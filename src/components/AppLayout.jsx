import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, CreditCard, Receipt, HeadphonesIcon,
  LogOut, Zap, Bell, ChevronRight, Settings
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/card',      icon: CreditCard,      label: 'Virtual Card' },
  { to: '/history',   icon: Receipt,         label: 'Transactions' },
  { to: '/support',   icon: HeadphonesIcon,  label: 'Support' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP'

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-900">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-charcoal-800 border-r border-charcoal-600/50">

        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-charcoal-600/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Zap size={18} className="text-charcoal-900" fill="currentColor" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-white tracking-wide">Sharp</span>
              <span className="font-display text-lg font-bold text-gold-400 tracking-wide">Pay</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="label px-3 mb-4">Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-gold-600/15 text-gold-400 border border-gold-600/25'
                  : 'text-white/50 hover:text-white/80 hover:bg-charcoal-600/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-gold-400' : 'text-white/40 group-hover:text-white/60'} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-gold-600" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-charcoal-600/30">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-700 border border-charcoal-500/40">
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-charcoal-900 text-xs font-bold shadow-gold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-red-400 transition-colors duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-charcoal-800/40 border-b border-charcoal-600/30 flex-shrink-0 backdrop-blur-sm">
          <div>
            <h1 className="text-sm font-medium text-white/50">
              Good {getGreeting()},
              <span className="text-white ml-1">{user?.fullName?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge-success">
              <span className="dot-gold w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              KYC Verified
            </span>
            <button className="w-9 h-9 rounded-xl bg-charcoal-700 border border-charcoal-500/40 flex items-center justify-center text-white/40 hover:text-gold-400 hover:border-gold-600/30 transition-all duration-200 relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold-400" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
