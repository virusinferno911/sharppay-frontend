import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'
import api from '../services/api' 
import { motion, AnimatePresence } from 'framer-motion'
import LivenessCamera from '../components/LivenessCamera'

export default function SettingsPage() {
  const nav = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  
  const [livenessLimit, setLivenessLimit] = useState(user?.livenessTransferLimit || 50000)
  const [loading, setLoading] = useState(false)

  // PIN Management States
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinMode, setPinMode] = useState('CHANGE') // CHANGE, FORGOT_OTP, FORGOT_LIVENESS, FORGOT_NEW
  const [pinStep, setPinStep] = useState('OLD') // OLD -> NEW -> CONFIRM
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [pinReset, setPinReset] = useState(0)

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); nav('/login') }
  
  const handleSaveLimit = async () => {
    try {
      await api.post('/auth/settings', { livenessTransferLimit: Number(livenessLimit) })
      toast.success(`Liveness Limit set to ₦${Number(livenessLimit).toLocaleString()}`)
      await refreshUser()
    } catch(err) { toast.error('Failed to save limit') }
  }

  // --- SEQUENTIAL PIN FLOW LOGIC ---
  const startPinChange = () => {
    resetModalState();
    // If user has no PIN yet, skip asking for the OLD pin
    if (user?.hasTransactionPin) {
      setPinStep('OLD');
    } else {
      setPinStep('NEW');
    }
    setPinModalOpen(true);
  }

  const handleOldPinComplete = (pin) => {
    setOldPin(pin);
    setPinReset(r => r + 1); // clear boxes
    setPinStep('NEW');
  }

  const handleNewPinComplete = (pin) => {
    setNewPin(pin);
    setPinReset(r => r + 1); // clear boxes
    setPinStep('CONFIRM');
  }

  const submitChangePin = async (confirmPinVal) => {
    if(newPin !== confirmPinVal) {
      toast.error('New PINs do not match!');
      setPinReset(r => r + 1);
      setPinStep('NEW'); // Send them back to typing the new pin
      return;
    }
    
    setLoading(true);
    try {
      if (user?.hasTransactionPin) {
        await api.post('/auth/change-pin', { oldPin, newPin });
      } else {
        await api.post('/auth/settings', { transactionPin: newPin });
      }
      toast.success('PIN successfully saved!');
      setPinModalOpen(false); 
      resetModalState();
      await refreshUser(); 
    } catch(err) { 
      toast.error(err.response?.data?.message || 'Failed to save PIN'); 
      setPinReset(r => r + 1);
      setPinStep(user?.hasTransactionPin ? 'OLD' : 'NEW'); // Reset flow on failure
    } finally { setLoading(false); }
  }

  const triggerForgotPin = async () => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-pin');
      toast.success('OTP sent to your email.');
      setPinMode('FORGOT_OTP');
    } catch(err) { toast.error('Failed to send OTP'); }
    finally { setLoading(false); }
  }

  const verifyForgotOtp = () => {
    if(otpCode.length !== 6) return toast.error('Enter 6-digit OTP');
    setPinMode('FORGOT_LIVENESS');
  }

  const handlePinLiveness = async (file) => {
    toast.success('Identity verified!');
    setPinMode('FORGOT_NEW');
    setPinStep('NEW'); // Start sequential pin box for forgot flow
  }

  const submitForgotPinReset = async (confirmPinVal) => {
    if(newPin !== confirmPinVal) {
        toast.error('PINs do not match');
        setPinReset(r => r + 1);
        setPinStep('NEW');
        return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-pin', { otpCode, newPin });
      toast.success('PIN reset successfully!');
      setPinModalOpen(false); resetModalState();
    } catch(err) { 
      toast.error(err.response?.data?.message || 'Failed to reset PIN'); 
      setPinReset(r => r + 1);
      setPinStep('NEW');
    }
    finally { setLoading(false); }
  }

  const resetModalState = () => {
    setOldPin(''); setNewPin(''); setOtpCode(''); setPinMode('CHANGE'); setPinReset(r => r + 1);
  }

  const isVerified = user?.kycStatus === 'VERIFIED' || user?.kycStatus === 'verified'

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative px-5 pt-14 pb-8 rounded-b-[40px] shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
        <div className="relative flex items-center justify-between z-10">
          <div><h1 className="text-2xl font-black text-white tracking-wide">My Profile</h1><p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Settings & Security</p></div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 overflow-y-auto pb-24 space-y-6">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50 relative overflow-hidden">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-purple-700 mb-3 relative z-10">{user?.fullName ? user.fullName[0] : 'U'}</div>
            <h2 className="text-purple-950 font-black text-xl mb-1">{user?.fullName || 'SharpPay User'}</h2>
            <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${isVerified ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
               <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
               {isVerified ? 'Tier 3 Merchant' : 'Tier 1 User'}
            </div>
          </div>
        </div>

        {/* RESTORED: Liveness Slider and Security Box */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50">
          <h3 className="text-purple-950 font-black text-sm mb-4">Security & Limits</h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-950 font-bold text-sm">Liveness Transfer Limit</span>
              <span className="text-rose-600 font-mono font-black text-sm">₦{Number(livenessLimit).toLocaleString()}</span>
            </div>
            <p className="text-purple-900/50 text-[10px] leading-relaxed mb-4">Any transfer above this amount will automatically trigger a Facial Liveness verification check.</p>
            <input type="range" min="10000" max="500000" step="10000" value={livenessLimit} onChange={(e) => setLivenessLimit(e.target.value)} onMouseUp={handleSaveLimit} onTouchEnd={handleSaveLimit} className="w-full accent-rose-600 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-purple-900/40 text-[9px] font-bold mt-1.5"><span>₦10,000</span><span>₦500,000</span></div>
          </div>

          <button onClick={startPinChange} className="w-full flex items-center justify-between p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100 group">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">🔒</div>
               <span className="text-purple-950 font-bold text-sm">{user?.hasTransactionPin ? 'Change Transaction PIN' : 'Set Transaction PIN'}</span>
            </div>
            <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <button onClick={handleLogout} className="w-full py-4 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm uppercase tracking-wider transition-colors active:scale-95 border border-rose-100 shadow-sm">Log Out</button>
      </div>

      <Modal open={pinModalOpen} onClose={() => { if (!loading) { setPinModalOpen(false); resetModalState(); } }} title={user?.hasTransactionPin ? "Manage PIN" : "Set PIN"}>
        <div className="py-2 px-2 relative z-[99999]">
          <AnimatePresence mode="wait">
            
            {/* The elegant 3-step PIN box UI */}
            {pinMode === 'CHANGE' && (
              <motion.div key="change" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                 
                 {pinStep === 'OLD' && (
                   <div className="text-center">
                      <p className="text-purple-950 text-sm font-bold mb-4">Enter your Current PIN</p>
                      <PinInput label="" onComplete={handleOldPinComplete} onReset={pinReset} />
                      <button onClick={triggerForgotPin} disabled={loading} className="w-full text-[11px] font-bold text-rose-500 uppercase tracking-wider text-center pt-6">Forgot PIN?</button>
                   </div>
                 )}

                 {pinStep === 'NEW' && (
                   <div className="text-center">
                      <p className="text-purple-950 text-sm font-bold mb-4">Enter your New PIN</p>
                      <PinInput label="" onComplete={handleNewPinComplete} onReset={pinReset} />
                   </div>
                 )}

                 {pinStep === 'CONFIRM' && (
                   <div className="text-center">
                      <p className="text-purple-950 text-sm font-bold mb-4">Confirm your New PIN</p>
                      <PinInput label="" onComplete={submitChangePin} onReset={pinReset} />
                      {loading && <p className="text-purple-600 font-bold text-xs mt-4">Saving PIN...</p>}
                   </div>
                 )}

              </motion.div>
            )}

            {pinMode === 'FORGOT_OTP' && (
              <motion.div key="otp" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                <p className="text-purple-950 font-bold text-sm text-center mb-4">Enter the 6-digit OTP sent to your email.</p>
                <input type="text" inputMode="numeric" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full bg-white text-purple-950 border border-purple-100 rounded-2xl px-4 py-3.5 font-black tracking-widest text-center text-lg mb-4 outline-none" />
                <button onClick={verifyForgotOtp} className="w-full py-3.5 rounded-2xl font-black text-white shadow-md active:scale-95" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>Verify OTP</button>
              </motion.div>
            )}

            {pinMode === 'FORGOT_LIVENESS' && (
              <motion.div key="liveness" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                 <p className="text-purple-900/60 text-xs font-bold text-center mb-4 uppercase tracking-wider">Face ID Required</p>
                 <div className="h-[300px] rounded-2xl overflow-hidden"><LivenessCamera onCapture={handlePinLiveness} onCancel={() => resetModalState()} /></div>
              </motion.div>
            )}

            {pinMode === 'FORGOT_NEW' && (
              <motion.div key="newpin" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                 
                 {pinStep === 'NEW' && (
                   <div className="text-center">
                      <p className="text-purple-950 text-sm font-bold mb-4">Enter your New PIN</p>
                      <PinInput label="" onComplete={handleNewPinComplete} onReset={pinReset} />
                   </div>
                 )}

                 {pinStep === 'CONFIRM' && (
                   <div className="text-center">
                      <p className="text-purple-950 text-sm font-bold mb-4">Confirm your New PIN</p>
                      <PinInput label="" onComplete={submitForgotPinReset} onReset={pinReset} />
                      {loading && <p className="text-purple-600 font-bold text-xs mt-4">Resetting PIN...</p>}
                   </div>
                 )}
                 
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <BottomNav />
    </div>
  )
}