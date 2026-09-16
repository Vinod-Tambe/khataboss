import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import CommonModal from '../common/CommonModal';
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

const EditSupportTicketModal = ({ show, ticket, onClose, onSubmit, saving }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (!show || !ticket) return;
    setTitle(ticket.st_title || '');
    setBody(ticket.st_body || '');
    setPriority(ticket.st_priority || 'Medium');
  }, [show, ticket]);

  const handleClose = () => {
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
        st_title: title.trim(),
        st_body: body.trim(),
        st_priority: priority,
      });
    } catch {
      /* parent shows toast */
    }
  };

  const formValid = isSupportTicketFormValid(title, body);

  return (
    <CommonModal show={show} onHide={handleClose} title="Edit ticket" size="lg">
      <form onSubmit={handleSubmit} className="p-3 support-ticket-create-form">
        <div className="mb-2">
          <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-edit-title">
            Title <span className="text-danger">*</span>
          </label>
          <input
            id="support-edit-title"
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
          <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-edit-body">
            Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="support-edit-body"
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
          <label className="form-label fw-bold small text-muted mb-1" htmlFor="support-edit-priority">
            Priority
          </label>
          <select
            id="support-edit-priority"
            className="form-select border-dark"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {SUPPORT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 pt-2 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={saving || !formValid}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </CommonModal>
  );
};

export default EditSupportTicketModal;
