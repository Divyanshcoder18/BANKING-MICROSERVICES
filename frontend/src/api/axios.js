import axios from 'axios';

// We create a custom instance of Axios
const API = axios.create({
  // Use the local or production API URL from environment variables
  baseURL: import.meta.env.VITE_API_URL || 'https://banking-api-t8iu.onrender.com/api',
});

// The INTERCEPTOR
// This code runs AUTOMATICALLY before every request we send to the backend
API.interceptors.request.use((config) => {
  // 1. We look inside the browser's "localStorage" for a token
  const token = localStorage.getItem('token');

  // 2. If we find a token, we attach it to the "Authorization" header
  if (token) {
    config.headers.Authorization = `${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
