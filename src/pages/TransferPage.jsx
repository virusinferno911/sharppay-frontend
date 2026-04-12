import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txTransfer, txResolve, kycLiveness, txReceipt, txList } from '../services/api'
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

const COLORS = ['from-blue-500 to-cyan-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-500', 'from-purple-500 to-indigo-500']

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function TransferPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()

  const [bank, setBank] = useState(BANKS[0])
  const [bankOpen, setBankOpen] = useState(false)
  const [acct, setAcct] = useState('')
  const [resolvedName, setResolvedName] = useState('')
  const [resolving, setResolving] = useState(false)
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')

  const [recents, setRecents] = useState([])
  const [pinOpen, setPinOpen] = useState(false)
  const [livenessOpen, setLivenessOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  
  const pendingPinRef = useRef('')
  const [pinReset, setPinReset] = useState(0)

  // Fetch REAL recents dynamically from API
  useEffect(() => {
    txList().then(({ data }) => {
      const list = data?.data || data?.transactions || data || [];
      const uniqueMap = new Map();
      list.forEach((t, index) => {
        const rxAcct = t.receiverAccountNumber || t.receiverAccount?.accountNumber || t.receiverAccount;
        if (rxAcct && String(rxAcct) !== String(user?.accountNumber) && !uniqueMap.has(rxAcct)) {
          const rxName = t.receiverName || t.receiverAccount?.user?.fullName || t.receiverAccount?.accountName || rxAcct;
          uniqueMap.set(rxAcct, { name: rxName, account: rxAcct, bankCode: 'SHARP_PAY', color: COLORS[index % COLORS.length] });
        }
      });
      setRecents(Array.from(uniqueMap.values()).slice(0, 5));
    }).catch(() => {})
  }, [user?.accountNumber])

  const resolveAccount = useCallback(async (number) => {
    if (bank.code !== 'SHARP_PAY' || number.length !== 10) { setResolvedName(''); return }
    setResolving(true)
    try {
      const { data } = await txResolve(number)
      setResolvedName(data?.data?.accountName || data?.accountName || data?.name || 'Account not found')
    } catch (err) { setResolvedName(err.response?.data?.message || 'Could not resolve') } finally { setResolving(false) }
  }, [bank.code])

  const handleAcctChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
    setAcct(v); setResolvedName(''); if (v.length === 10) resolveAccount(v)
  }

  const handleRecentClick = (recent) => {
    setBank(BANKS.find(b => b.code === recent.bankCode) || BANKS[0]); setAcct(recent.account); resolveAccount(recent.account);
  }

  const doTransfer = useCallback(async (pin, selfieFile = null) => {
    setSubmitting(true)
    try {
      // YOUR EXACT ORIGINAL PAYLOAD LOGIC
      const payload = {
        receiverAccountNumber: acct,
        amount: parseFloat(amount),
        description: desc,
        transactionPin: pin,
        ...(bank.code !== 'SHARP_PAY' ? { bankCode: bank.code } : {}),
      }
      const { data } = await txTransfer(payload)
      const txId = data?.data?.transactionId || data?.transactionId || data?.id || data?.data?.id;
      
      setPinOpen(false)
      toast.success('Transfer successful! 🎉')
      await refreshUser()

      if (txId) {
        try {
          const { data: receipt } = await txReceipt(txId);
          setReceiptData(receipt);
          // Notice there is NO nav('/dashboard') here. The popup will stay open!
        } catch (e) {
          nav('/dashboard')
        }
      } else {
        nav('/dashboard')
      }

    } catch (err) {
      const msg = err.response?.data?.message || err.message || ''
      if (msg.toLowerCase().includes('liveness') || err.response?.status === 403) {
        pendingPinRef.current = pin; setPinOpen(false); setTimeout(() => setLivenessOpen(true), 300);
      } else {
        toast.error(msg || 'Transfer failed'); setPinReset(r => r + 1);
      }
    } finally { setSubmitting(false) }
  }, [acct, amount, desc, bank, nav, refreshUser])

  const handleLivenessCapture = async (file) => {
    setLivenessOpen(false); setSubmitting(true)
    try {
      const fd = new FormData(); fd.append('liveSelfie', file)
      await kycLiveness(fd)
      toast.success('Liveness verified! Retrying…')
      await doTransfer(pendingPinRef.current, file)
    } catch (err) { toast.error(err.response?.data?.message || 'Liveness failed') } finally { setSubmitting(false) }
  }

  const canProceed = acct.length >= 6 && parseFloat(amount) > 0

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="relative px-5 pt-14 pb-12 rounded-b-[40px] shadow-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fde047 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3 z-10">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mr-1 shadow-sm hover:bg-white/30 transition-colors border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div><h1 className="text-2xl font-black text-white tracking-wide">Send Money</h1><p className="text-amber-200 text-xs font-semibold uppercase tracking-widest mt-0.5">Fast & Secure</p></div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl border border-rose-100 shadow-xl shadow-rose-900/5 rounded-3xl p-4 flex gap-4 overflow-x-auto no-scrollbar">
          <div className="flex flex-col items-center justify-center min-w-[60px] cursor-pointer group">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-rose-300 flex items-center justify-center mb-1 bg-rose-50 text-rose-500 group-hover:bg-rose-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></div>
            <span className="text-[10px] font-bold text-purple-900/60 uppercase">New</span>
          </div>
          {recents.map((recent, i) => (
            <div key={i} onClick={() => handleRecentClick(recent)} className="flex flex-col items-center min-w-[60px] cursor-pointer group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 shadow-md bg-gradient-to-br ${recent.color || COLORS[0]} text-white font-black text-lg group-active:scale-95`}>{String(recent.name).charAt(0)}</div>
              <span className="text-[10px] font-bold text-purple-950 truncate w-full text-center">{String(recent.name).split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto pb-24">
        <div className="bg-white rounded-3xl p-2 shadow-sm border border-purple-50">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider px-3 pt-2">Recipient Bank</label>
          <button onClick={() => setBankOpen(true)} className="w-full flex items-center justify-between px-3 py-3 rounded-2xl bg-transparent transition-all hover:bg-rose-50/50">
            <div className="flex items-center gap-3">
              {bank.logo ? <img src={bank.logo} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-rose-100" /> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 border border-rose-200 flex items-center justify-center"><span className="text-purple-700 text-sm font-black">{bank.name[0]}</span></div>}
              <span className="text-purple-950 font-black text-sm">{bank.name}</span>
            </div>
            <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">Account Number</label>
          <input type="text" inputMode="numeric" value={acct} onChange={handleAcctChange} placeholder="0000000000" className="w-full bg-transparent border-none p-0 text-purple-950 font-black text-lg tracking-widest focus:ring-0 placeholder:text-purple-200" maxLength={10} />
          <AnimatePresence>
            {(resolving || resolvedName) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl font-bold ${resolving ? 'text-purple-500 bg-purple-50' : resolvedName.includes('not found') || resolvedName.includes('Could not') ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                  {resolving ? <><div className="w-3.5 h-3.5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" /> Resolving…</> : <><span>{resolvedName.includes('not') ? '✕' : '✓'}</span><span>{resolvedName.toUpperCase()}</span></>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-2">Amount</label>
          <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
            <span className="text-purple-900/40 font-black text-2xl">₦</span>
            <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent border-none p-0 text-purple-950 font-black text-3xl focus:ring-0 placeholder:text-purple-200 font-mono" min="1" />
          </div>
          <div className="flex gap-2 mt-3">
            {[1000, 5000, 10000, 50000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${Number(amount) === v ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                {v >= 1000 ? `₦${v/1000}K` : `₦${v}`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">Description <span className="normal-case opacity-60">(Optional)</span></label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this for?" className="w-full bg-transparent border-none p-0 text-purple-950 font-bold text-sm focus:ring-0 placeholder:text-purple-200" maxLength={100} />
        </div>

        <button onClick={() => setPinOpen(true)} disabled={!canProceed || submitting} className="w-full py-4 mt-2 rounded-full font-black text-white text-sm uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
          {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</> : 'Proceed to Pay'}
        </button>
      </div>

      <Modal open={bankOpen} onClose={() => setBankOpen(false)} title="Select Bank">
        <div className="space-y-2 p-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {BANKS.map(b => (
            <button key={b.code} onClick={() => { setBank(b); setBankOpen(false); setResolvedName('') }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${bank.code === b.code ? 'bg-rose-50 border border-rose-200' : 'bg-white hover:bg-purple-50 border border-transparent'}`}>
              {b.logo ? <img src={b.logo} className="w-10 h-10 rounded-full object-cover shadow-sm border border-rose-100" alt="" /> : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center border border-rose-200"><span className="text-purple-700 text-lg font-black">{b.name[0]}</span></div>}
              <div className="text-left flex-1"><p className="text-purple-950 font-black text-sm">{b.name}</p>{b.instant && <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">Instant Transfer</p>}</div>
              {bank.code === b.code && <span className="text-rose-500 text-xl font-bold">✓</span>}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={pinOpen} onClose={() => { if (!submitting) setPinOpen(false) }} title="Confirm Payment">
        <div className="py-4 px-2">
          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-white border border-rose-100"><span className="text-2xl">💸</span></div>
            <div><p className="text-purple-900/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">You are sending</p><p className="text-purple-950 font-black text-xl font-mono">{fmt(parseFloat(amount) || 0)}</p><p className="text-rose-600 text-xs font-bold mt-1 max-w-[200px] truncate">To: {resolvedName || acct}</p></div>
          </div>
          <PinInput label="Enter 4-Digit PIN" onComplete={(pin) => doTransfer(pin)} onReset={pinReset} />
        </div>
      </Modal>

      <Modal open={livenessOpen} onClose={() => !submitting && setLivenessOpen(false)} title="Face ID Required" noPad>
        <div className="p-4 bg-white">
          <p className="text-purple-900/60 text-sm text-center mb-4 font-semibold">For your security, please complete a quick face scan to proceed.</p>
          <LivenessCamera onCapture={handleLivenessCapture} onCancel={() => setLivenessOpen(false)} />
        </div>
      </Modal>

      {/* Navigates to dashboard only AFTER the user closes the modal */}
      <ReceiptModal isOpen={!!receiptData} onClose={() => { setReceiptData(null); nav('/dashboard'); }} transaction={receiptData} myAccountNumber={user?.accountNumber} />
    </div>
  )
}