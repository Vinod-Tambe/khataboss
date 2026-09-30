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
  try {
    const response = await axiosInstance.get('/announcement/public/feed', {
      params: software ? { software: '1' } : {},
      skipAuthAlert: true,
    });
    return {
      data: response.data?.data || [],
      message: response.data?.message,
      meta: response.data?.meta,
    };
  } catch (error) {
    return {
      data: [],
      message: error?.message || 'Failed to fetch public announcements',
      meta: { blocksLogin: false },
    };
  }
};
