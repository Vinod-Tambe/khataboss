import React, { useCallback, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import SupportCompactScreenshotPicker from './SupportCompactScreenshotPicker';
import { DEFAULT_MAX_OTHER_IMAGES } from '../common/OtherImagesUpload';
import {
  SUPPORT_PRIORITIES,
  PRIORITY_LABELS,
  SUPPORT_TITLE_MIN,
  SUPPORT_TITLE_MAX,
  SUPPORT_BODY_MIN,
  SUPPORT_BODY_MAX,
} from '../../constants/supportTicket';
import {
  isSupportTicketFormValid,
  validateSupportTicketFields,
} from '../../utils/supportTicketValidation';

const MAX_SCREENSHOTS = DEFAULT_MAX_OTHER_IMAGES;

const revokePreviews = (items) => {
  items.forEach((item) => {
    if (item?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
  });
};

const CreateSupportTicketModal = ({ show, onClose, onSubmit, saving }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [newImages, setNewImages] = useState([]);
  const [previewSrc, setPreviewSrc] = useState(null);

  const reset = useCallback(() => {
    setNewImages((prev) => {
      revokePreviews(prev);
      return [];
    });
    setTitle('');
    setBody('');
    setPriority('Medium');
    setPreviewSrc(null);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSupportTicketFields(title, body);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    try {
      await onSubmit({
        title: title.trim(),
        body: body.trim(),
        priority,
        images: newImages.map((item) => item.file),
      });
      reset();
    } catch {
      /* parent shows toast */
    }
  };

  const handleAddNew = (item) => {
    setNewImages((prev) => [...prev, item]);
  };

  const handleRemoveNew = (index) => {
    setNewImages((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (removed?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      next.splice(index, 1);
      return next;
    });
  };

  const formValid = isSupportTicketFormValid(title, body);

  return (
    <>
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end"
        className="support-ticket-drawer support-board-drawer support-ticket-create-drawer"
        backdrop
      >
        <Offcanvas.Header closeButton className="border-bottom support-ticket-drawer__header">
          <Offcanvas.Title className="h6 fw-bold text-brown mb-0">
            New support ticket
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 support-ticket-drawer__body support-ticket-create-drawer__body">
          <form
            onSubmit={handleSubmit}
            className="support-ticket-create-form support-ticket-drawer__form support-ticket-create-drawer__form"
          >
            <div className="support-ticket-create-drawer__scroll support-ticket-drawer__section">
              <div className="p-3">
          <div className="mb-2">
            <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-ticket-title">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="support-ticket-title"
              className="form-control border-dark"
              minLength={SUPPORT_TITLE_MIN}
              maxLength={SUPPORT_TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary (max 50 characters)"
              required
              autoComplete="off"
            />
            <div
              className={`form-text text-end small ${
                title.length > SUPPORT_TITLE_MAX ? 'text-danger' : ''
              }`}
            >
              {title.length}/{SUPPORT_TITLE_MAX}
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-ticket-body">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="support-ticket-body"
              className="form-control border-dark"
              rows={5}
              minLength={SUPPORT_BODY_MIN}
              maxLength={SUPPORT_BODY_MAX}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened? Steps to reproduce, error messages, device/browser…"
              required
            />
            <div
              className={`form-text text-end small ${
                body.length > SUPPORT_BODY_MAX ? 'text-danger' : ''
              }`}
            >
              {body.length}/{SUPPORT_BODY_MAX} (min {SUPPORT_BODY_MIN})
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-ticket-priority">
              Priority
            </label>
            <select
              id="support-ticket-priority"
              className="form-select border-dark"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {SUPPORT_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className="mb-0">
            <label className="form-label fw-bold small text-muted mb-1">
              Screenshots <span className="fw-normal">(optional, max {MAX_SCREENSHOTS})</span>
            </label>
            <SupportCompactScreenshotPicker
              newImages={newImages}
              onAddNew={handleAddNew}
              onRemoveNew={handleRemoveNew}
              onPreview={setPreviewSrc}
              maxCount={MAX_SCREENSHOTS}
              disabled={saving}
            />
          </div>
              </div>
            </div>

            <div className="support-ticket-create-drawer__footer p-3 border-top">
              <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-bold"
                  disabled={saving || !formValid}
                >
                  {saving ? 'Submitting…' : 'Submit ticket'}
                </button>
              </div>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>

      {previewSrc && (
        <div
          className="support-ticket-create-preview"
          role="dialog"
          aria-label="Image preview"
          onClick={() => setPreviewSrc(null)}
        >
          <button
            type="button"
            className="support-ticket-create-preview__close"
            onClick={() => setPreviewSrc(null)}
            aria-label="Close preview"
          >
            <i className="bi bi-x-lg" />
          </button>
          <img src={previewSrc} alt="Screenshot preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

export default CreateSupportTicketModal;
