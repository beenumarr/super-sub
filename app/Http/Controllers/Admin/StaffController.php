<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use App\Models\UserPackage;
use App\Http\Requests\UserRequest;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Http\Resources\Admin\UserResource;
use App\Http\Resources\Admin\UserSearchResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as FilterRequest;

class StaffController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view_staff', ['only' => ['index', 'show']]);
        $this->middleware('permission:create_staff', ['only' => ['create', 'store']]);
        $this->middleware('permission:edit_staff', ['only' => ['edit', 'update']]);
        $this->middleware('permission:delete_staff', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        $pageSize = request('pageSize', 100);
        $currentPage = request('page', 1);

        $roles = [];

        if (auth()->user()->hasRole('Masteradmin')) {
            $roles = Role::all();
        } elseif (auth()->user()->hasRole('Superadmin')) {
            Role::whereNotIn('name', ['Masteradmin'])->get();
        } else {
            $roles = Role::whereNotIn('name', ['Superadmin', 'Masteradmin'])->get();
        }

        $staffs = User::latest();



            $data = $staffs->orWhereHas('roles', function($query) {
                $query->whereNotIn('name', ['User']);
            });


        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status','role', 'package'));

        return Inertia::render('Admin/Staff/Index', [
            'data' => UserResource::collection($data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())),
            'roles' => $roles,
            'packages' => UserPackage::all(),
        ]);

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

        $user = User::create($fields);

        $user->wallet()->create([
            'balance' => 0,
        ]);

        event(new Registered($user));

        $user->assignRole($request->role);

        return back();
    }


    public function updateRole(Request $request)
    {
        $fields = $request->validate([
            'user_id'=> 'required|exists:users,id',
            'role'=> 'required'
        ]);

        $user = User::find($fields['user_id']);

        if($user){

            $user->assignRole($request->role);
        }

        return back();
    }

    public function viewUser(User $user)
    {
        $user = new UserResource($user);

        return Inertia::render('Admin/Users/ViewUser', [
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
        return new UserResource($user);
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

        $request->password && $fields['password'] = Hash::make($request->password);

        if($request->kyc_level){
            $fields['kyc_verified_at'] = now();
        }

        $user->update($fields);


        if(!$request->password_reset){

            DB::table('model_has_roles')->where('model_id', $user->id)->delete();

            $user->assignRole($request->role);

        }


        return back();

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
}
