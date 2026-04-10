import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-600 via-pink-600 to-red-600 flex flex-col items-center justify-between px-6 py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-60px] w-52 h-52 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-[-40px] w-36 h-36 bg-pink-300/20 rounded-full blur-2xl" />

      {/* Top: Logo + Name */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', bounce: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl scale-110" />
          <img
            src="/logo.png"
            alt="SharpPay Logo"
            className="relative w-28 h-28 rounded-3xl shadow-2xl object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold text-white tracking-tight">SharpPay</h1>
          <p className="text-white/80 text-lg mt-2 font-medium">Banking. Payments. Freedom.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {['Instant Transfers', 'Virtual Cards', 'Bill Payments'].map((f) => (
            <span key={f} className="bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
              {f}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom: Buttons */}
      <motion.div
        className="w-full flex flex-col gap-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white text-rose-600 font-bold text-lg py-4 rounded-2xl shadow-xl hover:bg-rose-50 active:scale-95 transition-all duration-150"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-transparent text-white font-bold text-lg py-4 rounded-2xl border-2 border-white/60 hover:bg-white/10 active:scale-95 transition-all duration-150"
        >
          Sign In
        </button>
        <p className="text-center text-white/50 text-xs mt-2">
          Secure & encrypted banking platform
        </p>
      </motion.div>
    </div>
  );
}
