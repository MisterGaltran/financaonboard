import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000
});

export async function fetchCalendar() {
  const { data } = await apiClient.get('/api/calendar');
  return data.events || [];
}

export async function fetchNews(category = 'general') {
  const { data } = await apiClient.get('/api/news', { params: { category } });
  return data.news || [];
}

export async function fetchBrQuotes(tickers) {
  const params = tickers ? { tickers: tickers.join(',') } : {};
  const { data } = await apiClient.get('/api/quotes/br', { params });
  return data.quotes || [];
}

export async function fetchIndices() {
  const { data } = await apiClient.get('/api/indices');
  return data;
}

export async function fetchCurrencyQuotes() {
  const { data } = await apiClient.get('/api/quotes/currency');
  return data.quotes || [];
}

export async function fireDebugAlert(payload = {}) {
  const { data } = await apiClient.post('/api/debug/alert', payload);
  return data;
}

export async function fireDebugNews(payload = {}) {
  const { data } = await apiClient.post('/api/debug/news', payload);
  return data;
}
