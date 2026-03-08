<?php

namespace App\Http\Requests\Auth;
use Illuminate\Validation\Rules;
use Illuminate\Foundation\Http\FormRequest;

class SignupRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|regex:/^[A-Za-z\s]+$/',
            'phone' => 'required|regex:/[0-9]{10}/|digits:11|unique:users,phone',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // 'referral_code' => [
            //     function ($attribute, $value, $fail) {
            //         // Check if referral_code is not empty, then apply the exists rule
            //         if (!empty($value) && !\App\Models\User::where('phone', $value)->exists()) {
            //             $fail('The selected referral code is invalid.');
            //         }
            //     },
            // ],
        ];
    }

}
