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


        $logoPath = isset($configs['site_logo']) && Storage::disk('public')->exists("images/" . $configs['site_logo'])
            ? Storage::url("images/" . $configs['site_logo'])
            : asset('images/logo.png');

        $bg0Path = isset($configs['site_background_0']) && Storage::disk('public')->exists("images/" . $configs['site_background_0'])
            ? Storage::url("images/" . $configs['site_background_0'])
            : null;
        $bg1Path = isset($configs['site_background_1']) && Storage::disk('public')->exists("images/" . $configs['site_background_1'])
            ? Storage::url("images/" . $configs['site_background_1'])
            : null;
        $bg2Path = isset($configs['site_background_2']) && Storage::disk('public')->exists("images/" . $configs['site_background_2'])
            ? Storage::url("images/" . $configs['site_background_2'])
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

            if(!$this->isDataMasked($value)){

            if(in_array($key, $this->encConfigs )){

                $value = cs_encrypt($value);
            }


            AppConfiguration::updateOrCreate(
                ['key' => $key ],// The attributes to search for
                ['value' => $value] // The attributes to update or create
            );
        }
        }


       Artisan::call('cache:clear');
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


        $allFilesId = [];

        foreach ($request->file('images') as $key => $file) {


            if($request->name === 'logo'){
                $file->move(storage_path().'/uploads', $fileId = "logo");
            }else{
                $file->move(storage_path().'/uploads', $fileId = "site_background_".$key);

            }

            $allFilesId[]= $fileId;

        }


       ImageUpload::dispatch($allFilesId);


       return response()->noContent();

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
