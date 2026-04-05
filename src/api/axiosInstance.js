import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:9000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (session expired)
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // window.location.href = '/'; // Optional: Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
