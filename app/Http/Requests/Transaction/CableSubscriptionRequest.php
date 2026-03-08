<?php

namespace App\Http\Requests\Transaction;


use Illuminate\Foundation\Http\FormRequest;


class CableSubscriptionRequest extends FormRequest
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
            'cable_name' => 'required',
            'cable_subscription_plan_id' => 'required',
            'smart_card_number'=> 'required'
        ];
    }

    public function messages()
    {
        return [
            'cable_subscription_plan_id' => 'Please Select Plan',
        ];
    }


}
