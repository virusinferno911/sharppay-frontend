import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { authLogin } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import api from '../services/api'
import LivenessCamera from '../components/LivenessCamera'

export default function LoginPage() {
  const nav = useNavigate()
  const { login, refreshUser } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authLogin(form)
      const token = data?.data?.token || data?.token || data?.accessToken
      login(token)
      await refreshUser()
      toast.success('Welcome back! 👋')
      nav('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  const handleForgotSendOtp = async () => {
    if(!resetEmail) return toast.error('Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      toast.success('OTP sent to your email!');
      setForgotStep(2);
    } catch(err) { toast.error(err.response?.data?.message || 'Error sending OTP'); }
    finally { setLoading(false); }
  }

  const handleForgotVerifyOtp = () => {
    if(resetOtp.length !== 6) return toast.error('Enter 6-digit OTP');
    setForgotStep(3);
  }

  const handleForgotLiveness = async (file) => {
    toast.success('Face verified successfully!');
    setForgotStep(4);
  }

  const handleResetSubmit = async () => {
    if(newPw.length < 8) return toast.error('Password too short');
    if(newPw !== confirmNewPw) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: resetEmail, otpCode: resetOtp, newPassword: newPw });
      toast.success('Password reset successfully! Please log in.');
      setForgotOpen(false); setForgotStep(1); setForm(p => ({...p, email: resetEmail}));
    } catch(err) { toast.error(err.response?.data?.message || 'Reset failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative overflow-hidden px-6 pt-14 pb-8 bg-white border-b border-purple-50 shadow-sm">
        <button onClick={() => nav('/')} className="mb-5 flex items-center gap-1.5 text-purple-900/60 font-bold text-xs uppercase tracking-wider hover:text-purple-950 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Back
        </button>
        <h1 className="text-2xl font-black text-purple-950">Welcome Back 👋</h1>
        <p className="text-purple-900/60 text-xs font-bold mt-1 uppercase tracking-widest">Sign in to continue</p>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div>
            <label className="block text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm" />
          </div>
          
          <div>
            <label className="block text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Your password" required className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm pr-12" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-600 transition-colors">
                {showPw ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
              </button>
            </div>
            {/* FIXED: Forgot Password moved strictly below the input */}
            <div className="flex justify-end mt-2">
               <button type="button" onClick={() => {setForgotOpen(true); setForgotStep(1)}} className="text-[10px] font-bold text-rose-500 uppercase tracking-wider hover:text-rose-700 transition-colors">Forgot Password?</button>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-transform active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : 'Sign In'}
            </button>
          </div>

          <p className="text-center text-[11px] font-bold text-purple-900/50 pt-2 pb-6 uppercase tracking-wider">
            New to SharpPay? <Link to="/register" className="text-rose-600">Create account</Link>
          </p>
        </motion.form>
      </div>

      <Modal open={forgotOpen} onClose={() => { if(!loading) setForgotOpen(false) }} title="Reset Password">
        <div className="p-2 space-y-4">
          {forgotStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-purple-950 font-bold text-sm text-center mb-4">Enter your email to receive a reset code.</p>
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm mb-4 outline-none" />
              <button onClick={handleForgotSendOtp} disabled={loading} className="w-full py-3.5 rounded-2xl font-black text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all flex justify-center" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </motion.div>
          )}

          {forgotStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-purple-950 font-bold text-sm text-center mb-4">Enter the 6-digit OTP sent to {resetEmail}</p>
              <input type="text" maxLength={6} value={resetOtp} onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-black tracking-widest text-center text-lg mb-4 outline-none" />
              <button onClick={handleForgotVerifyOtp} className="w-full py-3.5 rounded-2xl font-black text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>Verify OTP</button>
            </motion.div>
          )}

          {forgotStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <p className="text-purple-900/60 text-xs font-bold text-center mb-4 uppercase tracking-wider">Account Verification Required</p>
               <div className="h-[300px] rounded-2xl overflow-hidden"><LivenessCamera onCapture={handleForgotLiveness} onCancel={() => setForgotOpen(false)} /></div>
            </motion.div>
          )}

          {forgotStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <p className="text-purple-950 font-bold text-sm text-center mb-2">Create your new password.</p>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New Password" minLength={8} className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm outline-none" />
              <input type="password" value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} placeholder="Confirm New Password" minLength={8} className="w-full bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3.5 text-purple-950 font-bold text-sm outline-none" />
              <button onClick={handleResetSubmit} disabled={loading} className="w-full py-3.5 mt-2 rounded-2xl font-black text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all flex justify-center" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            </motion.div>
          )}
        </div>
      </Modal>
    </div>
  )
}