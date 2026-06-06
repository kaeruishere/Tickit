import axios from 'axios';

const CSRF_STORAGE_KEY = 'csrfToken';

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] || null;
};

const getStoredCsrfToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CSRF_STORAGE_KEY);
};

export const storeCsrfToken = (csrfToken) => {
  if (typeof window === 'undefined' || !csrfToken) return;
  window.localStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
};

export const clearCsrfToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CSRF_STORAGE_KEY);
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookie('csrfToken') || getStoredCsrfToken();
    if (csrfToken) config.headers['X-CSRF-Token'] = decodeURIComponent(csrfToken);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearCsrfToken();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
