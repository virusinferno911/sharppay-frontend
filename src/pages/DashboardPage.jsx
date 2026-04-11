import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txList, txReceipt } from '../services/api'
import BottomNav from '../components/BottomNav'
import ReceiptModal from '../components/ReceiptModal'

const fmt = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  })
}

export default function DashboardPage() {
  const nav = useNavigate()
  const { user, refreshUser } = useAuth()
  const [txs, setTxs] = useState([])
  const [txLoading, setTxLoading] = useState(true)
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [selectedTxId, setSelectedTxId] = useState(null)
  const [receiptData, setReceiptData] = useState(null)

  const loadTxs = useCallback(async () => {
    try {
      const { data } = await txList()
      const list = data?.data || data?.transactions || data || []
      setTxs(Array.isArray(list) ? list : [])
    } catch (err) {
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
    try {
      const { data } = await txReceipt(txId);
      setReceiptData(data);
      setSelectedTxId(txId);
    } catch (err) {
      toast.error('Could not load receipt details');
    }
  }

  const PRIMARY_ACTIONS = [
    { label: 'To SharpPay', icon: '↗', to: '/transfer' },
    { label: 'To Bank', icon: '🏦', to: '/transfer' },
    { label: 'Receive', icon: '↙', to: '/dashboard' },
  ]

  const GRID_SERVICES = [
    { label: 'Airtime', icon: '📱' },
    { label: 'Data', icon: '🌐' },
    { label: 'Betting', icon: '⚽' },
    { label: 'Electricity', icon: '⚡' },
    { label: 'Internet', icon: '📡' },
    { label: 'More', icon: '⊞' },
  ]

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-[#0a0a0a]">
      {/* ── Top Banner & Balance ── */}
      <div className="px-5 pt-14 pb-6 rounded-b-[40px] shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1a0010 0%,#0f0018 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 80% 20%, #e11d48 0%, transparent 60%)' }} />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/15 p-1">
              <img src="/logo.png" alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Hi, {user?.fullName?.split(' ')[0] || 'User'}</p>
              <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Tier 3 Merchant
              </p>
            </div>
          </div>
          <button onClick={handleRefresh} className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 transition-transform ${refreshing ? 'animate-spin' : ''}`}>
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white/60 text-xs font-semibold">Total Balance</p>
              <button onClick={() => setBalanceHidden(h => !h)}>
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={balanceHidden ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
              </button>
            </div>
            <p className="text-white font-black text-4xl tracking-tight font-mono">
              {balanceHidden ? '••••••' : fmt(user?.balance || 0)}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full border border-white/15 text-sm font-bold text-white">
            <span>+</span> Add Money
          </button>
        </div>
      </div>

      {/* ── Primary Action Row ── */}
      <div className="px-5 mt-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex justify-around">
          {PRIMARY_ACTIONS.map(({ label, icon, to }) => (
            <div key={label} onClick={() => nav(to)} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-sm">
                {icon}
              </div>
              <span className="text-white/80 text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Secondary Grid ── */}
      <div className="px-5 mb-8">
        <div className="grid grid-cols-4 gap-y-6">
          {GRID_SERVICES.map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">
                {icon}
              </div>
              <span className="text-white/60 text-[11px] font-semibold text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transactions List ── */}
      <div className="px-5 flex-1 bg-white/5 rounded-t-[40px] pt-8 pb-24 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-lg">Transaction History</h3>
          <span className="text-white/40 text-sm">See All &gt;</span>
        </div>

        {txLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl shimmer bg-white/5" />)}
          </div>
        ) : txs.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <span className="text-4xl">💸</span>
            <p className="text-white mt-4 font-bold">No Transactions</p>
          </div>
        ) : (
          <div className="space-y-5">
            {txs.map((tx, i) => {
              // EXACT OPay-style Plus/Minus Logic
              const rxAcct = tx.receiverAccount?.accountNumber || tx.receiverAccount || '';
              const myAcct = user?.accountNumber || '';
              const isCredit = String(rxAcct) === String(myAcct) || tx.transactionType === 'WELCOME_BONUS';

              const icon = isCredit ? '↙' : '↗';
              const iconColor = isCredit ? 'text-purple-400' : 'text-rose-400';
              
              // Dynamic Names for the list
              const opponentName = isCredit 
                ? (tx.senderAccount?.user?.fullName || tx.senderName || 'System')
                : (tx.receiverAccount?.user?.fullName || tx.receiverName || 'User');

              return (
                <div key={tx.id || i} onClick={() => handleTxClick(tx.transactionId || tx.id)}
                  className="flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold ${iconColor}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm truncate max-w-[180px]">
                        {tx.description || `${isCredit ? 'From' : 'To'} ${opponentName}`}
                      </p>
                      <p className="text-white/40 text-[11px] mt-1">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm font-mono ${isCredit ? 'text-white' : 'text-white/80'}`}>
                      {isCredit ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] mt-1 font-bold tracking-wider uppercase text-purple-400/80">
                      {tx.status || 'Successful'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {/* ── Dynamic Receipt Modal ── */}
      <ReceiptModal 
        isOpen={!!selectedTxId && !!receiptData} 
        onClose={() => { setSelectedTxId(null); setReceiptData(null); }} 
        transaction={receiptData} 
        myAccountNumber={user?.accountNumber} 
      />
    </div>
  )
}