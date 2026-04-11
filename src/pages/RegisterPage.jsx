import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authRegister } from '../services/api'

export default function RegisterPage() {
  const nav = useNavigate()
  const [form, setForm]     = useState({ fullName: '', email: '', phoneNumber: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authRegister(form)
      toast.success('Account created! Check your email for OTP.')
      nav('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-14 pb-8"
        style={{ background: 'linear-gradient(135deg,#be123c 0%,#4c1d95 60%,#991b1b 100%)' }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
        <button onClick={() => nav(-1)}
          className="mb-5 flex items-center gap-1.5 text-white/60 text-sm hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.png" className="w-10 h-10 rounded-2xl" alt="" />
        </div>
        <h1 className="text-3xl font-black text-white">Create Account</h1>
        <p className="text-white/60 text-sm mt-1">Join millions banking the sharp way</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'John Doe', auto: 'name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com', auto: 'email' },
            { label: 'Phone Number', key: 'phoneNumber', type: 'tel', placeholder: '+2348012345678', auto: 'tel' },
          ].map(({ label, key, type, placeholder, auto }) => (
            <div key={key}>
              <label className="label-dark">{label}</label>
              <input
                type={type} value={form[key]} onChange={set(key)}
                placeholder={placeholder} required autoComplete={auto}
                className="input-dark"
              />
            </div>
          ))}

          <div>
            <label className="label-dark">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={form.password}
                onChange={set('password')} placeholder="Min. 8 characters"
                required minLength={8} className="input-dark pr-12"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw
                  ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                }
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="brand-btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</>
                : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-sm text-white/40 pt-1 pb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-400 font-semibold">Sign in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}
