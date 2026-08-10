import axiosInstance from './axiosInstance';

const errMsg = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message;

export const getMessageTemplates = async ({ firmId, channel } = {}) => {
  try {
    const response = await axiosInstance.get('/messaging/templates', {
      params: { firmId, channel },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const updateMessageTemplate = async (uuid, formData) => {
  try {
    const response = await axiosInstance.put(`/messaging/templates/${uuid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const getWhatsAppSettings = async (firmId) => {
  try {
    const response = await axiosInstance.get('/messaging/whatsapp/settings', {
      params: { firmId },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const saveWhatsAppSettings = async (payload) => {
  try {
    const response = await axiosInstance.post('/messaging/whatsapp/settings', payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const makeWhatsAppInstance = async (payload) => {
  try {
    const response = await axiosInstance.post('/messaging/whatsapp/make-instance', payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const refreshWhatsAppStatus = async (firmId) => {
  try {
    const response = await axiosInstance.get('/messaging/whatsapp/status', {
      params: { firmId },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const disconnectWhatsApp = async (firmId) => {
  try {
    const response = await axiosInstance.post('/messaging/whatsapp/disconnect', { firmId });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const dispatchMessage = async (formData) => {
  try {
    const response = await axiosInstance.post('/messaging/dispatch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const getEmailSettings = async () => {
  try {
    const response = await axiosInstance.get('/messaging/email/settings');
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const saveEmailSettings = async (payload) => {
  try {
    const response = await axiosInstance.put('/messaging/email/settings', payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const testEmailSettings = async (payload = {}) => {
  try {
    const response = await axiosInstance.post('/messaging/email/settings/test', payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const clearEmailSettings = async () => {
  try {
    const response = await axiosInstance.delete('/messaging/email/settings');
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};
