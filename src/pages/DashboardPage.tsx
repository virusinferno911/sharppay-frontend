import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Copy, Shield,
  Zap, CreditCard, ArrowLeftRight, ChevronRight, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTransactions } from '../services/api';
import toast from 'react-hot-toast';
import BottomNav from '../components/BottomNav';

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  createdAt: string;
  status: string;
  senderName?: string;
  receiverName?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await getTransactions();
      const data = res.data?.data || res.data || [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleCopyAccount = () => {
    if (user?.accountNumber) {
      navigator.clipboard.writeText(user.accountNumber);
      toast.success('Account number copied!');
    }
  };

  const handleRefresh = async () => {
    await refreshUser();
    await fetchTransactions();
    toast.success('Refreshed!');
  };

  const quickActions = [
    { label: 'Transfer', icon: ArrowLeftRight, color: 'bg-rose-100 text-rose-600', path: '/transfer' },
    { label: 'Bills', icon: Zap, color: 'bg-amber-100 text-amber-600', path: '/bills' },
    { label: 'Cards', icon: CreditCard, color: 'bg-blue-100 text-blue-600', path: '/cards' },
    { label: 'KYC', icon: Shield, color: 'bg-green-100 text-green-600', path: '/kyc' },
  ];

  const formatAmount = (amount: number) => `₦${Math.abs(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header / Balance Card */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 px-5 pt-12 pb-28 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-30px] left-[-30px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-white text-sm">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white/70 text-xs">Welcome back,</p>
              <p className="text-white font-bold text-sm">{firstName} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <RefreshCw size={16} className="text-white" />
            </button>
            <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center relative">
              <Bell size={16} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="relative z-10 text-center mb-4">
          <p className="text-white/70 text-sm mb-1">Total Balance</p>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              {balanceVisible
                ? `₦${(user?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                : '₦••••••'}
            </h2>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-white/70">
              {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Account Number */}
          {user?.accountNumber && (
            <button
              onClick={handleCopyAccount}
              className="mt-2 flex items-center justify-center gap-1.5 text-white/70 text-xs mx-auto hover:text-white transition-colors"
            >
              <span>Acct: {user.accountNumber}</span>
              <Copy size={12} />
            </button>
          )}
        </div>

        {/* KYC badge */}
        {user?.kycStatus && user.kycStatus !== 'verified' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/kyc')}
            className="relative z-10 w-full bg-yellow-400/20 border border-yellow-400/40 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-white"
          >
            <Shield size={16} className="text-yellow-300" />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold">Complete KYC Verification</p>
              <p className="text-xs text-white/60">Unlock full features</p>
            </div>
            <ChevronRight size={14} className="text-white/60" />
          </motion.button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="relative z-10 mx-5 -mt-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 shadow-xl border border-gray-100">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">Recent Transactions</h3>
          <button className="text-rose-500 text-xs font-semibold">See All</button>
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded-full shimmer w-3/4" />
                  <div className="h-3 rounded-full shimmer w-1/2" />
                </div>
                <div className="h-4 w-16 rounded-full shimmer" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center">
              <ArrowUpRight size={36} className="text-rose-300" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-700 text-base">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Fund your wallet to get started!</p>
            </div>
            <button
              onClick={() => navigate('/transfer')}
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
            >
              Make a Transfer
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {transactions.slice(0, 10).map((tx, i) => {
                const isCredit = tx.type === 'credit' || tx.amount > 0;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-50 active:bg-gray-50 transition-colors"
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isCredit ? 'bg-green-100' : 'bg-rose-100'}`}>
                      {isCredit
                        ? <ArrowDownLeft size={20} className="text-green-600" />
                        : <ArrowUpRight size={20} className="text-rose-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {tx.description || (isCredit ? tx.senderName : tx.receiverName) || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-rose-600'}`}>
                        {isCredit ? '+' : '-'}{formatAmount(tx.amount)}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        tx.status === 'success' ? 'bg-green-100 text-green-600' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
