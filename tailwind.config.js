/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185', 500: '#f43f5e',
          600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
        },
        dark: {
          900: '#0A0A0A', 800: '#111111', 700: '#1A1A1A',
          600: '#222222', 500: '#2A2A2A', 400: '#333333',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #e11d48 0%, #7c3aed 50%, #dc2626 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #f43f5e 0%, #a855f7 50%, #ef4444 100%)',
        'card-gradient': 'linear-gradient(135deg, #be123c 0%, #4c1d95 50%, #991b1b 100%)',
      },
      boxShadow: {
        'brand': '0 8px 32px rgba(225,29,72,0.4)',
        'brand-lg': '0 16px 48px rgba(225,29,72,0.5)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'glow': '0 0 40px rgba(225,29,72,0.25)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fadeUp': 'fadeUp 0.4s ease forwards',
        'scanline': 'scanline 2.5s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scanline: { '0%': { transform: 'translateY(0%)' }, '100%': { transform: 'translateY(300%)' } },
        pulseRing: { '0%': { transform: 'scale(0.9)', opacity: 1 }, '100%': { transform: 'scale(1.4)', opacity: 0 } },
      }
    },
  },
  plugins: [],
}
