import adminAxiosInstance from './adminAxiosInstance';

export const adminLogin = async (login_id, password) => {
  const response = await adminAxiosInstance.post('/admin/auth/login', {
    login_id,
    password,
  });
  const data = response.data?.data || response.data;
  return {
    token: data.token,
    user: data.admin || data.user,
    message: response.data?.message,
  };
};

export const getAdminProfile = async () => {
  const response = await adminAxiosInstance.get('/admin/auth/me');
  return {
    data: response.data?.data || response.data,
    message: response.data?.message,
  };
};

export const getAdminDashboard = async () => {
  const response = await adminAxiosInstance.get('/admin/dashboard');
  return {
    data: response.data?.data || response.data,
    message: response.data?.message,
  };
};
