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
    public function index()
    {
        $roles = auth()->user()->hasRole('Superadmin') ? Role::all() : Role::whereNotIn('name',['Superadmin'])->get();
        return Inertia::render('Admin/Roles/Index', [
            'permissions'=>Permission::all(),
            'roles' => RoleResource::collection($roles),
        ]);
    }



    public function store(RoleRequest $request)
    {
        try {
            $validated = $request->validated();
            $role = Role::create(['name' => $validated['name']]);
            $role->syncPermissions($validated['permissions']);
            return response()->json([
                'status' => 'success',
                'message' => 'Role created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
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
        try {
            $validated = $request->validated();
            $role->update(['name' => $validated['name']]);
            $role->syncPermissions($validated['permissions']);
            return response()->json([
                'status' => 'success',
                'message' => 'Role updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy(Role $role)
    {
        $role->delete();
		return response()->json(['success'=>'Deleted']);
    }
}
