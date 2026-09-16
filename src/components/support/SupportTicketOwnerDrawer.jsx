import React, { useCallback, useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  addSupportTicketComment,
  getSupportTicket,
  updateSupportTicket,
  updateSupportTicketComment,
  uploadSupportTicketImages,
  deleteSupportTicketImage,
} from '../../api/supportApi';
import SupportCommentThread from './SupportCommentThread';
import SupportInlineEditableField from './SupportInlineEditableField';
import SupportTicketScreenshotStrip from './SupportTicketScreenshotStrip';
import SupportTicketSummaryGrid from './SupportTicketSummaryGrid';
import { DEFAULT_MAX_OTHER_IMAGES } from '../common/OtherImagesUpload';
import {
  canOwnerEditSupportTicket,
  formatTicketNo,
  SUPPORT_TITLE_MAX,
  SUPPORT_BODY_MAX,
} from '../../constants/supportTicket';
import { validateSupportTicketFields } from '../../utils/supportTicketValidation';

const SupportTicketOwnerDrawer = ({
  ticketUuid,
  show,
  onHide,
  onUpdated,
  refreshToken = 0,
}) => {
  const user = useSelector((state) => state.auth.user);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const loadTicket = useCallback(
    async (silent = false) => {
      if (!ticketUuid) return;
      if (!silent) setLoading(true);
      try {
        const res = await getSupportTicket(ticketUuid);
        setTicket(res.data);
      } catch (error) {
        if (!silent) {
          toast.error(error.message || 'Failed to load ticket');
          setTicket(null);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [ticketUuid]
  );

  useEffect(() => {
    if (!show || !ticketUuid) return undefined;
    loadTicket();
    return undefined;
  }, [show, ticketUuid, refreshToken, loadTicket]);

  useEffect(() => {
    if (!show || !ticketUuid) return undefined;
    const intervalId = window.setInterval(() => loadTicket(true), 30000);
    const onFocus = () => loadTicket(true);
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [show, ticketUuid, loadTicket]);

  const handleAddComment = async ({ body, images }) => {
    setSubmitting(true);
    try {
      const res = await addSupportTicketComment(ticketUuid, { body, images });
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentUuid, payload) => {
    setSubmitting(true);
    try {
      const res = await updateSupportTicketComment(ticketUuid, commentUuid, payload);
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success('Comment updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update comment');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const saveTicketField = async (field, newValue) => {
    const nextTitle = field === 'title' ? newValue : ticket.st_title;
    const nextBody = field === 'body' ? newValue : ticket.st_body;
    const validation = validateSupportTicketFields(nextTitle, nextBody);
    if (!validation.ok) {
      throw new Error(validation.message);
    }
    const payload =
      field === 'title' ? { st_title: newValue } : { st_body: newValue };
    const res = await updateSupportTicket(ticketUuid, payload);
    setTicket(res.data);
    onUpdated?.(res.data);
  };

  const handleDeleteScreenshot = async (imagePath) => {
    const res = await deleteSupportTicketImage(ticketUuid, imagePath);
    setTicket(res.data);
    onUpdated?.(res.data);
    toast.success('Screenshot removed');
  };

  const handleUploadScreenshotFiles = async (files) => {
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      const res = await uploadSupportTicketImages(ticketUuid, files);
      setTicket(res.data);
      onUpdated?.(res.data);
      toast.success(files.length > 1 ? 'Screenshots added' : 'Screenshot added');
    } catch (error) {
      toast.error(error.message || 'Failed to upload screenshots');
    } finally {
      setUploadingImages(false);
    }
  };

  const canEdit = ticket ? canOwnerEditSupportTicket(ticket) : false;
  const existingImageCount = ticket?.st_images?.length || 0;

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="end"
        className="support-ticket-drawer support-board-drawer"
        scroll
        backdrop
      >
        <Offcanvas.Header closeButton className="border-bottom support-ticket-drawer__header">
          <Offcanvas.Title className="h6 fw-bold text-brown mb-0">
            {ticket ? formatTicketNo(ticket.ticket_no) : 'Ticket'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 support-ticket-drawer__body">
          {loading && (
            <div className="text-center text-muted py-5">
              <div className="spinner-border spinner-border-sm" role="status" />
            </div>
          )}

          {!loading && ticket && (
            <div className="support-ticket-drawer__form">
              <div className="p-3 border-bottom support-ticket-drawer__section">
                <SupportInlineEditableField
                  value={ticket.st_title}
                  editable={canEdit}
                  maxLength={SUPPORT_TITLE_MAX}
                  ariaLabel="Ticket title"
                  placeholder="Add a title"
                  className="support-ticket-detail__title-wrap"
                  inputClassName="support-ticket-detail__title-input"
                  onSave={(val) => saveTicketField('title', val)}
                />
                <div className="support-ticket-detail__summary-panel mt-3 pt-3 border-top">
                  <SupportTicketSummaryGrid ticket={ticket} compact />
                </div>
              </div>

              <div className="p-3 border-bottom support-ticket-drawer__section">
                <h6 className="support-detail-section__title mb-2">Description</h6>
                <SupportInlineEditableField
                  value={ticket.st_body}
                  editable={canEdit}
                  multiline
                  maxLength={SUPPORT_BODY_MAX}
                  ariaLabel="Ticket description"
                  placeholder="Add a description"
                  className="support-detail-section__content support-ticket-detail__body-wrap"
                  inputClassName="support-ticket-detail__body-input"
                  onSave={(val) => saveTicketField('body', val)}
                />
              </div>

              <div className="p-3 border-bottom support-ticket-drawer__section">
                <h6 className="support-detail-section__title mb-2">
                  Screenshots ({existingImageCount}/{DEFAULT_MAX_OTHER_IMAGES})
                </h6>
                <SupportTicketScreenshotStrip
                  images={ticket.st_images || []}
                  maxSlots={DEFAULT_MAX_OTHER_IMAGES}
                  uploading={uploadingImages}
                  canDelete={canEdit}
                  onUploadFiles={handleUploadScreenshotFiles}
                  onDeleteImage={handleDeleteScreenshot}
                  onPreview={setLightboxUrl}
                />
              </div>

              <div className="p-3 support-ticket-drawer__activity">
                <h6 className="support-detail-section__title mb-2">Activity & comments</h6>
                <SupportCommentThread
                  comments={ticket.comments || []}
                  currentRole="Owner"
                  currentUuid={user?.own_uuid}
                  activityAudience="owner"
                  onAddComment={handleAddComment}
                  onUpdateComment={handleUpdateComment}
                  submitting={submitting}
                />
              </div>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {lightboxUrl && (
        <div
          className="support-ticket-create-preview"
          role="dialog"
          aria-label="Screenshot"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="support-ticket-create-preview__close"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close"
          >
            <i className="bi bi-x-lg" />
          </button>
          <img src={lightboxUrl} alt="Screenshot full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
};

export default SupportTicketOwnerDrawer;
