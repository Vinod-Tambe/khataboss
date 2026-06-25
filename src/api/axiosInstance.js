import axios from 'axios';
import { LogoutAlert } from '../components/common/LogoutAlert';


const axiosInstance = axios.create({
  baseURL: 'https://khataboss.in/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add a request interceptor to add the auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.message = 'Server is down, please contact administrator';
    }

    const isTokenError = error.response && (
      (error.response.status === 401 &&
        error.config &&
        error.config.url &&
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/verify-otp')) ||
      (error.response.data && error.response.data.error === "Access denied. No token provided.")
    );

    if (isTokenError) {
      // Extract API message if available
      const apiMessage = error.response?.data?.message || error.response?.data?.error;

      // Handle unauthorized (session expired)
      await LogoutAlert(apiMessage);

      localStorage.removeItem('user');
      sessionStorage.removeItem('token');

      // Clear legacy token if exists
      localStorage.removeItem('token');
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
