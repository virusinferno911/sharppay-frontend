import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeftRight, CreditCard, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { label: 'Home', icon: Home, path: '/dashboard' },
  { label: 'Transfer', icon: ArrowLeftRight, path: '/transfer' },
  { label: 'Cards', icon: CreditCard, path: '/cards' },
  { label: 'Bills', icon: Zap, path: '/bills' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-rose-50 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-rose-600' : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={`relative z-10 text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-rose-600' : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
