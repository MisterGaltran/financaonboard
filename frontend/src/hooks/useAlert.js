import { useEffect, useRef } from 'react';
import { useAlertStore } from '../store/alertStore';

function playBeep(ctx, { freq = 880, duration = 0.18, gain = 0.25 } = {}) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function useAlert() {
  const queue = useAlertStore((s) => s.queue);
  const soundEnabled = useAlertStore((s) => s.soundEnabled);
  const audioCtxRef = useRef(null);
  const lastPlayedIdRef = useRef(null);

  useEffect(() => {
    if (!soundEnabled) return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (!queue.length) return;
    const newest = queue[queue.length - 1];
    if (lastPlayedIdRef.current === newest.id) return;
    lastPlayedIdRef.current = newest.id;
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    try {
      playBeep(ctx, { freq: 880, duration: 0.2 });
      setTimeout(() => playBeep(ctx, { freq: 1200, duration: 0.2 }), 220);
      setTimeout(() => playBeep(ctx, { freq: 880, duration: 0.25 }), 460);
    } catch {
      /* ignore */
    }
  }, [queue, soundEnabled]);

  return { current: queue[0] || null, count: queue.length };
}
