import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import AlertPopup from './components/AlertSystem/AlertPopup';
import CommandPalette from './components/CommandPalette/CommandPalette';
import { useSocket } from './hooks/useSocket';

export default function App() {
  useSocket();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Dashboard onOpenPalette={() => setPaletteOpen(true)} />
      <AlertPopup />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
