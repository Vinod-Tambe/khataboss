import axiosInstance from './axiosInstance';

export const getDaybookEntries = async (filters = {}) => {
  try {
    const response = await axiosInstance.get('/daybook', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network Error');
  }
};
