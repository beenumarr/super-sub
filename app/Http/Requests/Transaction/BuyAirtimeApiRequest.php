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

    protected function prepareForValidation()
    {
        if ($this->has('phone_number') && !$this->has('mobile_number')) {
            $this->merge(['mobile_number' => $this->input('phone_number')]);
        }
        if ($this->has('network_id') && !$this->has('network')) {
            $this->merge(['network' => $this->input('network_id')]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'amount' => ['required', 'numeric', 'max:50000', 'min:50'],
            'network' => 'required|numeric|exists:mobile_networks,id',
            'mobile_number' => 'required',
        ];
    }
}
