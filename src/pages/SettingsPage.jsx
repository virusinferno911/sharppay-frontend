import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authSettings } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'

const KYC_BADGE = {
  VERIFIED:    { label: 'Verified',   color: 'text-green-400',  bg: 'bg-green-500/15', dot: 'bg-green-400' },
  PENDING:     { label: 'Pending',    color: 'text-amber-400',  bg: 'bg-amber-500/15', dot: 'bg-amber-400' },
  UNVERIFIED:  { label: 'Not Verified', color: 'text-rose-400', bg: 'bg-rose-500/15',  dot: 'bg-rose-400'  },
  REJECTED:    { label: 'Rejected',   color: 'text-red-400',    bg: 'bg-red-500/15',   dot: 'bg-red-400'   },
}

export default function SettingsPage() {
  const nav = useNavigate()
  const { user, logout, refreshUser } = useAuth()

  const [pinOpen, setPinOpen]       = useState(false)
  const [pinStep, setPinStep]       = useState(1)   // 1=enter, 2=confirm
  const [firstPin, setFirstPin]     = useState('')
  const [pinReset, setPinReset]     = useState(0)
  const [savingPin, setSavingPin]   = useState(false)

  const [logoutOpen, setLogoutOpen] = useState(false)

  const kycStatus = (user?.kycStatus || 'UNVERIFIED').toUpperCase()
  const badge     = KYC_BADGE[kycStatus] || KYC_BADGE.UNVERIFIED

  const openPinModal = () => { setPinStep(1); setFirstPin(''); setPinReset(r => r+1); setPinOpen(true) }

  const handlePinStep = (pin) => {
    if (pinStep === 1) { setFirstPin(pin); setPinStep(2); setPinReset(r => r+1) }
    else {
      if (pin !== firstPin) {
        toast.error('PINs do not match. Please try again.')
        setPinStep(1); setFirstPin(''); setPinReset(r => r+1)
        return
      }
      savePin(pin)
    }
  }

  const savePin = async (pin) => {
    setSavingPin(true)
    try {
      await authSettings({ transactionPin: pin })
      toast.success('Transaction PIN updated! 🔒')
      setPinOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      setPinStep(1); setFirstPin(''); setPinReset(r => r+1)
    } finally {
      setSavingPin(false)
    }
  }

  const handleLogout = () => { logout(); nav('/', { replace: true }); toast.success('Signed out') }

  const initials = (name) => {
    if (!name) return 'SP'
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const MENU = [
    {
      title: 'Account',
      items: [
        {
          icon: '🛡️', label: 'Identity Verification', sub: badge.label,
          badgeBg: badge.bg, badgeColor: badge.color, badgeDot: badge.dot,
          action: () => nav('/kyc'),
          highlight: kycStatus !== 'VERIFIED',
        },
        {
          icon: '🔑', label: 'Transaction PIN', sub: 'Set or update your 4-digit PIN',
          action: openPinModal,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '💬', label: 'Help & Support',   sub: 'Chat, email, or call us', action: () => toast('Opening support…') },
        { icon: '📋', label: 'Privacy Policy',   sub: 'Read our policy', action: () => toast('Opening policy…') },
        { icon: '📃', label: 'Terms of Service', sub: 'Read our terms',  action: () => toast('Opening terms…') },
      ],
    },
  ]

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe">
      {/* Header / Profile */}
      <div className="relative overflow-hidden px-5 pt-14 pb-8"
        style={{ background: 'linear-gradient(160deg,#0a0018 0%,#0f0018 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, #7c3aed 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
        <div className="relative flex flex-col items-center text-center gap-3 pb-2">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-brand-lg"
            style={{ background: 'linear-gradient(135deg,#be123c 0%,#4c1d95 100%)' }}>
            {initials(user?.fullName || user?.name)}
          </motion.div>
          <div>
            <p className="text-white font-black text-xl">{user?.fullName || user?.name || 'User'}</p>
            <p className="text-white/40 text-sm mt-0.5">{user?.email || ''}</p>
          </div>
          {/* KYC badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${badge.badgeDot || badge.dot}`} />
            <span className={`text-xs font-bold ${badge.color}`}>KYC {badge.label}</span>
          </div>
        </div>
      </div>

      {/* Account number card */}
      {user?.accountNumber && (
        <div className="mx-5 mt-4">
          <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs mb-0.5">SharpPay Account</p>
              <p className="text-white font-bold font-mono tracking-widest">{user.accountNumber}</p>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(user.accountNumber); toast.success('Copied!') }}
              className="w-9 h-9 glass rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Menu sections */}
      <div className="flex-1 px-5 mt-5 space-y-5">
        {MENU.map((section) => (
          <div key={section.title}>
            <p className="label-dark mb-2">{section.title}</p>
            <div className="glass rounded-2xl divide-y divide-white/8 overflow-hidden">
              {section.items.map((item, i) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors text-left
                    ${item.highlight ? 'bg-amber-500/5' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0
                    ${item.highlight ? 'bg-amber-500/15' : 'glass'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${item.highlight ? 'text-amber-300' : 'text-white'}`}>
                      {item.label}
                    </p>
                    {item.badgeDot
                      ? <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.badgeDot}`} />
                          <span className={`text-xs font-semibold ${item.badgeColor}`}>{item.sub}</span>
                        </div>
                      : <p className="text-white/35 text-xs mt-0.5 truncate">{item.sub}</p>
                    }
                  </div>
                  <svg className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pb-4">
          <button onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/25 bg-red-500/8
              text-red-400 font-bold text-sm hover:bg-red-500/15 transition-all active:scale-97">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>

        <p className="text-center text-white/15 text-xs pb-6">SharpPay v1.0.0 · Secured by 256-bit SSL</p>
      </div>

      {/* ── Transaction PIN modal ── */}
      <Modal open={pinOpen} onClose={() => !savingPin && setPinOpen(false)} title="Set Transaction PIN">
        <div className="py-3">
          <AnimatePresence mode="wait">
            <motion.div key={pinStep}
              initial={{ opacity: 0, x: pinStep === 1 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-5 px-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'linear-gradient(135deg,#4c1d95,#be123c)' }}>
                  {pinStep === 1 ? '🔑' : '✅'}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {pinStep === 1 ? 'Enter a new PIN' : 'Confirm your PIN'}
                  </p>
                  <p className="text-white/35 text-xs">
                    {pinStep === 1 ? 'Choose a secure 4-digit transaction PIN' : 'Re-enter the same PIN to confirm'}
                  </p>
                </div>
              </div>
              <PinInput
                label={pinStep === 1 ? 'New 4-digit PIN' : 'Confirm PIN'}
                onComplete={handlePinStep}
                onReset={pinReset}
              />
              {savingPin && (
                <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-sm">
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                  Saving your PIN…
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Modal>

      {/* ── Logout confirm modal ── */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Sign Out">
        <p className="text-white/50 text-sm mb-5 leading-relaxed">
          Are you sure you want to sign out of your SharpPay account?
        </p>
        <div className="space-y-3">
          <button onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm
              hover:bg-red-500/25 transition-all active:scale-97">
            Yes, Sign Out
          </button>
          <button onClick={() => setLogoutOpen(false)}
            className="w-full py-3.5 rounded-2xl glass text-white/60 font-semibold text-sm hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  )
}
