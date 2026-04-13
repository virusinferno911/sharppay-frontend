import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { txList, txReceipt } from '../services/api'
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

export default function HistoryPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTxId, setSelectedTxId] = useState(null)
  const [receiptData, setReceiptData] = useState(null)

  const loadTxs = useCallback(async () => {
    try {
      const { data } = await txList()
      const list = data?.data || data?.transactions || data || []
      setTxs(Array.isArray(list) ? list : [])
    } catch (err) { 
      setTxs([]) 
      toast.error('Failed to load history')
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { loadTxs() }, [loadTxs])

  const handleTxClick = async (txId) => {
    if (!txId) return;
    try {
      const { data } = await txReceipt(txId);
      setReceiptData(data); setSelectedTxId(txId);
    } catch (err) { toast.error('Could not load receipt details'); }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen bg-gradient-to-b from-[#fff1f2] to-[#fdf4ff]">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 bg-white border-b border-purple-50 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-purple-950">Transaction History</h1>
            <p className="text-purple-900/50 text-xs font-bold mt-0.5 uppercase tracking-widest">All your activities</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-5 py-6 overflow-y-auto pb-24">
        {loading ? (
          <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-[24px] animate-pulse bg-white border border-rose-50 shadow-sm" />)}</div>
        ) : txs.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <span className="text-6xl">📭</span>
            <p className="text-purple-900 mt-4 font-black text-lg">No Transactions Yet</p>
            <p className="text-purple-900/60 text-sm font-semibold mt-1">Your history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {txs.map((tx, i) => {
              const { isCredit, opponentName } = getTxDetails(tx, user?.accountNumber);
              const icon = isCredit ? '↙' : '↗';
              const iconBg = isCredit ? 'bg-emerald-50' : 'bg-rose-50';
              const iconColor = isCredit ? 'text-emerald-600' : 'text-rose-600';
              
              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={tx.id || tx._id || i} onClick={() => handleTxClick(tx.transactionId || tx.id)}
                  className="flex items-center justify-between p-4 bg-white rounded-[24px] shadow-sm border border-purple-50 hover:bg-rose-50/50 cursor-pointer active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center text-xl font-bold ${iconColor}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-950 font-extrabold text-sm truncate max-w-[160px]">
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
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <ReceiptModal isOpen={!!selectedTxId && !!receiptData} onClose={() => { setSelectedTxId(null); setReceiptData(null); }} transaction={receiptData} myAccountNumber={user?.accountNumber} />
    </div>
  )
}