<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Jobs\ImageUpload;
use Illuminate\Http\Request;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Utils\Services\ApiUtils;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class AppConfigurationController extends Controller
{
    private $encConfigs = ApiUtils::ENCRCONFIGS;

    public function index(): Response
    {
        $enable_payvessel = config('settings.feat_enable_payvessel');
        $enable_Bill_Stack = config('settings.feat_enable_Bill_Stack');
        $enable_paymentPoint = config('settings.feat_enable_paymentPoint');

        // dd($enable_paymentPoint);

        $data = AppConfiguration::orderBy('id')->get(['id','key','value']);

        $collection = collect($data);

        // Use pluck to create a new collection with key-value pairs
        $configs = $collection->pluck('value', 'key')->toArray();


        foreach ($this->encConfigs  as $key) {
            if (!empty($configs[$key])) {
                $configs[$key] = maskSensitiveData(cs_decrypt($configs[$key]));
            }
        }


        // Prefer uploads folder where processed images are stored
        $logoPath = isset($configs['site_logo']) && Storage::disk('public')->exists("uploads/" . $configs['site_logo'])
            ? Storage::url("uploads/" . $configs['site_logo'])
            : asset('images/logo.png');

        $faviconPath = isset($configs['site_favicon']) && Storage::disk('public')->exists("uploads/" . $configs['site_favicon'])
            ? Storage::url("uploads/" . $configs['site_favicon'])
            : null;

        $bg0Path = isset($configs['site_background_0']) && Storage::disk('public')->exists("uploads/" . $configs['site_background_0'])
            ? Storage::url("uploads/" . $configs['site_background_0'])
            : null;
        $bg1Path = isset($configs['site_background_1']) && Storage::disk('public')->exists("uploads/" . $configs['site_background_1'])
            ? Storage::url("uploads/" . $configs['site_background_1'])
            : null;
        $bg2Path = isset($configs['site_background_2']) && Storage::disk('public')->exists("uploads/" . $configs['site_background_2'])
            ? Storage::url("uploads/" . $configs['site_background_2'])
            : null;

        return Inertia::render('Admin/AppConfigurations/Index', [
            'data' =>$data,
            'enable_payvessel'=> $enable_payvessel,
            'enable_Bill_Stack'=> $enable_Bill_Stack,
            'enable_paymentPoint' =>$enable_paymentPoint,
            'monnify_charges_options' => AppConfiguration::where('key', 'monnify_funding_charges')->first()->options,
            'configs_values'=> $configs,
            'site_images'=> [
                'logo' => $logoPath,
                'favicon' => $faviconPath,
                'bg_0' => $bg0Path,
                'bg_1' => $bg1Path,
                'bg_2' => $bg2Path,
            ]

        ]);
    }


    public function store(Request $request)
    {
        AppConfiguration::create([
            'key'=> $request->key,
            'value'=> $request->value,
        ]);


        return redirect()->back();


    }

    public function update(Request $request, AppConfiguration $app_configuration)
    {
        // dd($request);

        $data = $request->all();

        foreach ($data as $key => $value) {

            // Skip masked values
            if ($this->isDataMasked($value)) {
                continue;
            }

            // Skip null values - database column is NOT NULL
            if ($value === null) {
                continue;
            }

            if (in_array($key, $this->encConfigs)) {
                $value = cs_encrypt($value);
            }

            // Convert boolean values to 0/1
            if (is_bool($value)) {
                $value = $value ? 1 : 0;
            }

            AppConfiguration::updateOrCreate(
                ['key' => $key], // The attributes to search for
                ['value' => $value] // The attributes to update or create
            );
        }

        Cache::forget('app_settings');

       Artisan::call('cache:clear');
       Artisan::call('config:clear');
       Artisan::call('config:cache');

        return redirect()->back();

    }

    /**
     * Update configuration via API call
     */
    public function apiUpdate(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            // Skip masked values
            if ($this->isDataMasked($value)) {
                continue;
            }

            // Skip null values - they cannot be stored in NOT NULL column
            if ($value === null) {
                continue;
            }

            // Encrypt sensitive data
            if (in_array($key, $this->encConfigs)) {
                $value = cs_encrypt($value);
            }

            // Convert boolean values to 0/1
            if (is_bool($value)) {
                $value = $value ? 1 : 0;
            }

            AppConfiguration::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        Cache::forget('app_settings');

        Artisan::call('cache:clear');
        Artisan::call('config:cache');


        if($request->wantsJson()){
            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        }

        return redirect()->back();
    }

    function updatePhotos(Request $request) {
        try {
            // Validate that images are provided
            $request->validate([
                'images' => 'required|array',
                // allow favicon (.ico) and standard web images
                'images.*' => 'mimes:jpg,jpeg,png,webp,gif,ico|max:5120', // max 5MB per image
                'name' => 'required|string'
            ]);

            // Ensure uploads directory exists
            $uploadsPath = storage_path('uploads');
            if (!File::isDirectory($uploadsPath)) {
                File::makeDirectory($uploadsPath, 0755, true, true);
            }

            $allFilesId = [];

            foreach ($request->file('images') as $key => $file) {
                if ($request->name === 'logo') {
                    $fileId = 'logo';
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'png');
                    if ($ext === 'jpeg') {
                        $ext = 'jpg';
                    }
                    $file->move($uploadsPath, "{$fileId}.{$ext}");
                    $allFilesId[] = ['id' => $fileId, 'ext' => $ext];
                } elseif ($request->name === 'favicon') {
                    $fileId = 'favicon';
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'png');
                    if ($ext === 'jpeg') {
                        $ext = 'jpg';
                    }
                    $file->move($uploadsPath, "{$fileId}.{$ext}");
                    $allFilesId[] = ['id' => $fileId, 'ext' => $ext];
                } else {
                    $fileId = 'site_background_' . $key;
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
                    if ($ext === 'jpeg') {
                        $ext = 'jpg';
                    }
                    $file->move($uploadsPath, "{$fileId}.{$ext}");
                    $allFilesId[] = ['id' => $fileId, 'ext' => $ext];
                }
            }

            // Process immediately (queue workers are not always running in dev/prod)
            ImageUpload::dispatchSync($allFilesId);

            // Flash success message and redirect back
            session()->flash('success', 'Image uploaded successfully!');

            return redirect()->back();
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Flash validation errors and redirect back
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Logo upload error: ' . $e->getMessage());

            // Flash error message and redirect back
            session()->flash('error', 'Failed to upload logo: ' . $e->getMessage());

            return redirect()->back();
        }
    }


    public function clearImages()  {


            Storage::disk('public')->deleteDirectory('images');

            File::delete(public_path('storage'));

            // If not linked, create a symbolic link
            File::link(storage_path('app/public'), public_path('storage'));


            return response(['status'=>'success']);


    }


function isDataMasked($data)
{
    // Check if there are enough characters for a masked value (at least 4 characters).
    if (strlen($data) < 4) {
        return false;
    }

    // Number of visible digits at the start and end
    $visibleDigits = 2;

    // Extract the first and last visible parts
    $firstVisiblePart = substr($data, 0, $visibleDigits);
    $lastVisiblePart = substr($data, -$visibleDigits);

    // Extract the masked part
    $maskedPart = substr($data, $visibleDigits, strlen($data) - 2 * $visibleDigits);

    // Check if the middle part is completely masked (contains only *)
    if (strspn($maskedPart, '*') == strlen($maskedPart)) {
        return true;
    }

    return false;
}


}
