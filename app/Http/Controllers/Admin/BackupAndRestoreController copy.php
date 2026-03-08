<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Jobs\ImageUpload;
use Illuminate\Http\Request;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class AppConfigurationController extends Controller
{
    public function index(): Response
    {


        $data = AppConfiguration::orderBy('id')->get(['id','key','value']);

        $collection = collect($data);

        // Use pluck to create a new collection with key-value pairs
        $configs = $collection->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/AppConfigurations/Index', [
            'data' =>$data,
            'enable_payvessel'=> config('app.enable_payvessel'),
            'monnify_charges_options' => AppConfiguration::where('key', 'monnify_funding_charges')->first()->options,
            'configs_values'=> $configs,
            'site_images'=> [
                'logo' => isset($configs['site_logo']) ? Storage::url("/images/" . $configs['site_logo']) : Storage::url("/images/logo.png"),
                'bg_0' => isset($configs['site_background_0']) ? Storage::url("/images/" . $configs['site_background_0']) : Storage::url("/images/bg1.jpg"),
                'bg_1' => isset($configs['site_background_1']) ? Storage::url("/images/" . $configs['site_background_1']) : Storage::url("/images/bg2.jpg"),
                'bg_2' => isset($configs['site_background_2']) ? Storage::url("/images/" . $configs['site_background_2']) : Storage::url("/images/bg3.jpg"),
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

        $data = $request->all();

        foreach ($data as $key => $value) {
            AppConfiguration::updateOrCreate(
                ['key' => $key ],// The attributes to search for
                ['value' => $value] // The attributes to update or create
            );
        }


       Artisan::call('cache:clear');
       Artisan::call('config:cache');

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

}
