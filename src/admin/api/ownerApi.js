import adminAxiosInstance from './adminAxiosInstance';

export const getOwners = async () => {
  const response = await adminAxiosInstance.get('/owner');
  return {
    data: response.data?.data || [],
    message: response.data?.message,
  };
};

export const getOwnerByUuid = async (uuid) => {
  const response = await adminAxiosInstance.get(`/owner/${uuid}`);
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const createOwner = async (formData) => {
  const response = await adminAxiosInstance.post('/owner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const updateOwner = async (uuid, formData) => {
  const response = await adminAxiosInstance.patch(`/owner/${uuid}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const deleteOwner = async (uuid) => {
  const response = await adminAxiosInstance.delete(`/owner/${uuid}`);
  return {
    message: response.data?.message,
  };
};

export const updateOwnerStatus = async (uuid, own_status) => {
  const response = await adminAxiosInstance.patch(`/owner/${uuid}/status`, {
    own_status,
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const resetOwnerPassword = async (uuid, new_password, confirm_password) => {
  const response = await adminAxiosInstance.post(`/owner/${uuid}/reset-password`, {
    new_password,
    confirm_password,
  });
  return {
    message: response.data?.message,
  };
};
