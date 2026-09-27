<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class VerifyNinRequest extends FormRequest
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
            'nin' => ['required', 'string', 'regex:/^\d{11}$/'],
            'transaction_pin' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nin.required' => 'National Identity Number is required.',
            'nin.regex' => 'National Identity Number must be exactly 11 digits.',
        ];
    }
}
