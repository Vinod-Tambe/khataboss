import React, { useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  addAdminSupportComment,
  getAdminSupportTicket,
  updateAdminSupportComment,
  updateAdminSupportTicket,
} from '../api/supportApi';
import SupportCommentThread from '../../components/support/SupportCommentThread';
import SupportStatusBadge from '../../components/support/SupportStatusBadge';
import SupportStatusLabel from '../../components/support/SupportStatusLabel';
import SupportStatusSelect from '../../components/support/SupportStatusSelect';
import {
  ADMIN_TICKET_STATUSES,
  ADMIN_STATUS_LABELS,
  OWNER_TICKET_STATUSES,
  OWNER_STATUS_LABELS,
  SUPPORT_PRIORITIES,
  PRIORITY_LABELS,
  SUPPORT_TITLE_MAX,
  SUPPORT_BODY_MAX,
  SUPPORT_TITLE_MIN,
  SUPPORT_BODY_MIN,
  formatTicketNo,
} from '../../constants/supportTicket';
import { validateSupportTicketFields } from '../../utils/supportTicketValidation';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { formatDateTime } from '../../utils/dateFormat';
import { toDateTimeInputValue } from '../utils/dateHelpers';

const SupportTicketAdminDrawer = ({ ticketUuid, show, onHide, onUpdated, refreshToken = 0 }) => {
  const admin = useSelector((state) => state.adminAuth.user);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [form, setForm] = useState({
    st_title: '',
    st_body: '',
    st_priority: 'Medium',
    st_admin_status: 'Todo',
    st_owner_status: 'Sent',
    st_expected_delivery_at: '',
  });

  useEffect(() => {
    if (!show || !ticketUuid) return undefined;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminSupportTicket(ticketUuid);
        const data = res.data;
        setTicket(data);
        setForm({
          st_title: data.st_title || '',
          st_body: data.st_body || '',
          st_priority: data.st_priority || 'Medium',
          st_admin_status: data.st_admin_status || 'Todo',
          st_owner_status: data.st_owner_status || 'Sent',
          st_expected_delivery_at: toDateTimeInputValue(data.st_expected_delivery_at),
        });
      } catch (error) {
        toast.error(error.message || 'Failed to load ticket');
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [show, ticketUuid, refreshToken]);

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validateSupportTicketFields(form.st_title, form.st_body);
    if (!validation.ok) {
      toast.error(validation.message);
      return;
    }
    setSaving(true);
    try {
      const res = await updateAdminSupportTicket(ticketUuid, {
        st_title: form.st_title.trim(),
        st_body: form.st_body.trim(),
        st_priority: form.st_priority,
        st_admin_status: form.st_admin_status,
        st_owner_status: form.st_owner_status,
        st_expected_delivery_at: form.st_expected_delivery_at || null,
      });
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success('Ticket updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async ({ body, images }) => {
    setSubmittingComment(true);
    try {
      const res = await addAdminSupportComment(ticketUuid, { body, images });
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const adminStatusOptions = ADMIN_TICKET_STATUSES.map((s) => ({
    value: s,
    label: ADMIN_STATUS_LABELS[s],
  }));

  const ownerStatusOptions = OWNER_TICKET_STATUSES.map((s) => ({
    value: s,
    label: OWNER_STATUS_LABELS[s],
  }));

  const handleUpdateComment = async (commentUuid, payload) => {
    setSubmittingComment(true);
    try {
      const res = await updateAdminSupportComment(ticketUuid, commentUuid, payload);
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success('Comment updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update comment');
      throw error;
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className="support-ticket-drawer support-board-drawer"
      scroll
      backdrop
    >
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="h6 fw-bold text-brown">
          {ticket ? formatTicketNo(ticket.ticket_no) : 'Ticket'}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        {loading && (
          <div className="text-center text-muted py-5">
            <div className="spinner-border spinner-border-sm" role="status" />
          </div>
        )}

        {!loading && ticket && (
          <>
          <form onSubmit={handleSave} className="support-board-drawer__form">
            <div className="p-3 border-bottom">
              <div className="small text-muted mb-2">
                <div className="fw-semibold text-dark">{ticket.owner?.name}</div>
                <div>{ticket.owner?.own_login_id || ticket.owner?.own_mobile_no || ticket.owner?.own_email}</div>
                <div>Created {formatDateTime(ticket.st_created_at)}</div>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <SupportStatusBadge kind="priority" value={ticket.st_priority} />
                <SupportStatusLabel kind="admin" value={ticket.st_admin_status} />
                <SupportStatusLabel kind="owner" value={ticket.st_owner_status} />
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold small text-muted">Title</label>
                <input
                  className="form-control border-dark"
                  maxLength={SUPPORT_TITLE_MAX}
                  value={form.st_title}
                  onChange={(e) => setForm((f) => ({ ...f, st_title: e.target.value }))}
                  required
                />
                <div className="form-text text-end small">
                  {form.st_title.length}/{SUPPORT_TITLE_MAX} (min {SUPPORT_TITLE_MIN})
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold small text-muted">Description</label>
                <textarea
                  className="form-control border-dark"
                  rows={6}
                  maxLength={SUPPORT_BODY_MAX}
                  value={form.st_body}
                  onChange={(e) => setForm((f) => ({ ...f, st_body: e.target.value }))}
                  required
                />
                <div className="form-text text-end small">
                  {form.st_body.length}/{SUPPORT_BODY_MAX} (min {SUPPORT_BODY_MIN})
                </div>
              </div>

              {ticket.st_images?.length > 0 && (
                <div className="mb-2">
                  <label className="form-label fw-bold small text-muted">Screenshots</label>
                  <div className="d-flex flex-wrap gap-2">
                    {ticket.st_images.map((img, index) => {
                      const url = img.url || resolveImageUrl(img);
                      if (!url) return null;
                      return (
                        <a key={img.path || index} href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt=""
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-bottom bg-light-subtle">
              <h6 className="fw-bold small text-muted mb-2">Board & owner status</h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label small">Admin column</label>
                  <SupportStatusSelect
                    kind="admin"
                    value={form.st_admin_status}
                    options={adminStatusOptions}
                    onChange={(v) => setForm((f) => ({ ...f, st_admin_status: v }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Owner status</label>
                  <SupportStatusSelect
                    kind="owner"
                    value={form.st_owner_status}
                    options={ownerStatusOptions}
                    onChange={(v) => setForm((f) => ({ ...f, st_owner_status: v }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Priority</label>
                  <select
                    className="form-select border-dark"
                    value={form.st_priority}
                    onChange={(e) => setForm((f) => ({ ...f, st_priority: e.target.value }))}
                  >
                    {SUPPORT_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Expected delivery</label>
                  <input
                    type="datetime-local"
                    className="form-control border-dark"
                    value={form.st_expected_delivery_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, st_expected_delivery_at: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3 fw-bold" disabled={saving}>
                {saving ? 'Saving…' : 'Save ticket'}
              </button>
            </div>
          </form>

            <div className="p-3 support-ticket-drawer__activity">
              <SupportCommentThread
                comments={ticket.comments || []}
                currentRole="Admin"
                currentUuid={admin?.admin_uuid}
                activityAudience="admin"
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                submitting={submittingComment}
              />
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SupportTicketAdminDrawer;
