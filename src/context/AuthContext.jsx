import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const login = (email) => {
    setUser({
      fullName: 'Adebayo Okonkwo',
      email,
      kycStatus: 'APPROVED',
      accountNumber: '0123456789',
      balance: 2_450_750.00,
    })
    setIsAuthenticated(true)
  }

  const signup = (fullName, email) => {
    setUser({
      fullName,
      email,
      kycStatus: 'PENDING',
      accountNumber: null,
      balance: 0,
    })
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
