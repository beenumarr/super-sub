<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Deletion Request - {{ $siteName ?? config('app.name', 'SuperSub') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #9483EF;
            --primary-dark: #7C68DC;
            --text-dark: #1E293B;
            --text-muted: #64748B;
            --bg-light: #F8FAFC;
            --card-bg: #FFFFFF;
            --border: #E2E8F0;
            --danger: #EF4444;
            --success: #10B981;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-light);
            color: var(--text-dark);
            line-height: 1.6;
            padding: 32px 16px;
        }

        .container {
            max-width: 720px;
            margin: 0 auto;
        }

        .card {
            background: var(--card-bg);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            padding: 36px 32px;
            margin-bottom: 24px;
        }

        .header {
            margin-bottom: 24px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .header p {
            color: var(--text-muted);
            font-size: 14px;
        }

        .notice-box {
            background-color: #FEF2F2;
            border-left: 4px solid var(--danger);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
        }

        .notice-box h3 {
            font-size: 14px;
            font-weight: 600;
            color: #991B1B;
            margin-bottom: 4px;
        }

        .notice-box p {
            font-size: 13px;
            color: #7F1D1D;
            line-height: 1.5;
        }

        .info-section {
            margin-bottom: 28px;
        }

        .info-section h2 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-dark);
        }

        .info-section ul {
            padding-left: 20px;
            font-size: 14px;
            color: var(--text-muted);
        }

        .info-section li {
            margin-bottom: 6px;
        }

        .alert-success {
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            color: #065F46;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 500;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
            color: var(--text-dark);
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        textarea {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid var(--border);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.15s ease;
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(148, 131, 239, 0.15);
        }

        .checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            font-size: 13px;
            color: var(--text-muted);
            cursor: pointer;
        }

        .checkbox-label input {
            margin-top: 3px;
        }

        .btn-delete {
            background-color: var(--danger);
            color: #FFFFFF;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.15s ease;
        }

        .btn-delete:hover {
            background-color: #DC2626;
        }

        .error-message {
            color: var(--danger);
            font-size: 12px;
            margin-top: 4px;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Account & Data Deletion Request</h1>
                <p>{{ $siteName ?? config('app.name', 'SuperSub') }} Application</p>
            </div>

            @if(session('status_message'))
                <div class="alert-success">
                    {{ session('status_message') }}
                </div>
            @endif

            <div class="notice-box">
                <h3>Permanent Action Warning</h3>
                <p>Deleting your account is permanent and cannot be undone. Once processed, you will immediately lose access to your account, wallet balance, and historical benefits.</p>
            </div>

            <div class="info-section">
                <h2>What data will be deleted?</h2>
                <ul>
                    <li>Personal profile information (Full Name, Phone Number, Email, Address).</li>
                    <li>Security credentials (Hashed passwords, Transaction PINs, active login sessions and tokens).</li>
                    <li>Saved beneficiaries, payment preferences, and device identifiers.</li>
                    <li>Referral associations and unclaimed bonus points.</li>
                </ul>
            </div>

            <div class="info-section">
                <h2>What data is retained and why?</h2>
                <ul>
                    <li>Financial transaction records and payment gateway ledger references are retained in accordance with Central Bank regulations and Anti-Money Laundering (AML) audit requirements.</li>
                    <li>Regulatory records are securely archived and retained for the minimum statutory period required by financial compliance laws.</li>
                </ul>
            </div>

            <form action="{{ route('account-deletion.submit') }}" method="POST">
                @csrf

                <div class="form-group">
                    <label for="email">Registered Email Address *</label>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required placeholder="e.g. user@example.com">
                    @error('email')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-group">
                    <label for="phone_number">Registered Phone Number (Optional)</label>
                    <input type="text" id="phone_number" name="phone_number" value="{{ old('phone_number') }}" placeholder="e.g. 08012345678">
                    @error('phone_number')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-group">
                    <label for="password">Account Password (Optional - for instant automated deletion)</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password to delete instantly">
                    @error('password')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-group">
                    <label for="reason">Reason for Leaving (Optional)</label>
                    <textarea id="reason" name="reason" rows="3" placeholder="Tell us why you are deleting your account...">{{ old('reason') }}</textarea>
                    @error('reason')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="confirm_deletion" value="1" required>
                        <span>I confirm that I understand this action is permanent and wish to delete my account and associated personal data.</span>
                    </label>
                    @error('confirm_deletion')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <button type="submit" class="btn-delete">Submit Account Deletion Request</button>
            </form>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $siteName ?? config('app.name', 'SuperSub') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
