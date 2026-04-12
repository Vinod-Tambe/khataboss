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
 * @param {string} uuid - Firm UUID
 * @param {FormData} formData - Multipart form data containing updated details and files
 * @returns {Promise} - Response object with updated firm details
 */
export const updateFirm = async (uuid, formData) => {
  try {
    const response = await axiosInstance.put(`/firm/${uuid}`, formData, {
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
 * @param {string} uuid - Firm UUID
 * @returns {Promise} - Response object confirming deletion
 */
export const deleteFirm = async (uuid) => {
  try {
    const response = await axiosInstance.delete(`/firm/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};

/**
 * Get a single firm by UUID
 * @param {string} uuid - Firm UUID
 * @returns {Promise} - Response object with firm details
 */
export const getFirmByUuid = async (uuid) => {
  try {
    const response = await axiosInstance.get(`/firm/${uuid}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
/**
 * Get all firms for dropdown (id, uuid and name only)
 * @returns {Promise} - Response object with list of firms for dropdown
 */
export const getFirmsDropdown = async () => {
  try {
    const response = await axiosInstance.get('/firm/dropdown');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
