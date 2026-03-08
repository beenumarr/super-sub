@component('mail::message')
{{-- Logo --}}
<div style="text-align: center; margin-bottom: 20px;">
    <img src="{{ config('app.url')}}/images/logo.png" alt="{{ config('app.name') }} Logo" style="max-height: 80px;">
</div>

# Password Reset Request

Hello,

We received a request to reset the password for your account at **{{ config('app.name') }}**. If this was you, please click the button below to reset your password and regain access:

@component('mail::button', ['url' => config('app.url')."/reset-password/".$url, 'color' => 'primary'])
Reset My Password
@endcomponent

If you didn’t request a password reset, no further action is required. Your account is still secure.

---

If you need further assistance or have any questions, feel free to reply to this email or visit our [Help Center]({{ config('app.url') }}/help).

Thanks,
The {{ config('app.name') }} Team
<small>{{ config('app.url') }}</small>
@endcomponent
