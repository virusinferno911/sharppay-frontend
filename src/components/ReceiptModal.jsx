import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptModal({ isOpen, onClose, transaction, myAccountNumber }) {
  if (!isOpen || !transaction) return null;

  // Uses exactly what the DTO provided
  const myAccountStr = String(myAccountNumber || '').trim();
  const rxAcct = String(transaction.receiverAccountNumber || '').trim();
  
  const isCredit = (rxAcct === myAccountStr) || ['DEPOSIT', 'WELCOME_BONUS'].includes((transaction.transactionType || '').toUpperCase());

  const opponentName = isCredit ? (transaction.senderName || 'System') : (transaction.receiverName || 'External Entity');
  const opponentAcct = isCredit ? (transaction.senderAccountNumber || '***') : (transaction.receiverAccountNumber || '***');
  
  const safeAmount = Number(transaction.amount || 0);
  const safeDate = transaction.date ? new Date(transaction.date).toLocaleString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const safeTxId = String(transaction.transactionId || 'N/A');
  const safeStatus = String(transaction.status || 'COMPLETED');

  const maskAccount = (accNum) => {
    if (!accNum || accNum === '***' || accNum === 'SharpPay' || accNum === 'Biller' || accNum === 'External Bank') return '***';
    if (accNum.length < 6) return accNum;
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  const handleShare = () => {
    const shareText = `SharpPay Receipt\nAmount: ₦${safeAmount}\n${isCredit ? 'From' : 'To'}: ${opponentName}\nRef: ${safeTxId}\nDate: ${safeDate}`;
    if (navigator.share) navigator.share({ title: 'SharpPay Receipt', text: shareText });
    else navigator.clipboard.writeText(shareText);
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl relative"
        >
          <div className="flex items-center px-5 py-5 bg-gradient-to-r from-rose-600 to-purple-700 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
            <h2 className="relative z-10 flex-1 text-center text-lg font-black text-white">Transaction Receipt</h2>
          </div>

          <div className="px-6 pb-6 pt-6">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-rose-100 bg-white">
                <img src="/logo.png" alt="SP" className="w-9 h-9 object-contain" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-purple-900/50 text-sm font-bold mb-1 uppercase tracking-wide">
                {isCredit ? 'Received From' : 'Transfer To'}
              </p>
              <p className="text-purple-950 font-black text-lg mb-3 leading-tight truncate px-4">
                {opponentName.toUpperCase()}
              </p>
              <h1 className={`text-4xl font-black mb-3 tracking-tight font-mono ${isCredit ? 'text-emerald-600' : 'text-purple-950'}`}>
                {isCredit ? '+' : '-'}₦{safeAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h1>
              <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-black text-[11px] uppercase tracking-wider shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                {safeStatus}
              </div>
            </div>

            <div className="bg-purple-50/50 border border-purple-100/50 rounded-3xl p-6 space-y-5 mb-6 shadow-inner">
              <div className="flex justify-between items-center border-b border-purple-200/50 pb-5">
                <span className="text-purple-900/60 text-sm font-semibold">Amount {isCredit ? 'Received' : 'Sent'}</span>
                <span className="font-black text-purple-950 text-sm font-mono">₦{safeAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-1 space-y-5">
                <div className="flex justify-between items-start">
                  <span className="text-purple-900/60 text-sm font-semibold mt-0.5">{isCredit ? 'Sender Details' : 'Receiver Details'}</span>
                  <div className="text-right w-[60%]">
                    <p className="font-black text-purple-950 text-sm truncate">{opponentName.toUpperCase()}</p>
                    <p className="text-purple-900/50 text-xs mt-1 font-mono font-bold">SharpPay | {isCredit ? '***' : maskAccount(opponentAcct)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-purple-900/60 text-sm font-semibold">Transaction No.</span>
                  <span className="font-bold text-purple-950 flex items-center gap-2 font-mono text-[11px] bg-white border border-purple-100 px-2 py-1.5 rounded-lg shadow-sm truncate max-w-[160px]">
                    {safeTxId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-purple-900/60 text-sm font-semibold">Date & Time</span>
                  <span className="font-bold text-purple-950 text-xs">{safeDate}</span>
                </div>
              </div>
            </div>

            {/* DONE & SHARE BUTTONS */}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95 border border-rose-200">
                Done
              </button>
              <button onClick={handleShare} className="flex-1 py-4 rounded-2xl font-black text-white transition-transform active:scale-[0.98] shadow-lg shadow-rose-600/20" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
                Share Receipt
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}