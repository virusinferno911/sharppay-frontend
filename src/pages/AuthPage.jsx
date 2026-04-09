import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Zap, ArrowRight, Shield, ChevronRight
} from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' })
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // mock delay

    if (mode === 'login') {
      login(form.email)
      navigate('/dashboard')
    } else {
      signup(form.fullName, form.email)
      navigate('/kyc')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex">

      {/* ── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14">
        {/* Decorative gold orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gold-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] rounded-full bg-gold-500/8 blur-3xl pointer-events-none" />

        {/* Grid lines decoration */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,160,23,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <Zap size={20} className="text-charcoal-900" fill="currentColor" />
          </div>
          <span className="font-display text-2xl font-bold">
            <span className="text-white">Sharp</span>
            <span className="text-gold-400">Pay</span>
          </span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <p className="label">Neo-Banking · Nigeria</p>
          <h2 className="font-display text-5xl font-bold leading-tight">
            <span className="text-white">Banking built</span>
            <br />
            <span className="text-gold-400 text-gold-glow">for the bold.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Instant KYC verification, ACID-compliant ledger, and AI-powered biometrics.
            Your money, secured by enterprise-grade infrastructure.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              'AI-powered instant KYC in under 60 seconds',
              'Biometric face-scan for virtual card auth',
              'Real-time NGN wallet & transaction ledger',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="dot-gold flex-shrink-0" />
                <span className="text-white/60 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal-500/50 bg-charcoal-800/60 backdrop-blur-sm">
            <Shield size={14} className="text-gold-500" />
            <span className="text-white/50 text-xs">256-bit encryption · BCrypt hashing · JWT secured</span>
          </div>
        </div>
      </div>

      {/* ── Right panel / Form ──────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-14 bg-charcoal-800/30">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
              <Zap size={15} className="text-charcoal-900" fill="currentColor" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-white">Sharp</span><span className="text-gold-400">Pay</span>
            </span>
          </div>

          {/* Card */}
          <div className="card p-8 border-charcoal-500/40">

            {/* Tabs */}
            {mode !== 'forgot' && (
              <div className="flex gap-1 p-1 bg-charcoal-800 rounded-xl mb-8 border border-charcoal-600/30">
                {['login', 'signup'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                      ${mode === m
                        ? 'bg-gold-gradient text-charcoal-900 shadow-gold'
                        : 'text-white/40 hover:text-white/70'
                      }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

            {mode === 'forgot' ? (
              <ForgotForm onBack={() => setMode('login')} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {mode === 'signup' && (
                  <Field
                    icon={<User size={16} />}
                    label="Full Name"
                    type="text"
                    placeholder="Adebayo Okonkwo"
                    value={form.fullName}
                    onChange={set('fullName')}
                    required
                  />
                )}

                <Field
                  icon={<Mail size={16} />}
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                />

                {mode === 'signup' && (
                  <Field
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                  />
                )}

                <div>
                  <label className="label mb-2 block">Password</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                      value={form.password}
                      onChange={set('password')}
                      className="input-dark pl-10 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold-400 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-gold-500 hover:text-gold-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                  <p className="text-xs text-white/30 leading-relaxed">
                    By creating an account you agree to our{' '}
                    <span className="text-gold-500 cursor-pointer hover:underline">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-gold-500 cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                    </span>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {mode === 'signup' && (
            <p className="text-center text-xs text-white/30 mt-6">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-gold-500 hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────── */

function Field({ icon, label, ...inputProps }) {
  return (
    <div>
      <label className="label mb-2 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
          {icon}
        </div>
        <input {...inputProps} className="input-dark pl-10" />
      </div>
    </div>
  )
}

function ForgotForm({ onBack }) {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-white mb-1">Reset Password</h3>
        <p className="text-white/40 text-sm">We'll send a reset link to your email address.</p>
      </div>

      {sent ? (
        <div className="text-center py-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto">
            <Mail size={24} className="text-gold-400" />
          </div>
          <p className="text-white font-medium">Check your inbox</p>
          <p className="text-white/40 text-sm">A reset link was sent to <span className="text-gold-400">{email}</span></p>
          <button onClick={onBack} className="btn-ghost mt-4 flex items-center gap-2 mx-auto">
            Back to Sign In <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={handle} className="space-y-4">
          <Field
            icon={<Mail size={16} />}
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            {loading ? 'Sending…' : 'Send Reset Link'}
            {!loading && <ArrowRight size={16} />}
          </button>
          <button type="button" onClick={onBack} className="w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to Sign In
          </button>
        </form>
      )}
    </div>
  )
}
