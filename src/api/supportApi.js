import axiosInstance from './axiosInstance';

const unwrap = (response) => ({
  data: response.data?.data ?? response.data,
  message: response.data?.message,
});

export const listSupportTickets = async (params = {}) => {
  const query = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.owner_status) query.owner_status = params.owner_status;
  const response = await axiosInstance.get('/support/tickets', { params: query });
  return unwrap(response);
};

export const updateSupportTicket = async (uuid, payload) => {
  const response = await axiosInstance.patch(`/support/tickets/${uuid}`, payload);
  return unwrap(response);
};

export const getSupportTicket = async (uuid) => {
  const response = await axiosInstance.get(`/support/tickets/${uuid}`);
  return unwrap(response);
};

export const createSupportTicket = async ({ title, body, priority, images = [] }) => {
  const payload = {
    st_title: title,
    st_body: body,
    st_priority: priority,
  };
  const files = (images || []).filter(Boolean);

  if (files.length === 0) {
    const response = await axiosInstance.post('/support/tickets', payload);
    return unwrap(response);
  }

  const formData = new FormData();
  formData.append('st_title', title);
  formData.append('st_body', body);
  formData.append('st_priority', priority);
  files.forEach((file) => formData.append('images', file));

  const response = await axiosInstance.post('/support/tickets', formData);
  return unwrap(response);
};

export const uploadSupportTicketImages = async (uuid, images = []) => {
  const files = (images || []).filter(Boolean);
  if (!files.length) {
    throw new Error('Select at least one image to upload.');
  }
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await axiosInstance.post(`/support/tickets/${uuid}/images`, formData);
  return unwrap(response);
};

export const addSupportTicketComment = async (uuid, { body = '', images = [] } = {}) => {
  const text = String(body || '').trim();
  const files = (images || []).filter(Boolean);

  if (files.length > 0) {
    const formData = new FormData();
    if (text) formData.append('stc_body', text);
    files.forEach((file) => formData.append('images', file));
    const response = await axiosInstance.post(`/support/tickets/${uuid}/comments`, formData);
    return unwrap(response);
  }

  const response = await axiosInstance.post(`/support/tickets/${uuid}/comments`, {
    stc_body: text,
  });
  return unwrap(response);
};

export const updateSupportTicketComment = async (
  uuid,
  commentUuid,
  { body = '', images = [], removePaths = [] } = {}
) => {
  const text = body !== undefined && body !== null ? String(body).trim() : '';
  const files = (images || []).filter(Boolean);
  const paths = (removePaths || []).filter(Boolean);

  if (files.length > 0 || paths.length > 0) {
    const formData = new FormData();
    formData.append('stc_body', text);
    if (paths.length) {
      formData.append('stc_remove_paths', JSON.stringify(paths));
    }
    files.forEach((file) => formData.append('images', file));
    const response = await axiosInstance.patch(
      `/support/tickets/${uuid}/comments/${commentUuid}`,
      formData
    );
    return unwrap(response);
  }

  const response = await axiosInstance.patch(
    `/support/tickets/${uuid}/comments/${commentUuid}`,
    { stc_body: text }
  );
  return unwrap(response);
};

export const deleteSupportTicketImage = async (uuid, imagePath) => {
  const response = await axiosInstance.delete(`/support/tickets/${uuid}/images`, {
    data: { path: imagePath },
  });
  return unwrap(response);
};
