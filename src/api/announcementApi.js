import axiosInstance from './axiosInstance';

export const getAnnouncementFeed = async () => {
  const response = await axiosInstance.get('/announcement/feed');
  return {
    data: response.data?.data || [],
    message: response.data?.message,
  };
};

/** Login page — no token required. Software/maintenance notices only; does not block sign-in. */
export const getPublicAnnouncementFeed = async ({ software = true } = {}) => {
  const response = await axiosInstance.get('/announcement/public/feed', {
    params: software ? { software: '1' } : {},
  });
  return {
    data: response.data?.data || [],
    message: response.data?.message,
    meta: response.data?.meta,
  };
};
