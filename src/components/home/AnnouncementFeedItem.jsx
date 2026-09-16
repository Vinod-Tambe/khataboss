import React from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import AnnouncementFeedFooter from './AnnouncementFeedFooter';

const AnnouncementFeedItem = ({ item, compact = false, onOpen }) => {
  const config = getAnnouncementTypeConfig(item.ann_type);
  const isInteractive = compact && typeof onOpen === 'function';

  const handleOpen = () => {
    if (isInteractive) onOpen(item);
  };

  const handleKeyDown = (event) => {
    if (!isInteractive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(item);
    }
  };

  return (
    <article
      className={`announcement-feed-item ${compact ? 'announcement-feed-item--compact' : ''} ${
        isInteractive ? 'announcement-feed-item--clickable' : ''
      }`}
      style={{
        '--ann-type-color': config.color,
        '--ann-type-bg': config.bg,
        '--ann-type-border': config.border,
      }}
      onClick={isInteractive ? handleOpen : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `View announcement: ${item.ann_title}` : undefined}
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
      <AnnouncementFeedFooter
        item={item}
        className={compact ? 'announcement-feed-item__footer--compact' : ''}
      />
    </article>
  );
};

export default AnnouncementFeedItem;
