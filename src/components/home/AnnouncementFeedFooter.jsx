import React from 'react';
import { getAnnouncementFooterParts } from '../../utils/announcementMeta';

const AnnouncementFeedFooter = ({ item, className = '' }) => {
  const { publishedLabel, publisherName } = getAnnouncementFooterParts(item);

  return (
    <div className={`announcement-feed-item__footer ${className}`.trim()}>
      <span className="announcement-feed-item__footer-name">{publisherName}</span>
      {publishedLabel && (
        <span className="announcement-feed-item__footer-date">{publishedLabel}</span>
      )}
    </div>
  );
};

export default AnnouncementFeedFooter;
