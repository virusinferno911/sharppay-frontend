import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Wifi, Smartphone, Tv2, Zap as ElecIcon, Plus,
  Copy, CheckCheck, Send, Eye, EyeOff, RefreshCw,
  ArrowRight, Clock
} from 'lucide-react'

const TRANSACTIONS = [
  { id: 'TXN-20241120-A3F9', type: 'credit',  desc: 'Wallet Top-up',            amount: 500_000,  date: 'Today, 14:32',    status: 'completed' },
  { id: 'TXN-20241120-B7C2', type: 'debit',   desc: 'DSTV Premium Subscription', amount: 29_500,   date: 'Today, 11:15',    status: 'completed' },
  { id: 'TXN-20241119-D4E1', type: 'debit',   desc: 'MTN Airtime — 08012345678', amount: 5_000,    date: 'Yesterday, 19:40', status: 'completed' },
  { id: 'TXN-20241119-F2G8', type: 'credit',  desc: 'Transfer from Chike Obi',   amount: 150_000,  date: 'Yesterday, 09:20', status: 'completed' },
  { id: 'TXN-20241118-H6J3', type: 'debit',   desc: 'Ikeja Electric — 0000123456', amount: 45_750, date: 'Nov 18, 08:55',   status: 'completed' },
  { id: 'TXN-20241117-K1L5', type: 'debit',   desc: 'Virtual Card Issuance Fee', amount: 500,      date: 'Nov 17, 16:00',   status: 'completed' },
  { id: 'TXN-20241116-M9N2', type: 'credit',  desc: 'Salary Payment',            amount: 1_850_000, date: 'Nov 16, 00:01',  status: 'completed' },
]

const BILLS = [
  { id: 'internet', label: 'Internet',  icon: Wifi,       color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { id: 'airtime',  label: 'Airtime',   icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'dstv',     label: 'DSTV',      icon: Tv2,        color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  { id: 'electric', label: 'Electricity', icon: ElecIcon, color: 'text-gold-400',    bg: 'bg-gold-500/10',    border: 'border-gold-500/20' },
]

function fmt(n) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeBill, setActiveBill] = useState(null)
  const [billModal, setBillModal] = useState(false)

  const copyAccNum = () => {
    navigator.clipboard.writeText(user?.accountNumber || '0123456789')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openBill = (id) => {
    setActiveBill(id)
    setBillModal(true)
  }

  const totalIn  = TRANSACTIONS.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalOut = TRANSACTIONS.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page header ─────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/40 text-sm">Your financial overview at a glance</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Wallet balance card ──────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden p-8 border border-gold-700/20 shadow-gold-md"
        style={{ background: 'linear-gradient(135deg, #1A1A1C 0%, #1E1C16 50%, #201D10 100%)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gold-600/3 blur-2xl pointer-events-none" />

        {/* Top row */}
        <div className="relative flex items-start justify-between mb-6">
          <div>
            <p className="label mb-1">Available Balance</p>
            <div className="flex items-end gap-3">
              <h2 className="font-display text-4xl font-bold text-white leading-none">
                {balanceHidden ? '₦ ••••••••' : fmt(user?.balance ?? 2_450_750)}
              </h2>
              <button
                onClick={() => setBalanceHidden(h => !h)}
                className="text-white/30 hover:text-gold-400 transition-colors mb-1"
              >
                {balanceHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="label mb-1">Account Number</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-white/80 text-sm tracking-widest">
                {user?.accountNumber || '0123456789'}
              </span>
              <button onClick={copyAccNum} className="text-white/30 hover:text-gold-400 transition-colors">
                {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-0.5">SharpPay · NGN</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/30">Money In</p>
              <p className="text-sm font-semibold text-emerald-400">{fmt(totalIn)}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-charcoal-500/50" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center">
              <TrendingDown size={14} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs text-white/30">Money Out</p>
              <p className="text-sm font-semibold text-red-400">{fmt(totalOut)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex gap-3">
          <button className="btn-gold flex items-center gap-2 text-sm">
            <Plus size={15} /> Add Money
          </button>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Send size={15} /> Transfer
          </button>
        </div>
      </div>

      {/* ── Pay Bills + Transactions ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Bills */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Pay Bills</h3>
            <span className="label">Quick Pay</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BILLS.map(({ id, label, icon: Icon, color, bg, border }) => (
              <button
                key={id}
                onClick={() => openBill(id)}
                className={`card-hover p-4 flex flex-col items-start gap-3 text-left group border ${border} ${bg} hover:scale-[1.02]`}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/30 flex items-center gap-1 mt-0.5">
                    Pay now <ArrowRight size={10} className={`${color} group-hover:translate-x-0.5 transition-transform`} />
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div className="card mt-3 p-4 border-charcoal-500/30 bg-charcoal-800/50">
            <p className="label mb-3">This Month</p>
            <div className="space-y-2.5">
              {[
                { label: 'Bills Paid',    value: '4',       sub: 'transactions' },
                { label: 'Total Spent',   value: fmt(80_750), sub: 'on utilities' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{stat.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">{stat.value}</span>
                    <span className="text-xs text-white/30 ml-1">{stat.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Transactions</h3>
            <button className="text-xs text-gold-500 hover:text-gold-300 transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            {TRANSACTIONS.slice(0, 6).map((txn) => (
              <div
                key={txn.id}
                className="card-hover p-4 flex items-center gap-4 group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border
                  ${txn.type === 'credit'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                  }`}>
                  {txn.type === 'credit'
                    ? <ArrowDownLeft size={16} className="text-emerald-400" />
                    : <ArrowUpRight size={16} className="text-red-400" />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{txn.desc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-white/25">{txn.id}</span>
                  </div>
                </div>

                {/* Amount + time */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{fmt(txn.amount)}
                  </p>
                  <p className="text-xs text-white/30 flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={10} /> {txn.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bill Payment Modal ───────────────────── */}
      {billModal && (
        <BillModal
          bill={BILLS.find(b => b.id === activeBill)}
          onClose={() => setBillModal(false)}
          balance={user?.balance ?? 2_450_750}
        />
      )}
    </div>
  )
}

function BillModal({ bill, onClose, balance }) {
  const { icon: Icon, label, color, bg, border } = bill
  const [amount, setAmount] = useState('')
  const [ref, setRef]       = useState('')
  const [done, setDone]     = useState(false)
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setDone(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md card p-8 border-charcoal-500/40 relative animate-slide-up">

        {!done ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-white">Pay {label}</h3>
                <p className="text-white/40 text-sm">Available: {fmt(balance)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label mb-2 block">
                  {label === 'Airtime' ? 'Phone Number' : label === 'DSTV' ? 'Decoder Number' : label === 'Electricity' ? 'Meter Number' : 'Account ID'}
                </label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder={label === 'Airtime' ? '08012345678' : '0000000000'}
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                />
              </div>
              <div>
                <label className="label mb-2 block">Amount (₦)</label>
                <input
                  type="number"
                  className="input-dark font-mono"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
              <button
                onClick={pay}
                disabled={!amount || !ref || loading}
                className="btn-gold flex-1 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-charcoal-900/40 border-t-charcoal-900 rounded-full animate-spin" /> Processing…</>
                  : <>Pay {amount ? fmt(parseFloat(amount)) : ''} <ArrowRight size={15} /></>
                }
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-gold-lg">
              <CheckCheck size={32} className="text-charcoal-900" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-white/40 text-sm mb-6">Your {label} payment has been processed.</p>
            <button onClick={onClose} className="btn-gold w-full">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
