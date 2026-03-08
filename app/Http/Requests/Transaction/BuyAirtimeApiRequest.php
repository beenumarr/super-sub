<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;


class BuyAirtimeApiRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'max:5000', 'min:50'],
            'network' => 'required|numeric|exists:mobile_networks,id',
            'mobile_number'=> 'required'
        ];
    }


}
