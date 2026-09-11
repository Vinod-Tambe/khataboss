import React from 'react';
import AnnouncementTypePicker from './AnnouncementTypePicker';
import AnnouncementPreviewCard from './AnnouncementPreviewCard';

const AnnouncementFormModal = ({
  show,
  editingUuid,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="admin-modal-backdrop announcement-form-modal-backdrop">
      <div className="admin-modal-card announcement-form-modal">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-brown mb-1">
              {editingUuid ? 'Edit Announcement' : 'Publish Announcement'}
            </h5>
            <p className="text-muted small mb-0">
              Choose a type, write your message, and preview how owners will see it.
            </p>
          </div>
          <button type="button" className="btn btn-light btn-sm" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-lg-7">
              <AnnouncementTypePicker
                value={form.ann_type}
                onChange={(ann_type) => setForm((prev) => ({ ...prev, ann_type }))}
              />

              <div className="mb-3 mt-3">
                <label className="form-label">Title *</label>
                <input
                  className="form-control"
                  value={form.ann_title}
                  onChange={(e) => setForm((p) => ({ ...p, ann_title: e.target.value }))}
                  placeholder="e.g. Festival offer for all jewelry shops"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={form.ann_body}
                  onChange={(e) => setForm((p) => ({ ...p, ann_body: e.target.value }))}
                  placeholder="Write the full announcement message..."
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Publish Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.ann_publish_at}
                    onChange={(e) => setForm((p) => ({ ...p, ann_publish_at: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.ann_expires_at}
                    onChange={(e) => setForm((p) => ({ ...p, ann_expires_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.ann_status}
                    onChange={(e) => setForm((p) => ({ ...p, ann_status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sort Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.ann_sort_order}
                    onChange={(e) => setForm((p) => ({ ...p, ann_sort_order: e.target.value }))}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="ann_is_pinned_modal"
                      checked={form.ann_is_pinned}
                      onChange={(e) => setForm((p) => ({ ...p, ann_is_pinned: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="ann_is_pinned_modal">
                      Pin & show popup
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <AnnouncementPreviewCard item={form} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-2 pt-3 border-top">
            <button type="button" className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Saving...' : editingUuid ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
