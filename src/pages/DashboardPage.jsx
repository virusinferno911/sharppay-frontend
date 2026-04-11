import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txList, txReceipt } from '../services/api'
import BottomNav from '../components/BottomNav'

const fmt = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const txIcon = (type) => {
  const t = (type || '').toLowerCase()
  if (t.includes('credit') || t.includes('fund') || t.includes('receive')) return { icon: '↙', bg: 'bg-green-500/15', color: 'text-green-400' }
  if (t.includes('bill') || t.includes('utility')) return { icon: '⚡', bg: 'bg-yellow-500/15', color: 'text-yellow-400' }
  return { icon: '↗', bg: 'bg-rose-500/15', color: 'text-rose-400' }
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function DashboardPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()
  const [txs, setTxs] = useState([])
  const [txLoading, setTxLoading] = useState(true)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // --- RECEIPT MODAL STATE ---
  const [selectedTxId, setSelectedTxId] = useState(null)
  const [receiptData, setReceiptData] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(false)

  const loadTxs = useCallback(async () => {
    try {
      const { data } = await txList()
      const list = data?.data || data?.transactions || data || []
      setTxs(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      setTxs([])
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => { loadTxs() }, [loadTxs])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refreshUser(), loadTxs()])
    setRefreshing(false)
    toast.success('Refreshed')
  }

  const handleTxClick = async (txId) => {
    if (!txId) return;
    setSelectedTxId(txId);
    setReceiptLoading(true);
    try {
      const { data } = await txReceipt(txId);
      setReceiptData(data);
    } catch (err) {
      toast.error('Could not load receipt details');
      setSelectedTxId(null);
    } finally {
      setReceiptLoading(false);
    }
  }

  const handleShareReceipt = async () => {
    if (!receiptData) return;
    const shareText = `SharpPay Transaction Receipt\n\nAmount: ${fmt(receiptData.amount)}\nStatus: ${receiptData.status}\nRef: ${receiptData.transactionId}\nDate: ${formatDateTime(receiptData.createdAt)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SharpPay Receipt',
          text: shareText,
        });
      } catch (err) {
        console.log('User canceled sharing');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Receipt copied to clipboard!');
    }
  }

  const QUICK = [
    { label: 'Send Money', icon: SendIcon, color: 'from-rose-600 to-pink-700', to: '/transfer' },
    { label: 'Pay Bills',  icon: BillIcon,  color: 'from-violet-600 to-purple-700', to: '/bills' },
    { label: 'My Card',   icon: CardIcon,  color: 'from-blue-600 to-indigo-700', to: '/cards' },
  ]

  const kycBanner = user?.kycStatus && user.kycStatus !== 'VERIFIED' && user.kycStatus !== 'verified'

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe relative">
      {/* ── Header ── */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1a0010 0%,#0f0018 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #e11d48 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/15"
                style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
                <img src="/logo.png" alt="SP" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium">Good {greeting()},</p>
                <p className="text-white font-bold text-base leading-tight">
                  {firstName(user?.fullName || user?.name)}
                </p>
              </div>
            </div>
            <button onClick={handleRefresh}
              className={`w-10 h-10 rounded-2xl glass flex items-center justify-center transition-transform ${refreshing ? 'animate-spin' : ''}`}>
              <svg className="w-4.5 h-4.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>

          {/* Balance card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#be123c 0%,#4c1d95 55%,#991b1b 100%)' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 -left-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Total Balance</p>
                <button onClick={() => setBalanceHidden(h => !h)}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  {balanceHidden
                    ? <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    : <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  }
                </button>
              </div>
              <p className="text-white font-black text-3xl tracking-tight mb-1 font-mono">
                {balanceHidden ? '₦ ••••••' : fmt(user?.balance || user?.walletBalance)}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/15">
                <div>
                  <p className="text-white/50 text-xs">Account No.</p>
                  <p className="text-white font-bold font-mono text-sm tracking-widest mt-0.5">
                    {user?.accountNumber || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                  <img src="/logo.png" alt="" className="w-4 h-4 rounded-md" />
                  <span className="text-white/80 text-xs font-bold">SharpPay</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── KYC Banner ── */}
      <AnimatePresence>
        {kycBanner && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mx-5 mt-4 rounded-2xl overflow-hidden">
            <button onClick={() => nav('/kyc')}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.1))', border: '1px solid rgba(245,158,11,0.25)' }}>
              <span className="text-2xl">🛡️</span>
              <div className="flex-1">
                <p className="text-amber-400 font-bold text-sm">Complete Identity Verification</p>
                <p className="text-amber-400/60 text-xs mt-0.5">Unlock higher limits & full features</p>
              </div>
              <svg className="w-4 h-4 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Actions ── */}
      <div className="px-5 mt-5">
        <p className="label-dark mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {QUICK.map(({ label, icon: Icon, color, to }, i) => (
            <motion.button
              key={label}
              onClick={() => nav(to)}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              whileTap={{ scale: 0.93 }}
              className={`flex flex-col items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-br ${color} bg-opacity-80 shadow-lg`}>
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-bold leading-tight text-center">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Transactions ── */}
      <div className="px-5 mt-6 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="label-dark">Recent Transactions</p>
          {txs.length > 0 && (
            <span className="text-white/30 text-xs">{txs.length} total</span>
          )}
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl shimmer h-16" />
            ))}
          </div>
        ) : txs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center text-4xl mb-4">💸</div>
            <p className="text-white font-bold text-lg mb-1">No Transactions Yet</p>
            <p className="text-white/35 text-sm max-w-[220px] leading-relaxed">
              Fund your wallet to get started with transfers and bill payments.
            </p>
            <button onClick={() => nav('/transfer')}
              className="mt-5 px-6 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
              Make a Transfer
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2 pb-4">
            {txs.map((tx, i) => {
              const { icon, bg, color } = txIcon(tx.type || tx.transactionType)
              const isCredit = icon === '↙'
              return (
                <motion.div key={tx.id || tx._id || i}
                  onClick={() => handleTxClick(tx.transactionId || tx.id)}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-4 rounded-2xl glass hover:bg-white/15 transition-colors cursor-pointer active:scale-[0.98]">
                  <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 text-lg font-bold ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {tx.description || tx.narration || tx.type || 'Transaction'}
                    </p>
                    <p className="text-white/35 text-xs mt-0.5">
                      {tx.receiverName || tx.senderName || ''}{tx.receiverName || tx.senderName ? ' · ' : ''}{formatDateTime(tx.createdAt || tx.date)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm font-mono ${isCredit ? 'text-green-400' : 'text-white'}`}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <p className={`text-xs mt-0.5 capitalize ${
                      (tx.status || '').toLowerCase() === 'success' || (tx.status || '').toLowerCase() === 'completed'
                        ? 'text-green-400/70' : 'text-white/30'}`}>
                      {tx.status || 'completed'}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {/* ── RECEIPT MODAL (z-[9999]) ── */}
      <AnimatePresence>
        {selectedTxId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Receipt Header */}
              <div className="p-6 text-center border-b border-white/5" style={{ background: 'linear-gradient(180deg, rgba(225,29,72,0.1) 0%, rgba(15,15,15,1) 100%)' }}>
                <div className="w-12 h-12 mx-auto rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
                  <img src="/logo.png" alt="SP" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-bold text-lg">Transaction Receipt</h3>
                <p className="text-white/40 text-xs mt-1">{formatDateTime(receiptData?.createdAt || new Date())}</p>
              </div>

              {/* Receipt Content */}
              <div className="p-6 overflow-y-auto">
                {receiptLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-rose-500 rounded-full animate-spin" />
                  </div>
                ) : receiptData ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Amount</p>
                      <p className="text-white font-mono font-black text-4xl">{fmt(receiptData.amount)}</p>
                      <div className="inline-block mt-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase">
                        {receiptData.status}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-dashed border-white/10">
                      <div className="flex justify-between items-start">
                        <span className="text-white/50 text-sm">Type</span>
                        <span className="text-white font-bold text-sm text-right">{receiptData.transactionType}</span>
                      </div>
                      
                      {receiptData.senderAccount && (
                        <div className="flex justify-between items-start">
                          <span className="text-white/50 text-sm">From</span>
                          <span className="text-white font-bold text-sm text-right">
                            {receiptData.senderAccount.user?.fullName || receiptData.senderAccount.accountNumber}
                          </span>
                        </div>
                      )}
                      
                      {receiptData.receiverAccount && (
                        <div className="flex justify-between items-start">
                          <span className="text-white/50 text-sm">To</span>
                          <span className="text-white font-bold text-sm text-right">
                            {receiptData.receiverAccount.user?.fullName || receiptData.receiverAccount.accountNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <span className="text-white/50 text-sm">Description</span>
                        <span className="text-white font-bold text-sm text-right max-w-[150px] truncate">
                          {receiptData.description || 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-white/50 text-sm">Reference</span>
                        <span className="text-white/80 font-mono text-xs text-right bg-white/5 px-2 py-1 rounded">
                          {receiptData.transactionId}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-center text-sm py-10">Failed to load receipt data.</p>
                )}
              </div>

              {/* Receipt Footer Buttons */}
              <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                <button onClick={() => setSelectedTxId(null)} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-colors">
                  Close
                </button>
                <button onClick={handleShareReceipt} disabled={receiptLoading || !receiptData}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
                  Share Receipt
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
function firstName(full) {
  if (!full) return 'there'
  return full.split(' ')[0]
}

function SendIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function BillIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
}
function CardIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
}