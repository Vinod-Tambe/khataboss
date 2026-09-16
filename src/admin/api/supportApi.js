import adminAxiosInstance from './adminAxiosInstance';

const unwrap = (response) => ({
  data: response.data?.data ?? response.data,
  message: response.data?.message,
});

export const listAdminSupportTickets = async (params = {}) => {
  const response = await adminAxiosInstance.get('/admin/support/tickets', { params });
  return unwrap(response);
};

export const getAdminSupportTicket = async (uuid) => {
  const response = await adminAxiosInstance.get(`/admin/support/tickets/${uuid}`);
  return unwrap(response);
};

export const updateAdminSupportTicket = async (uuid, payload) => {
  const response = await adminAxiosInstance.patch(`/admin/support/tickets/${uuid}`, payload);
  return unwrap(response);
};

export const addAdminSupportComment = async (uuid, { body = '', images = [] } = {}) => {
  const text = String(body || '').trim();
  const files = (images || []).filter(Boolean);

  if (files.length > 0) {
    const formData = new FormData();
    if (text) formData.append('stc_body', text);
    files.forEach((file) => formData.append('images', file));
    const response = await adminAxiosInstance.post(
      `/admin/support/tickets/${uuid}/comments`,
      formData
    );
    return unwrap(response);
  }

  const response = await adminAxiosInstance.post(`/admin/support/tickets/${uuid}/comments`, {
    stc_body: text,
  });
  return unwrap(response);
};

export const updateAdminSupportComment = async (
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
    const response = await adminAxiosInstance.patch(
      `/admin/support/tickets/${uuid}/comments/${commentUuid}`,
      formData
    );
    return unwrap(response);
  }

  const response = await adminAxiosInstance.patch(
    `/admin/support/tickets/${uuid}/comments/${commentUuid}`,
    { stc_body: text }
  );
  return unwrap(response);
};
