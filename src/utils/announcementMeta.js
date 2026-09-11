import { formatDateTime } from './dateFormat';

export const getAnnouncementFooterParts = (item) => {
  const published = formatDateTime(item?.ann_publish_at);
  const publisherName = item?.ann_published_by || 'KhataBoss';
  return {
    publishedLabel: published || '',
    publisherName: `- ${publisherName}`,
  };
};
