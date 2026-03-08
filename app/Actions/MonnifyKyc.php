<?php

namespace App\Actions;

use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use App\Actions\Utils\MonnifyUtils;
use Illuminate\Support\Facades\Log;

class MonnifyKyc
{
    private $monnifyUtils;

    public function __construct()
    {
        $this->monnifyUtils = new MonnifyUtils();
    }

    /**
     * Validate BVN details using Monnify API
     *
     * @param string $name
     * @param string $bvn
     * @param string $phone
     * @return array
     */
    public function validateBvn(string $name, string $bvn, string $phone): array
    {
        if(config('settings.monnify_service') === '0') {
            return ['status' => 'success', 'matchPercentage' => 100];
        }

        $data = [
            "bvn" => $bvn,
            "name" => $name,
            "dateOfBirth" => Carbon::parse(null)->format('d-M-Y'),
            "mobileNo" => $phone,
        ];

        $client = new Client();
        $url = config('settings.monnify_api_url');

        try {
            $response = $client->post("$url/api/v1/vas/bvn-details-match", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->monnifyUtils->generateApiToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);

            if ($res['requestSuccessful'] && isset($res['responseBody'])) {
                $apiResponse = $res['responseBody'];

                Log::info('BVN Validation successful', [
                    'name' => $name,
                    'bvn' => $bvn,
                    'phone' => $phone,
                    'matchPercentage' => $apiResponse['name']['matchPercentage'],
                ]);

                return [
                    'status' => 'success',
                    'matchPercentage' => $apiResponse['name']['matchPercentage'],
                ];
            }

            Log::error('BVN Validation failed: No response body.', ['data' => $data]);

            return ['status' => 'failed', 'error' => 'Failed to retrieve BVN details.'];

        } catch (ClientException $e) {
            $this->logClientException($e, 'BVN Validation failed', $data);
            return ['status' => 'failed', 'error' => 'Failed to retrieve BVN details.'];
        } catch (\Exception $e) {
            Log::error('Unexpected error during BVN validation', ['error' => $e->getMessage(), 'data' => $data]);
            return ['status' => 'failed', 'error' => 'Failed to retrieve BVN details.'];
        }
    }

    /**
     * Validate NIN details using Monnify API
     *
     * @param string $name
     * @param string $nin
     * @param string $phone
     * @return array
     */
    public function validateNin(string $name, string $nin, string $phone): array
    {
        $data = ["nin" => $nin];
        $client = new Client();
        $url = config('settings.monnify_api_url');

        try {
            $response = $client->post("$url/api/v1/vas/nin-details", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->monnifyUtils->generateApiToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);

            if ($res['requestSuccessful'] && isset($res['responseBody'])) {
                $apiResponse = $res['responseBody'];
                $fullName = $apiResponse['firstName'] . " " . $apiResponse['middleName'] . " " . $apiResponse['lastName'];
                $mobileNumber = $apiResponse['mobileNumber'];

                Log::info('NIN Validation successful', [
                    'name' => $fullName,
                    'nin' => $nin,
                    'mobileNumber' => $mobileNumber,
                ]);

                return [
                    'status' => 'success',
                    'name' => $fullName,
                    'mobileNumber' => $mobileNumber,
                ];
            }

            Log::error('NIN Validation failed: No response body.', ['data' => $data]);

            return ['status' => 'failed', 'error' => 'Failed to retrieve NIN details.'];

        } catch (ClientException $e) {
            $this->logClientException($e, 'NIN Validation failed', $data);
            return ['status' => 'failed', 'error' => 'Failed to retrieve NIN details.'];
        } catch (\Exception $e) {
            Log::error('Unexpected error during NIN validation', ['error' => $e->getMessage(), 'data' => $data]);
            return ['status' => 'failed', 'error' => 'Failed to retrieve NIN details.'];
        }
    }

    /**
     * Log ClientException details
     *
     * @param ClientException $e
     * @param string $message
     * @param array $data
     */
    private function logClientException(ClientException $e, string $message, array $data): void
    {
        $response = $e->getResponse();
        $statusCode = $response->getStatusCode();
        $errorBody = json_decode($response->getBody(), true);
        $responseMessage = $errorBody['responseMessage'] ?? 'Unknown error';

        Log::error($message, [
            'statusCode' => $statusCode,
            'responseMessage' => $responseMessage,
            'data' => $data,
        ]);
    }
}
