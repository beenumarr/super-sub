<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Jobs\ImageUpload;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\AppConfiguration;
use App\Models\Promotion;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Artisan;
use App\Http\Resources\Admin\AdminTransactionResource;
use Illuminate\Support\Facades\Request as FilterRequest;

class PromoController extends Controller
{
    public function index(): Response
    {


        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');


        if(isset($from)){

            $data = Transaction::where('type', 'BONUS_WALLET')->whereBetween('updated_at', [$from.' 00:00:00',$to.' 23:59:59']);

        }else{

             $data = Transaction::where('type', 'BONUS_WALLET')->latest();

        }





        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status'));

        $total = $data->get()->sum('amount');





        $configsdata = AppConfiguration::orderBy('id')->get(['id','key','value']);
        $collection = collect($configsdata);
        $configs = $collection->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Promo/Index', [
            'data' =>$configsdata,
            'configs_values'=> $configs,
            'promotions' => Promotion::orderByDesc('id')->get(),
            'transactions' => AdminTransactionResource::collection($data->orderBy('created_at', 'desc')->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())),
            'total_amount'=> number_format($total, 2),
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
            $config = AppConfiguration::where('key', $key)->first();
            if ($config) {
                $config->value = $value;
                $config->save();
            }else{
                AppConfiguration::create([
                    'key'=> $key,
                    'value'=> $value,
                ]);
            }
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


}
