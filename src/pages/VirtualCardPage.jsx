import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  CreditCard, Shield, Camera, CheckCircle, Lock,
  Eye, EyeOff, Copy, CheckCheck, Wifi, AlertCircle,
  ArrowRight, X, Zap, RotateCcw, Info
} from 'lucide-react'

function fmt(n) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

const MOCK_CARD = {
  number:  '4444 •••• •••• 9271',
  numberFull: '4444 8392 7741 9271',
  holder:  'ADEBAYO OKONKWO',
  expiry:  '11/27',
  cvv:     '•••',
  cvvFull: '482',
  type:    'VISA',
  limit:   500_000,
  spent:   128_430,
}

export default function VirtualCardPage() {
  const { user } = useAuth()
  const [cardRevealed, setCardRevealed] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [copyState, setCopyState] = useState({})

  const requestReveal = () => {
    if (!cardRevealed) setShowAuthModal(true)
    else setCardRevealed(false)
  }

  const onAuthSuccess = () => {
    setShowAuthModal(false)
    setCardRevealed(true)
  }

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text)
    setCopyState(s => ({ ...s, [key]: true }))
    setTimeout(() => setCopyState(s => ({ ...s, [key]: false })), 2000)
  }

  const card = MOCK_CARD
  const spentPct = Math.round((card.spent / card.limit) * 100)

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Virtual Card</h1>
        <p className="text-white/40 text-sm">Your SharpPay debit card — secured by biometric auth</p>
      </div>

      {/* ── Card visual ─────────────────────────── */}
      <div className="perspective-1000">
        <div
          className={`relative w-full max-w-md mx-auto transition-transform duration-700 transform-style-preserve-3d cursor-pointer`}
          style={{
            aspectRatio: '1.586',
            transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            perspective: '1000px',
          }}
          onClick={() => setCardFlipped(f => !f)}
        >

          {/* ── FRONT ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-gold-lg"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #1A1A1C 0%, #222018 40%, #2A2210 70%, #1C1A0E 100%)',
              }}
            />

            {/* Gold decorative rings */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-gold-600/15 pointer-events-none" />
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-gold-500/10 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border border-gold-700/10 pointer-events-none" />

            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer-gold pointer-events-none" />

            <div className="relative h-full p-6 flex flex-col justify-between">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-gold">
                    <Zap size={15} className="text-charcoal-900" fill="currentColor" />
                  </div>
                  <span className="font-display text-white font-bold text-base tracking-wide">SharpPay</span>
                </div>

                {/* Contactless icon */}
                <Wifi size={22} className="text-gold-400/60 rotate-90" />
              </div>

              {/* Chip */}
              <div>
                <div
                  className="w-11 h-8 rounded-md mb-5 border border-gold-600/30"
                  style={{ background: 'linear-gradient(135deg, #C9A827 0%, #F5CE50 50%, #C9A827 100%)' }}
                >
                  <div className="w-full h-1/2 border-b border-gold-700/40 flex">
                    <div className="flex-1 border-r border-gold-700/40" />
                    <div className="flex-1" />
                  </div>
                </div>

                {/* Card number */}
                <p className="font-mono text-white/90 text-lg tracking-[0.2em] mb-1">
                  {cardRevealed ? card.numberFull : card.number}
                </p>
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Card Holder</p>
                  <p className="font-mono text-white text-sm tracking-wider">{card.holder}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Expires</p>
                  <p className="font-mono text-white text-sm">{card.expiry}</p>
                </div>
                {/* Visa logo */}
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-red-500/80 -mr-4 border border-white/10" />
                  <div className="w-8 h-8 rounded-full bg-gold-500/80 border border-white/10" />
                </div>
              </div>
            </div>
          </div>

          {/* ── BACK ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-gold-lg"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1A1A1C 0%, #222018 60%, #1C1A0E 100%)',
            }}
          >
            {/* Magnetic stripe */}
            <div className="w-full h-12 bg-charcoal-950 mt-8" />

            <div className="px-6 mt-6">
              {/* Signature strip + CVV */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex-1 h-10 rounded-md flex items-end px-3 pb-2"
                  style={{ background: 'repeating-linear-gradient(45deg, #2a2a2a, #2a2a2a 5px, #333 5px, #333 10px)' }}
                >
                  <span className="text-white/20 text-xs italic font-mono">Authorized Signature</span>
                </div>
                <div className="w-16 h-10 bg-white rounded-md flex flex-col items-center justify-center">
                  <p className="text-charcoal-900 text-[8px] font-bold">CVV</p>
                  <p className="text-charcoal-900 font-mono font-bold text-sm">
                    {cardRevealed ? card.cvvFull : card.cvv}
                  </p>
                </div>
              </div>

              <p className="text-white/20 text-[10px] leading-relaxed text-center">
                This card is issued by SharpPay under virtual card scheme. Report lost cards to support immediately.
                All transactions are monitored and secured.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-3">Click card to flip</p>
      </div>

      {/* ── Card controls ────────────────────────── */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={requestReveal}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          {cardRevealed ? <><EyeOff size={15} /> Hide Details</> : <><Eye size={15} /> Reveal Details</>}
        </button>
        <button className="btn-ghost flex items-center gap-2 text-sm text-red-400 border-red-500/20 hover:bg-red-500/5 hover:border-red-500/30">
          <Lock size={15} /> Freeze Card
        </button>
      </div>

      {/* ── Card details ─────────────────────────── */}
      {cardRevealed && (
        <div className="card p-5 border-gold-700/20 bg-gold-600/5 animate-slide-up space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={14} className="text-gold-500" />
            <p className="text-gold-400 text-sm font-medium">Card Details Unlocked</p>
          </div>
          {[
            { label: 'Card Number', value: card.numberFull, key: 'num' },
            { label: 'Expiry Date', value: card.expiry,     key: 'exp' },
            { label: 'CVV',         value: card.cvvFull,    key: 'cvv' },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/30 mb-0.5">{label}</p>
                <p className="font-mono text-white text-sm tracking-wider">{value}</p>
              </div>
              <button
                onClick={() => copyText(key, value)}
                className="text-white/30 hover:text-gold-400 transition-colors"
              >
                {copyState[key] ? <CheckCheck size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Spending limit ───────────────────────── */}
      <div className="card p-6 border-charcoal-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium text-sm">Monthly Spend Limit</p>
            <p className="text-white/40 text-xs mt-0.5">{fmt(card.spent)} of {fmt(card.limit)} used</p>
          </div>
          <span className="font-mono text-gold-400 font-bold">{spentPct}%</span>
        </div>

        <div className="w-full h-2 bg-charcoal-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gold-gradient transition-all duration-1000"
            style={{ width: `${spentPct}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/25 mt-2">
          <span>₦0</span>
          <span>{fmt(card.limit)}</span>
        </div>
      </div>

      {/* ── No card state (hidden, shown if needed) */}
      <div className="card p-6 border-charcoal-500/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <Info size={18} className="text-gold-400" />
        </div>
        <div>
          <p className="text-white text-sm font-medium mb-1">Virtual Card Security</p>
          <p className="text-white/40 text-xs leading-relaxed">
            Revealing card details requires biometric face verification stored in your AWS Rekognition collection.
            A one-time <span className="text-gold-400">₦500 issuance fee</span> is charged upon first card creation.
          </p>
        </div>
      </div>

      {/* ── Face Auth Modal ──────────────────────── */}
      {showAuthModal && (
        <FaceAuthModal
          onSuccess={onAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}

/* ── Face Auth Modal ─────────────────────────────────── */
function FaceAuthModal({ onSuccess, onClose }) {
  const [step, setStep] = useState('prompt') // prompt | scanning | success | failed
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => () => stopCamera(), [])

  const startScan = async () => {
    setStep('scanning')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      // Simulate processing
      setTimeout(() => {
        stopCamera()
        setStep('success')
        setTimeout(onSuccess, 1200)
      }, 3000)
    } catch {
      setStep('failed')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm card p-8 border-charcoal-500/40 animate-slide-up">

        {step === 'prompt' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
              <Camera size={28} className="text-gold-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Biometric Verification</h3>
            <p className="text-white/40 text-sm mb-6 leading-relaxed">
              To reveal your card details, we need to verify your identity via a quick face scan.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button onClick={startScan} className="btn-gold flex-1 flex items-center justify-center gap-2">
                <Camera size={15} /> Scan Face
              </button>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="text-center">
            <div className="relative rounded-xl overflow-hidden aspect-video bg-charcoal-900 mb-4 border border-charcoal-500/40">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-40 border-2 border-gold-400/70 rounded-full border-dashed animate-pulse-gold" />
              </div>
              {/* Scan line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gold-400/50"
                style={{ animation: 'scanLine 1.5s ease-in-out infinite', top: '50%' }}
              />
            </div>
            <style>{`@keyframes scanLine { 0%,100%{top:20%} 50%{top:80%} }`}</style>
            <p className="text-white text-sm font-medium mb-1">Scanning face…</p>
            <p className="text-white/30 text-xs">Keep your face within the oval guide</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-gold-md">
              <CheckCircle size={28} className="text-charcoal-900" />
            </div>
            <p className="text-white font-semibold">Identity Verified</p>
            <p className="text-white/30 text-sm mt-1">Unlocking card details…</p>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-white font-semibold mb-1">Camera Access Denied</p>
            <p className="text-white/40 text-sm mb-5">Please allow camera access in your browser settings.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setStep('prompt')} className="btn-gold flex-1 flex items-center gap-2 justify-center">
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
