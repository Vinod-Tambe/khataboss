import axios from 'axios';
import { LogoutAlert } from '../components/common/LogoutAlert';


const axiosInstance = axios.create({
  baseURL: 'https://carlie-atavic-tonita.ngrok-free.dev/api/v1',
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
    const isTokenError = error.response && (
      error.response.status === 401 ||
      (error.response.data && error.response.data.error === "Access denied. No token provided.")
    );

    if (isTokenError) {
      // Handle unauthorized (session expired)
      await LogoutAlert();
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
