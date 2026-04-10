import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { transfer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PinInput from '../components/PinInput';
import LivenessCamera from '../components/LivenessCamera';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function TransferPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ receiverAccountNumber: '', amount: '', description: '' });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'pin' | 'liveness' | 'success'>('form');
  const [pendingData, setPendingData] = useState<any>(null);
  const [showLiveness, setShowLiveness] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receiverAccountNumber || !form.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (parseFloat(form.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setPendingData({ ...form, amount: parseFloat(form.amount) });
    setStep('pin');
  };

  const handleTransfer = async () => {
    if (pin.length !== 4) {
      toast.error('Enter your 4-digit PIN');
      return;
    }
    setLoading(true);
    try {
      await transfer({ ...pendingData, transactionPin: pin });
      await refreshUser();
      setStep('success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('liveness') || err?.response?.status === 400) {
        if (msg.toLowerCase().includes('liveness')) {
          toast.error('Liveness check required');
          setShowLiveness(true);
          return;
        }
      }
      toast.error(msg || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLivenessSuccess = async () => {
    setShowLiveness(false);
    toast.success('Liveness verified! Retrying transfer...');
    setLoading(true);
    try {
      await transfer({ ...pendingData, transactionPin: pin });
      await refreshUser();
      setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed after liveness check.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AnimatePresence>
        {showLiveness && (
          <LivenessCamera
            mode="verify"
            onSuccess={handleLivenessSuccess}
            onClose={() => setShowLiveness(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-5 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => step === 'form' ? navigate(-1) : setStep('form')} className="text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Send Money</h1>
            <p className="text-white/70 text-xs">Transfer to any account</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Form */}
          {step === 'form' && (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              onSubmit={handleNext}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recipient Account Number</label>
                  <input
                    name="receiverAccountNumber"
                    type="text"
                    placeholder="Enter 10-digit account number"
                    value={form.receiverAccountNumber}
                    onChange={handleChange}
                    maxLength={10}
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none text-sm font-medium focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                    <input
                      name="amount"
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none text-sm font-medium focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                  <input
                    name="description"
                    type="text"
                    placeholder="What's this for?"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none text-sm font-medium focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Quick amounts */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Quick Amounts</p>
                <div className="flex gap-2 flex-wrap">
                  {[500, 1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, amount: String(amt) }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.amount === String(amt)
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Continue
              </button>
            </motion.form>
          )}

          {/* Step 2: PIN */}
          {step === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Transfer Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">To</span>
                    <span className="font-bold text-gray-800">{pendingData?.receiverAccountNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-rose-600 text-base">₦{pendingData?.amount?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {pendingData?.description && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Note</span>
                      <span className="font-medium text-gray-700">{pendingData.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PIN Entry */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-5">
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-base">Enter Transaction PIN</h3>
                  <p className="text-gray-400 text-sm mt-1">Confirm with your 4-digit PIN</p>
                </div>
                <PinInput value={pin} onChange={setPin} length={4} />
              </div>

              <button
                onClick={handleTransfer}
                disabled={loading || pin.length !== 4}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <Send size={18} />
                    Send ₦{pendingData?.amount?.toLocaleString()}
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700">Transfers are instant and irreversible. Please verify recipient details.</p>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle size={52} className="text-green-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-800">Transfer Successful!</h2>
                <p className="text-gray-500 mt-2">
                  ₦{pendingData?.amount?.toLocaleString('en-NG', { minimumFractionDigits: 2 })} has been sent to {pendingData?.receiverAccountNumber}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg"
              >
                Back to Dashboard
              </button>
              <button onClick={() => { setStep('form'); setForm({ receiverAccountNumber: '', amount: '', description: '' }); setPin(''); }}
                className="text-rose-500 font-semibold text-sm">
                Make Another Transfer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
