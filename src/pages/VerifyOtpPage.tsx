import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import { verifyOtp } from '../services/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email, otpCode });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-10 px-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <button onClick={() => navigate(-1)} className="relative z-10 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={24} />
        </button>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Verify Email</h1>
          <p className="text-white/70 text-sm text-center">
            We sent a 6-digit code to<br />
            <span className="text-white font-semibold">{email}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-10 flex flex-col items-center gap-8">
        {/* OTP inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-2xl font-bold bg-white border-2 rounded-xl transition-all focus:outline-none shadow-sm ${
                digit ? 'border-rose-400 bg-rose-50' : 'border-gray-200'
              } focus:border-rose-500`}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {resendTimer > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend code in <span className="text-rose-500 font-bold">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setResendTimer(60)}
              className="text-rose-500 font-semibold text-sm"
            >
              Resend OTP
            </button>
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </span>
          ) : 'Verify OTP'}
        </motion.button>
      </form>
    </PageWrapper>
  );
}
