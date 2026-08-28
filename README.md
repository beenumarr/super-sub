# 🚀 Super Sub (VTU App Pro)

**Super Sub** is an enterprise-grade Virtual Top-Up (VTU) and Telecom Services Platform built with **Laravel 12**, **Inertia.js (React 19)**, **TypeScript**, and **Tailwind CSS v4**. 

It provides automated vending of mobile data, airtime, cable TV subscriptions, electricity bills, exam result checker pins, airtime-to-cash conversions, and specialized internet bundles (Smile & Kirani), alongside virtual bank account wallet funding and a developer API.

---

## ✨ Features & Core Modules

### 📱 1. Telecom & VTU Vending
- **Mobile Data Top-Up**:
  - Automated vending across all major networks (MTN, Airtel, Glo, 9mobile).
  - Multi-category support: SME, Corporate Gifting, Gifting, Direct Data.
  - Custom API routing and fallback providers per network.
- **Airtime Purchase**:
  - Instant VTU top-up with customizable network discounts and rate limits.
- **Cable TV Subscriptions**:
  - DSTV, GOTV, StarTimes subscription packages.
  - Real-time Smartcard / IUC number validation before payment.
- **Electricity Bill Payments**:
  - Support for major electricity distribution companies (AEDC, EKEDC, IKEDC, IBEDC, KEDCO, etc.).
  - Meter number validation for Prepaid and Postpaid accounts with instant token generation.
- **Exam Result Checkers**:
  - Automated purchase of WAEC, NECO, and NABTEB scratch cards / pins.
- **Specialized Broadband (Smile & Kirani)**:
  - Smile 4G LTE bundle top-ups with phone/account validation.
  - Kirani data bundle vending and plan filters.

---

### 💳 2. Financial & Wallet Management
- **Automated Virtual Bank Accounts**:
  - Dedicated virtual bank accounts generated for users upon registration/KYC.
  - Multi-gateway integration: **Monnify**, **Payvessel**, **Paymentpoint**, and **BillStack**.
  - Instant automated wallet funding via webhooks.
- **Peer-to-Peer Wallet Transfers**:
  - Direct wallet-to-wallet funds transfer between registered users with username validation.
- **Card & Online Payments**:
  - Direct debit/credit card funding support via Paystack and inline gateways.
- **Airtime to Cash (A2C)**:
  - Exchange excess airtime for wallet cash with admin review, approval, and manual/auto-transfer to wallet.

---

### 👤 3. KYC & Security
- **Identity Verification (KYC)**:
  - Bank Verification Number (BVN) and National Identification Number (NIN) submission & verification.
  - Tiered transaction limits based on KYC completion.
- **Security & Session Control**:
  - Two-Factor Authentication (2FA) support.
  - Role-based Access Control (RBAC) via Spatie Permissions.

---

### 🎁 4. Referrals & Promotions
- **Referral System**:
  - Unique referral links and tracking dashboard.
  - Referral earnings withdrawal directly to main wallet.
- **Promotional Codes**:
  - Promo code creation by admins and instant redemption by users.

---

### 🔑 5. Developer API for Resellers
- **RESTful API**:
  - Secret key and token generation for automated external integration.
  - Automated VTU endpoints for resellers and third-party applications.
  - Transaction status query by reference.
  - Interactive API documentation page built into the dashboard.

---

### 👑 6. Admin Management Dashboard
- **Analytics & User Overview**: Comprehensive overview of revenue, daily transactions, active users, and system health.
- **User & Staff Management**: Impersonation ("Login as User"), category assignment, custom pricing per user, and manual wallet crediting/debiting.
- **Service & Package Management**: Configurable discount rates, service charges, data plan prices, and API provider mappings.
- **System Branding & Configurations**: Dynamic favicon, logos, app maintenance mode, site notices, and service toggles.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | [Laravel 12](https://laravel.com/) (PHP 8.2+) |
| **Frontend Adapter** | [Inertia.js 2.0](https://inertiajs.com/) |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI / Shadcn, MUI |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Database** | SQLite (Default for Dev) / MySQL 8.0+ / PostgreSQL |
| **Authentication** | Laravel Sanctum & JWT Auth (`php-open-source-saver/jwt-auth`) |
| **Authorization** | Spatie Laravel Permission (`spatie/laravel-permission`) |

---

## ⚙️ Installation & Setup Guide

### 📋 Prerequisites
- **PHP**: `>= 8.2` (with PDO, OpenSSL, Mbstring, Tokenizer, XML, Ctype, JSON extensions)
- **Composer**: `>= 2.0`
- **Node.js**: `>= 18.0` & **npm** `>= 9.0`
- **Database**: SQLite (built-in) or MySQL / PostgreSQL

---

### 🚀 Quick Start Instructions

#### 1. Clone Repository & Navigate to Directory
```bash
git clone <repository-url>
cd vtu-app-pro
```

#### 2. Copy Environment Configuration
```bash
cp .env.example .env
```
*(Default DB is SQLite. Update `.env` with MySQL credentials if using a dedicated database server)*

#### 3. Install Backend & Frontend Dependencies
```bash
composer install
npm install
```

#### 4. Generate Application & JWT Keys
```bash
php artisan key:generate
php artisan jwt:secret
```

#### 5. Set Up Database & Run Migrations
If using the default SQLite database:
```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
```

#### 6. Link Storage Directory
```bash
php artisan storage:link
```

---

## 💻 Running the Application

### Option A: Concurrent Development Runner (Recommended)
Super Sub comes pre-configured with a single command to run the web server, Vite asset builder, and queue worker concurrently:

```bash
composer run dev
```

### Option B: Separate Terminal Commands
```bash
# Terminal 1: Laravel Backend
php artisan serve

# Terminal 2: Vite Dev Server
npm run dev

# Terminal 3: Queue Listener
php artisan queue:listen --tries=1
```

Once running, access the web application at **`http://127.0.0.1:8000`**.

---

## 🧪 Testing & Code Quality

```bash
# Run PHP Unit / Pest Tests
php artisan test

# Check TypeScript types
npm run types

# Build production assets
npm run build
```

---

## 📜 License
This project is proprietary software. All rights reserved.
