import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import api from '../services/api'

export default function CardsPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()
  
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const { data } = await api.get('/cards/my-card')
        const responseData = data?.data || data;
        const c = Array.isArray(responseData) ? responseData[0] : responseData;
        const pan = c?.cardNumber || c?.card_number || c?.pan; 
        
        if (pan) {
          setCard({
            id: c.id,
            pan: String(pan),
            last4: String(pan).slice(-4),
            cvv: c.cvv || c.card_pin || c.cardPin || '•••', 
            expiry: c.expiryDate || c.expiry || '12/28',
            status: c.status || 'ACTIVE'
          })
        }
      } catch (err) {
        console.log("No card found yet");
      } finally {
        setLoading(false)
      }
    }
    fetchCard()
  }, [])

  const handleCreateCard = async () => {
    setCreating(true)
    try {
      const { data } = await api.post('/cards/create', { cardType: 'VIRTUAL', cardPin: '1234' })
      const responseData = data?.data || data;
      const c = Array.isArray(responseData) ? responseData[0] : responseData;
      const pan = c?.cardNumber || c?.card_number || c?.pan;
      
      setCard({
        id: c.id,
        pan: String(pan),
        last4: String(pan).slice(-4),
        cvv: c.cvv || c.card_pin || '•••',
        expiry: c.expiryDate || c.expiry || '12/28',
        status: c.status || 'ACTIVE'
      })
      toast.success('Virtual Card created securely! 🎉')
      await refreshUser() // Refresh balance after the ₦1,000 fee deduction
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card')
    } finally {
      setCreating(false)
    }
  }

  const handleFreezeToggle = async () => {
    if (!card) return
    const isFreezing = card.status === 'ACTIVE'
    const originalStatus = card.status
    
    setCard(prev => ({ ...prev, status: isFreezing ? 'FROZEN' : 'ACTIVE' }))
    toast(isFreezing ? 'Card Frozen ❄️' : 'Card Unfrozen 🔥', { icon: '💳' })
    
    try {
      await api.post(`/cards/freeze/${card.id}`, { freeze: isFreezing })
    } catch (err) {
      setCard(prev => ({ ...prev, status: originalStatus }))
      toast.error('Failed to update card status')
    }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative px-5 pt-14 pb-8 rounded-b-[40px] shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => nav('/dashboard')} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white/30 transition-colors border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">Virtual Card</h1>
              <p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Global Spends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 overflow-y-auto pb-24">
        {loading ? (
          <div className="w-full h-[240px] rounded-[32px] bg-rose-100 animate-pulse border border-rose-200 shadow-sm" />
        ) : !card ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-10 mt-4">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border border-rose-100 mb-6"><span className="text-6xl">💳</span></div>
            <h2 className="text-purple-950 font-black text-2xl mb-2">Get Your SharpPay Card</h2>
            <p className="text-purple-900/60 text-sm font-medium mb-8 max-w-[250px] leading-relaxed">Shop online globally, pay for subscriptions, and secure your funds. <br/><br/><span className="font-bold text-rose-600">Creation Fee: ₦1,000</span></p>
            <button onClick={handleCreateCard} disabled={creating} className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
              {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Virtual Card'}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className={`relative w-full h-[240px] rounded-[32px] p-6 flex flex-col text-white overflow-hidden transition-all duration-500 shadow-2xl ${card.status === 'FROZEN' ? 'grayscale opacity-90' : 'shadow-rose-900/30'}`} style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-900/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
              <img src="/logo.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 object-contain opacity-[0.04] grayscale pointer-events-none" />

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="font-black text-xl tracking-widest text-white drop-shadow-md">SharpPay</span>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">{card.status}</div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="w-11 h-8 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-md shadow-sm border border-amber-300 flex items-center justify-center opacity-90"><div className="w-full h-[1px] bg-amber-700/30 absolute" /><div className="w-[1px] h-full bg-amber-700/30 absolute" /></div>
                  <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
                </div>

                <p className="font-mono text-2xl tracking-[0.2em] font-black drop-shadow-md mt-4">{showDetails ? card.pan : `•••• •••• •••• ${card.last4}`}</p>

                <div className="flex justify-between items-end mt-auto pt-2 w-full">
                  <div className="flex-1 pr-4 overflow-hidden">
                    <p className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">Cardholder</p>
                    <p className="font-bold text-sm tracking-wide uppercase truncate w-full">{user?.fullName || 'SHARPPAY USER'}</p>
                  </div>
                  <div className="flex gap-5 text-right shrink-0">
                    <div><p className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">Valid Thru</p><p className="font-mono font-bold text-sm drop-shadow-md">{showDetails ? card.expiry : '••/••'}</p></div>
                    <div><p className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">CVV</p><p className="font-mono font-bold text-sm drop-shadow-md">{showDetails ? card.cvv : '•••'}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={() => setShowDetails(!showDetails)} className="bg-white rounded-2xl py-4 flex flex-col items-center justify-center gap-2 border border-purple-50 shadow-sm hover:bg-purple-50 transition-colors active:scale-95">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">{showDetails ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}</div>
                <span className="text-purple-950 text-xs font-black">{showDetails ? 'Hide Details' : 'Show Details'}</span>
              </button>

              <button onClick={handleFreezeToggle} className="bg-white rounded-2xl py-4 flex flex-col items-center justify-center gap-2 border border-purple-50 shadow-sm hover:bg-purple-50 transition-colors active:scale-95">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.status === 'FROZEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{card.status === 'FROZEN' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}</div>
                <span className="text-purple-950 text-xs font-black">{card.status === 'FROZEN' ? 'Unfreeze Card' : 'Freeze Card'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}