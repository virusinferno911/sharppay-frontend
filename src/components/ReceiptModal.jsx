import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptModal({ isOpen, onClose, transaction, myAccountNumber }) {
  if (!isOpen || !transaction) return null;

  // Accurately determine if the current user is receiving the money
  const rxAcct = transaction.receiverAccount?.accountNumber || transaction.receiverAccount || '';
  const myAcct = myAccountNumber || '';
  const isCredit = String(rxAcct) === String(myAcct) || transaction.transactionType === 'WELCOME_BONUS';
  
  // Format Date
  const txDate = new Date(transaction.createdAt).toLocaleString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const maskAccount = (accNum) => {
    if (!accNum) return '***';
    if (accNum.length < 6) return accNum;
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  // Dynamically grab the opponent's details
  const opponentName = isCredit 
    ? (transaction.senderAccount?.user?.fullName || transaction.senderName || 'SharpPay System')
    : (transaction.receiverAccount?.user?.fullName || transaction.receiverName || 'SharpPay User');
    
  const opponentAccount = isCredit 
    ? '***' // Hide sender account number per your request
    : (transaction.receiverAccount?.accountNumber || transaction.receiverAccount || '***');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center px-5 py-5 border-b border-white/5">
            <button onClick={onClose} className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center text-lg font-black text-white mr-8">Transaction Details</h2>
          </div>

          <div className="px-6 pb-8 pt-6">
            {/* Top Logo / Status */}
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/10"
                   style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}>
                <img src="/logo.png" alt="SP" className="w-8 h-8 object-contain" />
              </div>
            </div>

            {/* Title & Amount */}
            <div className="text-center mb-8">
              <p className="text-white/50 text-sm font-medium mb-2 uppercase tracking-wide">
                {isCredit ? 'Transfer from' : 'Transfer to'}
              </p>
              <p className="text-white font-bold text-sm mb-3">
                {opponentName.toUpperCase()}
              </p>
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight font-mono">
                {isCredit ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h1>
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {transaction.status || 'Successful'}
              </div>
            </div>

            {/* Main Details Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Amount</span>
                <span className="font-semibold text-white font-mono">₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50 flex items-center gap-1">Fee</span>
                <span className="font-semibold text-white font-mono">-₦0.00</span>
              </div>
              <div className="flex justify-between text-sm border-b border-white/10 pb-5">
                <span className="text-white/50">Amount {isCredit ? 'Received' : 'Sent'}</span>
                <span className="font-bold text-white font-mono">₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-1 space-y-5">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Transaction Details</h3>
                
                <div className="flex justify-between items-start text-sm">
                  <span className="text-white/50">{isCredit ? 'Sender Details' : 'Receiver Details'}</span>
                  <div className="text-right">
                    <p className="font-bold text-white">{opponentName.toUpperCase()}</p>
                    <p className="text-white/40 text-xs mt-1 font-mono">SharpPay | {maskAccount(opponentAccount)}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Transaction No.</span>
                  <span className="font-semibold text-white/80 flex items-center gap-2 font-mono text-xs bg-white/5 px-2 py-1 rounded-lg">
                    {transaction.transactionId}
                    <svg className="w-3.5 h-3.5 text-white/40 cursor-pointer hover:text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => navigator.clipboard.writeText(transaction.transactionId)}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Date & Time</span>
                  <span className="font-semibold text-white/80 text-xs">{txDate}</span>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <button 
              onClick={() => {
                const shareText = `SharpPay Receipt\nAmount: ₦${transaction.amount}\n${isCredit ? 'From' : 'To'}: ${opponentName}\nRef: ${transaction.transactionId}\nDate: ${txDate}`;
                if (navigator.share) navigator.share({ title: 'SharpPay Receipt', text: shareText });
                else navigator.clipboard.writeText(shareText);
              }}
              className="w-full py-4 rounded-2xl font-black text-white text-sm uppercase tracking-wide transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(225,29,72,0.3)]"
              style={{ background: 'linear-gradient(135deg,#e11d48,#7c3aed)' }}
            >
              Share Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}