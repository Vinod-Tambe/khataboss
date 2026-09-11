import adminAxiosInstance from './adminAxiosInstance';

export const getPlans = async (activeOnly = false) => {
  const response = await adminAxiosInstance.get(`/plan${activeOnly ? '?active=true' : ''}`);
  return {
    data: response.data?.data || [],
    message: response.data?.message,
  };
};

export const getPlanByUuid = async (uuid) => {
  const response = await adminAxiosInstance.get(`/plan/${uuid}`);
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const getPlanModuleCatalog = async () => {
  const response = await adminAxiosInstance.get('/plan/modules/catalog');
  return {
    data: response.data?.data || [],
    message: response.data?.message,
  };
};

export const createPlan = async (formData) => {
  const response = await adminAxiosInstance.post('/plan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const updatePlan = async (uuid, formData) => {
  const response = await adminAxiosInstance.patch(`/plan/${uuid}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const updatePlanStatus = async (uuid, plan_status) => {
  const response = await adminAxiosInstance.patch(`/plan/${uuid}/status`, { plan_status });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};

export const deletePlan = async (uuid) => {
  const response = await adminAxiosInstance.delete(`/plan/${uuid}`);
  return { message: response.data?.message };
};

export const applyPlanToOwner = async (planUuid, ownerUuid, dates = {}) => {
  const response = await adminAxiosInstance.post(`/plan/${planUuid}/apply`, {
    owner_uuid: ownerUuid,
    own_start_date: dates.own_start_date,
    own_expiry_date: dates.own_expiry_date,
  });
  return {
    data: response.data?.data,
    message: response.data?.message,
  };
};
