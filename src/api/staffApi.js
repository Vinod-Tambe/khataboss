import axiosInstance from './axiosInstance';

export const createStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post('/staff', staffData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getStaffList = async (search = '') => {
  try {
    const response = await axiosInstance.get('/staff', {
      params: search ? { search } : {},
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getStaff = async (uuid) => {
  try {
    const response = await axiosInstance.get(`/staff/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const updateStaff = async (uuid, staffData) => {
  try {
    const response = await axiosInstance.put(`/staff/${uuid}`, staffData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const updateStaffPassword = async (uuid, payload) => {
  try {
    const response = await axiosInstance.patch(`/staff/${uuid}/password`, payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const updateStaffPermissions = async (uuid, permissions) => {
  try {
    const response = await axiosInstance.patch(`/staff/${uuid}/permissions`, { permissions });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const deleteStaff = async (uuid) => {
  try {
    const response = await axiosInstance.delete(`/staff/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getPermissionCatalog = async () => {
  try {
    const response = await axiosInstance.get('/staff/permissions/catalog');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
