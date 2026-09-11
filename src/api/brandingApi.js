import axios from 'axios';
import { apiBaseUrl } from '../config/appConfig';

const DEFAULT_BRANDING = {
  company_name: 'KhataBoss',
  display_name: 'KhataBoss',
  help_phone: '9579082528',
};

let cachedBranding = null;
let pendingRequest = null;

export const getPlatformBranding = async () => {
  if (cachedBranding) {
    return { data: cachedBranding };
  }

  if (!pendingRequest) {
    pendingRequest = axios
      .get(`${apiBaseUrl}/admin/branding`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      })
      .then((response) => {
        cachedBranding = response.data?.data || DEFAULT_BRANDING;
        return { data: cachedBranding };
      })
      .catch(() => ({ data: DEFAULT_BRANDING }))
      .finally(() => {
        pendingRequest = null;
      });
  }

  return pendingRequest;
};

export const clearBrandingCache = () => {
  cachedBranding = null;
};
