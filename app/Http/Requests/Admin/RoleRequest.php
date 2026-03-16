<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $roleId = $this->route('role') instanceof \Spatie\Permission\Models\Role
            ? $this->route('role')->id
            : $this->route('role');

        return [
            'name' => ['required', 'max:255', Rule::unique('roles')->ignore($roleId)],
            'permissions' => 'required|array|min:1',
        ];
    }
}
