import axiosInstance from './axiosInstance';

/**
 * Create a new finance record
 * @param {object} financeData - Finance details
 * @returns {Promise} - Response object with created finance details
 */
export const createFinance = async (financeData) => {
  try {
    const response = await axiosInstance.post('/finance', financeData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get all finance records
 * @param {number|string} firmId - Optional firm ID to filter by
 * @returns {Promise} - Response object with list of finances
 */
export const getFinances = async (firmId = null) => {
  try {
    const url = firmId ? `/finance?firmId=${firmId}` : '/finance';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Delete a finance record
 * @param {number|string} id - Finance ID
 * @returns {Promise} - Response object with success message
 */
export const deleteFinance = async (id) => {
  try {
    const response = await axiosInstance.delete(`/finance/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
