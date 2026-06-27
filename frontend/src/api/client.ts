import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3000/api/v1');

const CLIENT_SECRET = import.meta.env.VITE_FRONTEND_CLIENT_SECRET || '';
if (!CLIENT_SECRET) {
  console.warn('[Larasana] VITE_FRONTEND_CLIENT_SECRET is not set. API requests may fail due to missing x-larasana-client-key header.');
}

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-larasana-client-key': CLIENT_SECRET,
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to automatically attach authorization tokens
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('larasana_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
  console.error('[Larasana] Unauthorized request (401). Check that VITE_FRONTEND_CLIENT_SECRET is correctly set and the auth token is valid.');
  localStorage.removeItem('larasana_auth_token');
      // Unauthorized: Clear tokens and potentially redirect to login
      localStorage.removeItem('larasana_auth_token');
    } else if (status === 403) {
      console.error('Forbidden: You do not have permissions for this resource.');
    } else if (status >= 500) {
      console.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default client;
