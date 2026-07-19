import axiosInstance from './axiosInstance';

export const createMoneyLender = async (data) => {
  try {
    const response = await axiosInstance.post('/money-lender', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getMoneyLenders = async () => {
  try {
    const response = await axiosInstance.get('/money-lender');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const updateMoneyLender = async (uuid, data) => {
  try {
    const response = await axiosInstance.put(`/money-lender/${uuid}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const deleteMoneyLender = async (uuid) => {
  try {
    const response = await axiosInstance.delete(`/money-lender/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getMoneyLenderByUuid = async (uuid) => {
  try {
    const response = await axiosInstance.get(`/money-lender/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
