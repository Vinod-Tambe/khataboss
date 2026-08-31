import axiosInstance from './axiosInstance';

const errMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message;

/** Fetch image as data URL via backend (works for R2 / local uploads). */
export const getImageDataUrl = async (path) => {
  if (!path) return null;
  try {
    const response = await axiosInstance.get('/media/data-url', {
      params: { path },
    });
    return response.data?.data || null;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};
