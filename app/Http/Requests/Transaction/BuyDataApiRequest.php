<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class BuyDataApiRequest extends FormRequest
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
        if ($this->has('plan_id') && !$this->has('plan')) {
            $this->merge(['plan' => $this->input('plan_id')]);
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
            'plan' => 'required|exists:data_plans,id',
            'mobile_number' => 'required',
            'network' => 'required',
        ];
    }
}
