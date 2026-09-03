import axios from 'axios';
import { apiBaseUrl } from '../../config/appConfig';

const adminAxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

adminAxiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Server is down, please contact administrator';
      return Promise.reject(error);
    }

    const isAdminAuthRoute =
      error.config?.url?.includes('/admin/auth/login');

    const isTokenError =
      error.response.status === 401 &&
      error.config &&
      !isAdminAuthRoute;

    if (isTokenError) {
      localStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminToken');
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    error.message = message;
    return Promise.reject(error);
  }
);

export default adminAxiosInstance;
