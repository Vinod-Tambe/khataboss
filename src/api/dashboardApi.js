import axiosInstance from './axiosInstance';
import { normalizeOwnerDashboardCharts } from '../utils/normalizeOwnerDashboardCharts';

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
    const payload = response.data;
    if (payload?.data?.charts) {
      payload.data.charts = normalizeOwnerDashboardCharts(
        payload.data.charts,
        payload.data.cards
      );
    }
    return payload;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
