<?php

namespace App\Services\Firebase;

use App\Models\AppConfiguration;
use App\Models\DeviceToken;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    /**
     * Remove emojis from text to adhere to strict formatting.
     */
    public static function cleanText(string $text): string
    {
        // Strip all emoji and supplemental symbols comprehensively
        $clean = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F700}-\x{1F77F}\x{1F780}-\x{1F7FF}\x{1F800}-\x{1F8FF}\x{1F900}-\x{1F9FF}\x{1FA00}-\x{1FA6F}\x{1FA70}-\x{1FAFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{2300}-\x{23FF}\x{2B50}\x{200D}\x{FE0F}\x{1F1E0}-\x{1F1FF}]/u', '', $text);
        return trim($clean ?? $text);
    }

    /**
     * Check if Firebase notifications are enabled and configured.
     */
    public static function isConfigured(): bool
    {
        $enabled = AppConfiguration::where('key', 'firebase_enabled')->value('value');
        if ($enabled !== '1' && $enabled !== 'true' && $enabled !== true) {
            return false;
        }

        $credentials = self::getCredentials();
        return !empty($credentials['project_id']) && !empty($credentials['private_key']) && !empty($credentials['client_email']);
    }

    /**
     * Get credentials array from database or local storage.
     */
    public static function getCredentials(): array
    {
        $rawJson = AppConfiguration::where('key', 'firebase_service_account_json')->value('value');

        if (empty($rawJson)) {
            // Check file in storage
            $filePath = storage_path('app/firebase/service-account.json');
            if (file_exists($filePath)) {
                $rawJson = file_get_contents($filePath);
            }
        }

        if (empty($rawJson)) {
            return [];
        }

        $decoded = json_decode($rawJson, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Get OAuth2 Google Access Token for FCM HTTP v1.
     */
    public static function getAccessToken(): ?string
    {
        $credentials = self::getCredentials();
        if (empty($credentials['client_email']) || empty($credentials['private_key'])) {
            return null;
        }

        $cacheKey = 'fcm_google_access_token_' . md5($credentials['client_email']);

        return Cache::remember($cacheKey, 3000, function () use ($credentials) {
            $now = time();
            $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
            $claimSet = json_encode([
                'iss' => $credentials['client_email'],
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => 'https://oauth2.googleapis.com/token',
                'exp' => $now + 3600,
                'iat' => $now,
            ]);

            $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64UrlClaimSet = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claimSet));
            $dataToSign = $base64UrlHeader . '.' . $base64UrlClaimSet;

            $privateKey = $credentials['private_key'];
            $binarySignature = '';

            $success = openssl_sign($dataToSign, $binarySignature, $privateKey, OPENSSL_ALGO_SHA256);
            if (!$success) {
                Log::error('FCM OAuth: Failed to sign JWT with private key');
                return null;
            }

            $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($binarySignature));
            $jwt = $dataToSign . '.' . $base64UrlSignature;

            $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if ($response->successful()) {
                return $response->json('access_token');
            }

            Log::error('FCM OAuth Token Request Failed: ' . $response->body());
            return null;
        });
    }

    /**
     * Send notification to a specific FCM device token.
     */
    public static function sendToToken(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        $credentials = self::getCredentials();
        $projectId = $credentials['project_id'] ?? null;
        if (empty($projectId)) {
            Log::warning('FCM: Cannot send, project_id is missing');
            return false;
        }

        $accessToken = self::getAccessToken();
        if (!$accessToken) {
            Log::warning('FCM: Cannot send, unable to acquire access token');
            return false;
        }

        $title = self::cleanText($title);
        $body = self::cleanText($body);

        $payload = [
            'message' => [
                'token' => $deviceToken,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => array_map('strval', array_merge([
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                ], $data)),
                'android' => [
                    'priority' => 'HIGH',
                    'notification' => [
                        'sound' => 'default',
                        'channel_id' => 'high_importance_channel',
                    ],
                ],
            ],
        ];

        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json; UTF-8'])
            ->post($url, $payload);

        if ($response->successful()) {
            return true;
        }

        $resJson = $response->json();
        $errorCode = $resJson['error']['details'][0]['errorCode'] ?? $resJson['error']['status'] ?? '';

        // If the token is invalid or unregistered, clean it up from database
        if (in_array($errorCode, ['UNREGISTERED', 'INVALID_ARGUMENT']) || str_contains($response->body(), 'NOT_FOUND')) {
            DeviceToken::where('token', $deviceToken)->delete();
            Log::info("FCM: Removed unregistered token from DB: " . substr($deviceToken, 0, 20) . "...");
        } else {
            Log::error("FCM Send Error: " . $response->body());
        }

        return false;
    }

    /**
     * Send notification to a specific user (sends to all user's registered devices).
     */
    public static function sendToUser(User|int $user, string $title, string $body, array $data = []): int
    {
        $userId = $user instanceof User ? $user->id : $user;
        $tokens = DeviceToken::where('user_id', $userId)->pluck('token')->all();

        if (empty($tokens)) {
            return 0;
        }

        $sentCount = 0;
        foreach ($tokens as $token) {
            if (self::sendToToken($token, $title, $body, $data)) {
                $sentCount++;
            }
        }

        return $sentCount;
    }

    /**
     * Send notification to a topic (e.g. 'all_users').
     */
    public static function sendToTopic(string $topic, string $title, string $body, array $data = []): bool
    {
        $credentials = self::getCredentials();
        $projectId = $credentials['project_id'] ?? null;
        if (empty($projectId)) return false;

        $accessToken = self::getAccessToken();
        if (!$accessToken) return false;

        $title = self::cleanText($title);
        $body = self::cleanText($body);

        $payload = [
            'message' => [
                'topic' => $topic,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                ],
                'data' => array_map('strval', array_merge([
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                ], $data)),
                'android' => [
                    'priority' => 'HIGH',
                    'notification' => [
                        'sound' => 'default',
                        'channel_id' => 'high_importance_channel',
                    ],
                ],
            ],
        ];

        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json; UTF-8'])
            ->post($url, $payload);

        if ($response->successful()) {
            return true;
        }

        Log::error("FCM Topic Send Error: " . $response->body());
        return false;
    }

    /**
     * Broadcast to all registered devices.
     * Dispatches to the 'all_users' topic once. If topic broadcast fails,
     * falls back to direct individual device token dispatch to avoid duplicate delivery.
     */
    public static function broadcast(string $title, string $body, array $data = []): int
    {
        $title = self::cleanText($title);
        $body = self::cleanText($body);

        $tokens = DeviceToken::pluck('token')->all();
        $topicSuccess = self::sendToTopic('all_users', $title, $body, $data);

        // If topic broadcast succeeded, FCM distributes it to all subscribers of 'all_users'.
        // Never send to individual tokens as well, which causes duplicate notifications on every device.
        if ($topicSuccess) {
            return count($tokens) > 0 ? count($tokens) : 1;
        }

        // Fallback: If topic broadcast failed, send to registered device tokens directly
        $sentCount = 0;
        foreach ($tokens as $token) {
            if (self::sendToToken($token, $title, $body, $data)) {
                $sentCount++;
            }
        }

        return $sentCount;
    }
}
