import EconomicCalendar from '../EconomicCalendar/EconomicCalendar';
import NewsFeed from '../NewsFeed/NewsFeed';
import BrazilQuotes from '../BrazilQuotes/BrazilQuotes';
import NewsTicker from '../NewsTicker/NewsTicker';
import Watchlist from '../Watchlist/Watchlist';
import StatusBar from './StatusBar';

export default function Dashboard({ onOpenPalette }) {
  return (
    <div className="h-screen flex flex-col bg-bbg-bg text-bbg-amber font-mono text-bbg-sm">
      <header className="flex items-center justify-between px-3 py-1.5 bg-bbg-panel border-b border-bbg-border-hi">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-bbg-amber" />
          <span className="text-bbg-white text-bbg-sm font-bold tracking-[0.2em]">FINANCA ONBOARD</span>
          <span className="text-bbg-muted text-bbg-xs tracking-wider">// TRADING TERMINAL</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-2 px-2 py-0.5 bg-black border border-bbg-border hover:border-bbg-amber text-bbg-muted hover:text-bbg-amber text-bbg-xs tracking-widest"
          >
            <span>⌕</span>
            <span>SEARCH</span>
            <span className="text-[9px] text-bbg-muted border border-bbg-border px-1 ml-1">CTRL+K</span>
          </button>
          <div className="text-bbg-xs text-bbg-muted tabular-nums tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </header>

      <StatusBar />
      <Watchlist />
      <BrazilQuotes />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-px bg-bbg-border overflow-hidden">
        <EconomicCalendar />
        <NewsFeed />
      </main>

      <NewsTicker />
    </div>
  );
}
