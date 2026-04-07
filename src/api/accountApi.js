import axiosInstance from './axiosInstance';

/**
 * Create a new account
 * @param {object} accountData - Account details
 * @returns {Promise} - Response object with created account details
 */
export const createAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/account', accountData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get all accounts for dropdown (id, uuid and name only)
 * @param {number|string} firmId - Optional firm ID to filter by
 * @returns {Promise} - Response object with list of accounts for dropdown
 */
export const getAccountsDropdown = async (firmId = null) => {
  try {
    const url = firmId ? `/account/dropdown?firmId=${firmId}` : '/account/dropdown';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get all accounts
 * @param {number|string} firmId - Optional firm ID to filter by
 * @returns {Promise} - Response object with list of accounts
 */
export const getAccounts = async (firmId = null) => {
  try {
    const url = firmId ? `/account?firmId=${firmId}` : '/account';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get a single account by UUID
 * @param {string} uuid - Account UUID
 * @returns {Promise} - Response object with account details
 */
export const getAccountByUuid = async (uuid) => {
  try {
    const response = await axiosInstance.get(`/account/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Update an existing account
 * @param {string} uuid - Account UUID
 * @param {object} accountData - Updated account details
 * @returns {Promise} - Response object with updated account details
 */
export const updateAccount = async (uuid, accountData) => {
  try {
    const response = await axiosInstance.put(`/account/${uuid}`, accountData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Delete an account (soft delete)
 * @param {string} uuid - Account UUID
 * @returns {Promise} - Response object with success message
 */
export const deleteAccount = async (uuid) => {
  try {
    const response = await axiosInstance.delete(`/account/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
