import React from 'react';
import { getAnnouncementTypeConfig } from '../../constants/announcementTypes';
import {
  formatAdminDate,
  getAnnouncementScheduleStatus,
} from '../utils/dateHelpers';

const SCHEDULE_BADGE = {
  Inactive: { className: 'announcement-schedule-badge announcement-schedule-badge--inactive', label: 'Not scheduled' },
  Scheduled: { className: 'announcement-schedule-badge announcement-schedule-badge--scheduled', label: 'Scheduled' },
  Live: { className: 'announcement-schedule-badge announcement-schedule-badge--live', label: 'Live' },
  Expired: { className: 'announcement-schedule-badge announcement-schedule-badge--expired', label: 'Expired' },
};

const AnnouncementTemplateAdminCard = ({ item, onSchedule }) => {
  const typeConfig = getAnnouncementTypeConfig(item.ann_type);
  const scheduleStatus = getAnnouncementScheduleStatus(item);
  const badge = SCHEDULE_BADGE[scheduleStatus] || SCHEDULE_BADGE.Inactive;

  return (
    <article
      className="announcement-admin-card announcement-admin-card--template"
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
        <span className={badge.className}>{badge.label}</span>
      </div>

      <h6 className="announcement-admin-card__title">{item.ann_title}</h6>
      <p className="announcement-admin-card__excerpt small text-muted mb-2">
        {item.ann_body?.length > 120 ? `${item.ann_body.slice(0, 120)}…` : item.ann_body}
      </p>

      <div className="announcement-admin-card__dates">
        <div className="announcement-admin-card__date-row">
          <span className="announcement-admin-card__date-label">Start date</span>
          <span className="announcement-admin-card__date-value">
            {item.ann_template_key && item.ann_status === 'Inactive'
              ? 'Not set'
              : formatAdminDate(item.ann_publish_at)}
          </span>
        </div>
        <div className="announcement-admin-card__date-row">
          <span className="announcement-admin-card__date-label">End date</span>
          <span className="announcement-admin-card__date-value">
            {item.ann_expires_at ? formatAdminDate(item.ann_expires_at) : '—'}
          </span>
        </div>
      </div>

      <div className="announcement-admin-card__actions">
        <button
          type="button"
          className="announcement-admin-card__schedule-btn"
          onClick={() => onSchedule(item)}
        >
          <i className="bi bi-calendar-range" aria-hidden="true" />
          Set dates
        </button>
      </div>
    </article>
  );
};

export default AnnouncementTemplateAdminCard;
