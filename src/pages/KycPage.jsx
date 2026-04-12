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
      try {
        const { data } = await authMe();
        const userStatus = data?.data?.kycStatus || data?.kycStatus;
        if (userStatus === 'VERIFIED' || userStatus === 'verified') {
          await refreshUser();
          setDone(true);
          toast.success('Identity Verified Successfully! ₦50,000 Credited.');
          setTimeout(() => nav('/dashboard'), 2500);
          return;
        }
      } catch (fallbackErr) {}

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

  if (livenessStarted) {
    return (
      <div className="app-shell flex flex-col min-h-screen bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
        <div className="relative px-5 pt-14 pb-5 flex items-center gap-3 bg-white border-b border-purple-50 shadow-sm">
          <button onClick={() => setLivenessStarted(false)} className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div><h1 className="text-lg font-black text-purple-950">Liveness Check</h1><p className="text-purple-900/50 text-xs font-bold">Follow the on-screen instructions</p></div>
        </div>
        <div className="flex-1 px-4 py-4 overflow-y-auto"><LivenessCamera onCapture={handleLivenessCapture} onCancel={() => setLivenessStarted(false)} /></div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 16 }} className="flex flex-col items-center gap-5 px-8 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-xl shadow-emerald-600/20" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>✅</div>
          <h2 className="text-purple-950 font-black text-2xl">KYC Submitted!</h2>
          <p className="text-purple-900/60 text-sm font-semibold leading-relaxed">Your identity has been verified securely. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative px-5 pt-14 pb-8 rounded-b-[40px] shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
        <div className="relative flex items-center gap-3 z-10">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mr-1 shadow-sm hover:bg-white/30 transition-colors border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div><h1 className="text-xl font-black text-white tracking-wide">Identity Verification</h1><p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Secure · Encrypted</p></div>
        </div>
      </div>

      <div className="px-5 pt-6 pb-3">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-5 right-5 top-5 h-px bg-purple-100 z-0" />
          <div className="absolute left-5 top-5 h-1 z-0 transition-all duration-500 rounded-full" style={{ background: 'linear-gradient(90deg,#e11d48,#7c3aed)', width: `${((step - 1) / 2) * (100 - 10)}%` }} />
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-1.5 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-300 font-bold border-2 ${step >= s.n ? 'text-white border-transparent shadow-md' : 'bg-white text-purple-300 border-purple-100'}`} style={step >= s.n ? { background: 'linear-gradient(135deg,#e11d48,#7c3aed)' } : {}}>
                {step > s.n ? '✓' : s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${step >= s.n ? 'text-purple-950' : 'text-purple-300'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="mb-6 bg-white rounded-3xl p-5 shadow-sm border border-purple-50">
              <h2 className="text-purple-950 font-black text-xl mb-1">{STEPS[step - 1].label}</h2>
              <p className="text-purple-900/60 text-xs font-bold">{STEPS[step - 1].desc}</p>
            </div>

            {step === 1 && (
              <UploadZone file={idFront} onPick={() => frontRef.current.click()} label="ID Front" hint="Passport · NIN Slip · Driver's License">
                <input ref={frontRef} type="file" accept="image/*" onChange={pickFile(setIdFront)} className="hidden" />
              </UploadZone>
            )}

            {step === 2 && (
              <UploadZone file={idBack} onPick={() => backRef.current.click()} label="ID Back" hint="The reverse side of the same document">
                <input ref={backRef} type="file" accept="image/*" onChange={pickFile(setIdBack)} className="hidden" />
              </UploadZone>
            )}

            {step === 3 && (
              <div>
                {selfie ? (
                  <div className="rounded-3xl p-5 flex items-center gap-4 mb-4 bg-emerald-50 border border-emerald-100 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">✅</div>
                    <div><p className="text-emerald-700 font-black text-sm">Liveness check passed!</p><p className="text-emerald-600/70 text-xs font-bold mt-0.5">Your face has been captured securely</p></div>
                    <button onClick={() => setSelfie(null)} className="ml-auto text-emerald-600 hover:text-emerald-800 text-xs font-black uppercase tracking-wider">Redo</button>
                  </div>
                ) : (
                  <div className="rounded-3xl p-8 text-center mb-4 bg-purple-50 border-2 border-dashed border-purple-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-sm border border-purple-100">🤳</div>
                    <p className="text-purple-950 font-black text-lg mb-1">Face Liveness Check</p>
                    <p className="text-purple-900/60 text-xs font-bold mb-6 leading-relaxed">We'll guide you through a quick scan to confirm you're a real person.</p>
                    <button onClick={() => setLivenessStarted(true)} className="px-6 py-3.5 rounded-full font-black text-white text-sm shadow-lg shadow-rose-600/20 active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>Start Liveness Check</button>
                  </div>
                )}

                {idFront && idBack && (
                  <div className="bg-white rounded-3xl p-5 mb-4 space-y-4 shadow-sm border border-purple-50">
                    <p className="text-purple-900/50 text-[10px] font-black uppercase tracking-widest">Review Documents</p>
                    {[{ label: 'ID Front', file: idFront }, { label: 'ID Back', file: idBack }].map(({ label, file }) => (
                      <div key={label} className="flex items-center gap-4">
                        <img src={URL.createObjectURL(file)} alt={label} className="w-14 h-10 rounded-lg object-cover border border-purple-100 shadow-sm" />
                        <div><p className="text-purple-950 text-sm font-black">{label}</p><p className="text-purple-900/50 text-[10px] font-bold mt-0.5">{(file.size / 1024).toFixed(0)} KB</p></div>
                        <span className="ml-auto text-emerald-500 text-sm font-black">✓</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 space-y-3 pb-6">
              {step < 3 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !idFront) || (step === 2 && !idBack)} className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-rose-600/20" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
                  Continue
                </button>
              ) : (
                <button onClick={submit} disabled={!idFront || !idBack || !selfie || submitting} className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-all disabled:opacity-40 active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
                  {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</> : 'Submit KYC'}
                </button>
              )}
              {step > 1 && <button onClick={() => setStep(s => s - 1)} className="w-full py-4 rounded-full font-black text-rose-600 bg-rose-50 hover:bg-rose-100 text-sm uppercase tracking-wider transition-colors active:scale-95">Back</button>}
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
      <button onClick={onPick} className={`w-full rounded-3xl p-6 text-center transition-all duration-200 cursor-pointer border-2 ${file ? 'border-rose-300 bg-rose-50 shadow-sm' : 'border-dashed border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50'}`}>
        {file ? (
          <div className="flex items-center gap-4 text-left">
            <img src={URL.createObjectURL(file)} alt="preview" className="w-20 h-14 rounded-xl object-cover border border-rose-200 flex-shrink-0 shadow-sm" />
            <div>
              <p className="text-purple-950 font-black text-sm truncate max-w-[150px]">{file.name}</p>
              <p className="text-rose-600 text-[10px] font-bold mt-1 uppercase tracking-wider">✓ Uploaded · Tap to change</p>
            </div>
          </div>
        ) : (
          <div className="py-6">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl border border-purple-100 shadow-sm">📎</div>
            <p className="text-purple-950 font-black mb-1">{label}</p>
            <p className="text-purple-900/50 text-xs font-bold mb-5">{hint}</p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-white uppercase tracking-wider shadow-sm" style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
              Choose File
            </span>
          </div>
        )}
      </button>
      {children}
    </div>
  )
}