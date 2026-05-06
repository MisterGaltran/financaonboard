/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ═══ New semantic palette ═══
        'surface':       '#0a0a0f',
        'surface-alt':   '#12121a',
        'surface-hover': '#1a1a25',
        'border':        '#1e1e2e',
        'border-hi':     '#2a2a3a',

        'text-primary':   '#e1e1e6',
        'text-secondary': '#6b6b80',

        'accent':       '#6366f1',
        'accent-light': '#818cf8',

        'positive':     '#22c55e',
        'positive-dim': '#15803d',
        'negative':     '#ef4444',
        'negative-dim': '#991b1b',
        'warning':      '#f59e0b',
        'info':         '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'ui-xs':   ['11px', { lineHeight: '14px' }],
        'ui-sm':   ['12px', { lineHeight: '16px' }],
        'ui-base': ['13px', { lineHeight: '18px' }],
      },
      keyframes: {
        'flash-up': {
          '0%':   { backgroundColor: 'rgba(34, 197, 94, 0.35)' },
          '100%': { backgroundColor: 'rgba(34, 197, 94, 0)' },
        },
        'flash-down': {
          '0%':   { backgroundColor: 'rgba(239, 68, 68, 0.35)' },
          '100%': { backgroundColor: 'rgba(239, 68, 68, 0)' },
        },
        'border-pulse': {
          '0%, 100%': { borderColor: '#ef4444', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.6)' },
          '50%':      { borderColor: '#f59e0b', boxShadow: '0 0 24px 4px rgba(239, 68, 68, 0.4)' },
        },
        'ticker-scroll': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        'flash-up':       'flash-up 300ms ease-out 1',
        'flash-down':     'flash-down 300ms ease-out 1',
        'border-pulse':   'border-pulse 1.1s ease-in-out infinite',
        'ticker':         'ticker-scroll var(--ticker-duration, 240s) linear infinite',
        'fade-in':        'fade-in 300ms ease-out',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
