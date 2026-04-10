import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, refreshUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const token = res.data?.data?.token || res.data?.token || res.data?.accessToken;
      if (token) {
        setToken(token);
        await refreshUser();
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error('Login failed. No token received.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Check your credentials.';
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
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <button onClick={() => navigate(-1)} className="relative z-10 text-white/80 hover:text-white mb-6">
          <ArrowLeft size={24} />
        </button>
        <div className="relative z-10 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="SharpPay" className="w-16 h-16 rounded-2xl object-cover shadow-xl" />
          <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-white/70 text-sm">Sign in to your SharpPay account</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none transition-all text-sm font-medium shadow-sm"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none transition-all text-sm font-medium shadow-sm"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button type="button" className="text-rose-500 text-sm font-semibold">
            Forgot Password?
          </button>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing In...
            </span>
          ) : 'Sign In'}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500">
          New to SharpPay?{' '}
          <button type="button" onClick={() => navigate('/register')} className="text-rose-500 font-bold">
            Create Account
          </button>
        </p>
      </form>
    </PageWrapper>
  );
}
