import React from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import AnnouncementFeedFooter from './AnnouncementFeedFooter';

const AnnouncementFeedItem = ({ item, compact = false }) => {
  const config = getAnnouncementTypeConfig(item.ann_type);

  return (
    <article
      className={`announcement-feed-item ${compact ? 'announcement-feed-item--compact' : ''}`}
      style={{
        '--ann-type-color': config.color,
        '--ann-type-bg': config.bg,
        '--ann-type-border': config.border,
      }}
    >
      <div className="announcement-feed-item__header">
        <div className="announcement-feed-item__type-badge">
          <i className={`bi ${config.icon}`} />
          <span>{config.label}</span>
        </div>
        {item.ann_is_pinned && (
          <span className="badge bg-warning text-dark">Pinned</span>
        )}
      </div>
      <h6 className="announcement-feed-item__title">{item.ann_title}</h6>
      <p className="announcement-feed-item__body small mb-2">{item.ann_body}</p>
      {!compact && <AnnouncementFeedFooter item={item} />}
    </article>
  );
};

export default AnnouncementFeedItem;
