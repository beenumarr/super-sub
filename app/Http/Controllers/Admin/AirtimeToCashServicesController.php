<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\AirtimeToCashTransaction;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\A2CTransactionResource;

class AirtimeToCashServicesController extends Controller
{

    public function index(Request $request)
    {
        $query = AirtimeToCashTransaction::with(['user', 'network'])
            ->latest();

        if ($request->has('manual') && $request->manual) {
            $query->where('is_manual', true);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $transactions = $query->paginate(10);

        return Inertia::render('Admin/AirtimeToCash/Index', [
            'transactions' => A2CTransactionResource::collection($transactions),
            'filters' => [
                'manual' => $request->manual,
                'status' => $request->status,
            ],
        ]);
    }

    public function show(AirtimeToCashTransaction $airtime_to_cash_service)
    {
        $airtime_to_cash_service->load(['user', 'network']);

        return Inertia::render('Admin/AirtimeToCash/Show', [
            'transaction' => new A2CTransactionResource($airtime_to_cash_service),
        ]);
    }


    public function update(Request $request, AirtimeToCashTransaction $airtime_to_cash_service)
    {


        $data = $request->validate([
            'status' => 'required|in:processing,completed,failed,transferred',
            'admin_note' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $airtime_to_cash_service->update([
                'status' => $data['status'],
                'api_response' => $data['admin_note'] ?
                    ($airtime_to_cash_service->api_response . "\nAdmin Note: " . $data['admin_note']) :
                    $airtime_to_cash_service->api_response,
            ]);

            if ($data['status'] === 'completed' && $airtime_to_cash_service->is_manual) {
                $userController = app()->make(\App\Http\Controllers\User\AirtimeToCashController::class);
                $userController->transferToWallet($airtime_to_cash_service);
            }

            DB::commit();

            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update transaction: ' . $e->getMessage());
        }
    }


    public function updateNetworkSettings(Request $request)
    {
        $services = $request->all();

        $services = $request->services;

        foreach ($services as $value) {
            $service = MobileNetwork::where('name', $value['name'])->first();

            if ($service) {
                $service->airtime_to_cash_active = $value['airtime_to_cash_active'];
                $service->airtime_to_cash_api_id = $value['airtime_to_cash_api_id'];
                $service->a2c_conversion_rate = $value['a2c_conversion_rate'];
                $service->a2c_auto_method_enabled = $value['a2c_auto_method_enabled'];
                $service->a2c_manual_method_enabled = $value['a2c_manual_method_enabled'];
                $service->save();
            }
        }

        return redirect()->back();
    }


    public function settings()
    {
        $configKeys = [
            'a2c_enabled',
            'a2c_auto_method_enabled',
            'a2c_manual_method_enabled',
            'a2c_min_amount',
            'a2c_max_amount',
            'a2c_daily_limit',
            'a2c_conversion_rate',
            'a2c_withdrawal_fee',
            'a2c_auto_approval',
            'a2c_mtn_phone_number',
            'a2c_glo_phone_number',
            'a2c_airtel_phone_number',
            'a2c_ninemoble_phone_number',
            'a2c_convertion_rate',
        ];

        // Read directly from database to get the latest values
        $configs = AppConfiguration::whereIn('key', $configKeys)
            ->get()
            ->pluck('value', 'key')
            ->toArray();

        $networks = MobileNetwork::all();

        // Get phone numbers directly from database
        $phoneNumbers = [
            'a2c_mtn_phone_number' => AppConfiguration::where('key', 'a2c_mtn_phone_number')->value('value') ?? '',
            'a2c_glo_phone_number' => AppConfiguration::where('key', 'a2c_glo_phone_number')->value('value') ?? '',
            'a2c_ninemoble_phone_number' => AppConfiguration::where('key', 'a2c_ninemoble_phone_number')->value('value') ?? '',
            'a2c_airtel_phone_number' => AppConfiguration::where('key', 'a2c_airtel_phone_number')->value('value') ?? '',
        ];

        return Inertia::render('Admin/Airtime2CashSettings/Index', [
            'configs' => $configs,
            'networks' => MobileNetworkResource::collection($networks),
            'phoneNumbers' => $phoneNumbers,
        ]);
    }
}
