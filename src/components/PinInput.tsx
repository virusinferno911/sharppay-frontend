import { useRef } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export default function PinInput({ length = 4, value, onChange, label }: Props) {
  const inputs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const arr = value.split('');
    arr[index] = val.slice(-1);
    const next = arr.join('').slice(0, length);
    onChange(next);
    if (val && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {label && <p className="text-sm font-medium text-gray-600">{label}</p>}
      <div className="flex gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { if (el) inputs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-12 text-center text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none focus:bg-white transition-all"
          />
        ))}
      </div>
    </div>
  );
}
