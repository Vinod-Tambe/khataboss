import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnnouncementFeed } from '../../api/announcementApi';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import AnnouncementFeedFooter from './AnnouncementFeedFooter';

const DISMISS_STORAGE_KEY = 'khataboss_dismissed_announcements';

const readDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeDismissed = (ids) => {
  localStorage.setItem(DISMISS_STORAGE_KEY, JSON.stringify(ids));
};

const AnnouncementPopup = () => {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  const loadPopupQueue = useCallback(async () => {
    try {
      const res = await getAnnouncementFeed();
      const dismissed = new Set(readDismissed());
      const pending = (res.data || [])
        .filter((item) => !dismissed.has(item.ann_uuid))
        .sort((a, b) => {
          if (a.ann_is_pinned !== b.ann_is_pinned) {
            return a.ann_is_pinned ? -1 : 1;
          }
          return new Date(b.ann_publish_at) - new Date(a.ann_publish_at);
        });
      setQueue(pending);
      setCurrent(pending[0] || null);
    } catch {
      setQueue([]);
      setCurrent(null);
    }
  }, []);

  useEffect(() => {
    loadPopupQueue();
  }, [loadPopupQueue]);

  const config = useMemo(
    () => getAnnouncementTypeConfig(current?.ann_type),
    [current?.ann_type]
  );

  const handleDismiss = () => {
    if (!current) return;
    const dismissed = readDismissed();
    if (!dismissed.includes(current.ann_uuid)) {
      writeDismissed([...dismissed, current.ann_uuid]);
    }
    const remaining = queue.filter((item) => item.ann_uuid !== current.ann_uuid);
    setQueue(remaining);
    setCurrent(remaining[0] || null);
  };

  if (!current) return null;

  return (
    <div className="announcement-popup-backdrop">
      <div
        className="announcement-popup-card"
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
          <div>
            <span className="announcement-popup-card__type">{config.label}</span>
            <h5 className="announcement-popup-card__title mb-0">{current.ann_title}</h5>
          </div>
          <button
            type="button"
            className="announcement-popup-card__close"
            onClick={handleDismiss}
            aria-label="Close announcement"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="announcement-popup-card__body">
          <p className="announcement-popup-card__message">{current.ann_body}</p>
          <AnnouncementFeedFooter item={current} className="announcement-feed-item__footer--popup" />
        </div>

        <div className="announcement-popup-card__footer">
          {queue.length > 1 && (
            <span className="announcement-popup-card__count">
              {queue.findIndex((item) => item.ann_uuid === current.ann_uuid) + 1} of {queue.length}
            </span>
          )}
          <button type="button" className="btn btn-primary" onClick={handleDismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
