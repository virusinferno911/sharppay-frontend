import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('sp_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authMe()
      // Handle various API response shapes
      const u = data?.data || data?.user || data
      setUser(u)
    } catch {
      localStorage.removeItem('sp_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    const onLogout = () => { setUser(null); setLoading(false) }
    window.addEventListener('sp_logout', onLogout)
    return () => window.removeEventListener('sp_logout', onLogout)
  }, [fetchUser])

  const login = (token) => {
    localStorage.setItem('sp_token', token)
  }

  const logout = () => {
    localStorage.removeItem('sp_token')
    setUser(null)
  }

  const refreshUser = fetchUser

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
