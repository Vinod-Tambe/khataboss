import React from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import { formatAdminDateTime } from '../utils/dateHelpers';

const AnnouncementAdminListItem = ({ item, onEdit, onDelete }) => {
  const typeConfig = getAnnouncementTypeConfig(item.ann_type);

  return (
    <article
      className="announcement-admin-card"
      style={{
        '--ann-type-color': typeConfig.color,
        '--ann-type-bg': typeConfig.bg,
        '--ann-type-border': typeConfig.border,
      }}
    >
      <div className="announcement-admin-card__top">
        <span className="announcement-admin-card__type">
          <i className={`bi ${typeConfig.icon}`} />
          {typeConfig.label}
        </span>
        {item.ann_is_pinned && (
          <span className="announcement-admin-card__pinned">
            <i className="bi bi-pin-angle-fill" />
          </span>
        )}
      </div>

      <h6 className="announcement-admin-card__title">{item.ann_title}</h6>

      <div className="announcement-admin-card__dates">
        <div className="announcement-admin-card__date-row">
          <span className="announcement-admin-card__date-label">Publish Date</span>
          <span className="announcement-admin-card__date-value">
            {formatAdminDateTime(item.ann_publish_at)}
          </span>
        </div>
        <div className="announcement-admin-card__date-row">
          <span className="announcement-admin-card__date-label">Expiry Date</span>
          <span className="announcement-admin-card__date-value">
            {item.ann_expires_at ? formatAdminDateTime(item.ann_expires_at) : 'No expiry'}
          </span>
        </div>
      </div>

      <div className="announcement-admin-card__actions">
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(item)}>
          <i className="bi bi-pencil-square me-1" />
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(item)}>
          <i className="bi bi-trash me-1" />
          Delete
        </button>
      </div>
    </article>
  );
};

export default AnnouncementAdminListItem;
