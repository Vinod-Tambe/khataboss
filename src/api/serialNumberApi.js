import axiosInstance from './axiosInstance';

/**
 * Preview next unique code without consuming serial counter (display only).
 * @param {string} entityType - e.g. FINANCE, LOAN
 */
export const previewNextUniqueCode = async (entityType) => {
  try {
    const response = await axiosInstance.get(`/serial-number/preview/${entityType}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    throw new Error(message);
  }
};
