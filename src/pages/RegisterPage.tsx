import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, User, Mail, Phone, Lock } from 'lucide-react';
import { register } from '../services/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      toast.success('Account created! Check your email for OTP.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'john@example.com' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: '+2348012345678' },
    { name: 'password', label: 'Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Confirm Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: '••••••••' },
  ];

  return (
    <PageWrapper className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <button onClick={() => navigate(-1)} className="relative z-10 text-white/80 hover:text-white mb-4">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo.png" alt="SharpPay" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
            <p className="text-white/70 text-sm">Join millions of SharpPay users</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 pb-10">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * fields.indexOf(field) }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
              <div className="relative">
                <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:border-rose-400 focus:outline-none transition-all text-sm font-medium shadow-sm"
                />
                {(field.name === 'password' || field.name === 'confirmPassword') && field.name === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p className="text-xs text-gray-500 text-center mb-4">
            By registering, you agree to our{' '}
            <span className="text-rose-500 font-semibold">Terms of Service</span> &{' '}
            <span className="text-rose-500 font-semibold">Privacy Policy</span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-base py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </span>
            ) : 'Create Account'}
          </button>
        </motion.div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-rose-500 font-bold">
            Sign In
          </button>
        </p>
      </form>
    </PageWrapper>
  );
}
