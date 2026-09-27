<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use App\Models\UserPackage;
use Illuminate\Http\Request;
use App\Utils\User\AccountHelper;
use App\Http\Requests\UserRequest;
use App\Jobs\CreateVirtualAccount;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Http\Resources\Admin\UserResource;
use App\Jobs\CreatePayvesselVirtualAccount;
use App\Http\Resources\Admin\UserSearchResource;
use App\Models\FundingAccount;
use App\Models\DataPlanType;
use Illuminate\Support\Facades\Request as FilterRequest;
use Illuminate\Support\Str;

class UserController extends Controller
{


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(?string $role = null)
    {
        $request = FilterRequest::instance();

        $query = User::with(['wallet', 'category'])
            ->orderBy('created_at', 'desc');

        if ($role && in_array($role, ['admin', 'user'], true)) {
            $query->where('role', $role);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        if (($categoryId = $request->get('category_id')) !== null && $categoryId !== '') {
            if ($categoryId === 'uncategorized') {
                $query->whereNull('user_category_id');
            } else {
                $query->where('user_category_id', $categoryId);
            }
        }

        $users = UserResource::collection($query->limit(500)->get());

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'categories' => \App\Models\UserCategory::select('id', 'name')->orderBy('name')->get(),
            'activeRole' => $role,
            'filters' => [
                'search' => $request->get('search'),
                'sort_by' => $request->get('sort_by', 'balance'),
                'sort_dir' => $request->get('sort_dir', 'desc'),
                'date' => $request->get('date'),
                'category_id' => $request->get('category_id'),
            ],
        ]);
    }

    public function byRole(string $role)
    {
        return $this->index($role);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(UserRequest $request)
    {
        $fields = $request->all();

        $fields['password'] = Hash::make($request->password);
        $fields['username'] = $request->email;
        $fields['phone'] = $request->phone_number;

        $user = User::create($fields);

        $user->wallet()->create([
            'balance' => 0,
        ]);

        // Create Vitual Accounts

        CreateVirtualAccount::dispatch($user);

        event(new Registered($user));

        $user->assignRole($request->role);

        return back();
    }


    public function viewUser(User $user)
    {
        $user = new UserResource($user);

        return Inertia::render('Admin/Analytics/Users/ViewUser', [
            'user' => $user,

        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        $user->load(['wallet']);

        $categories = DataPlanType::with('network')->get()->map(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'network_id' => $type->mobile_network_id,
                'network' => $type->network ? [
                    'id' => $type->network->id,
                    'name' => $type->network->name,
                ] : null,
            ];
        });

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user),
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UserRequest $request, User $user)
    {
        $fields = $request->except('email');

        if ($request->filled('password')) {
            $fields['password'] = Hash::make($request->password);
        } else {
            unset($fields['password']);
        }

        if ($request->has('phone_number')) {
            $fields['phone'] = $request->phone_number;
        }

        if ($request->has('is_active')) {
            $fields['is_active'] = (bool) $request->is_active;
            $fields['active'] = (bool) $request->is_active;
        }

        if ($request->filled('kyc_level')) {
            $fields['kyc_level'] = $request->kyc_level;
            $fields['kyc_verified_at'] = now();
        }

        $user->update($fields);

        if ($request->filled('wallet_balance')) {
            $wallet = $user->wallet;
            if ($wallet) {
                $wallet->update(['balance' => (float) $request->wallet_balance]);
            }
        }

        if ($request->filled('role')) {
            DB::table('model_has_roles')->where('model_id', $user->id)->delete();
            $user->assignRole($request->role);
        }

        return back();

    }

    public function activation(Request $request, User $user)
    {
        $fields = $request->validate([
            'active' => 'required|boolean',
        ]);
        $user->update($fields);

        return response()->noContent();
    }

    public function sendLowBalanceAlert(User $user)
    {
        try {
            $balance = $user->wallet?->balance ?? 0;
            $user->notify(new \App\Notifications\LowWalletBalance($balance));

            return back()->with('success', 'Low balance alert sent successfully to ' . ($user->name ?? $user->email) . '.');
        } catch (\Throwable $e) {
            \Log::error('Failed to send Low Balance Alert: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', 'Failed to send alert: ' . $e->getMessage());
        }
    }


    public function deleteTempVirtualAccount(Request $request, User $user)
    {
        $user->fundingAccounts()->where('account_type', 'temporary')->delete();

        return response()->json(['message' => 'Funding account deleted.'], 200);
    }



    public function deleteVirtualAccount(Request $request, User $user)
    {

        $accountType = $request->accountType;

        if($accountType === 'temporary'){
            $user->fundingAccounts()->where('account_type', 'temporary')->delete();
        }
        else{
            $user->fundingAccounts()->where('account_type', "!=", 'temporary')->delete();
        }


        return response()->json(['message' => 'Funding account deleted.'], 200);
    }



    public function deleteKyc(Request $request, User $user)
    {

        $user->update([
            'bvn'=> null,
            'nin'=> null,
            'kyc_verified_at'=> null
        ]);

        return response()->noContent();
    }


    public function generateApi(Request $request, User $user)
    {

        return response()->noContent();
    }

    public function generateVirtualAccount(Request $request, User $user)
    {
        $accountType = $request->accountType;

        $accountHelper = new AccountHelper();



        if($accountType === 'permanent'){

            $accountHelper->generateVirtualAccount($user);

        }else{

            $accountHelper->generateTemporaryAccount($user);

        }


        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->noContent();
    }

    public function search()
    {

        if($search = request('search')){


            $data =  User::orderBy('name');

            $result = $data->where('name', 'like', '%'.$search.'%')->get();

            return UserSearchResource::collection($result);


        }

        return [];
    }

    public function generateApiKey(User $user)
    {
        try {
            // Generate a random 40-character token
            $plainToken = Str::random(40);

            // Hash the token
            $hashedToken = hash('sha256', $plainToken);

            // Save the hashed token to the database
            $user->update(['api_key' => $hashedToken]);

            // Return the plain token (only time it will be visible)
            return response()->json([
                'success' => true,
                'api_key' => $plainToken,
                'message' => 'API Key generated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate API Key: ' . $e->getMessage()
            ], 500);
        }
    }
}
