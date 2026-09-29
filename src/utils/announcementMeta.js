import { formatDateTime } from './dateFormat';

export const SOFTWARE_ANNOUNCEMENT_KEY_PREFIX = 'software_';

export const isSoftwareAnnouncement = (item) =>
  String(item?.ann_template_key || '').startsWith(SOFTWARE_ANNOUNCEMENT_KEY_PREFIX);

/** Full-screen popup is for festivals/custom pins — not software maintenance/issue notices. */
export const shouldShowAnnouncementPopup = (item) => !isSoftwareAnnouncement(item);

export const getAnnouncementFooterParts = (item) => {
  const published = formatDateTime(item?.ann_publish_at);
  const publisherName = item?.ann_published_by || 'KhataBoss';
  return {
    publishedLabel: published || '',
    publisherName: `- ${publisherName}`,
  };
};
