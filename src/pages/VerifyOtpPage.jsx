import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authVerifyOtp } from '../services/api'

export default function VerifyOtpPage() {
  const nav = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ''
  const [otp, setOtp]         = useState(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const refs = Array.from({ length: 6 }, () => useRef(null))

  useEffect(() => { setTimeout(() => refs[0].current?.focus(), 120) }, [])

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) refs[idx + 1].current?.focus()
    if (next.every(Boolean)) submit(next.join(''))
  }
  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs[idx - 1].current?.focus()
  }
  const handlePaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length === 6) { const a = p.split(''); setOtp(a); refs[5].current?.focus(); submit(p) }
  }

  const submit = async (code) => {
    if (loading || done) return
    setLoading(true)
    try {
      await authVerifyOtp({ email, otpCode: code })
      setDone(true)
      toast.success('Email verified! Please sign in.')
      setTimeout(() => nav('/login'), 1600)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      setOtp(Array(6).fill(''))
      setTimeout(() => refs[0].current?.focus(), 80)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen">
      <div className="relative overflow-hidden px-6 pt-14 pb-10"
        style={{ background: 'linear-gradient(135deg,#be123c 0%,#4c1d95 60%,#991b1b 100%)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
        <button onClick={() => nav(-1)}
          className="mb-5 flex items-center gap-1.5 text-white/60 text-sm hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg> Back
        </button>
        <h1 className="text-3xl font-black text-white">Verify Email ✉️</h1>
        <p className="text-white/60 text-sm mt-1.5">
          We sent a 6-digit code to{' '}
          <span className="text-white font-semibold">{email || 'your email'}</span>
        </p>
      </div>

      <div className="flex-1 px-6 py-10">
        {done ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-5 py-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>✅</div>
            <p className="text-white font-bold text-xl">Email Verified!</p>
            <p className="text-white/40 text-sm">Redirecting to login…</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/40 text-sm text-center mb-7">Enter the 6-digit code below</p>
            <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
              {otp.map((v, i) => (
                <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
                  value={v} onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all
                    bg-white/5 text-white focus:outline-none
                    ${v ? 'border-rose-500 bg-rose-500/10' : 'border-white/15'}
                    focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30`}
                />
              ))}
            </div>
            <button onClick={() => submit(otp.join(''))} disabled={loading || otp.some(d => !d)}
              className="brand-btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying…</>
                : 'Verify OTP'}
            </button>
            <p className="text-center text-white/30 text-sm mt-5">
              Didn't get it?{' '}
              <button className="text-rose-400 font-semibold">Resend code</button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
