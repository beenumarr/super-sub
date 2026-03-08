<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlan;
use App\Models\ExamType;
use App\Models\AppConfiguration;
use App\Http\Resources\ExamResource;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\DataPlanResource;

class LandingPageController extends Controller
{
    function index()
    {
        if (config('app.disable_landing_page')) {
            return Inertia::render('Auth/Login', [
                'canResetPassword' => Route::has('password.request'),
                'status' => session('status'),
            ]);
        }

        if (config('app.custom_landing_page')) {
            return view('custom.index');
        }

        $configs = AppConfiguration::pluck('value', 'key')->toArray();

        $data_plans = [
            'mtn' => DataPlanResource::collection(DataPlan::with('planType')
                ->whereHas('planType', fn($q) => $q->where('mobile_network_id', 1))->get()),
            'airtel' => DataPlanResource::collection(DataPlan::with('planType')
                ->whereHas('planType', fn($q) => $q->where('mobile_network_id', 2))->get()),
            'glo' => DataPlanResource::collection(DataPlan::with('planType')
                ->whereHas('planType', fn($q) => $q->where('mobile_network_id', 3))->get()),
            '9mobile' => DataPlanResource::collection(DataPlan::with('planType')
                ->whereHas('planType', fn($q) => $q->where('mobile_network_id', 4))->get()),
        ];

        $site_content = [
            'name' => $configs['site_name'],
            'about' => $configs['site_about'],
            'title' => $configs['site_hero_title'],
            'hero_title_color' => $configs['site_hero_title_color'] ?? '',
            'subtitle' => $configs['site_hero_subtitle'],
            'address' => $configs['site_contact_address'],
            'email' => $configs['site_contact_email'],
            'phone_number' => $configs['site_contact_number'],
            'logo_type' => $configs['logo_type'] ?? 'icon',
            'theme' => $configs['site_primary_color'],
            'appstore_link' => $configs['appstore_link'] ?? '',
            'playstore_link' => $configs['playstore_link'] ?? '',
            'logo' => '/assets/images/logo.png',
            'bg_0' => isset($configs['site_background_0']) ? Storage::url("/images/" . $configs['site_background_0']) : Storage::url("/images/bg1.jpg"),
        ];

        return Inertia::render('Index', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'site_content' => $site_content,
            'data_plans' => $data_plans,
        ]);
    }


   public function privacyPage() {

        $collection = collect(AppConfiguration::get());

        $configs = $collection->pluck('value', 'key')->toArray();


        $site_content = [
            'name' => $configs['site_name'],
            'logo_type' => $configs['logo_type']?? 'icon',
            'theme' => $configs['site_primary_color'],
            'logo' => '/assets/images/logo.png',
            'email' => $configs['site_contact_email'],


        ];
        return Inertia::render('Privacy', [
            'site_content' => $site_content,
        ]);
    }


    public function info() {

        $collection = collect(AppConfiguration::get());

        $configs = $collection->pluck('value', 'key')->toArray();

        $exam_types = ExamResource::collection(ExamType::all());


        $data_plans = [
            'mtn'=> DataPlan::whereHas('planType', fn($q)=> $q->where('mobile_network_id', 1))->get(),
            'airtel'=> DataPlan::whereHas('planType', fn($q)=> $q->where('mobile_network_id', 2))->get(),
            '9mobile'=> DataPlan::whereHas('planType', fn($q)=> $q->where('mobile_network_id', 3))->get(),
            'glo'=> DataPlan::whereHas('planType', fn($q)=> $q->where('mobile_network_id', 4))->get(),
        ];


        $site_content = [
            'name' => $configs['site_name'],
            'whatsapp_link' => $configs['site_whatsapp_link'] ?? '',
            'monnify_contract_code'=> config('settings.monnify_contract_code'),
            'monnify_api_key'=> config('settings.monnify_api_key'),
            'about' => $configs['site_about'],
            'email' => $configs['site_contact_email'],
            'phone_number' => $configs['site_contact_number'],
            'data_plans' => $data_plans,
            'exam_types' => $exam_types,
        ];

        return response($site_content);


    }
}
