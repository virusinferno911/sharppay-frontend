import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txTransfer, txResolve, kycLiveness, txReceipt } from '../services/api'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'
import LivenessCamera from '../components/LivenessCamera'
import ReceiptModal from '../components/ReceiptModal'

const BANKS = [
  { code: 'SHARP_PAY', name: 'SharpPay',   logo: '/logo.png', instant: true },
  { code: 'OPAY',      name: 'OPay',        logo: null },
  { code: 'MONIEPOINT',name: 'Moniepoint',  logo: null },
  { code: 'GTBANK',    name: 'GTBank',      logo: null },
  { code: 'ZENITH',    name: 'Zenith Bank', logo: null },
  { code: 'ACCESS',    name: 'Access Bank', logo: null },
]

const fmt = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function TransferPage() {
  const nav = useNavigate()
  const { user } = useAuth()

  // Form state
  const [bank, setBank]         = useState(BANKS[0])
  const [bankOpen, setBankOpen] = useState(false)
  const [acct, setAcct]         = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [amount, setAmount]     = useState('')
  const [desc, setDesc]         = useState('')

  // Modal state
  const [pinOpen, setPinOpen]           = useState(false)
  const [livenessOpen, setLivenessOpen] = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  
  // Receipt State
  const [receiptData, setReceiptData]   = useState(null)

  // Pending PIN for liveness retry
  const pendingPinRef = useRef('')
  const [pinReset, setPinReset] = useState(0)

  // ── Account resolution ──
  const resolveAccount = useCallback(async (number) => {
    if (bank.code !== 'SHARP_PAY' || number.length !== 10) {
      setResolvedName(''); return
    }
    setResolving(true)
    try {
      const { data } = await txResolve(number)
      const name = data?.data?.accountName || data?.accountName || data?.name || ''
      setResolvedName(name || 'Account not found')
    } catch (err) {
      setResolvedName(err.response?.data?.message || 'Could not resolve account')
    } finally {
      setResolving(false)
    }
  }, [bank.code])

  const handleAcctChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
    setAcct(v)
    setResolvedName('')
    if (v.length === 10) resolveAccount(v)
  }

  // ── Transfer submit ──
  const doTransfer = useCallback(async (pin, selfieFile = null) => {
    setSubmitting(true)
    try {
      const payload = {
        receiverAccountNumber: acct,
        amount: parseFloat(amount),
        description: desc,
        transactionPin: pin,
        ...(bank.code !== 'SHARP_PAY' ? { bankCode: bank.code } : {}),
      }
      const { data } = await txTransfer(payload)
      
      // Get the transaction ID from the successful response
      const txId = data?.data?.transactionId || data?.transactionId || data?.id || data?.data?.id;
      
      setPinOpen(false)
      toast.success('Transfer successful! 🎉')
      
      // Fetch and show the receipt instantly
      if (txId) {
        try {
          const { data: receipt } = await txReceipt(txId);
          setReceiptData(receipt);
        } catch (e) {
          // If receipt fetch fails, just go to dashboard safely
          nav('/dashboard')
        }
      } else {
        nav('/dashboard')
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || ''
      if (msg.toLowerCase().includes('liveness') || err.response?.status === 403) {
        pendingPinRef.current = pin
        setPinOpen(false)
        setTimeout(() => setLivenessOpen(true), 300)
        toast('Please complete a liveness check to proceed', { icon: '🤳' })
      } else {
        toast.error(msg || 'Transfer failed')
        setPinReset(r => r + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }, [acct, amount, desc, bank, nav])

  const handleLivenessCapture = async (file) => {
    setLivenessOpen(false)
    setSubmitting(true)
    try {
      const fd = new FormData(); fd.append('liveSelfie', file)
      await kycLiveness(fd)
      toast.success('Liveness verified! Retrying transfer…')
      await doTransfer(pendingPinRef.current, file)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = acct.length >= 6 && parseFloat(amount) > 0

  // Normalize receipt data for the modal to hide sender info
  const normalizedReceipt = receiptData ? {
    ...receiptData,
    senderAccount: '***', // Hides the sender account number perfectly
    senderName: receiptData.senderAccount?.user?.fullName || 'SharpPay',
    receiverAccount: receiptData.receiverAccount?.accountNumber || '',
    receiverName: receiptData.receiverAccount?.user?.fullName || 'SharpPay User'
  } : null;

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1a0010 0%,#0f0018 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #7c3aed 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => nav(-1)}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center mr-1">
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Send Money</h1>
            <p className="text-white/40 text-xs">Instant transfers, zero hassle</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
        {/* Bank Selector */}
        <div>
          <label className="label-dark">Recipient Bank</label>
          <button onClick={() => setBankOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20">
            <div className="flex items-center gap-3">
              {bank.logo
                ? <img src={bank.logo} alt="" className="w-6 h-6 rounded-lg object-cover" />
                : <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-black">{bank.name[0]}</span>
                  </div>
              }
              <span className="text-white font-semibold text-sm">{bank.name}</span>
            </div>
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Account Number */}
        <div>
          <label className="label-dark">Account Number</label>
          <input
            type="text" inputMode="numeric" value={acct} onChange={handleAcctChange}
            placeholder="Enter 10-digit account number"
            className="input-dark font-mono tracking-widest"
            maxLength={10}
          />
          <AnimatePresence>
            {(resolving || resolvedName) && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-2 flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${
                  resolving ? 'text-white/40' :
                  resolvedName.includes('not found') || resolvedName.includes('Could not')
                    ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'
                }`}>
                {resolving
                  ? <><div className="w-3.5 h-3.5 border border-white/30 border-t-white/80 rounded-full animate-spin" /> Resolving account…</>
                  : <><span>✓</span><span className="font-semibold">{resolvedName}</span></>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Amount */}
        <div>
          <label className="label-dark">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">₦</span>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-dark pl-8 font-mono text-lg"
              min="1"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[1000, 5000, 10000, 50000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  Number(amount) === v
                    ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                    : 'border-white/10 text-white/35 hover:border-white/20'
                }`}>
                {v >= 1000 ? `₦${v/1000}K` : `₦${v}`}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label-dark">Description <span className="normal-case text-white/20 font-normal">(optional)</span></label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="e.g. Rent payment" className="input-dark" maxLength={100} />
        </div>

        {/* Summary card */}
        <AnimatePresence>
          {canProceed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-4 space-y-2 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {[
                ['To', resolvedName || acct],
                ['Bank', bank.name],
                ['Amount', fmt(parseFloat(amount) || 0)],
                ...(desc ? [['Note', desc]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-white/40">{k}</span>
                  <span className="text-white font-semibold">{v}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-2 pb-4">
          <button onClick={() => setPinOpen(true)} disabled={!canProceed || submitting}
            className="brand-btn-primary disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
              : 'Continue to PIN'}
          </button>
        </div>
      </div>

      <Modal open={bankOpen} onClose={() => setBankOpen(false)} title="Select Bank">
        <div className="space-y-1 -mx-1">
          {BANKS.map(b => (
            <button key={b.code} onClick={() => { setBank(b); setBankOpen(false); setResolvedName('') }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                bank.code === b.code ? 'bg-rose-500/15 border border-rose-500/30' : 'hover:bg-white/5'
              }`}>
              {b.logo
                ? <img src={b.logo} className="w-8 h-8 rounded-xl object-cover" alt="" />
                : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-black">{b.name[0]}</span>
                  </div>
              }
              <span className="text-white font-semibold text-sm">{b.name}</span>
              {b.instant && <span className="ml-auto text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full font-semibold">Instant</span>}
              {bank.code === b.code && <span className="text-rose-400 ml-1">✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={pinOpen} onClose={() => { if (!submitting) setPinOpen(false) }} title="Transaction PIN">
        <div className="py-3">
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold">Sending {fmt(parseFloat(amount) || 0)}</p>
              <p className="text-white/40 text-xs mt-0.5">To {resolvedName || acct} · {bank.name}</p>
            </div>
          </div>
          <PinInput
            label="Enter your 4-digit transaction PIN"
            onComplete={(pin) => doTransfer(pin)}
            onReset={pinReset}
          />
          {submitting && (
            <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-sm">
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              Processing transfer…
            </div>
          )}
        </div>
      </Modal>

      <Modal open={livenessOpen} onClose={() => !submitting && setLivenessOpen(false)} title="Liveness Check Required" noPad>
        <div className="p-4">
          <p className="text-white/40 text-sm text-center mb-4">
            For your security, please complete a quick face scan to proceed with this transfer.
          </p>
          <LivenessCamera
            onCapture={handleLivenessCapture}
            onCancel={() => setLivenessOpen(false)}
          />
        </div>
      </Modal>

      <BottomNav />

      {/* ── STUNNING RECEIPT MODAL ── */}
      {receiptData && (
        <ReceiptModal 
          isOpen={!!receiptData} 
          onClose={() => { setReceiptData(null); nav('/dashboard'); }} 
          transaction={normalizedReceipt} 
          myAccountNumber={user?.accountNumber} 
        />
      )}
    </div>
  )
}