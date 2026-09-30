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

export const seedAnnouncementTemplates = async () => {
  const paths = ['/admin/announcement/templates/seed', '/announcement/templates/seed'];
  let lastError;
  for (const url of paths) {
    try {
      const response = await adminAxiosInstance.post(url);
      return {
        data: response.data?.data || [],
        stats: response.data?.stats,
        message: response.data?.message,
      };
    } catch (error) {
      lastError = error;
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  }
  throw lastError;
};
