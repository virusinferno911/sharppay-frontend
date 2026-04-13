import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { authRegister } from '../services/api'

export default function RegisterPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match!'); return }
    
    setLoading(true)
    try {
      const payload = { fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, password: form.password }
      await authRegister(payload)
      toast.success('Account created! Check your email for OTP.')
      nav('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative overflow-hidden px-6 pt-14 pb-8 bg-white border-b border-purple-50 shadow-sm">
        <button onClick={() => nav(-1)} className="mb-5 flex items-center gap-1.5 text-purple-900/60 font-bold text-xs uppercase tracking-wider hover:text-purple-950 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
        </button>
        <h1 className="text-2xl font-black text-purple-950">Create Account</h1>
        <p className="text-purple-900/60 text-xs font-bold mt-1 uppercase tracking-widest">Join millions banking the sharp way</p>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'John Doe', auto: 'name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com', auto: 'email' },
            { label: 'Phone Number', key: 'phoneNumber', type: 'tel', placeholder: '08012345678', auto: 'tel' },
          ].map(({ label, key, type, placeholder, auto }) => (
            <div key={key}>
              <label className="block text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">{label}</label>
              <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} required autoComplete={auto} className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm" />
            </div>
          ))}

          <div>
            <label className="block text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required minLength={8} className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm pr-12" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-600 transition-colors">
                {showPw ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Confirm Password</label>
            <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" required minLength={8} className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-transform active:scale-95 shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account…</> : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-[11px] font-bold text-purple-900/50 pt-2 pb-6 uppercase tracking-wider">
            Already have an account? <Link to="/login" className="text-rose-600">Sign in</Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}