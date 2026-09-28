import axiosInstance from './axiosInstance';

export const getStockLedger = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/stock/ledger', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
