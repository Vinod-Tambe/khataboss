import React, { useEffect, useMemo } from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import AnnouncementFeedFooter from './AnnouncementFeedFooter';

const AnnouncementDetailModal = ({ item, onClose }) => {
  const config = useMemo(
    () => getAnnouncementTypeConfig(item?.ann_type),
    [item?.ann_type]
  );

  useEffect(() => {
    if (!item) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="announcement-popup-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="announcement-popup-card announcement-popup-card--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-detail-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          '--ann-type-color': config.color,
          '--ann-type-bg': config.bg,
          '--ann-type-border': config.border,
        }}
      >
        <div className="announcement-popup-card__hero">
          <div className="announcement-popup-card__icon-wrap">
            <i className={`bi ${config.icon}`} />
          </div>
          <div className="min-w-0">
            <span className="announcement-popup-card__type">{config.label}</span>
            <h5 id="announcement-detail-title" className="announcement-popup-card__title mb-0">
              {item.ann_title}
            </h5>
          </div>
          <button
            type="button"
            className="announcement-popup-card__close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="announcement-popup-card__body announcement-popup-card__body--scroll">
          {item.ann_is_pinned && (
            <span className="badge bg-warning text-dark mb-2">Pinned</span>
          )}
          <p className="announcement-popup-card__message mb-0">{item.ann_body}</p>
          <AnnouncementFeedFooter item={item} className="announcement-feed-item__footer--popup" />
        </div>

        <div className="announcement-popup-card__footer">
          <button type="button" className="btn btn-primary ms-auto" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;
