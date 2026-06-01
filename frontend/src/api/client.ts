import axios from 'axios';

// Get base URL from environment variables, fallback to localhost gateway
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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
      // Unauthorized: Clear tokens and potentially redirect to login
      localStorage.removeItem('larasana_auth_token');
      // window.location.href = '/login'; // Optional: auto redirect on session expiry
    } else if (status === 403) {
      console.error('Forbidden: You do not have permissions for this resource.');
    } else if (status >= 500) {
      console.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default client;
