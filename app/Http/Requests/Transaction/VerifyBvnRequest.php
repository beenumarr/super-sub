<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class VerifyBvnRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'bvn' => ['required', 'string', 'regex:/^\d{11}$/'],
            'transaction_pin' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'bvn.required' => 'Bank Verification Number is required.',
            'bvn.regex' => 'Bank Verification Number must be exactly 11 digits.',
        ];
    }
}
