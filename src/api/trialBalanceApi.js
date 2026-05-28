import axiosInstance from './axiosInstance';

export const getTrialBalanceEntries = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/trial-balance', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
