import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'
import ReceiptModal from '../components/ReceiptModal'
import api from '../services/api' 

const CATEGORIES = [
  { id: 'AIRTIME', label: 'Airtime', icon: '📱', providers: ['MTN', 'Airtel', 'Glo', '9mobile'], field: 'Phone Number' },
  { id: 'DATA', label: 'Data', icon: '🌐', providers: ['MTN', 'Airtel', 'Glo', '9mobile'], field: 'Phone Number' },
  { id: 'BETTING', label: 'Betting', icon: '⚽', providers: ['Bet9ja', 'SportyBet', '1xBet', 'NairaBet'], field: 'Customer ID' },
  { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡', providers: ['Ikeja Electric', 'Eko Electric', 'Abuja Electric'], field: 'Meter Number' },
  { id: 'INTERNET', label: 'Internet', icon: '📡', providers: ['Smile', 'Spectranet', 'Swift'], field: 'Account Number' },
]

export default function BillsPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  
  const urlTab = searchParams.get('tab')
  const defaultCat = CATEGORIES.find(c => c.label.toLowerCase() === (urlTab || 'airtime').toLowerCase()) || CATEGORIES[0]

  const [activeCat, setActiveCat] = useState(defaultCat)
  const [provider, setProvider] = useState(activeCat.providers[0])
  const [billerId, setBillerId] = useState('')
  const [amount, setAmount] = useState('')
  
  const [pinOpen, setPinOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pinReset, setPinReset] = useState(0)
  const [receiptData, setReceiptData] = useState(null)

  useEffect(() => {
    setProvider(activeCat.providers[0])
    setBillerId('')
    setAmount('')
  }, [activeCat])

  const handlePay = async (pin) => {
    setSubmitting(true)
    try {
      // THE EXACT PAYLOAD FOR YOUR BACKEND DTO
      const payload = {
        amount: parseFloat(amount),
        billType: activeCat.id,
        targetNumber: String(billerId),
        transactionPin: String(pin)
      };

      const { data } = await api.post('/transactions/bills', payload)
      
      const txId = data?.transactionId || data?.data?.transactionId;
      setPinOpen(false)
      toast.success(`${activeCat.label} purchased successfully!`)
      
      await refreshUser()
      
      if (txId) {
        try {
          const { data: receipt } = await api.get(`/transactions/${txId}/receipt`);
          setReceiptData(receipt);
        } catch(e) {}
      }
      
      setBillerId('')
      setAmount('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Check your balance and PIN.')
      setPinReset(r => r + 1)
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = billerId.length >= 4 && parseFloat(amount) > 0

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative px-5 pt-14 pb-8 rounded-b-[40px] shadow-lg overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fde047 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3 z-10">
          <button onClick={() => nav('/dashboard')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mr-1 shadow-sm hover:bg-white/30 transition-colors border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">Pay Bills</h1>
            <p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Zero extra fees</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 mb-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => {
            const isActive = activeCat.id === cat.id
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all shadow-sm ${
                  isActive ? 'bg-rose-600 text-white shadow-rose-600/30 font-bold' : 'bg-white text-purple-900 border border-purple-50 font-semibold hover:bg-purple-50'
                }`}>
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 px-5 py-2 space-y-5 overflow-y-auto pb-24">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-3">Select Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {activeCat.providers.map(p => (
              <button key={p} onClick={() => setProvider(p)}
                className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                  provider === p ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm' : 'border-purple-100 bg-transparent text-purple-900/60 hover:bg-purple-50'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">{activeCat.field}</label>
          <input
            type="text" inputMode="numeric" value={billerId} onChange={e => setBillerId(e.target.value.replace(/\D/g, ''))}
            placeholder={`Enter ${activeCat.field.toLowerCase()}`}
            className="w-full bg-transparent border-none p-0 text-purple-950 font-black text-lg tracking-widest focus:ring-0 placeholder:text-purple-200"
          />
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-2">Amount</label>
          <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
            <span className="text-purple-900/40 font-black text-2xl">₦</span>
            <input
              type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent border-none p-0 text-purple-950 font-black text-3xl focus:ring-0 placeholder:text-purple-200 font-mono"
            />
          </div>
          {(activeCat.id === 'AIRTIME' || activeCat.id === 'DATA') && (
            <div className="flex gap-2 mt-3">
              {[100, 500, 1000, 2000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                    Number(amount) === v ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}>
                  ₦{v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button onClick={() => setPinOpen(true)} disabled={!canProceed || submitting}
            className="w-full py-4 rounded-full font-black text-white text-sm uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
            Pay {activeCat.label}
          </button>
        </div>
      </div>

      <Modal open={pinOpen} onClose={() => { if (!submitting) setPinOpen(false) }} title="Confirm Payment">
        <div className="py-4 px-2">
          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white border border-rose-100 text-2xl">
              {activeCat.icon}
            </div>
            <div>
              <p className="text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">{provider} {activeCat.label}</p>
              <p className="text-purple-950 font-black text-xl font-mono">₦{parseFloat(amount || 0).toLocaleString()}</p>
              <p className="text-rose-600 text-xs font-bold mt-1">ID: {billerId}</p>
            </div>
          </div>
          <PinInput label="Enter 4-Digit PIN" onComplete={handlePay} onReset={pinReset} />
          {submitting && (
            <div className="flex items-center justify-center gap-2 mt-6 text-purple-600 text-sm font-bold">
              <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              Processing Bill…
            </div>
          )}
        </div>
      </Modal>

      <BottomNav />
      
      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        transaction={receiptData} 
        myAccountNumber={user?.accountNumber} 
      />
    </div>
  )
}