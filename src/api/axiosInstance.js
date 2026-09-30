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
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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

    const isPublicUrl =
      error.config &&
      error.config.url &&
      (error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/verify-otp') ||
        error.config.url.includes('/auth/logout') ||
        error.config.url.includes('/announcement/public'));

    const shouldSkipAlert = Boolean(error.config?.skipAuthAlert || isPublicUrl);
    const hasActiveToken = Boolean(sessionStorage.getItem('token'));

    const isTokenError =
      error.response &&
      !shouldSkipAlert &&
      ((error.response.status === 401 && error.config?.url && !isPublicUrl) ||
        (responseData &&
          (responseData.error === "Access denied. No token provided." ||
            responseData.message === "Access denied. No token provided.")));

    if (isTokenError) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');

      // Only show the 'Session Expired' alert if user actually had an active session
      if (hasActiveToken) {
        const apiMessage = responseData?.message || responseData?.error;
        const alertTitle =
          responseData?.code === 'SESSION_SUPERSEDED' ? 'Signed in elsewhere' : 'Session Expired';

        await LogoutAlert(apiMessage, alertTitle);

        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
