import React, { useCallback, useEffect, useState } from 'react';
import { getAnnouncementFeed } from '../../api/announcementApi';
import usePlatformBranding from '../../hooks/usePlatformBranding';
import AnnouncementFeedItem from './AnnouncementFeedItem';

const FEED_REFRESH_MS = 60 * 1000;

const NewsPanel = () => {
  const { companyName } = usePlatformBranding();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    try {
      const res = await getAnnouncementFeed();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFeed();
    const timer = setInterval(loadFeed, FEED_REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadFeed]);

  return (
    <div className="dashboard-news-panel">
      <div className="dashboard-news-panel__header">
        <h5 className="mb-0 fw-bold text-brown">
          <i className="bi bi-megaphone-fill me-2 text-primary" />
          News & Updates
        </h5>
        <span className="dashboard-news-panel__badge">From {companyName}</span>
      </div>

      <div className="dashboard-news-panel__body">
        {loading && (
          <div className="text-center text-muted py-4">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading news...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="dashboard-news-empty text-muted text-center py-4">
            <i className="bi bi-newspaper fs-3 d-block mb-2" />
            No news at the moment.
          </div>
        )}

        {!loading && items.map((item) => (
          <AnnouncementFeedItem key={item.ann_uuid} item={item} compact />
        ))}
      </div>
    </div>
  );
};

export default NewsPanel;
