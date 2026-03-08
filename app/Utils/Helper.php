<?php


    if (!function_exists('cs_encrypt')) {
        function cs_encrypt($data)
        {
            $key = 'secured';
            $cipher = 'AES-256-CBC';
            $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($cipher));

            $encrypted = openssl_encrypt($data, $cipher, $key, 0, $iv);
            return base64_encode($encrypted . '::' . $iv);
        }
    }

    if (!function_exists('cs_decrypt')) {
        function cs_decrypt($encrypted)
        {
            $key = 'secured';
            $cipher = 'AES-256-CBC';

            try {
                list($encrypted_data, $iv) = explode('::', base64_decode($encrypted), 2);
                $decrypted = openssl_decrypt($encrypted_data, $cipher, $key, 0, $iv);

                return $decrypted !== false ? $decrypted : $encrypted;
            } catch (\Exception $e) {
                // Log the exception if needed
                return $encrypted;
            }
        }


  }


  if (!function_exists('maskSensitiveData')) {

      // Helper function to mask sensitive data
    function maskSensitiveData($data)
      {
          $length = strlen($data);
          $visibleDigits = 2; // Number of visible digits at the start and end
          $maskedPart = str_repeat('*', $length - 2 * $visibleDigits); // Generate the masked part
          return substr($data, 0, $visibleDigits) . $maskedPart . substr($data, -$visibleDigits);
      }


    }
