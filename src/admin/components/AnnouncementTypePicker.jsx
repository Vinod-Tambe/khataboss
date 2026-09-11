import React from 'react';
import {
  ANNOUNCEMENT_TYPE_CONFIG,
  ANNOUNCEMENT_TYPE_ORDER,
} from '../../constants/announcementTypes';

const AnnouncementTypePicker = ({ value, onChange }) => (
  <div className="announcement-type-picker">
    <label className="form-label fw-semibold">Announcement Type *</label>
    <div className="announcement-type-picker__grid">
      {ANNOUNCEMENT_TYPE_ORDER.map((typeKey) => {
        const config = ANNOUNCEMENT_TYPE_CONFIG[typeKey];
        const isActive = value === typeKey;
        return (
          <button
            key={typeKey}
            type="button"
            className={`announcement-type-picker__option ${isActive ? 'is-active' : ''}`}
            style={{
              '--ann-type-color': config.color,
              '--ann-type-bg': config.bg,
              '--ann-type-border': config.border,
            }}
            onClick={() => onChange(typeKey)}
          >
            <span className="announcement-type-picker__icon">
              <i className={`bi ${config.icon}`} />
            </span>
            <span className="announcement-type-picker__label">{config.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default AnnouncementTypePicker;
