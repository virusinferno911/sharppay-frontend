import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import WelcomePage   from './pages/WelcomePage'
import RegisterPage  from './pages/RegisterPage'
import LoginPage     from './pages/LoginPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import DashboardPage from './pages/DashboardPage'
import TransferPage  from './pages/TransferPage'
import CardsPage     from './pages/CardsPage'
import BillsPage     from './pages/BillsPage'
import SettingsPage  from './pages/SettingsPage'
import KycPage       from './pages/KycPage'
import HistoryPage   from './pages/HistoryPage' // <-- Imported here

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              fontSize: '14px',
              fontFamily: 'Sora, sans-serif',
              fontWeight: '500',
              maxWidth: '360px',
            },
            success: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            duration: 4000,
          }}
        />
        <Routes>
          <Route path="/"            element={<WelcomePage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/verify-otp"  element={<VerifyOtpPage />} />
          <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transfer"    element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
          <Route path="/cards"       element={<ProtectedRoute><CardsPage /></ProtectedRoute>} />
          <Route path="/bills"       element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
          <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/kyc"         element={<ProtectedRoute><KycPage /></ProtectedRoute>} />
          
          {/* Added the new History route here securely */}
          <Route path="/history"     element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}