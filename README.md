# SharpPay Frontend 🚀

A premium, high-performance Neo-Banking frontend for **SharpPay**, built to deliver a seamless, secure, and visually stunning user experience. 

## 🛠 Tech Stack
* **Build Tool:** Vite (Ultra-fast development server and bundler)
* **Framework:** React 18
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (Custom Rose & Purple design system)
* **Animations:** Framer Motion (Smooth page transitions and micro-interactions)
* **State & Data Fetching:** React Context API + Axios
* **Notifications:** React Hot Toast
* **PDF Generation:** html2canvas + jsPDF (For downloadable transaction receipts)

## 🎨 Color Palette
The app uses a modern, vibrant gradient theme to convey trust and premium quality.

| Theme Element | TailWind Classes | Usage |
| :--- | :--- | :--- |
| **App Background** | `from-[#fff1f2] to-[#fdf4ff]` | Soft, warm gradient base |
| **Primary Headers** | `from-[#be123c] to-[#7c3aed]` | Deep Rose to Purple gradients |
| **Action Buttons** | `from-[#e11d48] to-[#7c3aed]` | Primary interactive elements |
| **Success / Credit** | `emerald-50` / `emerald-600` | Inflow transactions, active states |
| **Warning / Debit** | `rose-50` / `rose-600` | Outflow transactions, frozen cards |
| **Highlights** | `amber-300` / `amber-400` | Merchant tiers, copy buttons, limits |

## 🗺 App Architecture (Pages)

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | `WelcomePage` | Landing page for unauthenticated users |
| `/login`, `/register` | `Auth Pages` | User onboarding and authentication |
| `/verify-otp` | `VerifyOtpPage` | Email OTP verification step |
| `/dashboard` | `DashboardPage` | Wallet balance, quick actions, recent transactions |
| `/transfer` | `TransferPage` | Send money (Internal & External Banks) with Name Resolution |
| `/cards` | `CardsPage` | Virtual Card management, Freeze/Unfreeze, simulated PIN |
| `/bills` | `BillsPage` | Buy Airtime, Data, Betting, Electricity, and Internet |
| `/history` | `HistoryPage` | Full transaction ledger with PDF downloadable receipts |
| `/kyc` | `KycPage` | Secure Face ID / Liveness capture using device camera |
| `/settings` | `SettingsPage` | Liveness limits, Transaction PIN setup and recovery |

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
2. Environment Setup
Create a .env file in the root directory and point it to your Spring Boot backend:

Code snippet
VITE_API_URL=[https://your-live-backend-domain.com/api/v1](https://your-live-backend-domain.com/api/v1)
(For local development, use http://localhost:8080/api/v1)

3. Start development server
Bash
npm run dev
4. Build for production
Bash
npm run build
npm run preview
🔐 Security & API Handling
JWT Authentication: Tokens are securely stored and automatically injected into headers via an Axios Interceptor (src/services/api.js).

Liveness Checks: Transactions exceeding the user's custom limit trigger an immediate LivenessCamera pop-up for facial verification.

Transaction PINs: All financial movements (Transfers, Bills) require a 4-digit PIN, managed via a custom <PinInput /> component.