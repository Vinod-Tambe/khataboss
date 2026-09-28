import axiosInstance from './axiosInstance';

export const createMoneyTransaction = async (payload) => {
  try {
    const response = await axiosInstance.post('/money-transaction', payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const getMoneyTransactions = async (params = {}) => {
  try {
    const qs = new URLSearchParams();
    if (params.firmId) qs.set('firmId', params.firmId);
    if (params.startDate) qs.set('startDate', params.startDate);
    if (params.endDate) qs.set('endDate', params.endDate);
    const query = qs.toString();
    const response = await axiosInstance.get(`/money-transaction${query ? `?${query}` : ''}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

export const deleteMoneyTransaction = async (mtId) => {
  try {
    const response = await axiosInstance.delete(`/money-transaction/${mtId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
