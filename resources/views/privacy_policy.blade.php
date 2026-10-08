<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - {{ $siteName ?? config('app.name', 'SuperSub') }}</title>
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
            line-height: 1.7;
            padding: 40px 16px;
        }

        .container {
            max-width: 840px;
            margin: 0 auto;
        }

        .card {
            background: var(--card-bg);
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            padding: 48px 40px;
        }

        @media (max-width: 640px) {
            .card {
                padding: 28px 20px;
            }
        }

        .header {
            border-bottom: 1px solid var(--border);
            padding-bottom: 24px;
            margin-bottom: 32px;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 8px;
        }

        .header .meta {
            color: var(--text-muted);
            font-size: 13px;
        }

        .section {
            margin-bottom: 32px;
        }

        .section h2 {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 12px;
        }

        .section p {
            font-size: 14px;
            color: #334155;
            margin-bottom: 12px;
        }

        .section ul {
            padding-left: 20px;
            font-size: 14px;
            color: #334155;
            margin-bottom: 12px;
        }

        .section li {
            margin-bottom: 8px;
        }

        .highlight-box {
            background-color: #F1F5F9;
            border-left: 4px solid var(--primary);
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            font-size: 13px;
            color: #334155;
        }

        .highlight-box a {
            color: var(--primary-dark);
            font-weight: 600;
            text-decoration: underline;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 32px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Privacy Policy</h1>
                <div class="meta">
                    <strong>{{ $siteName ?? config('app.name', 'SuperSub') }}</strong> &bull; Effective Date: October 2026
                </div>
            </div>

            <div class="section">
                <h2>1. Introduction</h2>
                <p>
                    Welcome to <strong>{{ $siteName ?? config('app.name', 'SuperSub') }}</strong>. We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy describes how we collect, use, store, share, and protect your information when you use our mobile application and web platform for virtual top-up (VTU), airtime, mobile data, cable TV subscriptions, electricity bill payments, and financial wallet services.
                </p>
                <p>
                    By registering for an account or using our services, you consent to the practices described in this Privacy Policy.
                </p>
            </div>

            <div class="section">
                <h2>2. Information We Collect</h2>
                <p>We collect information necessary to provide seamless, secure digital payment and utility services:</p>
                <ul>
                    <li><strong>Account & Contact Information:</strong> Full name, email address, telephone number, and residential address provided during registration or profile updates.</li>
                    <li><strong>Identity Verification Data (KYC):</strong> Bank Verification Number (BVN) and National Identification Number (NIN), submitted solely to verify your identity for regulatory tier upgrades and fraud prevention.</li>
                    <li><strong>Service & Utility Data:</strong> Recipient mobile phone numbers (for airtime and data), electricity meter numbers, meter types (prepaid/postpaid), and cable TV decoder/smartcard (IUC) numbers.</li>
                    <li><strong>Financial & Transaction Records:</strong> Dedicated virtual bank account numbers assigned to you, wallet funding history, transaction amounts, timestamps, payment gateway transaction references, and wallet-to-wallet transfer details.</li>
                    <li><strong>Security Credentials:</strong> Encrypted passwords and four-digit transaction PINs. We never store passwords or PINs in plain text.</li>
                    <li><strong>Device & Usage Information:</strong> Device type, operating system, IP address, and application logs used for fraud prevention and performance monitoring.</li>
                </ul>
            </div>

            <div class="section">
                <h2>3. How We Use Your Information</h2>
                <p>We process your personal information for the following specific purposes:</p>
                <ul>
                    <li>To deliver requested utility and telecom services (purchasing airtime, data plans, TV subscriptions, and generating electricity tokens).</li>
                    <li>To manage and fund your digital wallet balances via automated virtual bank accounts and payment gateways.</li>
                    <li>To verify your identity and satisfy statutory Know Your Customer (KYC) requirements set by financial regulatory bodies.</li>
                    <li>To authenticate login sessions and authorize transactions using your secure PIN or biometrics.</li>
                    <li>To provide customer support and notify you of transaction confirmations, receipts, and service updates.</li>
                    <li>To detect, investigate, and prevent fraudulent transactions, unauthorized account access, and security incidents.</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Third-Party Sharing and Disclosures</h2>
                <p>We do not sell or rent your personal information to third parties. We disclose data only to trusted partners strictly to fulfill your transactions:</p>
                <ul>
                    <li><strong>Telecommunications Providers:</strong> MTN, Airtel, Glo, and 9mobile to deliver airtime and data subscriptions.</li>
                    <li><strong>Utility Aggregators & Discos:</strong> Accelerate, VTPass, electricity distribution companies (IKEDC, EKEDC, AEDC, IBEDC, etc.), and TV providers (DStv, GOtv, Startimes) to validate meters/smartcards and vend power tokens.</li>
                    <li><strong>Licensed Payment Gateways & Banking Partners:</strong> Monnify, Payvessel, BillStack, Paymentpoint, and commercial partner banks (Wema, Moniepoint, Sterling) to generate automated virtual funding accounts and process payments.</li>
                    <li><strong>Identity Verification Partners:</strong> Accredited verification services to confirm BVN and NIN records against national identity databases.</li>
                    <li><strong>Legal & Regulatory Authorities:</strong> Law enforcement agencies or regulatory bodies where required by applicable laws or court orders.</li>
                </ul>
            </div>

            <div class="section">
                <h2>5. Data Security</h2>
                <p>
                    We employ robust technical and organizational security measures to protect your data against unauthorized access, loss, or alteration. These include:
                </p>
                <ul>
                    <li>Industry-standard TLS/SSL encryption for all data in transit between your device and our servers.</li>
                    <li>Salted cryptographic hashing (bcrypt) for all user passwords and transaction PINs.</li>
                    <li>Restricted database access controls and periodic security assessments.</li>
                </ul>
            </div>

            <div class="section">
                <h2>6. Data Retention and Account Deletion</h2>
                <p>
                    We retain your personal information for as long as your account remains active. Under Central Bank regulations and Anti-Money Laundering (AML) audit statutes, financial transaction ledgers must be retained for the minimum statutory period required by financial compliance laws.
                </p>
                <div class="highlight-box">
                    <strong>Requesting Account & Data Deletion:</strong><br>
                    You may request permanent deletion of your account and personal profile data at any time directly through the mobile application (under Profile &rarr; Delete Account) or by submitting a request via our public deletion page:
                    <br><br>
                    <a href="/account-deletion">https://{{ request()->getHost() }}/account-deletion</a>
                </div>
            </div>

            <div class="section">
                <h2>7. Your Privacy Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access and review the personal information associated with your account.</li>
                    <li>Update or correct inaccurate details in your Profile settings.</li>
                    <li>Withdraw consent or request account closure at any time.</li>
                </ul>
            </div>

            <div class="section">
                <h2>8. Children's Privacy</h2>
                <p>
                    Our services are intended for individuals who are 18 years of age or older, or who have reached the age of majority in their jurisdiction. We do not knowingly collect personal data from minors.
                </p>
            </div>

            <div class="section">
                <h2>9. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy periodically to reflect changes in our services or legal obligations. We will notify you of material changes through the application or via email.
                </p>
            </div>

            <div class="section">
                <h2>10. Contact Us</h2>
                <p>
                    If you have questions, comments, or concerns regarding this Privacy Policy or our data practices, please contact our support team at:
                </p>
                <ul>
                    <li><strong>Email:</strong> support@{{ request()->getHost() }}</li>
                    <li><strong>Platform:</strong> {{ $siteName ?? config('app.name', 'SuperSub') }}</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $siteName ?? config('app.name', 'SuperSub') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
