<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;


use App\Http\Requests\Admin\RoleRequest;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use App\Http\Resources\Admin\RoleResource;

class RoleController extends Controller
{


    function __construct()
    {
        $this->middleware('permission:view_role', ['only' => ['index','show']]);
        $this->middleware('permission:create_role', ['only' => ['create','store']]);
        $this->middleware('permission:edit_role', ['only' => ['edit','update']]);
        $this->middleware('permission:delete_role', ['only' => ['destroy']]);
    }


    public function index()
    {
        $roles = auth()->user()->hasRole('Superadmin') ? Role::all() : Role::whereNotIn('name',['SuperAdmin'])->get();
        return Inertia::render('Admin/Staff/Roles/Index', [
            'permissions'=>Permission::all(),
            'roles' => RoleResource::collection($roles),
        ]);
    }



    public function store(RoleRequest $request)
    {
        $validated = $request->validated();
        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);
        return response()->json([
            'status' => 'success'
        ], 201);
    }


    public function show(Role $role)
    {
            $RolePermissions = DB::table("role_has_permissions")
                ->where("role_has_permissions.role_id",$role->id)
                ->pluck('role_has_permissions.permission_id','role_has_permissions.permission_id')
                ->all();
            $permissions = [];
            foreach ($RolePermissions as  $value) { array_push($permissions, $value); }
            return response()->json(['permissions'=>$permissions, 'name'=>$role->name, 'id'=>$role->id]);
    }

    public function update(RoleRequest $request, Role $role)
    {
        $validated = $request->validated();
        $role->update(['name'=>$validated['name']]);
        $role->syncPermissions($validated['permissions']);
        return response()->json(['status' => 'success'],201);
    }


    public function destroy(Role $role)
    {
        $role->delete();
		return response()->json(['success'=>'Deleted']);
    }
}
