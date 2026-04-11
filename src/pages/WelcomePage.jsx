import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '⚡', label: 'Instant Transfers' },
  { icon: '🔒', label: 'Bank-Grade Security' },
  { icon: '🌐', label: 'Bills & Utilities' },
]

export default function WelcomePage() {
  const nav = useNavigate()

  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      {/* Multi-stop gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.45) 30%, rgba(10,10,10,0.85) 60%, rgba(10,10,10,0.98) 85%, #0A0A0A 100%)',
        }}
      />

      {/* Brand gradient top-left accent */}
      <div
        className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #e11d48 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6">
        {/* Top logo badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-14 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/20 shadow-brand">
            <img src="/logo.png" alt="SharpPay" className="w-full h-full object-cover" />
          </div>
          <span className="text-white/80 font-semibold text-sm tracking-wide">SharpPay</span>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Main content block */}
        <div className="pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', damping: 22 }}
          >
            <h1 className="text-5xl font-black leading-tight mb-3">
              <span className="text-white">Banking</span>
              <br />
              <span className="text-gradient">Made Sharp.</span>
            </h1>
            <p className="text-white/55 text-base leading-relaxed mb-7 max-w-xs">
              Send money instantly, pay all your bills, and manage your virtual card — all in one sleek app.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 glass"
                >
                  <span className="text-base">{f.icon}</span>
                  <span className="text-white/80 text-xs font-semibold">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <button
              onClick={() => nav('/register')}
              className="brand-btn-primary"
            >
              Get Started
            </button>
            <button
              onClick={() => nav('/login')}
              className="brand-btn-ghost"
            >
              Sign In
            </button>
          </motion.div>

          <p className="text-center text-white/25 text-xs mt-5 pb-6">
            Secured by 256-bit encryption · Licensed & Regulated
          </p>
        </div>
      </div>
    </div>
  )
}
