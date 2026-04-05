import axiosInstance from './axiosInstance';

/**
 * Create a new firm
 * @param {FormData} formData - Multipart form data containing firm details and files
 * @returns {Promise} - Response object with created firm details
 */
export const createFirm = async (formData) => {
  try {
    const response = await axiosInstance.post('/firm', formData, {
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
 * Get all firms
 * @returns {Promise} - Response object with list of firms
 */
export const getFirms = async () => {
  try {
    const response = await axiosInstance.get('/firm');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Update an existing firm
 * @param {number|string} id - Firm ID
 * @param {FormData} formData - Multipart form data containing updated details and files
 * @returns {Promise} - Response object with updated firm details
 */
export const updateFirm = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/firm/${id}`, formData, {
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
 * Delete a firm (soft delete)
 * @param {number|string} id - Firm ID
 * @returns {Promise} - Response object confirming deletion
 */
export const deleteFirm = async (id) => {
  try {
    const response = await axiosInstance.delete(`/firm/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

