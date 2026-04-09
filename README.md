# SharpPay Frontend

A premium Neo-Banking frontend for **SharpPay** built with Vite + React + Tailwind CSS.

## Tech Stack
- **Vite** — ultra-fast dev server and bundler
- **React 18** — with React Router v6 for routing
- **Tailwind CSS** — custom charcoal & gold design system
- **Lucide React** — icon library

## Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `charcoal-900` | `#0F0F11` | App background |
| `charcoal-800` | `#161618` | Sidebar / panels |
| `charcoal-700` | `#1E1E21` | Card surfaces |
| `gold-400` | `#E8B831` | Accents & highlights |
| `gold-600` | `#C9951A` | Primary gold |

## Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/auth` | `AuthPage` | Login, Registration, Forgot Password |
| `/kyc` | `KYCPage` | 4-step KYC: ID upload → Face scan → AI processing → Approval |
| `/dashboard` | `DashboardPage` | Wallet balance, transactions, bill payments |
| `/card` | `VirtualCardPage` | Virtual debit card with biometric reveal |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Connecting to the Backend
Set your API URL in a `.env` file:
```
VITE_API_URL=https://sharppay.virusinferno.xyz
```

The `AuthContext` is currently using mock state. Replace the `login()` and `signup()` methods with real `axios` calls to your Spring Boot backend as documented in the build guide.

## KYC Camera Hook
The KYC page directly uses `navigator.mediaDevices.getUserMedia`. For production, extract this into `/src/hooks/useCamera.js` as shown in the complete build guide (Step 17).

## Folder Structure
```
src/
├── context/
│   └── AuthContext.jsx     ← Mock auth state (replace with real API)
├── pages/
│   ├── AuthPage.jsx        ← Login + Register + Forgot Password
│   ├── KYCPage.jsx         ← 4-step identity verification
│   ├── DashboardPage.jsx   ← Main wallet dashboard
│   └── VirtualCardPage.jsx ← Virtual card + biometric auth
├── components/
│   └── AppLayout.jsx       ← Sidebar + top bar wrapper
├── App.jsx                 ← Router setup
├── main.jsx                ← React entry point
└── index.css               ← Tailwind + custom utilities
```
