import adminAxiosInstance from './adminAxiosInstance';

export const getAnnouncements = async () => {
  const response = await adminAxiosInstance.get('/announcement');
  return { data: response.data?.data || [], message: response.data?.message };
};

export const getAnnouncementByUuid = async (uuid) => {
  const response = await adminAxiosInstance.get(`/announcement/${uuid}`);
  return { data: response.data?.data, message: response.data?.message };
};

export const createAnnouncement = async (payload) => {
  const response = await adminAxiosInstance.post('/announcement', payload);
  return { data: response.data?.data, message: response.data?.message };
};

export const updateAnnouncement = async (uuid, payload) => {
  const response = await adminAxiosInstance.patch(`/announcement/${uuid}`, payload);
  return { data: response.data?.data, message: response.data?.message };
};

export const deleteAnnouncement = async (uuid) => {
  const response = await adminAxiosInstance.delete(`/announcement/${uuid}`);
  return { message: response.data?.message };
};
