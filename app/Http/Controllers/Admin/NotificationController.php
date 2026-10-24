<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppConfiguration;
use App\Models\DeviceToken;
use App\Models\NotificationBroadcast;
use App\Models\User;
use App\Services\Firebase\FcmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display broadcast dashboard and history.
     */
    public function broadcastIndex(): Response
    {
        $broadcasts = NotificationBroadcast::with(['admin:id,name,email', 'targetUser:id,name,email'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Notifications/Broadcast', [
            'broadcasts' => $broadcasts,
            'stats' => [
                'total_users' => User::count(),
                'registered_devices' => DeviceToken::count(),
                'users_with_devices' => DeviceToken::distinct('user_id')->count('user_id'),
                'firebase_configured' => FcmService::isConfigured(),
            ],
        ]);
    }

    /**
     * Send a notification broadcast or direct message.
     */
    public function broadcastSend(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:1000',
            'target_type' => 'required|in:all,user',
            'target_user_id' => 'nullable|required_if:target_type,user|exists:users,id',
        ]);

        $title = FcmService::cleanText($validated['title']);
        $body = FcmService::cleanText($validated['body']);
        $admin = $request->user();
        $targetType = $validated['target_type'];
        $targetUserId = $validated['target_user_id'] ?? null;

        $sentCount = 0;
        $status = 'sent';

        try {
            if ($targetType === 'all') {
                $sentCount = FcmService::broadcast($title, $body, ['type' => 'BROADCAST']);
            } else {
                $sentCount = FcmService::sendToUser((int) $targetUserId, $title, $body, ['type' => 'DIRECT']);
            }

            if ($sentCount === 0 && !FcmService::isConfigured()) {
                $status = 'unconfigured';
            }
        } catch (\Throwable $e) {
            $status = 'failed';
        }

        NotificationBroadcast::create([
            'admin_id' => $admin->id,
            'target_type' => $targetType,
            'target_user_id' => $targetUserId,
            'title' => $title,
            'body' => $body,
            'status' => $status,
            'sent_count' => $sentCount,
        ]);

        if ($status === 'unconfigured') {
            return back()->with('warning', 'Notification logged, but Firebase is not configured or disabled in settings.');
        }

        return back()->with('success', "Notification dispatched successfully to {$sentCount} device(s).");
    }

    /**
     * Search users for direct notification selection.
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');
        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::select('id', 'name', 'email', 'phone_number')
            ->withCount('deviceTokens')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('phone_number', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($users);
    }

    /**
     * Display Firebase settings screen.
     */
    public function settingsIndex(): Response
    {
        $enabled = AppConfiguration::where('key', 'firebase_enabled')->value('value');
        $credentials = FcmService::getCredentials();

        return Inertia::render('Admin/Notifications/Settings', [
            'settings' => [
                'enabled' => $enabled === '1' || $enabled === 'true' || $enabled === true,
                'project_id' => $credentials['project_id'] ?? '',
                'client_email' => $credentials['client_email'] ?? '',
                'has_private_key' => !empty($credentials['private_key']),
                'has_credentials' => !empty($credentials['project_id']) && !empty($credentials['private_key']),
                'registered_tokens_count' => DeviceToken::count(),
            ],
        ]);
    }

    /**
     * Update Firebase settings.
     */
    public function settingsUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'enabled' => 'nullable|boolean',
            'service_account_json' => 'nullable|string',
            'service_account_file' => 'nullable|file|mimes:json',
        ]);

        // Toggle enabled
        $enabled = $request->boolean('enabled') ? '1' : '0';
        AppConfiguration::updateOrCreate(
            ['key' => 'firebase_enabled'],
            ['value' => $enabled]
        );

        // Process file or JSON text
        $rawJson = null;
        if ($request->hasFile('service_account_file')) {
            $rawJson = file_get_contents($request->file('service_account_file')->getRealPath());
        } elseif (!empty($request->service_account_json)) {
            $rawJson = $request->service_account_json;
        }

        if ($rawJson) {
            $decoded = json_decode($rawJson, true);
            if (!is_array($decoded) || empty($decoded['project_id']) || empty($decoded['private_key']) || empty($decoded['client_email'])) {
                return back()->with('error', 'Invalid Firebase service account JSON. Must contain project_id, client_email, and private_key.');
            }

            AppConfiguration::updateOrCreate(
                ['key' => 'firebase_service_account_json'],
                ['value' => json_encode($decoded)]
            );

            AppConfiguration::updateOrCreate(
                ['key' => 'firebase_project_id'],
                ['value' => $decoded['project_id']]
            );
        }

        return back()->with('success', 'Firebase settings updated successfully.');
    }

    /**
     * Send a test notification.
     */
    public function testNotification(Request $request): RedirectResponse
    {
        if (!FcmService::isConfigured()) {
            return back()->with('error', 'Firebase is not yet configured or is disabled. Please save valid credentials first.');
        }

        $user = $request->user();
        $sent = FcmService::sendToUser($user->id, 'Test Notification', 'This is a test notification from your SuperSub admin panel.', [
            'type' => 'TEST',
        ]);

        if ($sent > 0) {
            return back()->with('success', "Test notification sent successfully to {$sent} device(s) registered to your account.");
        }

        // Try topic if no personal tokens
        $topicSent = FcmService::sendToTopic('all_users', 'Test Notification', 'This is a test broadcast notification to all users.');
        if ($topicSent) {
            return back()->with('success', 'Test notification sent successfully to the all_users topic.');
        }

        return back()->with('warning', 'Firebase credentials are valid, but no registered device tokens were found for your account to receive the notification.');
    }
}
