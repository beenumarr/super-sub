<?php

namespace App\Http\Requests\Transaction;


use Illuminate\Foundation\Http\FormRequest;


class ElectricityBillRequest extends FormRequest
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
            'meter_type' => 'required',
            'phone_number' => 'required',
            'name' => 'required',
            'meter_number'=> 'required',
            'electricity_distributor_id'=> 'required|exists:electricity_distributors,id',
            'amount'=> 'required|numeric|min:1000',
        ];
    }




}
