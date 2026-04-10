import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Shield, Bell, Lock, HelpCircle,
  LogOut, ChevronRight, Phone, Mail, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const kycBadge = () => {
    if (user?.kycStatus === 'verified') return { label: 'Verified', color: 'text-green-600 bg-green-100' };
    if (user?.kycStatus === 'pending') return { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Not Started', color: 'text-red-600 bg-red-100' };
  };

  const badge = kycBadge();

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Information', icon: User, action: () => toast.success('Coming soon!'), sub: user?.fullName },
        { label: 'Phone Number', icon: Phone, action: () => toast.success('Coming soon!'), sub: user?.phoneNumber },
        { label: 'Email Address', icon: Mail, action: () => toast.success('Coming soon!'), sub: user?.email },
      ],
    },
    {
      title: 'Security',
      items: [
        { label: 'KYC Verification', icon: Shield, action: () => navigate('/kyc'), sub: badge.label, subColor: badge.color },
        { label: 'Change Password', icon: Lock, action: () => toast.success('Coming soon!') },
        { label: 'Transaction PIN', icon: Lock, action: () => toast.success('Coming soon!') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: Bell, action: () => toast.success('Coming soon!') },
        { label: 'Help & Support', icon: HelpCircle, action: () => toast.success('Coming soon!') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-red-500 pt-12 pb-8 px-5 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white">Settings</h1>
            <p className="text-white/70 text-xs">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-800 text-base">{user?.fullName || 'User'}</p>
            <p className="text-gray-400 text-xs mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-gray-500 text-xs">Acc: {user?.accountNumber || 'N/A'}</span>
              {user?.kycStatus === 'verified' && (
                <CheckCircle size={14} className="text-green-500" />
              )}
              {user?.kycStatus === 'pending' && (
                <Clock size={14} className="text-yellow-500" />
              )}
            </div>
          </div>
        </motion.div>

        {/* KYC Banner */}
        {user?.kycStatus !== 'verified' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/kyc')}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 text-white shadow-md"
          >
            <Shield size={22} />
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">Complete KYC Verification</p>
              <p className="text-white/80 text-xs">Verify identity to unlock all features</p>
            </div>
            <ChevronRight size={18} />
          </motion.button>
        )}

        {/* Settings Sections */}
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * si }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{section.title}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-rose-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                      <Icon size={18} className="text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                      {item.sub && (
                        <p className={`text-xs mt-0.5 ${(item as any).subColor || 'text-gray-400'}`}>
                          {item.sub}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* App Info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <img src="/logo.png" alt="SharpPay" className="w-12 h-12 rounded-2xl object-cover" />
          <div>
            <p className="font-bold text-gray-800">SharpPay</p>
            <p className="text-gray-400 text-xs">Version 1.0.0 • Secure Banking PWA</p>
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-100 rounded-2xl py-4 flex items-center justify-center gap-2 text-red-600 font-bold"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>

        <p className="text-center text-gray-300 text-xs pb-2">
          © 2025 SharpPay. All rights reserved.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
