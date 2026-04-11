import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { billsPay } from '../services/api'
import BottomNav from '../components/BottomNav'
import Modal from '../components/Modal'
import PinInput from '../components/PinInput'

const CATEGORIES = [
  { id: 'ELECTRICITY', label: 'Electricity', icon: '⚡', hint: 'Meter number', numLabel: 'Meter Number' },
  { id: 'AIRTIME',     label: 'Airtime',     icon: '📱', hint: 'Phone number', numLabel: 'Phone Number' },
  { id: 'DATA',        label: 'Data',        icon: '🌐', hint: 'Phone number', numLabel: 'Phone Number' },
  { id: 'CABLE_TV',    label: 'Cable TV',    icon: '📺', hint: 'Smart card / IUC no.', numLabel: 'Smart Card Number' },
  { id: 'WATER',       label: 'Water',       icon: '💧', hint: 'Customer number', numLabel: 'Customer Number' },
  { id: 'INTERNET',    label: 'Internet',    icon: '🔌', hint: 'Account number', numLabel: 'Account Number' },
]

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000]

const fmt = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function BillsPage() {
  const nav = useNavigate()
  const [selected, setSelected]   = useState(null)
  const [target, setTarget]       = useState('')
  const [amount, setAmount]       = useState('')
  const [pinOpen, setPinOpen]     = useState(false)
  const [paying, setPaying]       = useState(false)
  const [pinReset, setPinReset]   = useState(0)

  const canPay = selected && target.length >= 5 && parseFloat(amount) > 0

  const handlePay = async (pin) => {
    setPaying(true)
    try {
      await billsPay({
        billType: selected.id,
        targetNumber: target,
        amount: parseFloat(amount),
        transactionPin: pin,
      })
      toast.success(`${selected.label} payment successful! 🎉`)
      setPinOpen(false)
      setTarget(''); setAmount(''); setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
      setPinReset(r => r + 1)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="app-shell flex flex-col min-h-screen nav-safe">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#001a0f 0%,#001408 50%,#0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(ellipse at 70% 40%, #059669 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => nav(-1)}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center mr-1">
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-white">Pay Bills</h1>
            <p className="text-white/40 text-xs">Utilities, airtime, cable & more</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 overflow-y-auto space-y-5">
        {/* Category grid */}
        <div>
          <p className="label-dark mb-3">Select Category</p>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => { setSelected(cat); setTarget(''); setAmount('') }}
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all duration-200 ${
                  selected?.id === cat.id
                    ? 'border-rose-500 bg-rose-500/15'
                    : 'border-white/8 bg-white/4 hover:border-white/15'
                }`}>
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs font-bold ${selected?.id === cat.id ? 'text-rose-400' : 'text-white/60'}`}>
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-3xl">{selected.icon}</span>
                <div>
                  <p className="text-white font-bold">{selected.label}</p>
                  <p className="text-white/40 text-xs">{selected.hint}</p>
                </div>
              </div>

              <div>
                <label className="label-dark">{selected.numLabel}</label>
                <input
                  type="text" inputMode="numeric" value={target}
                  onChange={e => setTarget(e.target.value.replace(/\D/g, ''))}
                  placeholder={`Enter ${selected.numLabel.toLowerCase()}`}
                  className="input-dark font-mono tracking-widest"
                />
              </div>

              <div>
                <label className="label-dark">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">₦</span>
                  <input
                    type="number" inputMode="decimal" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" min="1"
                    className="input-dark pl-8 font-mono text-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {QUICK_AMOUNTS.map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        Number(amount) === v
                          ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                          : 'border-white/8 text-white/35 hover:border-white/20'
                      }`}>
                      {v >= 1000 ? `₦${v/1000}K` : `₦${v}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {canPay && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-4 space-y-2">
                  {[
                    ['Category', selected.label],
                    [selected.numLabel, target],
                    ['Amount', fmt(parseFloat(amount))],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-white/40">{k}</span>
                      <span className="text-white font-semibold">{v}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              <button onClick={() => setPinOpen(true)} disabled={!canPay}
                className="brand-btn-primary disabled:opacity-40">
                Pay Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="text-5xl mb-3">🧾</span>
            <p className="text-white/30 text-sm">Select a bill category above to get started</p>
          </div>
        )}
      </div>

      {/* PIN Modal */}
      <Modal open={pinOpen} onClose={() => !paying && setPinOpen(false)} title="Confirm Payment">
        <div className="py-3">
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
              {selected?.icon}
            </div>
            <div>
              <p className="text-white font-bold">{selected?.label} – {fmt(parseFloat(amount) || 0)}</p>
              <p className="text-white/40 text-xs mt-0.5">{target}</p>
            </div>
          </div>
          <PinInput
            label="Enter your 4-digit transaction PIN"
            onComplete={handlePay}
            onReset={pinReset}
          />
          {paying && (
            <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-sm">
              <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              Processing payment…
            </div>
          )}
        </div>
      </Modal>

      <BottomNav />
    </div>
  )
}
