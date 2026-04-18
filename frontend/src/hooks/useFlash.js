import { useEffect, useRef, useState } from 'react';

export function useFlash(value, { durationMs = 320 } = {}) {
  const prevRef = useRef(value);
  const [cls, setCls] = useState('');

  useEffect(() => {
    const prev = prevRef.current;
    if (prev !== undefined && prev !== null && value !== prev && typeof value === 'number' && typeof prev === 'number') {
      setCls(value > prev ? 'animate-flash-up' : 'animate-flash-down');
      const t = setTimeout(() => setCls(''), durationMs);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
    prevRef.current = value;
  }, [value, durationMs]);

  return cls;
}
