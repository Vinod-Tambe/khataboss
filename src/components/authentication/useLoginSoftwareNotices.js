import { useEffect, useState } from 'react';
import { getPublicAnnouncementFeed } from '../../api/announcementApi';

/** When live, login page shows notice card and hides sign-in form. */
export const LOGIN_FORM_BLOCK_TEMPLATE_KEYS = new Set([
  'software_maintenance',
  'software_emergency_downtime',
]);

export function useLoginSoftwareNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicAnnouncementFeed({ software: true });
        if (!cancelled) setNotices(res.data || []);
      } catch {
        if (!cancelled) setNotices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const blockingNotices = notices.filter((row) =>
    LOGIN_FORM_BLOCK_TEMPLATE_KEYS.has(row.ann_template_key)
  );

  return {
    notices: blockingNotices,
    loading,
    maintenanceMode: blockingNotices.length > 0,
  };
}
