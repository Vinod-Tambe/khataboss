import React from 'react';
import AnnouncementPreviewCard from './AnnouncementPreviewCard';
import {
  dateInputToExpiryEnd,
  dateInputToPublishStart,
  toDateInputValue,
} from '../utils/dateHelpers';

const AnnouncementTemplateScheduleModal = ({
  show,
  item,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!show || !item) return null;

  return (
    <div className="admin-modal-backdrop announcement-form-modal-backdrop">
      <div className="admin-modal-card announcement-form-modal">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-brown mb-1">Schedule announcement</h5>
            <p className="text-muted small mb-0">
              Title and message are fixed for this system template. Set when owners should see it on
              their dashboard.
            </p>
          </div>
          <button type="button" className="btn btn-light btn-sm" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-lg-7">
              <div className="mb-3">
                <label className="form-label text-muted small mb-1">Template</label>
                <div className="fw-semibold">{item.ann_title}</div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Start date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <p className="small text-muted mb-0">
                Visible from start of the start date through end of the end date (owner local time).
                {String(item.ann_template_key || '').startsWith('software_') && (
                  <>
                    {' '}
                    While live, the owner login screen shows this notice and hides the sign-in form.
                  </>
                )}
              </p>
            </div>

            <div className="col-lg-5">
              <AnnouncementPreviewCard item={item} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-2 pt-3 border-top">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn admin-announcement-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const templateScheduleDefaultsFromItem = (item) => {
  if (!item) return { startDate: '', endDate: '' };
  const inactive = item.ann_status === 'Inactive';
  return {
    startDate: inactive ? '' : toDateInputValue(item.ann_publish_at),
    endDate: inactive ? '' : toDateInputValue(item.ann_expires_at),
  };
};

export const buildTemplateSchedulePayload = (startDate, endDate) => {
  const publish = dateInputToPublishStart(startDate);
  const expiry = dateInputToExpiryEnd(endDate);
  if (!publish || !expiry) {
    throw new Error('Start date and end date are required.');
  }
  if (expiry <= publish) {
    throw new Error('End date must be on or after start date.');
  }
  return {
    ann_publish_at: publish.toISOString(),
    ann_expires_at: expiry.toISOString(),
  };
};

export default AnnouncementTemplateScheduleModal;
