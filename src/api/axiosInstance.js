import axios from 'axios';
import { LogoutAlert } from '../components/common/LogoutAlert';
import { apiBaseUrl } from '../config/appConfig';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
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

    const responseData = error.response?.data;
    const isSubscriptionExpired =
      error.response?.status === 403 &&
      (responseData?.code === 'SUBSCRIPTION_EXPIRED' ||
        String(responseData?.message || responseData?.error || '').toLowerCase().includes('subscription has expired'));

    if (isSubscriptionExpired) {
      const apiMessage =
        responseData?.message ||
        responseData?.error ||
        'Your KhataBoss subscription has expired. Please contact your administrator to renew.';

      await LogoutAlert(apiMessage);

      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    const isTokenError = error.response && (
      (error.response.status === 401 &&
        error.config &&
        error.config.url &&
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/verify-otp')) ||
      (responseData && responseData.error === "Access denied. No token provided.")
    );

    if (isTokenError) {
      const apiMessage = responseData?.message || responseData?.error;

      await LogoutAlert(apiMessage);

      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
