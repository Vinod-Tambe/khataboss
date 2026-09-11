import { useEffect, useState } from 'react';
import { getPlatformBranding } from '../api/brandingApi';

const DEFAULT_BRANDING = {
  company_name: 'KhataBoss',
  display_name: 'KhataBoss',
  help_phone: '9579082528',
};

const usePlatformBranding = () => {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await getPlatformBranding();
        if (active) {
          setBranding(res.data || DEFAULT_BRANDING);
        }
      } catch {
        if (active) {
          setBranding(DEFAULT_BRANDING);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return {
    loading,
    companyName: branding.company_name || DEFAULT_BRANDING.company_name,
    displayName: branding.display_name || DEFAULT_BRANDING.display_name,
    helpPhone: branding.help_phone || DEFAULT_BRANDING.help_phone,
  };
};

export default usePlatformBranding;
