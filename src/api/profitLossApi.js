import axiosInstance from './axiosInstance';

export const getProfitLossEntries = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/profit-loss', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
