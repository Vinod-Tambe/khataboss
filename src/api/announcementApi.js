import axiosInstance from './axiosInstance';

export const getAnnouncementFeed = async () => {
  const response = await axiosInstance.get('/announcement/feed');
  return {
    data: response.data?.data || [],
    message: response.data?.message,
  };
};
