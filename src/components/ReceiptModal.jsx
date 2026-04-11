import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceiptModal({ isOpen, onClose, transaction, myAccountNumber }) {
  if (!isOpen || !transaction) return null;

  // Determine if the current user is the sender or receiver
  const isCredit = transaction.receiverAccount === myAccountNumber;
  
  // Format the Date
  const txDate = new Date(transaction.createdAt).toLocaleString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Mask Account Number Function (e.g., 708****869)
  const maskAccount = (accNum) => {
    if (!accNum) return '***';
    if (accNum.length < 6) return accNum;
    return `${accNum.slice(0, 3)}****${accNum.slice(-3)}`;
  };

  const opponentName = isCredit ? transaction.senderName : transaction.receiverName;
  const opponentBank = isCredit ? 'SharpPay' : 'SharpPay'; // Update if you add external banks later
  const opponentAccount = isCredit ? transaction.senderAccount : transaction.receiverAccount;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="w-full max-w-md bg-[#f8f9fa] rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center px-4 py-4 bg-white">
            <button onClick={onClose} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center text-lg font-bold text-gray-900 mr-6">Transaction Details</h2>
          </div>

          <div className="px-5 pb-6 pt-2">
            {/* Top Logo / Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-6 h-6 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* Title & Amount */}
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm font-medium mb-2">
                {isCredit ? 'Transfer from' : 'Transfer to'} {opponentName?.toUpperCase()}
              </p>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {isCredit ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-bold text-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Successful
              </div>
            </div>

            {/* Main Details Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">Fee <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                <span className="font-semibold text-gray-900">-₦0.00</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 pb-4">
                <span className="text-gray-500">Amount {isCredit ? 'Received' : 'Sent'}</span>
                <span className="font-semibold text-gray-900">₦{parseFloat(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-2 space-y-4">
                <h3 className="font-bold text-gray-900">Transaction Details</h3>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{isCredit ? 'Credited to' : 'Debited from'}</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    Available Balance <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>

                <div className="flex justify-between items-start text-sm">
                  <span className="text-gray-500">{isCredit ? 'Sender Details' : 'Receiver Details'}</span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{opponentName?.toUpperCase()}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{opponentBank} | {maskAccount(opponentAccount)}</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction No.</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    {transaction.transactionId}
                    <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => navigator.clipboard.writeText(transaction.transactionId)}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction Date</span>
                  <span className="font-semibold text-gray-900">{txDate}</span>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <button className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-full transition-colors">
              Share Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}