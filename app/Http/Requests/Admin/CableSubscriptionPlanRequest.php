<?php

namespace App\Http\Requests\Admin;


use Illuminate\Foundation\Http\FormRequest;


class CableSubscriptionPlanRequest extends FormRequest
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
        return [
            'cable_network_id' => 'required',
            'package_name' => 'required',
            'product_code'=> 'required',
            'amount'=> 'required',
            'validity'=> 'required'
        ];
    }


}
