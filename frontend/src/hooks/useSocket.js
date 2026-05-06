import { useEffect } from 'react';
import { socket } from '../services/socketClient';
import { useNewsStore } from '../store/newsStore';
import { useCalendarStore } from '../store/calendarStore';
import { useAlertStore } from '../store/alertStore';
import { useConnectionStore } from '../store/connectionStore';
import { useBrQuotesStore } from '../store/brQuotesStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useIndicesStore } from '../store/indicesStore';

export function useSocket() {
  const addNews = useNewsStore((s) => s.addItem);
  const setCalendar = useCalendarStore((s) => s.setEvents);
  const enqueueAlert = useAlertStore((s) => s.enqueue);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const incAttempts = useConnectionStore((s) => s.incAttempts);
  const resetAttempts = useConnectionStore((s) => s.resetAttempts);
  const setProviders = useConnectionStore((s) => s.setProviders);
  const setBrQuotes = useBrQuotesStore((s) => s.setQuotes);
  const setCurrencyQuotes = useCurrencyStore((s) => s.setQuotes);
  const setIndices = useIndicesStore((s) => s.setIndices);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => { setStatus('connected'); resetAttempts(); };
    const onDisconnect = (reason) => setStatus(`disconnected: ${reason}`);
    const onReconnectAttempt = () => { setStatus('reconnecting'); incAttempts(); };
    const onReconnectFailed = () => setStatus('failed');
    const onConnectError = () => setStatus('error');

    const onNewsNew = (item) => addNews(item);
    const onCalendarUpdate = (events) => setCalendar(events);
    const onAlertCritical = (alert) => enqueueAlert(alert);
    const onProviderStatus = (s) => setProviders(s);
    const onQuotesBr = (quotes) => setBrQuotes(quotes);
    const onCurrencyUpdate = (quotes) => setCurrencyQuotes(quotes);
    const onIndicesUpdate = (data) => setIndices(data);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.io.on('reconnect_failed', onReconnectFailed);
    socket.on('connect_error', onConnectError);

    socket.on('news:new', onNewsNew);
    socket.on('calendar:update', onCalendarUpdate);
    socket.on('alert:critical', onAlertCritical);
    socket.on('provider:status', onProviderStatus);
    socket.on('quotes:br:update', onQuotesBr);
    socket.on('quotes:currency:update', onCurrencyUpdate);
    socket.on('indices:update', onIndicesUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.io.off('reconnect_failed', onReconnectFailed);
      socket.off('connect_error', onConnectError);
      socket.off('news:new', onNewsNew);
      socket.off('calendar:update', onCalendarUpdate);
      socket.off('alert:critical', onAlertCritical);
      socket.off('provider:status', onProviderStatus);
      socket.off('quotes:br:update', onQuotesBr);
      socket.off('quotes:currency:update', onCurrencyUpdate);
      socket.off('indices:update', onIndicesUpdate);
    };
  }, [addNews, setCalendar, enqueueAlert, setStatus, incAttempts, resetAttempts, setProviders, setBrQuotes, setCurrencyQuotes, setIndices]);
}
