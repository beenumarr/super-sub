<?php

namespace App\Http\Requests\Admin;


use Illuminate\Foundation\Http\FormRequest;


class DataPlanRequest extends FormRequest
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
            'api_plan_id' => 'required',
            'plan_size' => 'required',
            'mobile_network_id'=> 'required',
            'data_plan_type_id'=> 'required',
            'amount'=> 'required',
            'plan_volume'=> 'required|in:gb,mb',
            'plan_validity'=> 'required'
        ];
    }


}
