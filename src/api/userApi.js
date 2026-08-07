import axiosInstance from './axiosInstance';

/**
 * Create a new user
 * @param {FormData} userData - User details including files
 * @returns {Promise} - Response object with created user details
 */
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/user', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get all users
 * @param {number|string} firmId - Optional firm ID to filter users
 * @returns {Promise} - Response object with list of users
 */
export const getUsers = async (firmId, search = "") => {
  try {
    const response = await axiosInstance.get('/user', {
      params: { firmId, search },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Fast header autocomplete search
 * @param {string} q - mobile / email / name / customer id
 * @param {number|string|null} firmId - firm filter; omit/null for all firms
 * @param {number} limit - max results (default 12)
 */
export const searchUsers = async (q, firmId = null, limit = 12) => {
  try {
    const params = { q, limit };
    if (firmId != null && firmId !== '' && firmId !== 'all') {
      params.firmId = firmId;
    }
    const response = await axiosInstance.get('/user/search', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Delete a user by UUID
 * @param {string} uuid - User UUID
 * @returns {Promise} - Response object
 */
export const deleteUser = async (uuid) => {
  try {
    const response = await axiosInstance.delete(`/user/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get user by UUID
 * @param {string} uuid - User UUID
 * @returns {Promise} - Response object with user details
 */
export const getUser = async (uuid) => {
  try {
    const response = await axiosInstance.get(`/user/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Update user by UUID
 * @param {string} uuid - User UUID
 * @param {FormData} userData - Updated user details including files
 * @returns {Promise} - Response object with updated user details
 */
export const updateUser = async (uuid, userData) => {
  try {
    const response = await axiosInstance.put(`/user/${uuid}`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
