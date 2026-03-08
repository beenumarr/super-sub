<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class BuyDataRequest extends FormRequest
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
            'data_plan_id' => 'required|exists:data_plans,id',
            'phone_number' => [
                'required',
                'digits_between:10,15'
            ],
            'mobile_network' => 'required|in:1,2,3,4', // Validates that the mobile network is one of the supported networks
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'data_plan_id.required' => 'The data plan is required.',
            'data_plan_id.exists' => 'The selected data plan is invalid.',
            'phone_number.required' => 'The phone number is required.',
            'phone_number.digits_between' => 'The phone number is invalid, please check and try again.',
            'mobile_network.required' => 'The mobile network is required.',
            'mobile_network.in' => 'The selected mobile network is invalid.',
        ];
    }
}
