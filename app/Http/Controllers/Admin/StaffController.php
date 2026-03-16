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
            $roles = Role::whereNotIn('name', ['Masteradmin'])->get();
        } else {
            $roles = Role::whereNotIn('name', ['Superadmin', 'Masteradmin'])->get();
        }

        // Get all staff members (users with non-User roles)
        $query = User::whereHas('roles', function($q) {
            $q->whereNotIn('name', ['User']);
        });

        // Apply search filter if provided
        if (request('search')) {
            $search = request('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $data = $query->latest();
        $paginated = $data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all());

        return Inertia::render('Admin/Staff/Index', [
            'data' => UserResource::collection($paginated->items()),
            'roles' => $roles,
            'packages' => UserPackage::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $roles = [];

        if (auth()->user()->hasRole('Masteradmin')) {
            $roles = Role::all();
        } elseif (auth()->user()->hasRole('Superadmin')) {
            $roles = Role::whereNotIn('name', ['Masteradmin'])->get();
        } else {
            $roles = Role::whereNotIn('name', ['Superadmin', 'Masteradmin'])->get();
        }

        return Inertia::render('Admin/Staff/Create', [
            'roles' => $roles,
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

        // Get the role by ID and assign it by name
        $role = Role::findById($request->role);
        if ($role) {
            $user->assignRole($role->name);
        }

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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UserRequest $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            $fields = $request->only(['name', 'email', 'phone_number', 'is_active', 'kyc_level', 'account_status', 'address', 'user_package_id']);

            // Map is_active to active if provided
            if (isset($fields['is_active'])) {
                $fields['active'] = $fields['is_active'];
                unset($fields['is_active']);
            }

            if ($request->kyc_level) {
                $fields['kyc_verified_at'] = now();
            }

            \Log::info('Updating user', ['user_id' => $user->id, 'fields' => $fields]);

            $user->update($fields);

            \Log::info('User updated successfully', ['user_id' => $user->id]);

            return back()->with('success', 'Staff member updated successfully');
        } catch (\Exception $e) {
            \Log::error('Error updating user', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to update staff member: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            \Log::info('Attempting to delete user', ['user_id' => $user->id, 'user_name' => $user->name]);

            // Clear related records first
            $user->roles()->detach();
            $user->permissions()->detach();

            // Delete the user
            $deleted = $user->delete();

            \Log::info('User deleted', ['user_id' => $user->id, 'deleted' => $deleted]);

            return back()->with('success', 'Staff member deleted successfully');
        } catch (\Exception $e) {
            \Log::error('Error deleting user', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to delete staff member: ' . $e->getMessage());
        }
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
