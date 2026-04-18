/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ═══ Bloomberg palette (novo, canônico) ═══
        'bbg-bg':        '#000000',  // fundo preto profundo
        'bbg-panel':     '#0A0A0A',  // fundo de tiles (quase preto)
        'bbg-panel-alt': '#141414',  // stripe row alternado
        'bbg-border':    '#2A2A2A',  // 1px divisor entre tiles
        'bbg-border-hi': '#404040',  // divisor de header

        'bbg-amber':     '#FFB800',  // texto primário (clássico Bloomberg)
        'bbg-amber-dim': '#B87A00',  // texto secundário
        'bbg-white':     '#FFFFFF',  // headers / dados em destaque
        'bbg-muted':     '#6E7681',  // labels menos importantes
        'bbg-cyan':      '#55D4FF',  // acentos neutros (ex: hora, links)

        'bbg-green':     '#00FF5F',  // variação positiva
        'bbg-green-dim': '#007F2F',  // fundo tênue de flash up
        'bbg-red':       '#FF3350',  // variação negativa
        'bbg-red-dim':   '#7F1928',  // fundo tênue de flash down
        'bbg-yellow':    '#FFD700',  // impacto médio / destaque

        // ═══ Legacy tokens mantidos (componentes atuais) ═══
        'trade-bg':     '#0B0E11',
        'trade-panel':  '#161B22',
        'trade-border': '#21262D',
        'trade-text':   '#E6EDF3',
        'trade-muted':  '#8B949E',
        'impact-high':  '#F85149',
        'impact-mid':   '#E3B341',
        'impact-low':   '#6E7681'
      },
      fontFamily: {
        // Monospace rigoroso Bloomberg-style
        mono: [
          'JetBrains Mono',
          'IBM Plex Mono',
          'Fira Code',
          'Consolas',
          '"Courier New"',
          'monospace'
        ]
      },
      fontSize: {
        'bbg-xs':  ['10px', { lineHeight: '13px' }],
        'bbg-sm':  ['11px', { lineHeight: '15px' }],
        'bbg-md':  ['13px', { lineHeight: '17px' }]
      },
      keyframes: {
        'flash-up': {
          '0%':   { backgroundColor: 'rgba(0, 255, 95, 0.40)' },
          '100%': { backgroundColor: 'rgba(0, 255, 95, 0)' }
        },
        'flash-down': {
          '0%':   { backgroundColor: 'rgba(255, 51, 80, 0.40)' },
          '100%': { backgroundColor: 'rgba(255, 51, 80, 0)' }
        },
        'border-pulse': {
          '0%, 100%': { borderColor: '#FF3350', boxShadow: '0 0 0 0 rgba(255, 51, 80, 0.6)' },
          '50%':      { borderColor: '#FFB800', boxShadow: '0 0 24px 4px rgba(255, 51, 80, 0.4)' }
        },
        'ticker-scroll': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        'flash-up':     'flash-up 300ms ease-out 1',
        'flash-down':   'flash-down 300ms ease-out 1',
        'border-pulse': 'border-pulse 1.1s ease-in-out infinite',
        'ticker':       'ticker-scroll var(--ticker-duration, 240s) linear infinite'
      }
    }
  },
  plugins: []
};
