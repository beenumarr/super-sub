<?php

namespace App\Providers;

use App\Models\AppConfiguration;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\QueryException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        try {
            // Check if the application is running in GitHub Actions deployment environment
            $isGitHubActions = env('GITHUB_ACTIONS', false);

            if (!$isGitHubActions && app()->bound('db')) {
                $settings = cache()->rememberForever('app_settings', function () {
                    return AppConfiguration::all(['key', 'value'])
                        ->keyBy('key')
                        ->transform(function ($setting) {
                            return $setting->value;
                        })
                        ->toArray();
                });

                config(['settings' => $settings]);
            }



        } catch (QueryException $e) {
            // Handle the database connection error
            // You can log the error or take appropriate action based on your application's requirements
            Log::error('Database connection error: ' . $e->getMessage());
        } catch (\Exception $e) {
            // Handle other exceptions
            // You can log the error or take appropriate action based on your application's requirements
            Log::error('Unexpected error: ' . $e->getMessage());
        }
    }
}

