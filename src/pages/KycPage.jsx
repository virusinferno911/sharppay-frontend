import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { kycVerify, authMe } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LivenessCamera from '../components/LivenessCamera'

const STEPS = [
  { n: 1, label: 'ID Front', icon: '🪪', desc: 'Upload the front of your government-issued ID' },
  { n: 2, label: 'ID Back',  icon: '🔄', desc: 'Upload the back of the same ID document' },
  { n: 3, label: 'Liveness', icon: '🤳', desc: 'Complete a quick face scan for verification' },
]

export default function KycPage() {
  const nav = useNavigate()
  const { refreshUser } = useAuth()

  const [step, setStep]           = useState(1)
  const [idFront, setIdFront]     = useState(null)
  const [idBack, setIdBack]       = useState(null)
  const [selfie, setSelfie]       = useState(null)
  const [livenessStarted, setLivenessStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)

  const frontRef = useRef()
  const backRef  = useRef()
  
  // Guard to prevent ghost double-clicks
  const isSubmittingGuard = useRef(false)

  const pickFile = (setter, next) => (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    setter(f)
    if (next) setTimeout(() => setStep(next), 300)
  }

  const handleLivenessCapture = (file) => {
    setSelfie(file)
    setLivenessStarted(false)
    toast.success('Liveness check passed ✅')
  }

  const submit = async () => {
    if (isSubmittingGuard.current) return;
    if (!idFront || !idBack || !selfie) { toast.error('All three documents are required'); return }
    
    isSubmittingGuard.current = true;
    setSubmitting(true)
    
    try {
      const fd = new FormData()
      fd.append('idFront', idFront)
      fd.append('idBack', idBack)
      fd.append('liveSelfie', selfie)
      await kycVerify(fd)
      
      await refreshUser()
      setDone(true)
      toast.success('Identity Verified Successfully! ₦50,000 Credited.')
      setTimeout(() => nav('/dashboard'), 2500)
      
    } catch (err) {
      // ==========================================
      // SMART FALLBACK: THE GHOST ERROR CATCHER
      // ==========================================
      // If the connection drops but Java successfully processed the AWS match, 
      // we double-check the user's status directly from the database before showing an error.
      try {
        const { data } = await authMe();
        const userStatus = data?.data?.kycStatus || data?.kycStatus;
        
        if (userStatus === 'VERIFIED') {
          await refreshUser();
          setDone(true);
          toast.success('Identity Verified Successfully! ₦50,000 Credited.');
          setTimeout(() => nav('/dashboard'), 2500);
          return; // Exit immediately so the error toast never shows!
        }
      } catch (fallbackErr) {
        // Silently ignore fallback errors
      }

      // If we reach here, it actually failed (e.g. AWS rejected the fake ID)
      const errorMsg = err.response?.data?.message || err.message || '';
      if (errorMsg.includes('already KYC Verified') || errorMsg.includes('already exist')) {
        await refreshUser();
        setDone(true);
        toast.success('Identity Verified Successfully!');
        setTimeout(() => nav('/dashboard'), 2500);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      isSubmittingGuard.current = false;
      setSubmitting(false)
    }
  }

  // If liveness camera is running, render full-screen cam
  if (livenessStarted) {
    return (
      <div className="app-shell flex flex-col min-h-screen">
        <div className="relative px-5 pt-14 pb-5 flex items-center gap-3"
          style={{ background: '#0A0A0A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setLivenessStarted(false)}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center">
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Liveness Check</h1>
            <p className="text-white/40 text-xs">Follow the on-screen instructions</p>
          </div>
        </div>
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <LivenessCamera
            onCapture={handleLivenessCapture}
            onCancel={() => setLivenessStarted(false)}
          />
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 16 }}
          className="flex flex-col items-center gap-5 px-8 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>✅</div>
          <h2 className="text-white font-black text-2xl">KYC Submitted!</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Your identity has been verified securely. Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#050018 0%,#0a0018 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, #7c3aed 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-10"
          style={{ background: 'linear-gradient(to bottom,transparent,#0A0A0A)' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => nav(-1)}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center mr-1">
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Identity Verification</h1>
            <p className="text-white/40 text-xs">Secure · Encrypted · ~2 minutes</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-5 pt-5 pb-3">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-5 right-5 top-5 h-px bg-white/10 z-0" />
          <div
            className="absolute left-5 top-5 h-px z-0 transition-all duration-500"
            style={{
              background: 'linear-gradient(90deg,#e11d48,#7c3aed)',
              width: `${((step - 1) / 2) * (100 - 10)}%`,
            }}
          />
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-all duration-300 font-bold
                ${step > s.n
                  ? 'text-white shadow-brand'
                  : step === s.n
                  ? 'text-white shadow-brand'
                  : 'glass text-white/30'
                }`}
                style={step >= s.n ? { background: 'linear-gradient(135deg,#e11d48,#7c3aed)' } : {}}>
                {step > s.n ? '✓' : s.icon}
              </div>
              <span className={`text-[10px] font-bold transition-colors ${step >= s.n ? 'text-rose-400' : 'text-white/25'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

            <div className="mb-5">
              <h2 className="text-white font-black text-xl">{STEPS[step - 1].label}</h2>
              <p className="text-white/40 text-sm mt-1">{STEPS[step - 1].desc}</p>
            </div>

            {step === 1 && (
              <UploadZone
                file={idFront}
                onPick={() => frontRef.current.click()}
                label="ID Front"
                hint="Passport · NIN Slip · Driver's License (Front)"
              >
                <input ref={frontRef} type="file" accept="image/*" onChange={pickFile(setIdFront)} className="hidden" />
              </UploadZone>
            )}

            {step === 2 && (
              <UploadZone
                file={idBack}
                onPick={() => backRef.current.click()}
                label="ID Back"
                hint="The reverse side of the same document"
              >
                <input ref={backRef} type="file" accept="image/*" onChange={pickFile(setIdBack)} className="hidden" />
              </UploadZone>
            )}

            {step === 3 && (
              <div>
                {selfie ? (
                  <div className="rounded-2xl p-5 flex items-center gap-4 mb-4"
                    style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)' }}>
                    <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">✅</div>
                    <div>
                      <p className="text-green-400 font-bold text-sm">Liveness check passed!</p>
                      <p className="text-green-400/50 text-xs mt-0.5">Your face has been captured securely</p>
                    </div>
                    <button onClick={() => setSelfie(null)}
                      className="ml-auto text-white/30 hover:text-white/60 text-xs">Redo</button>
                  </div>
                ) : (
                  <div className="rounded-2xl p-8 text-center mb-4"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '2px dashed rgba(124,58,237,0.3)' }}>
                    <div className="text-5xl mb-3">🤳</div>
                    <p className="text-white font-bold mb-1">Face Liveness Check</p>
                    <p className="text-white/35 text-sm mb-5 leading-relaxed">
                      We'll guide you through a quick scan to confirm you're a real person, not a photo.
                    </p>
                    <button onClick={() => setLivenessStarted(true)}
                      className="px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-brand"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#e11d48)' }}>
                      Start Liveness Check
                    </button>
                  </div>
                )}

                {/* Review summary */}
                {idFront && idBack && (
                  <div className="glass rounded-2xl p-4 mb-4 space-y-3">
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Review Documents</p>
                    {[
                      { label: 'ID Front', file: idFront },
                      { label: 'ID Back',  file: idBack  },
                    ].map(({ label, file }) => (
                      <div key={label} className="flex items-center gap-3">
                        <img src={URL.createObjectURL(file)} alt={label}
                          className="w-14 h-10 rounded-xl object-cover border border-white/10" />
                        <div>
                          <p className="text-white text-sm font-semibold">{label}</p>
                          <p className="text-white/30 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <span className="ml-auto text-green-400 text-sm">✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-5 space-y-3 pb-6">
              {step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={(step === 1 && !idFront) || (step === 2 && !idBack)}
                  className="brand-btn-primary disabled:opacity-40">
                  Continue
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!idFront || !idBack || !selfie || submitting}
                  className="brand-btn-primary disabled:opacity-40 flex items-center justify-center gap-2">
                  {submitting
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                    : 'Submit KYC'}
                </button>
              )}
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="brand-btn-ghost">
                  Back
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function UploadZone({ file, onPick, label, hint, children }) {
  return (
    <div>
      <button onClick={onPick}
        className={`w-full rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer
          ${file
            ? 'border-2 border-rose-500/50 bg-rose-500/8'
            : 'border-2 border-dashed border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
          }`}>
        {file ? (
          <div className="flex items-center gap-4 text-left">
            <img src={URL.createObjectURL(file)} alt="preview"
              className="w-20 h-14 rounded-xl object-cover border border-white/15 flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">{file.name}</p>
              <p className="text-rose-400 text-xs mt-0.5">✓ Uploaded · Tap to change</p>
              <p className="text-white/30 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">📎</div>
            <p className="text-white font-bold mb-1.5">{label}</p>
            <p className="text-white/35 text-xs mb-4 leading-relaxed">{hint}</p>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Choose File
            </span>
          </div>
        )}
      </button>
      {children}
    </div>
  )
}