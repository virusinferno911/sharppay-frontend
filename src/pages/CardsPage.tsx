import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Eye, EyeOff, Copy, Plus, Lock, Wifi } from 'lucide-react';
import { getMyCard, createCard } from '../services/api';
import PinInput from '../components/PinInput';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface CardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  cardType: string;
  balance?: number;
  status?: string;
}

export default function CardsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [card, setCard] = useState<CardData | null>(null);
  const [cardLoading, setCardLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [cardType, setCardType] = useState('virtual');
  const [cardPin, setCardPin] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    setCardLoading(true);
    try {
      const res = await getMyCard();
      const data = res.data?.data || res.data;
      setCard(data);
    } catch {
      setCard(null);
    } finally {
      setCardLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (cardPin.length !== 4) {
      toast.error('Enter a 4-digit card PIN');
      return;
    }
    setCreateLoading(true);
    try {
      await createCard({ cardType, cardPin });
      toast.success('Virtual card created successfully!');
      setShowCreate(false);
      setCardPin('');
      await fetchCard();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Card creation failed. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCardNumber = (num: string) => {
    if (!num) return '';
    if (showDetails) return num.match(/.{1,4}/g)?.join(' ') || num;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  const copyCardNumber = () => {
    if (card?.cardNumber) {
      navigator.clipboard.writeText(card.cardNumber);
      toast.success('Card number copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-5 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white">My Cards</h1>
              <p className="text-white/70 text-xs">Manage your virtual cards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {cardLoading ? (
          <div className="h-48 rounded-3xl shimmer" />
        ) : card ? (
          <>
            {/* Card Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative card-gradient rounded-3xl p-6 shadow-2xl overflow-hidden"
              style={{ aspectRatio: '1.586/1' }}
            >
              {/* Background decorations */}
              <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-white/10 rounded-full" />
              <div className="absolute bottom-[-20px] left-[40%] w-44 h-44 bg-white/10 rounded-full" />

              {/* Top row */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <img src="/logo.png" alt="SharpPay" className="w-9 h-9 rounded-xl object-cover" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Wifi size={22} className="text-white/80 rotate-90" />
                  <span className="text-white/70 text-xs font-medium capitalize">{card.cardType || 'Virtual'}</span>
                </div>
              </div>

              {/* Card Number */}
              <div className="mt-5 relative z-10">
                <div className="flex items-center gap-2">
                  <p className="text-white font-mono text-lg tracking-widest font-bold">
                    {formatCardNumber(card.cardNumber)}
                  </p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between mt-4 relative z-10">
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Card Holder</p>
                  <p className="text-white font-bold text-sm">{card.cardHolderName || user?.fullName || 'Card Holder'}</p>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Expires</p>
                  <p className="text-white font-bold text-sm">{card.expiryDate || 'MM/YY'}</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg px-2 py-1">
                  <p className="text-white text-xs font-bold">VISA</p>
                </div>
              </div>
            </motion.div>

            {/* Card Actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: showDetails ? 'Hide Details' : 'Show Details', icon: showDetails ? EyeOff : Eye, action: () => setShowDetails(!showDetails) },
                { label: 'Copy Number', icon: Copy, action: copyCardNumber },
                { label: 'Freeze Card', icon: Lock, action: () => toast.success('Feature coming soon!') },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.label}
                    onClick={btn.action}
                    className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 shadow-sm border border-gray-100 active:bg-rose-50 transition-colors"
                  >
                    <Icon size={20} className="text-rose-500" />
                    <span className="text-xs font-semibold text-gray-600 text-center">{btn.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Card Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3"
                >
                  <h3 className="font-bold text-gray-800 text-sm">Card Details</h3>
                  {[
                    { label: 'Full Card Number', value: card.cardNumber?.match(/.{1,4}/g)?.join(' ') || '' },
                    { label: 'CVV', value: card.cvv || '•••' },
                    { label: 'Expiry Date', value: card.expiryDate || 'N/A' },
                    { label: 'Status', value: card.status || 'Active' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                      <span className="text-gray-500 text-xs">{item.label}</span>
                      <span className="font-bold text-gray-800 text-sm font-mono">{item.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs text-blue-700">
                <span className="font-bold">🔒 Security tip:</span> Never share your CVV or full card details with anyone.
              </p>
            </div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 py-10"
          >
            <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center">
              <CreditCard size={44} className="text-rose-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">No Virtual Card Yet</h2>
              <p className="text-gray-400 text-sm mt-2">Create your SharpPay virtual card to shop online and make payments globally.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              <Plus size={18} />
              Provision Virtual Card
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Card Sheet */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl z-50 p-6 space-y-5"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
              <h2 className="text-lg font-extrabold text-gray-800 text-center">Create Virtual Card</h2>

              {/* Card Type */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Card Type</p>
                <div className="flex gap-3">
                  {['virtual', 'debit'].map((type) => (
                    <button key={type} onClick={() => setCardType(type)}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm capitalize border-2 transition-all ${
                        cardType === type ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-500'
                      }`}>
                      {type} Card
                    </button>
                  ))}
                </div>
              </div>

              {/* Card PIN */}
              <div className="flex flex-col items-center gap-3">
                <PinInput value={cardPin} onChange={setCardPin} length={4} label="Set Card PIN" />
              </div>

              <button
                onClick={handleCreateCard}
                disabled={createLoading || cardPin.length !== 4}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-60"
              >
                {createLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Card...
                  </span>
                ) : 'Create Card'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
