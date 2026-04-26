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
export const getFinances = async (filters = {}) => {
  try {
    const { firmId, userId, status } = filters;
    let query = [];
    if (firmId) query.push(`firmId=${firmId}`);
    if (userId) query.push(`userId=${userId}`);
    if (status) query.push(`status=${status}`);
    
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    const response = await axiosInstance.get(`/finance${queryString}`);
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

/**
 * Get finance details by ID (including EMIs and History)
 * @param {number|string} id - Finance ID
 * @returns {Promise} - Response object with finance details
 */
export const getFinanceDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/finance/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Create a new finance payment
 * @param {object} paymentData - Payment details
 * @returns {Promise} - Response object with created payment details
 */
export const createFinancePayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/finance/payment', paymentData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
