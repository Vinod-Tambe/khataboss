import axiosInstance from './axiosInstance';

/**
 * Get user dashboard data
 * @param {Object} params - Query parameters (firmId, userId)
 * @returns {Promise} - Response object with dashboard data
 */
export const getUserDashboard = async (params) => {
  try {
    const response = await axiosInstance.get('/dashboard/user', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get owner/staff home dashboard (cards + charts)
 * @param {Object} params - { firmId }
 */
export const getOwnerDashboard = async (params) => {
  try {
    const response = await axiosInstance.get('/dashboard/home', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
