import axiosInstance from './axiosInstance';

const errMsg = (error) =>
  error.response?.data?.error || error.response?.data?.message || error.message;

export const getAgreementTemplates = async (type) => {
  try {
    const response = await axiosInstance.get('/agreement-templates/templates', {
      params: type ? { type } : undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const getAgreementTemplate = async (firmId, type) => {
  try {
    const response = await axiosInstance.get('/agreement-templates/template', {
      params: { firmId, type },
    });
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};

export const updateAgreementTemplate = async (uuid, payload) => {
  try {
    const response = await axiosInstance.put(`/agreement-templates/templates/${uuid}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(errMsg(error));
  }
};
