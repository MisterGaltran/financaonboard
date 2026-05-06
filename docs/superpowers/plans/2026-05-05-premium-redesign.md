# Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Financa Onboard frontend from Bloomberg amber terminal to a dark modern minimalist UI (indigo accent, Inter font, market clock, polished components) targeting advanced retail investors.

**Architecture:** Incremental CSS/Tailwind redesign. No data architecture changes. New semantic color tokens replace all `bbg-*` and `trade-*` tokens. One new component (MarketClock). All existing components get visual updates. Foundation layer (tailwind config, CSS, HTML) is updated first, then components are migrated one by one.

**Tech Stack:** React 18, Tailwind CSS 3.4, Vite 5, Zustand, Inter (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-05-05-premium-redesign-design.md`

---

### Task 1: Foundation — Tailwind Config, Global CSS, HTML

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`

This task sets up the new design system. After this task, both old (`bbg-*`) and new semantic tokens coexist so components can be migrated incrementally.

- [ ] **Step 1: Rewrite `frontend/tailwind.config.js`**

Replace the entire file with the new design tokens. Keep `bbg-*` tokens temporarily as aliases so the app doesn't break while migrating components.

```js
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

        // ═══ Legacy aliases (removed after migration) ═══
        'bbg-bg':        '#0a0a0f',
        'bbg-panel':     '#12121a',
        'bbg-panel-alt': '#1a1a25',
        'bbg-border':    '#1e1e2e',
        'bbg-border-hi': '#2a2a3a',
        'bbg-amber':     '#e1e1e6',
        'bbg-amber-dim': '#6b6b80',
        'bbg-white':     '#e1e1e6',
        'bbg-muted':     '#6b6b80',
        'bbg-cyan':      '#38bdf8',
        'bbg-green':     '#22c55e',
        'bbg-green-dim': '#15803d',
        'bbg-red':       '#ef4444',
        'bbg-red-dim':   '#991b1b',
        'bbg-yellow':    '#f59e0b',
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
```

- [ ] **Step 2: Rewrite `frontend/src/index.css`**

Replace the entire file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  margin: 0;
  background: #0a0a0f;
  color: #e1e1e6;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth transitions on all interactive elements */
button, a, [role="button"] {
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease, opacity 150ms ease;
}

/* Custom scrollbar */
*::-webkit-scrollbar { width: 6px; height: 6px; }
*::-webkit-scrollbar-track { background: #0a0a0f; }
*::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
*::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }

/* Marquee animation */
@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll var(--marquee-duration, 180s) linear infinite;
  will-change: transform;
}
.marquee-wrapper:hover .marquee-track {
  animation-play-state: paused;
}

/* Row hover */
.row-hover:hover { background: #1a1a25; }

/* Skeleton loading */
.skeleton {
  background: #1a1a25;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
```

- [ ] **Step 3: Rewrite `frontend/index.html`**

Replace the entire file with Google Fonts, favicon, and meta tags:

```html
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0a0f" />
    <meta name="description" content="Terminal de investimentos em tempo real com calendario economico, noticias e cotacoes brasileiras." />
    <meta property="og:title" content="Financa Onboard" />
    <meta property="og:description" content="Terminal de investimentos em tempo real para investidores brasileiros." />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%236366f1'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>Financa Onboard</title>
  </head>
  <body class="bg-surface text-text-primary font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Verify the app still loads**

Run: `cd frontend && npm run dev`

Open `http://localhost:5173` in a browser. The app should render — colors will look different because the legacy aliases now map to new values, but nothing should crash.

- [ ] **Step 5: Commit**

```bash
git add frontend/tailwind.config.js frontend/src/index.css frontend/index.html
git commit -m "feat: new design system foundation — palette, Inter font, animations"
```

---

### Task 2: MarketClock Component

**Files:**
- Create: `frontend/src/components/Dashboard/MarketClock.jsx`

New component showing live clock + market status (B3, NYSE, Crypto).

- [ ] **Step 1: Create `frontend/src/components/Dashboard/MarketClock.jsx`**

```jsx
import { useEffect, useState } from 'react';

function getMarketStatus() {
  const now = new Date();

  // B3: 10:00-17:00 BRT (America/Sao_Paulo)
  const brTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const brH = brTime.getHours();
  const brM = brTime.getMinutes();
  const brMinutes = brH * 60 + brM;
  const brDay = brTime.getDay();
  const b3Open = brDay >= 1 && brDay <= 5 && brMinutes >= 600 && brMinutes < 1020;

  // NYSE: 09:30-16:00 ET (America/New_York)
  const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const nyH = nyTime.getHours();
  const nyM = nyTime.getMinutes();
  const nyMinutes = nyH * 60 + nyM;
  const nyDay = nyTime.getDay();
  const nyseOpen = nyDay >= 1 && nyDay <= 5 && nyMinutes >= 570 && nyMinutes < 960;

  const clock = now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return { b3Open, nyseOpen, clock };
}

const Dot = ({ open }) => (
  <span className={`inline-block w-1.5 h-1.5 rounded-full ${open ? 'bg-positive' : 'bg-negative'}`} />
);

export default function MarketClock() {
  const [status, setStatus] = useState(getMarketStatus);

  useEffect(() => {
    const t = setInterval(() => setStatus(getMarketStatus()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-4 text-ui-xs">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <Dot open={status.b3Open} />
          <span className="text-text-secondary tracking-wider">B3</span>
          <span className={status.b3Open ? 'text-positive' : 'text-negative'}>
            {status.b3Open ? 'ABERTO' : 'FECHADO'}
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <Dot open={status.nyseOpen} />
          <span className="text-text-secondary tracking-wider">NYSE</span>
          <span className={status.nyseOpen ? 'text-positive' : 'text-negative'}>
            {status.nyseOpen ? 'OPEN' : 'CLOSED'}
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <Dot open={true} />
          <span className="text-text-secondary tracking-wider">CRYPTO</span>
          <span className="text-positive">24H</span>
        </span>
      </div>

      <span className="tabular-nums text-ui-sm font-semibold text-text-primary tracking-wider">
        {status.clock}
        <span className="text-text-secondary ml-1 text-ui-xs font-normal">BRT</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Dashboard/MarketClock.jsx
git commit -m "feat: add MarketClock component with B3/NYSE/Crypto status"
```

---

### Task 3: Dashboard Header + StatusBar Redesign

**Files:**
- Modify: `frontend/src/components/Dashboard/Dashboard.jsx`
- Modify: `frontend/src/components/Dashboard/StatusBar.jsx`

Redesign the header with logo, market clock, integrated providers, and minimal search button. Remove debug buttons from StatusBar.

- [ ] **Step 1: Rewrite `frontend/src/components/Dashboard/StatusBar.jsx`**

Remove debug buttons, make it a compact provider strip that integrates into the header area:

```jsx
import { useConnectionStore } from '../../store/connectionStore';

const dot = (color) => `inline-block w-1.5 h-1.5 rounded-full ${color}`;

export default function StatusBar() {
  const status = useConnectionStore((s) => s.status);
  const providers = useConnectionStore((s) => s.providers);

  const isConnected = status === 'connected';

  const providerDot = (p) => {
    if (p === 'ready' || p === 'authed' || p === 'connected' || p === 'polling') return dot('bg-positive');
    if (p === 'rest-polling') return dot('bg-warning');
    if (p === 'connecting' || p === 'reconnecting') return dot('bg-warning animate-pulse');
    if (p === 'disabled' || p === 'no-token') return dot('bg-text-secondary');
    return dot('bg-negative');
  };

  return (
    <div className="flex items-center gap-3 text-ui-xs">
      <span className="flex items-center gap-1.5">
        <span className={isConnected ? dot('bg-positive') : dot('bg-negative animate-pulse')} />
        <span className={`uppercase tracking-wider ${isConnected ? 'text-positive' : 'text-negative'}`}>
          {isConnected ? 'LIVE' : 'OFF'}
        </span>
      </span>

      <span className="h-3 w-px bg-border-hi" />

      <div className="flex items-center gap-2.5 text-text-secondary">
        {Object.entries(providers).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1" title={`${key}: ${val}`}>
            <span className={providerDot(val)} />
            <span className="tracking-wider">{key === 'brRss' ? 'RSS' : key.toUpperCase()}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `frontend/src/components/Dashboard/Dashboard.jsx`**

New header with logo, MarketClock, StatusBar, search icon. Grid adjusted to `1.2fr_1fr`.

```jsx
import EconomicCalendar from '../EconomicCalendar/EconomicCalendar';
import NewsFeed from '../NewsFeed/NewsFeed';
import BrazilQuotes from '../BrazilQuotes/BrazilQuotes';
import NewsTicker from '../NewsTicker/NewsTicker';
import Watchlist from '../Watchlist/Watchlist';
import StatusBar from './StatusBar';
import MarketClock from './MarketClock';

export default function Dashboard({ onOpenPalette }) {
  return (
    <div className="h-screen flex flex-col bg-surface text-text-primary font-sans text-ui-base">
      {/* Header */}
      <header className="bg-surface-alt border-b border-border-hi">
        {/* Top row: Logo + Market Clock + Search */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-text-primary text-ui-sm font-semibold tracking-[0.15em]">
              FINANCA ONBOARD
            </span>
          </div>

          <MarketClock />

          <button
            onClick={onOpenPalette}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface border border-border hover:border-accent text-text-secondary hover:text-accent text-ui-xs tracking-wider"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-text-secondary/60 text-[10px] border border-border rounded px-1">Ctrl+K</span>
          </button>
        </div>

        {/* Bottom row: Providers */}
        <div className="flex items-center justify-between px-4 py-1 border-t border-border">
          <StatusBar />
          <div className="text-ui-xs text-text-secondary tabular-nums tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </header>

      <Watchlist />
      <BrazilQuotes />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-px bg-border overflow-hidden">
        <EconomicCalendar />
        <NewsFeed />
      </main>

      <NewsTicker />
    </div>
  );
}
```

- [ ] **Step 3: Verify header renders correctly**

Open `http://localhost:5173`. The header should show:
- Indigo dot + "FINANCA ONBOARD" on the left
- Market clock with B3/NYSE/Crypto status in the center
- Search icon with Ctrl+K badge on the right
- Provider status strip below

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Dashboard/Dashboard.jsx frontend/src/components/Dashboard/StatusBar.jsx
git commit -m "feat: premium header with market clock and integrated status bar"
```

---

### Task 4: Watchlist Components

**Files:**
- Modify: `frontend/src/components/Watchlist/Watchlist.jsx`
- Modify: `frontend/src/components/Watchlist/WatchlistTile.jsx`
- Modify: `frontend/src/components/Watchlist/WatchlistEditor.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/Watchlist/Watchlist.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import WatchlistTile from './WatchlistTile';
import WatchlistEditor from './WatchlistEditor';

export default function Watchlist() {
  const symbols = useWatchlistStore((s) => s.symbols);
  const remove = useWatchlistStore((s) => s.remove);
  const quotes = useBrQuotesStore((s) => s.quotes);
  const [editing, setEditing] = useState(false);

  const quoteMap = useMemo(() => {
    const m = new Map();
    for (const q of quotes) m.set(q.symbol, q);
    return m;
  }, [quotes]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && editing) setEditing(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing]);

  return (
    <div className="bg-surface-alt border-b border-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-b border-border">
        <span className="text-ui-xs font-semibold tracking-widest text-text-primary">WATCHLIST</span>
        <div className="flex items-center gap-2">
          <span className="text-ui-xs text-text-secondary tabular-nums tracking-wider">{symbols.length} SYMBOLS</span>
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-0.5 text-ui-xs tracking-widest rounded border border-border text-text-secondary hover:border-accent hover:text-accent"
          >
            + EDIT
          </button>
        </div>
      </div>

      {symbols.length === 0 ? (
        <div className="px-4 py-4 text-ui-sm text-text-secondary text-center tracking-wider">
          Watchlist vazia &middot;{' '}
          <button onClick={() => setEditing(true)} className="text-accent hover:text-accent-light">
            + Adicionar tickers
          </button>
        </div>
      ) : (
        <div className="grid gap-px bg-border" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {symbols.map((s) => (
            <WatchlistTile key={s} symbol={s} quote={quoteMap.get(s)} onRemove={remove} />
          ))}
        </div>
      )}

      {editing && <WatchlistEditor onClose={() => setEditing(false)} />}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `frontend/src/components/Watchlist/WatchlistTile.jsx`**

```jsx
import { useFlash } from '../../hooks/useFlash';
import { fmtNum } from '../../utils/formatters';

export default function WatchlistTile({ quote, symbol, onRemove }) {
  const flash = useFlash(quote?.price);
  const pct = quote?.changePct;
  const hasChange = pct != null && pct !== 0;
  const up = hasChange && pct > 0;
  const down = hasChange && pct < 0;
  const color = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
  const symbolColor = up ? 'text-positive' : down ? 'text-negative' : 'text-text-primary';
  const arrow = up ? '▲' : down ? '▼' : '';

  return (
    <div className={`relative rounded bg-surface-alt border border-border hover:border-accent transition-all duration-150 p-2.5 group ${flash}`}>
      <button
        onClick={() => onRemove(symbol)}
        title="remover"
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-ui-xs text-text-secondary opacity-0 group-hover:opacity-100 hover:text-negative hover:bg-negative/10"
      >
        ✕
      </button>
      {!quote ? (
        <div className="space-y-2">
          <div className="text-ui-sm font-semibold text-text-secondary tracking-wider">{symbol}</div>
          <div className="skeleton h-5 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`text-ui-sm font-bold tracking-wider ${symbolColor}`}>{symbol}</span>
            <span className={`text-ui-xs tabular-nums font-semibold ${color}`}>
              {pct == null ? '--' : `${arrow} ${Math.abs(pct).toFixed(2)}%`}
            </span>
          </div>
          <div className={`text-[16px] tabular-nums font-bold ${color} leading-tight mt-1`}>
            R$ {fmtNum(quote.price)}
          </div>
          <div className="flex items-center justify-between gap-2 text-ui-xs text-text-secondary tabular-nums mt-1 tracking-wider">
            <span>H {fmtNum(quote.high)}</span>
            <span>L {fmtNum(quote.low)}</span>
          </div>
          {quote.volume != null && (
            <div className="text-ui-xs text-text-secondary tabular-nums mt-0.5 tracking-wider">
              VOL {formatVolume(quote.volume)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatVolume(v) {
  if (v == null) return '—';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return String(v);
}
```

- [ ] **Step 3: Rewrite `frontend/src/components/Watchlist/WatchlistEditor.jsx`**

```jsx
import { useMemo, useRef, useState, useEffect } from 'react';
import { useWatchlistStore } from '../../store/watchlistStore';
import { useBrQuotesStore } from '../../store/brQuotesStore';

export default function WatchlistEditor({ onClose }) {
  const symbols = useWatchlistStore((s) => s.symbols);
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const clear = useWatchlistStore((s) => s.clear);
  const reset = useWatchlistStore((s) => s.reset);
  const ibov = useBrQuotesStore((s) => s.quotes);

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return ibov.slice(0, 12);
    return ibov
      .filter((s) => s.symbol.includes(q) || (s.name || '').toUpperCase().includes(q))
      .slice(0, 20);
  }, [ibov, query]);

  return (
    <div className="fixed inset-0 z-[8000] flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface-alt border-2 border-accent rounded shadow-[0_0_40px_rgba(99,102,241,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface border-b border-border rounded-t">
          <span className="text-ui-sm font-semibold tracking-widest text-text-primary">EDIT WATCHLIST</span>
          <button onClick={onClose} className="text-ui-xs text-text-secondary hover:text-negative tracking-widest">CLOSE · ESC</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions[0]) {
                  add(suggestions[0].symbol);
                  setQuery('');
                }
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Buscar PETR4, Vale, banco..."
              className="w-full px-3 py-2 bg-surface border border-border focus:border-accent rounded outline-none text-text-primary placeholder-text-secondary tabular-nums tracking-wider text-ui-sm"
            />
          </div>

          <div>
            <div className="text-ui-xs tracking-widest text-text-secondary mb-1.5">
              {query.trim() ? `RESULTADOS (${suggestions.length})` : 'TOP-12 IBOV POR VOLUME'}
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded">
              {suggestions.length === 0 && (
                <div className="px-3 py-4 text-ui-xs text-text-secondary text-center">Nenhum resultado</div>
              )}
              {suggestions.map((s) => {
                const already = symbols.includes(s.symbol);
                return (
                  <button
                    key={s.symbol}
                    onClick={() => (already ? remove(s.symbol) : add(s.symbol))}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 border-b border-border/50 hover:bg-surface-hover text-ui-xs ${already ? 'bg-surface-hover' : ''}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] font-bold ${already ? 'bg-accent border-accent text-white' : 'border-text-secondary text-text-secondary'}`}>
                        {already ? '✓' : '+'}
                      </span>
                      <span className="font-semibold tracking-wider text-text-primary">{s.symbol}</span>
                      <span className="text-text-secondary truncate max-w-[200px]">{s.name}</span>
                    </span>
                    <span className="tabular-nums text-text-secondary">R$ {s.price?.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ui-xs tracking-widest text-text-secondary">SUA LISTA ({symbols.length})</span>
              <div className="flex gap-2 text-ui-xs tracking-widest">
                <button onClick={reset} className="text-text-secondary hover:text-accent">RESET</button>
                <button onClick={clear} className="text-text-secondary hover:text-negative">LIMPAR</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {symbols.length === 0 && (
                <span className="text-ui-xs text-text-secondary italic">Watchlist vazia</span>
              )}
              {symbols.map((s) => (
                <button
                  key={s}
                  onClick={() => remove(s)}
                  className="px-2 py-0.5 text-ui-xs rounded bg-accent/10 border border-accent/40 text-accent hover:border-negative hover:text-negative hover:bg-negative/10 tracking-wider"
                  title="Clique para remover"
                >
                  {s} ✕
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify watchlist renders**

Check watchlist section: cards with rounded borders, skeleton loading for missing data, hover shows indigo border, editor modal has rounded corners and indigo accents.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Watchlist/Watchlist.jsx frontend/src/components/Watchlist/WatchlistTile.jsx frontend/src/components/Watchlist/WatchlistEditor.jsx
git commit -m "feat: premium watchlist cards with skeleton loading and polished editor"
```

---

### Task 5: BrazilQuotes Component

**Files:**
- Modify: `frontend/src/components/BrazilQuotes/BrazilQuotes.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/BrazilQuotes/BrazilQuotes.jsx`**

```jsx
import { useEffect, useMemo } from 'react';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import { fetchBrQuotes } from '../../services/apiClient';
import { fmtTime, fmtNum } from '../../utils/formatters';
import { useFlash } from '../../hooks/useFlash';

function QuoteItem({ q }) {
  const flash = useFlash(q.price);
  const pct = q.changePct;
  const hasChange = pct != null && pct !== 0;
  const up = hasChange && pct > 0;
  const down = hasChange && pct < 0;

  const color = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
  const symbolColor = up ? 'text-positive' : down ? 'text-negative' : 'text-text-primary';
  const arrow = up ? '▲' : down ? '▼' : '';

  return (
    <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1 border-r border-border ${flash}`}>
      <span className={`text-ui-xs font-semibold tracking-wider ${symbolColor}`}>{q.symbol}</span>
      <span className={`text-ui-xs tabular-nums ${color}`}>{fmtNum(q.price)}</span>
      <span className={`text-ui-xs tabular-nums font-semibold ${color}`}>
        {pct == null ? '' : `${arrow} ${Math.abs(pct).toFixed(2)}%`}
      </span>
    </div>
  );
}

function SkeletonQuotes() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export default function BrazilQuotes() {
  const quotes = useBrQuotesStore((s) => s.quotes);
  const lastUpdate = useBrQuotesStore((s) => s.lastUpdate);
  const setQuotes = useBrQuotesStore((s) => s.setQuotes);
  const setError = useBrQuotesStore((s) => s.setError);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const q = await fetchBrQuotes();
        if (!cancelled && q.length) setQuotes(q);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [setQuotes, setError]);

  const duration = useMemo(() => {
    const baseSec = 3;
    return `${Math.max(60, Math.round(baseSec * Math.max(20, quotes.length)))}s`;
  }, [quotes.length]);

  return (
    <div className="bg-surface-alt border-b border-border overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex flex-col justify-center px-3 py-1 border-r border-border bg-surface z-10 leading-tight">
          <div className="text-ui-xs text-accent font-semibold tracking-widest">IBOV</div>
          <div className="tabular-nums text-[10px] text-text-secondary tracking-normal">
            {quotes.length ? `${quotes.length} · ${fmtTime(lastUpdate)}` : '...'}
          </div>
        </div>

        <div className="flex-1 overflow-hidden marquee-wrapper relative">
          {quotes.length === 0 ? (
            <SkeletonQuotes />
          ) : (
            <div className="marquee-track" style={{ '--marquee-duration': duration }}>
              {[...quotes, ...quotes].map((q, idx) => (
                <QuoteItem key={`${q.symbol}-${idx}`} q={q} />
              ))}
            </div>
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface-alt to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface-alt to-transparent" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/BrazilQuotes/BrazilQuotes.jsx
git commit -m "feat: premium BrazilQuotes with skeleton loading"
```

---

### Task 6: EconomicCalendar + CountryFilter

**Files:**
- Modify: `frontend/src/components/EconomicCalendar/EconomicCalendar.jsx`
- Modify: `frontend/src/components/EconomicCalendar/CountryFilter.jsx`
- Modify: `frontend/src/utils/formatters.js`

- [ ] **Step 1: Update `frontend/src/utils/formatters.js`**

Update impact classes and badge styling to use new tokens:

```js
export const fmtTime = (ts) => {
  if (!ts) return '--:--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const fmtDateTime = (ts) => {
  if (!ts) return '--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const fmtHHMM = (ts) => {
  if (!ts) return '--:--';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const impactClass = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'bg-negative text-white';
    case 'medium': return 'bg-warning text-black';
    default:       return 'bg-text-secondary/30 text-text-primary';
  }
};

export const impactLabel = (impact) => {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'H';
    case 'medium': return 'M';
    default:       return 'L';
  }
};

export const IMPACT_BADGE_CLASS = 'inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold leading-none tabular-nums';

export const fmtNum = (v, digits = 2) => {
  if (v == null) return '—';
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
```

- [ ] **Step 2: Rewrite `frontend/src/components/EconomicCalendar/CountryFilter.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useCalendarFilterStore } from '../../store/calendarFilterStore';
import { flagFor } from '../../utils/countries';

export default function CountryFilter({ events }) {
  const [open, setOpen] = useState(false);
  const selected = useCalendarFilterStore((s) => s.selected);
  const hideLow = useCalendarFilterStore((s) => s.hideLowImpact);
  const next24h = useCalendarFilterStore((s) => s.next24h);
  const hidePast = useCalendarFilterStore((s) => s.hidePast);
  const toggle = useCalendarFilterStore((s) => s.toggle);
  const setAll = useCalendarFilterStore((s) => s.setAll);
  const clear = useCalendarFilterStore((s) => s.clear);
  const toggleHideLow = useCalendarFilterStore((s) => s.toggleHideLow);
  const toggleNext24h = useCalendarFilterStore((s) => s.toggleNext24h);
  const toggleHidePast = useCalendarFilterStore((s) => s.toggleHidePast);

  const countries = useMemo(() => {
    const counts = new Map();
    for (const e of events) {
      const c = e.country || '??';
      counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([code, count]) => ({ code, count }));
  }, [events]);

  const label =
    selected.length === 0 ? 'ALL'
      : selected.length <= 3 ? selected.map(flagFor).join(' ')
        : `${selected.length} CTRY`;

  const Chip = ({ on, onClick, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded border ${on ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-2 py-0.5 text-ui-xs uppercase tracking-widest rounded bg-surface border border-border hover:border-accent text-text-primary"
      >
        {label} ▾
      </button>
      <Chip on={next24h} onClick={toggleNext24h} title="Proximas 24h">24H</Chip>
      <Chip on={hidePast} onClick={toggleHidePast} title="Ocultar passados">FUT</Chip>
      <Chip on={hideLow} onClick={toggleHideLow} title="Ocultar baixo impacto">H·M</Chip>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-30 w-60 max-h-80 overflow-y-auto bg-surface-alt border border-border-hi rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-surface border-b border-border rounded-t text-ui-xs uppercase tracking-widest">
              <span className="text-text-secondary">{selected.length === 0 ? 'ALL' : `${selected.length} SEL`}</span>
              <div className="flex gap-2">
                <button onClick={() => setAll(countries.map((c) => c.code))} className="text-text-secondary hover:text-text-primary">ALL</button>
                <button onClick={clear} className="text-text-secondary hover:text-negative">CLR</button>
              </div>
            </div>
            <ul className="py-0.5">
              {countries.map(({ code, count }) => {
                const on = selected.includes(code);
                return (
                  <li key={code}>
                    <button
                      onClick={() => toggle(code)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-ui-xs hover:bg-surface-hover ${on ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm border ${on ? 'bg-accent border-accent' : 'border-text-secondary'}`} />
                        <span>{flagFor(code)}</span>
                        <span className="tabular-nums tracking-wider">{code}</span>
                      </span>
                      <span className="text-ui-xs text-text-secondary tabular-nums">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `frontend/src/components/EconomicCalendar/EconomicCalendar.jsx`**

```jsx
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useCalendarStore } from '../../store/calendarStore';
import { useCalendarFilterStore } from '../../store/calendarFilterStore';
import { fetchCalendar } from '../../services/apiClient';
import { impactClass, impactLabel, IMPACT_BADGE_CLASS } from '../../utils/formatters';
import { flagFor } from '../../utils/countries';
import { useFlash } from '../../hooks/useFlash';
import CountryFilter from './CountryFilter';

function ActualCell({ value }) {
  const flash = useFlash(typeof value === 'number' ? value : parseFloat(value));
  return (
    <td className={`px-2 py-1.5 text-right tabular-nums text-text-primary ${flash}`}>
      {value ?? '—'}
    </td>
  );
}

function parseEventTs(t) {
  if (!t) return NaN;
  const iso = String(t).replace(' ', 'T');
  const d = new Date(iso);
  return d.getTime();
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(ts, now) {
  const d = new Date(ts);
  const today = new Date(now);
  const diffDays = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86_400_000);
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
  const dm = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (diffDays === 0) return `HOJE · ${weekday} ${dm}`;
  if (diffDays === 1) return `AMANHA · ${weekday} ${dm}`;
  if (diffDays === -1) return `ONTEM · ${weekday} ${dm}`;
  return `${weekday} · ${dm}`;
}

function groupByDay(events, now) {
  const groups = [];
  let current = null;
  for (const e of events) {
    const ts = parseEventTs(e.time);
    const key = Number.isNaN(ts) ? 'unknown' : dayKey(ts);
    if (!current || current.key !== key) {
      current = { key, label: Number.isNaN(ts) ? 'SEM DATA' : dayLabel(ts, now), events: [] };
      groups.push(current);
    }
    current.events.push(e);
  }
  return groups;
}

function Row({ e, now }) {
  const ts = parseEventTs(e.time);
  const isPast = !Number.isNaN(ts) && ts < now;
  const time = String(e.time).slice(11, 16) || String(e.time).slice(0, 10);
  const rowDim = isPast ? 'opacity-40' : '';
  return (
    <tr data-event-id={e.id} className={`border-b border-border/50 row-hover ${rowDim}`}>
      <td className="px-2 py-1.5 tabular-nums text-info">{time}</td>
      <td className="px-2 py-1.5 text-text-secondary"><span className="mr-1">{flagFor(e.country)}</span>{e.country}</td>
      <td className="px-2 py-1.5 text-text-primary">{e.event}</td>
      <ActualCell value={e.actual} />
      <td className="px-2 py-1.5 text-right tabular-nums text-text-secondary">{e.estimate ?? '—'}</td>
      <td className="px-2 py-1.5 text-right tabular-nums text-text-secondary">{e.previous ?? '—'}</td>
      <td className="px-2 py-1.5 text-center">
        <span className={`${IMPACT_BADGE_CLASS} ${impactClass(e.impact)}`}>
          {impactLabel(e.impact)}
        </span>
      </td>
    </tr>
  );
}

export default function EconomicCalendar() {
  const events = useCalendarStore((s) => s.events);
  const setEvents = useCalendarStore((s) => s.setEvents);
  const selectedCountries = useCalendarFilterStore((s) => s.selected);
  const hideLowImpact = useCalendarFilterStore((s) => s.hideLowImpact);
  const next24h = useCalendarFilterStore((s) => s.next24h);
  const hidePast = useCalendarFilterStore((s) => s.hidePast);

  useEffect(() => {
    if (events.length === 0) {
      fetchCalendar().then(setEvents).catch(() => {});
    }
  }, [events.length, setEvents]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    const selectedSet = new Set(selectedCountries);
    const windowEnd = now + 24 * 3600 * 1000;
    const filtered = events.filter((e) => {
      if (selectedSet.size > 0 && !selectedSet.has(e.country)) return false;
      if (hideLowImpact && e.impact === 'low') return false;
      const ts = parseEventTs(e.time);
      if (hidePast && !Number.isNaN(ts) && ts < now) return false;
      if (next24h && !Number.isNaN(ts) && (ts < now - 3600_000 || ts > windowEnd)) return false;
      return true;
    });
    return filtered.sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }, [events, selectedCountries, hideLowImpact, next24h, hidePast, now]);

  const grouped = useMemo(() => groupByDay(sorted, now), [sorted, now]);

  return (
    <div className="bg-surface-alt h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-surface border-b border-border-hi">
        <h2 className="text-ui-xs font-semibold tracking-widest text-text-primary flex-shrink-0">CALENDARIO</h2>
        <CountryFilter events={events} />
        <span className="ml-auto text-ui-xs text-text-secondary flex-shrink-0 tabular-nums">
          {sorted.length}/{events.length}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-ui-sm">
          <thead className="sticky top-0 bg-surface-alt border-b border-border-hi text-text-primary uppercase text-ui-xs tracking-widest">
            <tr>
              <th className="text-left font-medium px-2 py-1.5">T</th>
              <th className="text-left font-medium px-2 py-1.5">PAIS</th>
              <th className="text-left font-medium px-2 py-1.5">EVENTO</th>
              <th className="text-right font-medium px-2 py-1.5">REAL</th>
              <th className="text-right font-medium px-2 py-1.5">EST</th>
              <th className="text-right font-medium px-2 py-1.5">ANT</th>
              <th className="text-center font-medium px-2 py-1.5">IMP</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={7} className="px-2 py-8 text-center text-text-secondary text-ui-sm">Nenhum evento encontrado</td></tr>
            )}
            {grouped.map((group) => (
              <Fragment key={group.key}>
                <tr>
                  <td colSpan={7} className="sticky top-[30px] bg-surface-hover border-y border-border-hi px-3 py-1 text-ui-xs font-semibold tracking-widest text-accent">
                    {group.label} · {group.events.length}
                  </td>
                </tr>
                {group.events.map((e) => <Row key={e.id} e={e} now={now} />)}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/utils/formatters.js frontend/src/components/EconomicCalendar/EconomicCalendar.jsx frontend/src/components/EconomicCalendar/CountryFilter.jsx
git commit -m "feat: premium calendar with rounded badges and polished filters"
```

---

### Task 7: NewsFeed + NewsFilter

**Files:**
- Modify: `frontend/src/components/NewsFeed/NewsFeed.jsx`
- Modify: `frontend/src/components/NewsFeed/NewsFilter.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/NewsFeed/NewsFilter.jsx`**

```jsx
import { useMemo, useState } from 'react';
import { useNewsFilterStore } from '../../store/newsFilterStore';

const LANG_LABEL = { pt: 'PT', en: 'EN' };

export default function NewsFilter({ items }) {
  const [open, setOpen] = useState(false);
  const sources = useNewsFilterStore((s) => s.sources);
  const languages = useNewsFilterStore((s) => s.languages);
  const hideLow = useNewsFilterStore((s) => s.hideLowImpact);
  const toggleSource = useNewsFilterStore((s) => s.toggleSource);
  const toggleLanguage = useNewsFilterStore((s) => s.toggleLanguage);
  const clearSources = useNewsFilterStore((s) => s.clearSources);
  const setAllSources = useNewsFilterStore((s) => s.setAllSources);
  const toggleHideLow = useNewsFilterStore((s) => s.toggleHideLow);

  const sourceList = useMemo(() => {
    const counts = new Map();
    for (const n of items) {
      const s = n.source || '??';
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {['pt', 'en'].map((lang) => {
        const on = languages.includes(lang);
        return (
          <button
            key={lang}
            onClick={() => toggleLanguage(lang)}
            className={`px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded border ${on ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
          >
            {LANG_LABEL[lang]}
          </button>
        );
      })}

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-1.5 py-0.5 text-ui-xs uppercase tracking-widest rounded bg-surface border border-border hover:border-accent text-text-primary"
        >
          {sources.length === 0 ? 'ALL SRC' : `${sources.length} SRC`} ▾
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full mt-1 right-0 z-30 w-60 max-h-80 overflow-y-auto bg-surface-alt border border-border-hi rounded shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="sticky top-0 flex items-center justify-between gap-2 px-3 py-1.5 bg-surface border-b border-border rounded-t text-ui-xs uppercase tracking-widest">
                <span className="text-text-secondary">{sources.length === 0 ? 'ALL' : `${sources.length} SEL`}</span>
                <div className="flex gap-2">
                  <button onClick={() => setAllSources(sourceList.map((s) => s.name))} className="text-text-secondary hover:text-text-primary">ALL</button>
                  <button onClick={clearSources} className="text-text-secondary hover:text-negative">CLR</button>
                </div>
              </div>
              <ul className="py-0.5">
                {sourceList.map(({ name, count }) => {
                  const on = sources.includes(name);
                  return (
                    <li key={name}>
                      <button
                        onClick={() => toggleSource(name)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-ui-xs hover:bg-surface-hover ${on ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-sm border ${on ? 'bg-accent border-accent' : 'border-text-secondary'}`} />
                          <span className="truncate max-w-[140px]">{name}</span>
                        </span>
                        <span className="text-ui-xs text-text-secondary tabular-nums">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      <button
        onClick={toggleHideLow}
        className={`px-1.5 py-0.5 text-ui-xs tracking-widest rounded border ${hideLow ? 'bg-accent/20 border-accent text-accent-light' : 'bg-surface border-border text-text-secondary hover:border-accent'}`}
      >
        HIGH
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `frontend/src/components/NewsFeed/NewsFeed.jsx`**

```jsx
import { useEffect, useMemo, useState } from 'react';
import { useNewsStore } from '../../store/newsStore';
import { useNewsFilterStore } from '../../store/newsFilterStore';
import { fetchNews } from '../../services/apiClient';
import { fmtDateTime, impactClass, impactLabel, IMPACT_BADGE_CLASS } from '../../utils/formatters';
import NewsFilter from './NewsFilter';

export default function NewsFeed() {
  const items = useNewsStore((s) => s.items);
  const setInitial = useNewsStore((s) => s.setInitial);
  const languages = useNewsFilterStore((s) => s.languages);
  const sources = useNewsFilterStore((s) => s.sources);
  const hideLow = useNewsFilterStore((s) => s.hideLowImpact);

  useEffect(() => {
    if (items.length === 0) {
      fetchNews('general').then(setInitial).catch(() => {});
    }
  }, [items.length, setInitial]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    const langSet = new Set(languages);
    const srcSet = new Set(sources);
    return items
      .filter((n) => {
        if (langSet.size && !langSet.has((n.language || 'en').toLowerCase())) return false;
        if (srcSet.size && !srcSet.has(n.source)) return false;
        if (hideLow && n.impact !== 'high') return false;
        return true;
      })
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 100);
  }, [items, languages, sources, hideLow]);

  return (
    <div className="bg-surface-alt h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-surface border-b border-border-hi">
        <h2 className="text-ui-xs font-semibold tracking-widest text-text-primary flex-shrink-0">NEWS</h2>
        <NewsFilter items={items} />
        <span className="ml-auto text-ui-xs text-text-secondary flex-shrink-0 tabular-nums">{sorted.length}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {sorted.length === 0 && (
          <div className="px-4 py-8 text-center text-ui-sm text-text-secondary">Nenhuma noticia encontrada</div>
        )}
        {sorted.map((n) => {
          const age = now - (n.datetime || 0);
          const isFresh = age >= 0 && age < 5 * 60_000;
          const isStale = age > 60 * 60_000;
          const highlight = isFresh ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-transparent';
          const dim = isStale ? 'opacity-40' : '';
          return (
            <article key={n.id} className={`pl-3 pr-4 py-2 border-b border-border/40 row-hover ${highlight} ${dim} animate-fade-in`}>
              <div className="flex items-center gap-2 text-ui-xs text-text-secondary tracking-wider">
                <span className="tabular-nums text-info">{fmtDateTime(n.datetime)}</span>
                {isFresh && <span className="text-accent font-semibold">NEW</span>}
                <span className="text-text-secondary uppercase truncate max-w-[120px]">{n.source}</span>
                {n.language === 'pt' && <span className="text-text-secondary">BR</span>}
                <span className="ml-auto">
                  <span className={`${IMPACT_BADGE_CLASS} ${impactClass(n.impact)}`}>
                    {impactLabel(n.impact)}
                  </span>
                </span>
              </div>
              {n.url ? (
                <a href={n.url} target="_blank" rel="noreferrer" className="block text-ui-base leading-snug text-text-primary hover:text-accent-light mt-0.5">
                  {n.headline}
                </a>
              ) : (
                <div className="text-ui-base leading-snug text-text-primary mt-0.5">{n.headline}</div>
              )}
              {n.tickers?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {n.tickers.slice(0, 8).map((t) => (
                    <span key={t} className="text-ui-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">{t}</span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NewsFeed/NewsFeed.jsx frontend/src/components/NewsFeed/NewsFilter.jsx
git commit -m "feat: premium news feed with indigo accents and polished filters"
```

---

### Task 8: NewsTicker

**Files:**
- Modify: `frontend/src/components/NewsTicker/NewsTicker.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/NewsTicker/NewsTicker.jsx`**

```jsx
import { useMemo } from 'react';
import { useNewsStore } from '../../store/newsStore';
import { fmtHHMM } from '../../utils/formatters';

export default function NewsTicker() {
  const items = useNewsStore((s) => s.items);

  const headlines = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, 30);
  }, [items]);

  if (!headlines.length) {
    return (
      <div className="bg-surface border-t border-border-hi px-4 py-1.5 text-ui-xs text-text-secondary tracking-widest">
        NEWS TICKER · AGUARDANDO FEED...
      </div>
    );
  }

  const duration = `${Math.max(90, headlines.length * 6)}s`;

  return (
    <div className="bg-surface border-t border-border-hi overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-shrink-0 flex items-center px-3 py-1 bg-accent text-white text-ui-xs font-semibold tracking-widest">
          NEWS
        </div>
        <div className="flex-1 overflow-hidden marquee-wrapper relative">
          <div className="marquee-track" style={{ '--marquee-duration': duration }}>
            {[...headlines, ...headlines].map((n, idx) => (
              <a
                key={`${n.id}-${idx}`}
                href={n.url || '#'}
                target={n.url ? '_blank' : undefined}
                rel="noreferrer"
                className="flex-shrink-0 flex items-center gap-2 px-4 py-1 text-ui-xs border-r border-border hover:bg-surface-hover"
              >
                <span className="tabular-nums text-info">{fmtHHMM(n.datetime)}</span>
                <span className="uppercase text-text-secondary max-w-[100px] truncate">{n.source}</span>
                <span className={`uppercase text-[10px] ${n.impact === 'high' ? 'text-negative font-bold' : 'text-text-secondary'}`}>
                  {n.impact === 'high' ? '!' : '·'}
                </span>
                <span className="text-text-primary truncate max-w-[600px]">{n.headline}</span>
              </a>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/NewsTicker/NewsTicker.jsx
git commit -m "feat: premium news ticker with indigo badge"
```

---

### Task 9: AlertPopup

**Files:**
- Modify: `frontend/src/components/AlertSystem/AlertPopup.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/AlertSystem/AlertPopup.jsx`**

```jsx
import { useEffect } from 'react';
import { useAlert } from '../../hooks/useAlert';
import { useAlertStore } from '../../store/alertStore';
import { fmtDateTime } from '../../utils/formatters';

export default function AlertPopup() {
  const { current, count } = useAlert();
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const clearAll = useAlertStore((s) => s.clearAll);
  const soundEnabled = useAlertStore((s) => s.soundEnabled);
  const enableSound = useAlertStore((s) => s.enableSound);

  useEffect(() => {
    if (!current) return;
    const handler = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        acknowledge(current.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, acknowledge]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm font-sans">
      <div className="relative w-full max-w-3xl mx-4 border-2 border-negative bg-surface-alt rounded animate-border-pulse">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-negative bg-negative/10 rounded-t">
          <div className="flex items-center gap-3">
            <span className="text-negative text-2xl font-black animate-pulse">!</span>
            <div className="leading-tight">
              <div className="text-ui-xs uppercase tracking-[0.3em] text-negative font-bold">HIGH IMPACT ALERT</div>
              <div className="text-ui-xs text-text-secondary tabular-nums tracking-wider">{fmtDateTime(current.timestamp)}</div>
            </div>
          </div>
          {count > 1 && (
            <div className="text-ui-xs text-warning tracking-widest">+{count - 1} NA FILA</div>
          )}
        </div>

        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-[15px] font-bold leading-snug mb-2 text-text-primary">{current.title}</h3>
          {current.message && (
            <p className="text-ui-base text-text-secondary leading-relaxed">{current.message}</p>
          )}
          {current.tickers?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.tickers.map((t) => (
                <span key={t} className="text-ui-xs px-2 py-0.5 rounded bg-negative/20 text-negative border border-negative font-semibold tracking-wider">{t}</span>
              ))}
            </div>
          ) : null}
          {current.source && (
            <div className="mt-3 text-ui-xs uppercase text-text-secondary tracking-widest">FONTE · {current.source}</div>
          )}
        </div>

        <div className="flex items-center gap-2 px-5 py-3 bg-surface rounded-b">
          {!soundEnabled && (
            <button
              onClick={enableSound}
              className="px-3 py-1.5 text-ui-xs rounded bg-warning/20 text-warning border border-warning hover:bg-warning/30 tracking-widest"
            >
              ATIVAR SOM
            </button>
          )}
          {current.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-ui-xs rounded text-text-primary border border-border hover:border-accent tracking-widest"
            >
              FONTE ↗
            </a>
          )}
          <div className="ml-auto flex gap-2">
            {count > 1 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-ui-xs rounded text-text-secondary border border-border hover:border-negative hover:text-negative tracking-widest"
              >
                LIMPAR TUDO
              </button>
            )}
            <button
              onClick={() => acknowledge(current.id)}
              className="px-4 py-1.5 text-ui-xs font-bold rounded bg-negative text-white hover:bg-negative/80 tracking-widest"
            >
              ACK · ENTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/AlertSystem/AlertPopup.jsx
git commit -m "feat: premium alert popup with rounded corners and refined typography"
```

---

### Task 10: CommandPalette

**Files:**
- Modify: `frontend/src/components/CommandPalette/CommandPalette.jsx`

- [ ] **Step 1: Rewrite `frontend/src/components/CommandPalette/CommandPalette.jsx`**

```jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBrQuotesStore } from '../../store/brQuotesStore';
import { useNewsStore } from '../../store/newsStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useWatchlistStore } from '../../store/watchlistStore';
import { fmtHHMM } from '../../utils/formatters';
import { flagFor } from '../../utils/countries';

const MAX_PER_GROUP = 6;

export default function CommandPalette({ open, onClose }) {
  const quotes = useBrQuotesStore((s) => s.quotes);
  const news = useNewsStore((s) => s.items);
  const events = useCalendarStore((s) => s.events);
  const watchlist = useWatchlistStore((s) => s.symbols);
  const addSymbol = useWatchlistStore((s) => s.add);
  const removeSymbol = useWatchlistStore((s) => s.remove);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { group: 'WATCHLIST', items: watchlist.slice(0, 6).map((s) => ({ type: 'ticker', symbol: s, inWatchlist: true })) },
        { group: 'TRENDING', items: quotes.slice(0, 6).map((s) => ({ type: 'ticker', symbol: s.symbol, name: s.name, price: s.price, changePct: s.changePct, inWatchlist: watchlist.includes(s.symbol) })) },
      ].filter((g) => g.items.length > 0);
    }

    const tickers = quotes
      .filter((s) => s.symbol.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q))
      .slice(0, MAX_PER_GROUP)
      .map((s) => ({ type: 'ticker', symbol: s.symbol, name: s.name, price: s.price, changePct: s.changePct, inWatchlist: watchlist.includes(s.symbol) }));

    const newsItems = news
      .filter((n) => (n.headline || '').toLowerCase().includes(q) || (n.source || '').toLowerCase().includes(q))
      .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
      .slice(0, MAX_PER_GROUP)
      .map((n) => ({ type: 'news', id: n.id, headline: n.headline, source: n.source, url: n.url, datetime: n.datetime, impact: n.impact, language: n.language }));

    const eventItems = events
      .filter((e) => (e.event || '').toLowerCase().includes(q) || (e.country || '').toLowerCase().includes(q))
      .slice(0, MAX_PER_GROUP)
      .map((e) => ({ type: 'event', id: e.id, event: e.event, country: e.country, time: e.time, impact: e.impact }));

    return [
      { group: 'TICKERS', items: tickers },
      { group: 'NEWS', items: newsItems },
      { group: 'EVENTS', items: eventItems },
    ].filter((g) => g.items.length > 0);
  }, [query, quotes, news, events, watchlist]);

  const flatList = useMemo(() => results.flatMap((g) => g.items), [results]);

  useEffect(() => { setActive(0); }, [query]);

  const activate = (item) => {
    if (!item) return;
    if (item.type === 'ticker') {
      if (item.inWatchlist) removeSymbol(item.symbol);
      else addSymbol(item.symbol);
    } else if (item.type === 'news' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'event') {
      const el = document.querySelector(`[data-event-id="${item.id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flatList.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); activate(flatList[active]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, flatList, active, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[8500] flex items-start justify-center pt-24 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface-alt border-2 border-accent rounded shadow-[0_0_40px_rgba(99,102,241,0.2)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border-b border-border rounded-t">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ticker, manchete, evento, pais..."
            className="flex-1 bg-transparent border-0 outline-none text-text-primary placeholder-text-secondary tabular-nums tracking-wider text-ui-sm"
          />
          <span className="text-[10px] text-text-secondary tracking-widest border border-border rounded px-1.5 py-0.5">ESC</span>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <div className="px-4 py-8 text-ui-sm text-text-secondary text-center tracking-wider">
              Nenhum resultado
            </div>
          )}
          {results.map((group) => (
            <div key={group.group}>
              <div className="sticky top-0 bg-surface/95 border-b border-border px-4 py-1 text-ui-xs text-text-secondary tracking-widest">
                {group.group}
              </div>
              {group.items.map((item) => {
                flatIdx += 1;
                const idx = flatIdx;
                const isActive = idx === active;
                return (
                  <button
                    key={`${item.type}-${item.id || item.symbol}-${idx}`}
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => activate(item)}
                    className={`w-full text-left px-4 py-2 border-b border-border/40 flex items-center gap-2 ${isActive ? 'bg-accent/15 text-text-primary' : 'text-text-secondary hover:bg-surface-hover'}`}
                  >
                    {renderItem(item)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-surface border-t border-border rounded-b text-[10px] text-text-secondary tracking-widest">
          <div className="flex gap-3">
            <span>↑↓ NAV</span>
            <span>↵ ATIVAR</span>
            <span>ESC FECHAR</span>
          </div>
          <div className="flex gap-3">
            <span>TICKER · WATCHLIST</span>
            <span>NEWS · ABRIR ↗</span>
            <span>EVENTO · IR</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderItem(item) {
  if (item.type === 'ticker') {
    const up = item.changePct != null && item.changePct > 0;
    const down = item.changePct != null && item.changePct < 0;
    const col = up ? 'text-positive' : down ? 'text-negative' : 'text-text-secondary';
    return (
      <>
        <span className="w-5 text-[10px] text-text-secondary">{item.inWatchlist ? '★' : '+'}</span>
        <span className="w-16 font-semibold tracking-wider text-text-primary">{item.symbol}</span>
        <span className="flex-1 truncate text-text-secondary">{item.name || ''}</span>
        {item.price != null && <span className={`text-ui-xs tabular-nums ${col}`}>R$ {item.price?.toFixed(2)}</span>}
        {item.changePct != null && (
          <span className={`text-ui-xs tabular-nums font-semibold w-16 text-right ${col}`}>
            {up ? '▲' : down ? '▼' : ''} {Math.abs(item.changePct).toFixed(2)}%
          </span>
        )}
      </>
    );
  }
  if (item.type === 'news') {
    const impact = item.impact === 'high' ? 'text-negative font-bold' : 'text-text-secondary';
    return (
      <>
        <span className={`w-5 text-[10px] text-center ${impact}`}>{item.impact === 'high' ? '!' : '·'}</span>
        <span className="w-14 text-ui-xs tabular-nums text-info">{fmtHHMM(item.datetime)}</span>
        <span className="w-20 truncate text-ui-xs uppercase text-text-secondary">{item.source}</span>
        {item.language === 'pt' && <span className="text-ui-xs text-text-secondary">BR</span>}
        <span className="flex-1 truncate text-text-primary">{item.headline}</span>
      </>
    );
  }
  if (item.type === 'event') {
    const impact = item.impact === 'high' ? 'bg-negative text-white' : item.impact === 'medium' ? 'bg-warning text-black' : 'bg-text-secondary/30 text-text-primary';
    return (
      <>
        <span className={`w-5 h-5 inline-flex items-center justify-center text-[10px] font-bold rounded ${impact}`}>
          {item.impact === 'high' ? 'H' : item.impact === 'medium' ? 'M' : 'L'}
        </span>
        <span className="text-ui-xs tabular-nums text-info">{String(item.time).slice(11, 16) || String(item.time).slice(5, 10)}</span>
        <span className="w-10 text-text-secondary">{flagFor(item.country)} {item.country}</span>
        <span className="flex-1 truncate text-text-primary">{item.event}</span>
      </>
    );
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CommandPalette/CommandPalette.jsx
git commit -m "feat: premium command palette with indigo glow and refined items"
```

---

### Task 11: Remove Legacy Tokens

**Files:**
- Modify: `frontend/tailwind.config.js`

Final cleanup: remove all `bbg-*` legacy aliases now that all components have been migrated.

- [ ] **Step 1: Remove legacy color aliases from `frontend/tailwind.config.js`**

Edit the colors section to remove the entire "Legacy aliases" block:

```js
// Remove these lines from the colors object:
// ═══ Legacy aliases (removed after migration) ═══
'bbg-bg':        '#0a0a0f',
'bbg-panel':     '#12121a',
'bbg-panel-alt': '#1a1a25',
'bbg-border':    '#1e1e2e',
'bbg-border-hi': '#2a2a3a',
'bbg-amber':     '#e1e1e6',
'bbg-amber-dim': '#6b6b80',
'bbg-white':     '#e1e1e6',
'bbg-muted':     '#6b6b80',
'bbg-cyan':      '#38bdf8',
'bbg-green':     '#22c55e',
'bbg-green-dim': '#15803d',
'bbg-red':       '#ef4444',
'bbg-red-dim':   '#991b1b',
'bbg-yellow':    '#f59e0b',
```

The final `tailwind.config.js` colors section should only contain the semantic tokens (`surface`, `surface-alt`, `surface-hover`, `border`, `border-hi`, `text-primary`, `text-secondary`, `accent`, `accent-light`, `positive`, `positive-dim`, `negative`, `negative-dim`, `warning`, `info`).

- [ ] **Step 2: Verify no remaining `bbg-` references in source**

Run: `grep -r "bbg-" frontend/src/`

Expected: No results (0 matches). If any remain, update those files.

- [ ] **Step 3: Verify the app renders correctly**

Open `http://localhost:5173` and check:
- Header: indigo dot logo, market clock with B3/NYSE/Crypto, search icon
- Watchlist: rounded cards, indigo hover border, skeleton for missing data
- IBOV marquee: indigo accent, skeleton loading
- Calendar: rounded impact badges, indigo day headers, polished filters
- News: indigo left border on fresh items, accent "NEW" badge, rounded ticker pills
- News Ticker: indigo "NEWS" badge, clean typography
- Command Palette (Ctrl+K): indigo border and glow, clean items
- Alert Popup: red border, rounded corners, "!" icon

- [ ] **Step 4: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "chore: remove legacy bbg-* color tokens after migration"
```
