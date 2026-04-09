/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0A0A0B',
          900: '#0F0F11',
          800: '#161618',
          700: '#1E1E21',
          600: '#26262A',
          500: '#2E2E33',
          400: '#3A3A40',
          300: '#52525C',
        },
        gold: {
          50:  '#FEFBF0',
          100: '#FDF3CC',
          200: '#FAE494',
          300: '#F5CE50',
          400: '#E8B831',
          500: '#D4A017',
          600: '#C9951A',
          700: '#A67C15',
          800: '#85620F',
          900: '#6B4F0C',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9951A 0%, #E8B831 40%, #F5CE50 60%, #D4A017 100%)',
        'card-gradient': 'linear-gradient(135deg, #1E1E21 0%, #26262A 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F0F11 0%, #161618 100%)',
      },
      boxShadow: {
        'gold': '0 0 30px rgba(212, 160, 23, 0.15)',
        'gold-md': '0 4px 20px rgba(212, 160, 23, 0.25)',
        'gold-lg': '0 8px 40px rgba(212, 160, 23, 0.3)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 160, 23, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 160, 23, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
