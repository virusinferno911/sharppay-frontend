import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyCard, createCard, freezeCard, unfreezeCard, disableCard } from '../services/api';
import BottomNav from '../components/BottomNav';

export default function CardsPage() {
  const nav = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // UI States
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [cardPin, setCardPin] = useState('');

  const fetchCard = useCallback(async () => {
    try {
      const res = await getMyCard();
      // Handle different wrapper structures safely
      const cardData = res.data?.data || res.data;
      setCard(cardData);
    } catch (err) {
      if (err.response?.status !== 404 && err.response?.status !== 400) {
        toast.error(err.response?.data?.message || 'Failed to load card');
      }
      setCard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCard();
  }, [fetchCard]);

  const handleCreateCard = async () => {
    if (cardPin.length !== 4) {
      toast.error('Card PIN must be exactly 4 digits');
      return;
    }
    setActionLoading(true);
    try {
      await createCard({ cardType: 'VIRTUAL', cardPin });
      toast.success('Virtual card created successfully!');
      setShowCreateModal(false);
      setCardPin('');
      await fetchCard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFreeze = async () => {
    if (!card) return;
    setActionLoading(true);
    try {
      if (card.status === 'FROZEN') {
        await unfreezeCard();
        toast.success('Card Unfrozen! Ready to use.');
      } else {
        await freezeCard();
        toast.success('Card Frozen! Transactions blocked.');
      }
      await fetchCard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminateCard = async () => {
    setActionLoading(true);
    try {
      await disableCard();
      toast.success('Card permanently disabled.');
      setShowTerminateModal(false);
      await fetchCard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable card');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCardNumber = (num, show) => {
    if (!num) return '•••• •••• •••• ••••';
    if (show) return num.match(/.{1,4}/g).join(' ');
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe bg-[#0A0A0A]">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden border-b border-white/5">
        <div className="relative flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-black text-white">Virtual Cards</h1>
            <p className="text-white/40 text-xs mt-1">Manage your spending globally</p>
          </div>
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-2xl bg-white/5 border border-white/10">
            💳
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {loading ? (
          <div className="w-full h-56 rounded-3xl shimmer border border-white/10" />
        ) : !card || card.status === 'DISABLED' ? (
          /* Empty State / Disabled State */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 mb-6 relative">
              <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
              <div className="relative w-full h-full glass rounded-3xl flex items-center justify-center text-4xl border border-white/10">
                🌐
              </div>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">
              {card?.status === 'DISABLED' ? 'Card Terminated' : 'No Active Card'}
            </h2>
            <p className="text-white/40 text-sm max-w-[240px] leading-relaxed mb-8">
              Create a SharpPay virtual USD card to shop online globally with zero hidden fees.
            </p>
            <button onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 rounded-2xl font-bold text-white shadow-lg w-full transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
              Create Virtual Card
            </button>
          </motion.div>
        ) : (
          /* Active / Frozen Card State */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* The Credit Card UI */}
            <div className={`relative w-full aspect-[1.58/1] rounded-3xl p-6 overflow-hidden shadow-2xl transition-all duration-500
              ${card.status === 'FROZEN' ? 'grayscale opacity-80' : ''}`}
              style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #be123c 100%)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-white font-bold tracking-widest text-lg italic">SharpPay</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-bold">{card.cardType || 'VIRTUAL'}</span>
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="7" cy="12" r="5" fillOpacity="0.8" />
                      <circle cx="17" cy="12" r="5" fillOpacity="0.6" />
                    </svg>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-white font-mono text-2xl tracking-[0.15em] drop-shadow-md">
                      {formatCardNumber(card.cardNumber, showDetails)}
                    </p>
                    <button onClick={() => setShowDetails(!showDetails)}
                      className="p-2 rounded-lg bg-black/20 hover:bg-black/40 backdrop-blur-md transition-colors text-white">
                      {showDetails ? '🙈' : '👁️'}
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Card Holder</p>
                      <p className="text-white font-bold text-sm uppercase tracking-wider">{card.nameOnCard}</p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Expires</p>
                        <p className="text-white font-mono font-bold text-sm">{card.expiryDate}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">CVV</p>
                        <p className="text-white font-mono font-bold text-sm">{showDetails ? card.cvv : '•••'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${
              card.status === 'FROZEN' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${card.status === 'FROZEN' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${card.status === 'FROZEN' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">
                Status: {card.status}
              </span>
            </div>

            {/* Card Controls */}
            <div className="space-y-3">
              <p className="label-dark px-1">Card Settings</p>
              
              <button onClick={handleToggleFreeze} disabled={actionLoading}
                className="w-full flex items-center justify-between p-4 rounded-2xl glass border border-white/5 active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                    ${card.status === 'FROZEN' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {card.status === 'FROZEN' ? '▶️' : '❄️'}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{card.status === 'FROZEN' ? 'Unfreeze Card' : 'Freeze Card'}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {card.status === 'FROZEN' ? 'Reactivate your card for use' : 'Temporarily block all transactions'}
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${card.status === 'FROZEN' ? 'bg-blue-500' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${card.status === 'FROZEN' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>

              <button onClick={() => setShowTerminateModal(true)} disabled={actionLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl glass border border-rose-500/20 active:scale-[0.98] transition-transform group hover:bg-rose-500/10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  ⚠️
                </div>
                <div className="text-left">
                  <p className="text-rose-400 font-bold text-sm">Terminate Card</p>
                  <p className="text-rose-400/60 text-xs mt-0.5">Permanently delete this virtual card</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      {/* CREATE CARD MODAL (z-[9999]) */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4">
                🔐
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Set Card PIN</h3>
              <p className="text-white/50 text-sm mb-6">Create a 4-digit PIN for your new virtual card. You will need this for transactions.</p>
              
              <input
                type="password"
                maxLength={4}
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full bg-black border border-white/10 rounded-2xl p-4 text-center text-2xl font-mono text-white tracking-[1em] focus:border-purple-500 outline-none mb-6 transition-colors"
              />
              
              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreateCard} disabled={cardPin.length !== 4 || actionLoading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white disabled:opacity-50 transition-opacity"
                  style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
                  {actionLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TERMINATE CARD MODAL (z-[9999]) */}
      <AnimatePresence>
        {showTerminateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#111] border border-rose-500/20 rounded-3xl p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4">
                ⚠️
              </div>
              <h3 className="text-rose-500 font-bold text-xl mb-2">Terminate Card?</h3>
              <p className="text-white/50 text-sm mb-6">
                This action is <span className="text-rose-400 font-bold">permanent</span>. Your card will be disabled and cannot be used for any future transactions.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowTerminateModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-white/70 bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleTerminateCard} disabled={actionLoading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors">
                  {actionLoading ? 'Terminating...' : 'Terminate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}