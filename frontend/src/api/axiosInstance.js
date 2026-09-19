 import axios from 'axios';

const api = axios.create({
  baseURL: 'https://soko-la-mkulima-production.up.railway.app/api',
});

// Ongeza token kwa kila request endapo ipo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
