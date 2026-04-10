import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Wifi, Phone, Tv, Droplets, CheckCircle } from 'lucide-react';
import { payBill } from '../services/api';
import PinInput from '../components/PinInput';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

const billTypes = [
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'bg-yellow-100 text-yellow-600', desc: 'PHCN, Eko Electric...' },
  { id: 'airtime', label: 'Airtime', icon: Phone, color: 'bg-green-100 text-green-600', desc: 'MTN, Airtel, Glo, 9mobile' },
  { id: 'data', label: 'Data', icon: Wifi, color: 'bg-blue-100 text-blue-600', desc: 'Mobile data bundles' },
  { id: 'cable', label: 'Cable TV', icon: Tv, color: 'bg-purple-100 text-purple-600', desc: 'DSTV, GOtv, Startimes' },
  { id: 'water', label: 'Water', icon: Droplets, color: 'bg-cyan-100 text-cyan-600', desc: 'Water bills' },
  { id: 'internet', label: 'Internet', icon: Wifi, color: 'bg-indigo-100 text-indigo-600', desc: 'Broadband, Spectranet' },
];

export default function BillsPage() {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [form, setForm] = useState({ targetNumber: '', amount: '' });
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'pin' | 'success'>('select');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectBill = (id: string) => {
    setSelectedBill(id);
    setStep('details');
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetNumber || !form.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep('pin');
  };

  const handlePay = async () => {
    if (pin.length !== 4) {
      toast.error('Enter your 4-digit PIN');
      return;
    }
    setLoading(true);
    try {
      await payBill({
        billType: selectedBill!,
        targetNumber: form.targetNumber,
        amount: parseFloat(form.amount),
        transactionPin: pin,
      });
      setStep('success');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bill payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBillData = billTypes.find((b) => b.id === selectedBill);

  const getPlaceholder = () => {
    switch (selectedBill) {
      case 'airtime': case 'data': return 'e.g., 08012345678';
      case 'electricity': return 'e.g., Meter number';
      case 'cable': return 'e.g., Smartcard number';
      case 'water': return 'e.g., Customer number';
      default: return 'Enter number/ID';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-5 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => {
              if (step === 'select') navigate(-1);
              else if (step === 'details') setStep('select');
              else if (step === 'pin') setStep('details');
              else navigate('/dashboard');
            }}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Pay Bills</h1>
            <p className="text-white/70 text-xs">Utilities, Airtime & More</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Bill */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <p className="text-sm font-semibold text-gray-600 mb-4">Select a bill category</p>
              <div className="grid grid-cols-2 gap-3">
                {billTypes.map((bill) => {
                  const Icon = bill.icon;
                  return (
                    <motion.button
                      key={bill.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectBill(bill.id)}
                      className="bg-white rounded-2xl p-4 text-left shadow-sm border border-gray-100 hover:border-rose-200 active:bg-rose-50 transition-all"
                    >
                      <div className={`w-10 h-10 ${bill.color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon size={20} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{bill.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{bill.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <motion.form
              key="details"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              onSubmit={handleDetailsNext}
              className="space-y-4"
            >
              {selectedBillData && (
                <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
                  <div className={`w-12 h-12 ${selectedBillData.color} rounded-xl flex items-center justify-center`}>
                    <selectedBillData.icon size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{selectedBillData.label}</p>
                    <p className="text-gray-400 text-xs">{selectedBillData.desc}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {selectedBill === 'electricity' ? 'Meter Number' :
                     selectedBill === 'cable' ? 'Smartcard Number' :
                     selectedBill === 'water' ? 'Customer ID' : 'Phone Number'}
                  </label>
                  <input
                    name="targetNumber"
                    type="text"
                    placeholder={getPlaceholder()}
                    value={form.targetNumber}
                    onChange={handleChange}
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
                      min="50"
                      required
                      className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none text-sm font-medium focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[100, 200, 500, 1000, 2000].map((amt) => (
                  <button key={amt} type="button"
                    onClick={() => setForm((p) => ({ ...p, amount: String(amt) }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      form.amount === String(amt) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
                Continue
              </button>
            </motion.form>
          )}

          {/* Step 3: PIN */}
          {step === 'pin' && (
            <motion.div key="pin" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-2">
                <h3 className="text-sm font-semibold text-gray-500">Payment Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Bill Type</span><span className="font-bold text-gray-800 capitalize">{selectedBill}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Number</span><span className="font-bold text-gray-800">{form.targetNumber}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-rose-600 text-base">₦{parseFloat(form.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-5">
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">Enter Transaction PIN</h3>
                  <p className="text-gray-400 text-sm mt-1">Confirm with your 4-digit PIN</p>
                </div>
                <PinInput value={pin} onChange={setPin} length={4} />
              </div>

              <button onClick={handlePay} disabled={loading || pin.length !== 4}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : `Pay ₦${parseFloat(form.amount || '0').toLocaleString()}`}
              </button>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={52} className="text-green-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-800">Payment Successful!</h2>
                <p className="text-gray-500 mt-2 capitalize">
                  ₦{parseFloat(form.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} {selectedBill} bill paid for {form.targetNumber}
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg">
                Back to Dashboard
              </button>
              <button onClick={() => { setStep('select'); setSelectedBill(null); setForm({ targetNumber: '', amount: '' }); setPin(''); }}
                className="text-rose-500 font-semibold text-sm">Pay Another Bill</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}
