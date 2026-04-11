import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl animate-pulse-ring border-2 border-rose-500/50" />
            <img src="/logo.png" alt="SharpPay" className="w-20 h-20 rounded-3xl relative z-10" />
          </div>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 bg-rose-500 rounded-full"
                animate={{ y: [0,-8,0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i*0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
