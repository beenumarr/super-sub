<?php

namespace App\Validations;

use Illuminate\Support\Facades\Log;

class PhoneNumberValidation
{
    public static function validateNetworkPhoneNumber(string $phoneNumber, string $networkName, bool $skipNetworkCheck = false): bool|string
    {
        // Log::channel('inspect_logs')->info("Validating phone number: {$phoneNumber} for network: {$networkName}");

        // Trim whitespace and normalize number
        $phoneNumber = trim($phoneNumber);
        $normalized = $phoneNumber;

        // Remove any spaces, dashes, or other characters
        $normalized = preg_replace('/[^0-9+]/', '', $normalized);

        // Handle different input formats
        if (preg_match('/^\+234(.+)/', $normalized, $matches)) {
            // +234XXXXXXXXXX → 0XXXXXXXXXX
            $normalized = '0' . $matches[1];
        } elseif (preg_match('/^234(.+)/', $normalized, $matches)) {
            // 234XXXXXXXXXX → 0XXXXXXXXXX
            $normalized = '0' . $matches[1];
        } elseif (strlen($normalized) == 10 && preg_match('/^[7-9]/', $normalized)) {
            // 8106664640 → 08106664640 (missing leading 0)
            $normalized = '0' . $normalized;
        }

        // Log::channel('inspect_logs')->info("Normalized phone number: {$normalized}");

        // Check if number is too short (incomplete)
        if (strlen($normalized) < 11) {
            return "Phone number is incomplete. Please enter a complete 11-digit phone number.";
        }

        // Check if number is too long
        if (strlen($normalized) > 11) {
            return "Phone number is too long. Please enter a valid 11-digit phone number.";
        }

        // Must be 11 digits Nigerian number with correct format
        if (!preg_match('/^0[7-9][0-9]{9}$/', $normalized)) {
            return "Invalid phone number format. should start with 07XX, 08XX, or 09XX series.";
        }

        // ✅ If skipping network validation, stop here
        if ($skipNetworkCheck) {
            return true;
        }

        // Known prefixes by network (updated with more accurate mappings)
        $prefixes = [
            'mtn' => [
                '703','704','706','709', '707', '702',
                '803','806',
                '810','813','814','816','819',
                '903','906','913','916'
            ],
            'airtel' => [
                '701','708','802','808',
                '812','901','902','907','912','904', '911'
            ],
            'glo' => [
                '705','805','807',
                '811','815','905','915'
            ],
            '9mobile' => [
                '809','817','818','909','908'
            ],
        ];

        $networkKey = strtolower(trim($networkName));
        $prefix = substr($normalized, 1, 3); // Skip the leading '0' and get next 3 digits


        // Skip prefix check if network not recognized
        if (!isset($prefixes[$networkKey])) {
            return true;
        }

        // Log::channel('inspect_logs')->info("Prefix: {$prefix}");
        // Log::channel('inspect_logs')->info("Available prefixes: " . implode(', ', $prefixes[$networkKey]));
        // Log::channel('inspect_logs')->info("Network key: {$networkKey}");

        // Validate prefix
        if (!in_array($prefix, $prefixes[$networkKey])) {
            return "The phone number is not a valid {$networkName} number. Please check the phone number and try again.";
        }

        return true; // ✅ valid
    }
}
