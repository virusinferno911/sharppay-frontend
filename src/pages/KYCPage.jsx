import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Upload, Camera, CheckCircle, Shield, Zap,
  FileText, User, AlertCircle, ArrowRight, RotateCcw, X
} from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Upload ID',     desc: 'Front & back of valid ID' },
  { id: 2, label: 'Liveness Check', desc: 'Live facial capture' },
  { id: 3, label: 'Verification',  desc: 'AI processing' },
  { id: 4, label: 'Approved',      desc: 'Account activated' },
]

export default function KYCPage() {
  const [step, setStep] = useState(1)
  const [idFront, setIdFront] = useState(null)
  const [idBack, setIdBack]   = useState(null)
  const [selfie, setSelfie]   = useState(null)
  const [processing, setProcessing] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')
    setSelfie(dataUrl)
    stopCamera()
  }

  const handleIDUpload = (side) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (side === 'front') setIdFront(ev.target.result)
      else setIdBack(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const runVerification = async () => {
    setStep(3)
    setProcessing(true)
    await new Promise(r => setTimeout(r, 3500))
    setProcessing(false)
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-charcoal-600/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
            <Zap size={18} className="text-charcoal-900" fill="currentColor" />
          </div>
          <span className="font-display text-xl font-bold">
            <span className="text-white">Sharp</span><span className="text-gold-400">Pay</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Shield size={14} className="text-gold-500" />
          Secure KYC Verification
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl">

          {/* Step progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-4 left-0 right-0 h-px bg-charcoal-600/50 z-0" />
              <div
                className="absolute top-4 left-0 h-px bg-gold-gradient z-0 transition-all duration-700"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500
                    ${step > s.id
                      ? 'bg-gold-gradient border-gold-500 text-charcoal-900 shadow-gold'
                      : step === s.id
                        ? 'bg-charcoal-800 border-gold-500 text-gold-400 animate-pulse-gold'
                        : 'bg-charcoal-800 border-charcoal-500 text-white/30'
                    }`}>
                    {step > s.id ? <CheckCircle size={14} /> : s.id}
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className={`text-xs font-medium ${step >= s.id ? 'text-white' : 'text-white/30'}`}>{s.label}</p>
                    <p className="text-xs text-white/25">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 1: ID Upload ───────────────────── */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-white mb-2">Upload your ID</h2>
                <p className="text-white/40">NIN slip, Driver's License, International Passport, or Voter's Card</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <UploadBox
                  label="Front of ID"
                  hint="Clear photo, all corners visible"
                  icon={<FileText size={28} />}
                  preview={idFront}
                  onChange={handleIDUpload('front')}
                  onClear={() => setIdFront(null)}
                />
                <UploadBox
                  label="Back of ID"
                  hint="Back side clearly visible"
                  icon={<FileText size={28} />}
                  preview={idBack}
                  onChange={handleIDUpload('back')}
                  onClear={() => setIdBack(null)}
                />
              </div>

              {/* Tips */}
              <div className="card p-4 mb-6 border-gold-700/20 bg-gold-600/5">
                <p className="text-xs font-medium text-gold-400 mb-2 flex items-center gap-1.5">
                  <AlertCircle size={13} /> Photo Tips
                </p>
                <ul className="space-y-1 text-xs text-white/40">
                  {['Ensure good lighting — no shadows on the ID', 'All four corners must be visible', 'Image must be under 5MB'].map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-gold-600 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!idFront || !idBack}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                Continue to Face Scan <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Liveness Check ──────────────── */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-white mb-2">Face Liveness Check</h2>
                <p className="text-white/40">We'll compare your live photo to the ID you uploaded</p>
              </div>

              <div className="card p-6 mb-6 border-gold-700/20">
                {/* Camera viewport */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-charcoal-900 border border-charcoal-500/40 mb-4 flex items-center justify-center">
                  {selfie ? (
                    <img src={selfie} alt="Captured selfie" className="w-full h-full object-cover" />
                  ) : cameraActive ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-charcoal-400/50 flex items-center justify-center mx-auto mb-3">
                        <Camera size={32} className="text-white/20" />
                      </div>
                      <p className="text-white/30 text-sm">Camera preview will appear here</p>
                    </div>
                  )}

                  {/* Face guide overlay */}
                  {cameraActive && !selfie && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-60 border-2 border-gold-400/60 rounded-full border-dashed animate-pulse-gold" />
                    </div>
                  )}

                  {/* Captured badge */}
                  {selfie && (
                    <div className="absolute top-3 right-3 badge-success">
                      <CheckCircle size={12} /> Captured
                    </div>
                  )}
                </div>

                <canvas ref={canvasRef} className="hidden" />

                {/* Instructions */}
                {!selfie && (
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center text-xs text-white/40">
                    {['Look directly at camera', 'Keep face in oval guide', 'Good lighting required'].map((t, i) => (
                      <div key={i} className="card p-2 border-charcoal-600/30 text-xs">{t}</div>
                    ))}
                  </div>
                )}

                {/* Camera controls */}
                <div className="flex gap-3">
                  {!selfie ? (
                    <>
                      {!cameraActive ? (
                        <button onClick={startCamera} className="btn-gold flex-1 flex items-center justify-center gap-2">
                          <Camera size={16} /> Start Camera
                        </button>
                      ) : (
                        <button onClick={captureFrame} className="btn-gold flex-1 flex items-center justify-center gap-2">
                          <Camera size={16} /> Capture Photo
                        </button>
                      )}
                      {cameraActive && (
                        <button onClick={stopCamera} className="btn-ghost px-4">
                          <X size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <button onClick={() => setSelfie(null)} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                      <RotateCcw size={16} /> Retake Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost px-5">
                  ← Back
                </button>
                <button
                  onClick={runVerification}
                  disabled={!selfie}
                  className="btn-gold flex-1 flex items-center justify-center gap-2"
                >
                  Submit for Verification <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: AI Processing ───────────────── */}
          {step === 3 && (
            <div className="animate-fade-in text-center py-8">
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-gold-600/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-gold-500/30 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full bg-gold-600/10 flex items-center justify-center">
                  <Shield size={40} className="text-gold-400" />
                </div>
              </div>

              <h2 className="font-display text-3xl font-bold text-white mb-3">Verifying Identity</h2>
              <p className="text-white/40 mb-8">Our AI is analyzing your documents. This takes just a moment.</p>

              <div className="space-y-3 max-w-sm mx-auto text-left">
                {[
                  { label: 'Extracting ID data via AWS Textract', done: true  },
                  { label: 'Comparing facial biometrics',          done: processing },
                  { label: 'Running liveness detection',           done: false },
                  { label: 'Activating NGN wallet account',        done: false },
                ].map((task, i) => (
                  <ProcessingRow key={i} label={task.label} active={processing} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Approved ────────────────────── */}
          {step === 4 && (
            <div className="animate-slide-up text-center py-6">
              {/* Success animation */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gold-gradient opacity-15 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-gold-gradient opacity-10 scale-110" />
                <div className="w-full h-full rounded-full bg-charcoal-800 border-2 border-gold-500 flex items-center justify-center shadow-gold-lg">
                  <CheckCircle size={48} className="text-gold-400" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="font-display text-4xl font-bold text-white mb-3">
                Identity <span className="text-gold-400">Verified!</span>
              </h2>
              <p className="text-white/50 mb-2">
                Welcome to SharpPay, <span className="text-white">{user?.fullName}</span>
              </p>
              <p className="text-white/30 text-sm mb-8">Your NGN wallet account has been activated.</p>

              {/* Info cards */}
              <div className="grid grid-cols-3 gap-3 mb-8 text-sm">
                {[
                  { label: 'Match Score', value: '98.4%', icon: <Shield size={14} /> },
                  { label: 'ID Verified', value: 'NIN Slip', icon: <FileText size={14} /> },
                  { label: 'KYC Level', value: 'Tier 1', icon: <CheckCircle size={14} /> },
                ].map((info, i) => (
                  <div key={i} className="card p-3 text-center border-charcoal-500/30">
                    <div className="text-gold-500 flex justify-center mb-1">{info.icon}</div>
                    <p className="text-white font-semibold text-sm">{info.value}</p>
                    <p className="text-white/30 text-xs">{info.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => window.location.replace('/dashboard')}
                className="btn-gold w-full flex items-center justify-center gap-2 text-base"
              >
                Enter Dashboard <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────── */

function UploadBox({ label, hint, icon, preview, onChange, onClear }) {
  const inputRef = useRef(null)

  return (
    <div>
      <p className="label mb-2">{label}</p>
      <div
        onClick={() => !preview && inputRef.current.click()}
        className={`relative aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${preview
            ? 'border-gold-600/40 bg-charcoal-800'
            : 'border-charcoal-500/50 bg-charcoal-800 hover:border-gold-600/40 hover:bg-gold-600/5'
          }`}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-cover rounded-[10px]" />
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-charcoal-900/80 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-2 left-2 badge-success text-[10px]">
              <CheckCircle size={10} /> Uploaded
            </div>
          </>
        ) : (
          <>
            <div className="text-white/20 mb-2">{icon}</div>
            <p className="text-white/50 text-xs font-medium">{label}</p>
            <p className="text-white/25 text-xs mt-1 text-center px-3">{hint}</p>
            <div className="mt-3 flex items-center gap-1.5 text-gold-500 text-xs">
              <Upload size={12} /> Click to upload
            </div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  )
}

function ProcessingRow({ label, index }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), (index + 1) * 900)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500
      ${done ? 'border-gold-600/25 bg-gold-600/5' : 'border-charcoal-600/30 bg-charcoal-800/50'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
        ${done ? 'bg-gold-gradient shadow-gold' : 'border-2 border-charcoal-500'}`}>
        {done
          ? <CheckCircle size={12} className="text-charcoal-900" />
          : <div className="w-1.5 h-1.5 rounded-full bg-charcoal-400 animate-pulse" />
        }
      </div>
      <span className={`text-sm transition-colors duration-500 ${done ? 'text-white' : 'text-white/30'}`}>
        {label}
      </span>
    </div>
  )
}
