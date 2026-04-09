import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import KYCPage from './pages/KYCPage'
import DashboardPage from './pages/DashboardPage'
import VirtualCardPage from './pages/VirtualCardPage'
import AppLayout from './components/AppLayout'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />

          <Route path="/auth" element={
            <PublicRoute><AuthPage /></PublicRoute>
          } />

          <Route path="/kyc" element={
            <ProtectedRoute><KYCPage /></ProtectedRoute>
          } />

          {/* Protected app routes with sidebar layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/card" element={<VirtualCardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
