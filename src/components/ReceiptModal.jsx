import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function ReceiptModal({ isOpen, onClose, transaction, myAccountNumber }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !transaction) return null;

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

  // THE MAGIC PDF GENERATOR
  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    
    try {
      // Takes a screenshot of the receipt details
      const canvas = await html2canvas(receiptRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      // Formats it neatly onto an A4 document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SharpPay_Receipt_${safeTxId}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        >
          {/* THE RECEIPT CONTENT (Wrapped securely in a Ref so buttons don't show on the PDF) */}
          <div ref={receiptRef} className="bg-white pb-2 overflow-y-auto no-scrollbar">
            <div className="flex items-center px-5 py-5 bg-gradient-to-r from-rose-600 to-purple-700 relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fde047 0%, transparent 50%)' }} />
              <h2 className="relative z-10 flex-1 text-center text-lg font-black text-white">Transaction Receipt</h2>
            </div>

            <div className="px-6 pt-6">
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

              <div className="bg-purple-50/50 border border-purple-100/50 rounded-3xl p-6 space-y-5 mb-2 shadow-inner">
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
            </div>
          </div>

          {/* DONE, SHARE, & DOWNLOAD PDF BUTTONS (Outside the Ref) */}
          <div className="px-6 pb-6 pt-2 bg-white">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95 border border-rose-200">
                  Done
                </button>
                <button onClick={handleShare} className="flex-1 py-3.5 rounded-2xl font-black text-white transition-transform active:scale-[0.98] shadow-lg shadow-rose-600/20" style={{ background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)' }}>
                  Share Receipt
                </button>
              </div>
              <button onClick={handleDownloadPdf} disabled={downloading} className="w-full py-3.5 rounded-2xl font-black text-purple-700 bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors active:scale-95 flex items-center justify-center gap-2">
                {downloading ? (
                  <><div className="w-4 h-4 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" /> Generating PDF...</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Download PDF Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}