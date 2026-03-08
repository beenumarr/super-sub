@component('mail::message')
{{-- Logo --}}
<div style="text-align: center; margin-bottom: 20px;">
    <img src="{{ config('app.url')}}/images/logo.png" alt="{{ config('app.name') }} Logo" style="max-height: 80px;">
</div>

# Welcome to {{ config('app.name') }} 🚀

Hello,

Thank you for signing up with **{{ config('app.name') }}**! We're thrilled to have you with us.

To complete your registration, please click the button below to **verify your email address** and get started:

@component('mail::button', ['url' => $url, 'color' => 'success'])
Verify My Email
@endcomponent

If you didn't sign up for this account, you can safely ignore this message.

---

Need help? Have questions? Just reply to this email or visit our [Help Center]({{ config('app.url') }}/help).

Thanks,
The {{ config('app.name') }} Team
<small>{{ config('app.url') }}</small>
@endcomponent
