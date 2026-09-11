import React from 'react';
import { useSelector } from 'react-redux';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import { formatAdminDateTime } from '../utils/dateHelpers';

const AnnouncementPreviewCard = ({ item }) => {
  const { user } = useSelector((state) => state.adminAuth);
  const companyName = user?.admin_company_name?.trim() || 'KhataBoss';
  const config = getAnnouncementTypeConfig(item.ann_type);
  const title = item.ann_title?.trim() || 'Announcement title';
  const body = item.ann_body?.trim() || 'Your announcement message will appear here.';

  return (
    <div className="announcement-preview-card">
      <div className="announcement-preview-card__label">Owner dashboard preview</div>
      <article
        className="announcement-feed-item announcement-feed-item--preview"
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
        <h6 className="announcement-feed-item__title">{title}</h6>
        <p className="announcement-feed-item__body small mb-2">{body}</p>
        <div className="announcement-feed-item__footer">
          <span className="announcement-feed-item__footer-name">
            - {item.ann_published_by || companyName}
          </span>
          <span className="announcement-feed-item__footer-date">
            {formatAdminDateTime(item.ann_publish_at) || '—'}
          </span>
        </div>
      </article>
    </div>
  );
};

export default AnnouncementPreviewCard;
