import React, { useState, useRef, useEffect } from 'react'

export default function PinInput({ length = 4, onComplete, onReset, label = 'Enter PIN', autoFocus = true }) {
  const [pins, setPins] = useState(Array(length).fill(''))
  const refs = Array.from({ length }, () => useRef(null))

  useEffect(() => {
    if (autoFocus) setTimeout(() => refs[0].current?.focus(), 80)
  }, [autoFocus])

  useEffect(() => {
    if (onReset !== undefined) { setPins(Array(length).fill('')); refs[0].current?.focus() }
  }, [onReset])

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pins]
    next[idx] = val
    setPins(next)
    if (val && idx < length - 1) refs[idx + 1].current?.focus()
    if (next.every(Boolean) && next.length === length) onComplete?.(next.join(''))
  }

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !pins[idx] && idx > 0) {
      refs[idx - 1].current?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length === length) {
      setPins(pasted.split(''))
      refs[length - 1].current?.focus()
      onComplete?.(pasted)
    }
  }

  const clear = () => { setPins(Array(length).fill('')); refs[0].current?.focus() }

  return (
    <div>
      {label && <p className="text-white/50 text-sm text-center mb-4">{label}</p>}
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {pins.map((v, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={v}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            className={`w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 transition-all duration-150
              bg-white/5 text-white focus:outline-none
              ${v ? 'border-rose-500 bg-rose-500/10' : 'border-white/15'}
              focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30`}
          />
        ))}
      </div>
      {pins.some(Boolean) && (
        <button onClick={clear} className="block mx-auto mt-3 text-xs text-white/30 hover:text-white/60 transition-colors">
          Clear
        </button>
      )}
    </div>
  )
}
