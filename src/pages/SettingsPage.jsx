import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'
import api from '../services/api' 

export default function SettingsPage() {
  const nav = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  
  const [livenessLimit, setLivenessLimit] = useState(user?.livenessTransferLimit || 50000)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinReset, setPinReset] = useState(0)
  const [loadingPin, setLoadingPin] = useState(false)

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); nav('/login') }
  
  const handleSaveLimit = async () => {
    try {
      await api.post('/auth/settings', { livenessTransferLimit: Number(livenessLimit) })
      toast.success(`Liveness Limit set to ₦${Number(livenessLimit).toLocaleString()}`)
      await refreshUser()
    } catch(err) { toast.error('Failed to save limit') }
  }

  const handleChangePin = async (newPin) => {
    setLoadingPin(true)
    try {
      await api.post('/auth/settings', { transactionPin: String(newPin) })
      toast.success('Transaction PIN updated securely!')
      setPinModalOpen(false)
      setLoadingPin(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change PIN')
      setPinReset(r => r + 1)
      setLoadingPin(false)
    }
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
          <div className="mt-6 space-y-4 pt-6 border-t border-purple-50">
            <div className="flex justify-between items-center"><span className="text-purple-900/50 text-xs font-bold uppercase tracking-wider">Account Number</span><span className="text-purple-950 font-mono font-black text-sm">{user?.accountNumber || 'N/A'} <span className="ml-2 cursor-pointer text-rose-500" onClick={() => {navigator.clipboard.writeText(user?.accountNumber); toast.success('Copied!')}}>📋</span></span></div>
            <div className="flex justify-between items-center"><span className="text-purple-900/50 text-xs font-bold uppercase tracking-wider">Email Address</span><span className="text-purple-950 font-bold text-sm truncate max-w-[180px]">{user?.email || 'N/A'}</span></div>
            <div className="flex justify-between items-center"><span className="text-purple-900/50 text-xs font-bold uppercase tracking-wider">Phone Number</span><span className="text-purple-950 font-bold text-sm">{user?.phoneNumber || 'N/A'}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50">
          <h3 className="text-purple-950 font-black text-sm mb-4">Account Verification</h3>
          <button onClick={() => nav('/kyc')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100 group">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">🛡️</div>
               <div className="text-left">
                 <span className="text-purple-950 font-bold text-sm block">Identity Verification</span>
                 <span className="text-purple-900/50 text-[10px] block mt-0.5">{isVerified ? 'Fully Verified' : 'Action Required to increase limits'}</span>
               </div>
            </div>
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-purple-50">
          <h3 className="text-purple-950 font-black text-sm mb-4">Security & Limits</h3>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2"><span className="text-purple-950 font-bold text-sm">Liveness Transfer Limit</span><span className="text-rose-600 font-mono font-black text-sm">₦{Number(livenessLimit).toLocaleString()}</span></div>
            <p className="text-purple-900/50 text-[10px] leading-relaxed mb-4">Any transfer above this amount will automatically trigger a Facial Liveness verification check.</p>
            <input type="range" min="10000" max="500000" step="10000" value={livenessLimit} onChange={(e) => setLivenessLimit(e.target.value)} onMouseUp={handleSaveLimit} onTouchEnd={handleSaveLimit} className="w-full accent-rose-600 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between text-purple-900/40 text-[9px] font-bold mt-1.5"><span>₦10,000</span><span>₦500,000</span></div>
          </div>

          <button onClick={() => setPinModalOpen(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100 group">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg></div>
               <span className="text-purple-950 font-bold text-sm">Change Transaction PIN</span>
            </div>
            <svg className="w-4 h-4 text-purple-300 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <button onClick={handleLogout} className="w-full py-4 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm uppercase tracking-wider transition-colors active:scale-95 border border-rose-100 shadow-sm">Log Out</button>
      </div>

      <Modal open={pinModalOpen} onClose={() => { if (!loadingPin) setPinModalOpen(false) }} title="Change PIN">
        <div className="py-4 px-2 relative z-[99999]">
          <p className="text-purple-950 text-sm font-bold text-center mb-6">Enter your new 4-digit secure PIN.</p>
          <PinInput label="" onComplete={handleChangePin} onReset={pinReset} />
          {loadingPin && <div className="flex items-center justify-center gap-2 mt-6 text-purple-600 text-sm font-bold"><div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /> Saving...</div>}
        </div>
      </Modal>
      <BottomNav />
    </div>
  )
}