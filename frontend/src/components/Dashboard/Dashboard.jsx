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
              FINANÇAS ONBOARD
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
            {new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </header>

      <Watchlist />
      <BrazilQuotes />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-px bg-border overflow-hidden">
        <EconomicCalendar />
        <NewsFeed />
      </main>

      <NewsTicker />
    </div>
  );
}
