import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txList, txReceipt } from '../services/api'
import BottomNav from '../components/BottomNav'
import ReceiptModal from '../components/ReceiptModal'

const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

const getTxDetails = (tx, myAcct) => {
  if (!tx) return { isCredit: false, opponentName: 'System' };
  const myAccountStr = String(myAcct || '').trim();
  const sxAcct = String(tx.senderAccountNumber || tx.senderAccount?.accountNumber || tx.senderAccount || '').trim();
  const rxAcct = String(tx.receiverAccountNumber || tx.receiverAccount?.accountNumber || tx.receiverAccount || '').trim();
  const isCredit = (rxAcct === myAccountStr) || ['DEPOSIT', 'WELCOME_BONUS'].includes((tx.transactionType || '').toUpperCase());
  const rawRxName = tx.receiverName || tx.receiverAccount?.user?.fullName || tx.receiverAccount?.accountName || rxAcct || 'Receiver';
  const rawSxName = tx.senderName || tx.senderAccount?.user?.fullName || tx.senderAccount?.accountName || sxAcct || 'Sender';
  return { isCredit, opponentName: String(isCredit ? rawSxName : rawRxName) };
};

export default function DashboardPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()
  const [txs, setTxs] = useState([])
  const [txLoading, setTxLoading] = useState(true)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [selectedTxId, setSelectedTxId] = useState(null)
  const [receiptData, setReceiptData] = useState(null)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const loadTxs = useCallback(async () => {
    try {
      const { data } = await txList()
      const list = data?.data || data?.transactions || data || []
      setTxs(Array.isArray(list) ? list : [])
    } catch (err) { setTxs([]) } finally { setTxLoading(false) }
  }, [])

  useEffect(() => { loadTxs() }, [loadTxs])

  const handleRefresh = async () => {
    setRefreshing(true); await Promise.all([refreshUser(), loadTxs()]); setRefreshing(false); toast.success('Refreshed')
  }

  const handleTxClick = async (txId) => {
    if (!txId) return;
    try {
      const { data } = await txReceipt(txId);
      setReceiptData(data); setSelectedTxId(txId);
    } catch (err) { toast.error('Could not load receipt details'); }
  }

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Account Number Copied!') }

  const PRIMARY_ACTIONS = [
    { label: 'To SharpPay', icon: '↗', to: '/transfer' },
    { label: 'To Bank', icon: '🏦', to: '/transfer' },
    { label: 'Receive', icon: '↙', action: () => setReceiveOpen(true) },
  ]
  const GRID_SERVICES = [
    { label: 'Airtime', icon: '📱', to: '/bills?tab=Airtime' },
    { label: 'Data', icon: '🌐', to: '/bills?tab=Data' },
    { label: 'Betting', icon: '⚽', to: '/bills?tab=Betting' },
    { label: 'Electricity', icon: '⚡', to: '/bills?tab=Electricity' },
    { label: 'Internet', icon: '📡', to: '/bills?tab=Internet' },
    { label: 'More', icon: '⊞', to: '/bills' },
  ]

  const isVerified = user?.kycStatus === 'VERIFIED' || user?.kycStatus === 'verified';
  const kycBanner = !isVerified;

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      <div className="px-5 pt-14 pb-8 rounded-b-[40px] shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #be123c 0%, #db2777 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 p-1 shadow-inner">
              <img src="/logo.png" alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Hi, {user?.fullName?.split(' ')[0] || 'User'}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5 drop-shadow-md ${isVerified ? 'text-amber-300' : 'text-purple-300'}`}>
                {isVerified && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />}
                {isVerified ? 'Tier 3 Merchant' : 'Tier 1 User'}
              </p>
            </div>
          </div>
          <button onClick={handleRefresh} className={`w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg ${refreshing ? 'animate-spin' : ''}`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          </button>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-white/90 text-xs font-bold uppercase tracking-wider">Total Balance</p>
              <button onClick={() => setBalanceHidden(h => !h)} className="text-white hover:text-amber-200 transition-colors">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d={balanceHidden ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
              </button>
            </div>
            <p className="text-white font-black text-4xl tracking-tight font-mono drop-shadow-md">
              {balanceHidden ? '••••••' : fmt(user?.balance || user?.walletBalance || 0)}
            </p>
          </div>
          <button onClick={() => setReceiveOpen(true)} className="flex items-center gap-2 bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all px-5 py-2.5 rounded-full border border-white/30 text-sm font-black text-white shadow-lg active:scale-95">
            <span className="text-amber-300 text-lg leading-none">+</span> Add Money
          </button>
        </div>
      </div>

      <AnimatePresence>
        {kycBanner && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-5 mt-4 rounded-2xl overflow-hidden">
            <button onClick={() => nav('/kyc')} className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-amber-50 border border-amber-200">
              <span className="text-2xl">🛡️</span>
              <div className="flex-1">
                <p className="text-amber-700 font-black text-sm">Complete Identity Verification</p>
                <p className="text-amber-600/70 text-xs font-bold mt-0.5">Unlock higher limits & full features</p>
              </div>
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 mt-6 mb-6">
        <div className="bg-white/80 backdrop-blur-xl border border-rose-100 shadow-xl shadow-rose-900/5 rounded-[28px] p-5 flex justify-around relative overflow-hidden">
          {PRIMARY_ACTIONS.map(({ label, icon, to, action }) => (
            <div key={label} onClick={action ? action : () => nav(to)} className="flex flex-col items-center gap-2.5 cursor-pointer group">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-rose-50 to-purple-50 border border-rose-100 flex items-center justify-center text-2xl shadow-sm text-rose-600 active:scale-95 transition-all">{icon}</div>
              <span className="text-purple-950 text-xs font-extrabold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-y-7">
          {GRID_SERVICES.map(({ label, icon, to }) => (
            <div key={label} onClick={() => nav(to)} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-purple-50 flex items-center justify-center text-xl text-purple-700 active:scale-95 transition-all">{icon}</div>
              <span className="text-purple-900/70 text-[11px] font-bold text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 flex-1 bg-white rounded-t-[40px] pt-8 pb-24 shadow-[0_-10px_40px_rgba(159,18,57,0.05)] border-t border-rose-50">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-purple-950 font-black text-lg">Recent Transactions</h3>
          {txs.length > 0 && <span className="text-rose-600 text-xs font-bold">{txs.length} total</span>}
        </div>

        {txLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse bg-rose-50" />)}</div>
        ) : txs.length === 0 ? (
          <div className="text-center py-10 opacity-50"><span className="text-4xl">💸</span><p className="text-purple-900 mt-4 font-bold">No Transactions</p></div>
        ) : (
          <div className="space-y-4">
            {txs.map((tx, i) => {
              const { isCredit, opponentName } = getTxDetails(tx, user?.accountNumber);
              const icon = isCredit ? '↙' : '↗';
              const iconBg = isCredit ? 'bg-emerald-50' : 'bg-rose-50';
              const iconColor = isCredit ? 'text-emerald-600' : 'text-rose-600';
              
              return (
                <div key={tx.id || tx._id || i} onClick={() => handleTxClick(tx.transactionId || tx.id)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/50 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center text-xl font-bold ${iconColor}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-950 font-extrabold text-sm truncate max-w-[170px]">
                        {tx.description || tx.narration || tx.type || 'Transaction'}
                      </p>
                      <p className="text-purple-900/50 text-[11px] font-bold mt-0.5 uppercase tracking-wide">
                        {opponentName.toUpperCase()} · {formatDateTime(tx.createdAt || tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm font-mono ${isCredit ? 'text-emerald-600' : 'text-purple-950'}`}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                    <p className={`text-[10px] mt-1 font-bold tracking-wider uppercase ${(tx.status || '').toLowerCase() === 'success' || (tx.status || '').toLowerCase() === 'completed' ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {tx.status || 'completed'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
      <AnimatePresence>
        {receiveOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-purple-950/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative">
              <div className="bg-gradient-to-r from-rose-600 to-purple-700 p-6 text-center relative">
                <button onClick={() => setReceiveOpen(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">✕</button>
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <h2 className="text-white font-black text-xl">Fund Your Wallet</h2>
                <p className="text-white/80 text-xs font-medium mt-1">Transfer to the account details below</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                  <p className="text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">Bank Name</p>
                  <p className="text-purple-950 font-black text-lg">SharpPay</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">Account Name</p>
                  <p className="text-purple-950 font-black text-lg uppercase leading-tight">{user?.fullName || 'SharpPay User'}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between">
                  <div>
                    <p className="text-purple-900/50 text-[11px] font-bold uppercase tracking-wider mb-1">Account Number</p>
                    <p className="text-purple-950 font-black text-2xl font-mono tracking-widest">{user?.accountNumber || 'N/A'}</p>
                  </div>
                  <button onClick={() => copyToClipboard(user?.accountNumber)} className="w-10 h-10 bg-amber-400 text-purple-950 rounded-xl flex items-center justify-center hover:bg-amber-500 transition-colors shadow-md active:scale-95">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ReceiptModal isOpen={!!selectedTxId && !!receiptData} onClose={() => { setSelectedTxId(null); setReceiptData(null); }} transaction={receiptData} myAccountNumber={user?.accountNumber} />
    </div>
  )
}