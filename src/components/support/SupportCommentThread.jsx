import React, { useCallback, useState } from 'react';
import { formatDateTime } from '../../utils/dateFormat';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { getSupportImagePath } from '../../utils/supportImages';
import SupportCommentComposer from './SupportCommentComposer';
import { SUPPORT_COMMENT_MAX_IMAGES } from '../../constants/supportTicket';
import {
  formatSupportActivityBody,
  getSupportActivityPreview,
  isSupportActivityHistory,
  supportActivityNeedsExpand,
} from '../../utils/supportActivity';

const revokePreviews = (items) => {
  items.forEach((item) => {
    if (item?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
  });
};

const commentWasEdited = (comment) => {
  if (!comment?.stc_updated_at || !comment?.stc_created_at) return false;
  const delta =
    new Date(comment.stc_updated_at).getTime() - new Date(comment.stc_created_at).getTime();
  return delta > 1500;
};

const SupportCommentThread = ({
  comments = [],
  currentRole,
  currentUuid,
  onAddComment,
  onUpdateComment,
  submitting = false,
  activityAudience = 'owner',
}) => {
  const [newComment, setNewComment] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editNewImages, setEditNewImages] = useState([]);
  const [editRemovePaths, setEditRemovePaths] = useState([]);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [expandedActivities, setExpandedActivities] = useState(() => new Set());

  const toggleActivityExpand = (commentUuid) => {
    setExpandedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(commentUuid)) next.delete(commentUuid);
      else next.add(commentUuid);
      return next;
    });
  };

  const clearNewImages = useCallback(() => {
    setNewImages((prev) => {
      revokePreviews(prev);
      return [];
    });
  }, []);

  const clearEditImages = useCallback(() => {
    setEditNewImages((prev) => {
      revokePreviews(prev);
      return [];
    });
    setEditRemovePaths([]);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    const files = newImages.map((item) => item.file).filter(Boolean);
    if ((!text && !files.length) || !onAddComment) return;
    await onAddComment({ body: text, images: files });
    setNewComment('');
    clearNewImages();
  };

  const startEdit = (comment) => {
    setEditingId(comment.stc_uuid);
    setEditText(comment.stc_body);
    clearEditImages();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    clearEditImages();
  };

  const saveEdit = async (comment) => {
    const text = editText.trim();
    const files = editNewImages.map((item) => item.file).filter(Boolean);
    const keptExisting = (comment.stc_images || []).filter((img) => {
      const p = getSupportImagePath(img);
      return p && !editRemovePaths.includes(p);
    });

    if (!text && !files.length && !keptExisting.length) return;
    if (!onUpdateComment) return;

    await onUpdateComment(comment.stc_uuid, {
      body: text,
      images: files,
      removePaths: editRemovePaths,
    });
    cancelEdit();
  };

  const canEdit = (comment) =>
    !isSupportActivityHistory(comment)
    && comment.stc_author_role === currentRole
    && comment.stc_author_uuid === currentUuid;

  const forOwnerActivity = activityAudience === 'owner';
  const forAdminActivity = activityAudience === 'admin';

  const canPost = newComment.trim() || newImages.length > 0;

  const getEntryVisual = (comment, isHistory) => {
    if (isHistory) {
      return {
        itemClass: 'support-activity__item--history',
        iconClass: 'support-activity__icon--history',
        icon: 'bi-arrow-repeat',
        iconLabel: 'Activity',
      };
    }
    const isSent =
      comment.stc_author_role === currentRole && comment.stc_author_uuid === currentUuid;
    if (isSent) {
      return {
        itemClass: 'support-activity__item--sent',
        iconClass: 'support-activity__icon--sent',
        icon: 'bi-send-fill',
        iconLabel: 'Sent',
      };
    }
    return {
      itemClass: 'support-activity__item--received',
      iconClass: 'support-activity__icon--received',
      icon: 'bi-inbox-fill',
      iconLabel: 'Received',
    };
  };

  const markImageRemoved = (path) => {
    if (!path) return;
    setEditRemovePaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  return (
    <div className="support-comments support-activity">
      <form onSubmit={handleAdd} className="support-activity__composer support-activity__composer--top mb-3">
        <label className="form-label fw-bold small text-muted mb-1">Add comment</label>
        <SupportCommentComposer
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={submitting}
          newImages={newImages}
          maxCount={SUPPORT_COMMENT_MAX_IMAGES}
          onAddNew={(item) => setNewImages((prev) => [...prev, item])}
          onRemoveNew={(index) => {
            setNewImages((prev) => {
              const next = [...prev];
              const removed = next[index];
              if (removed?.preview?.startsWith('blob:')) {
                URL.revokeObjectURL(removed.preview);
              }
              next.splice(index, 1);
              return next;
            });
          }}
          onPreview={setLightboxUrl}
        />
        <button
          type="submit"
          className="btn btn-primary mt-2 px-4 fw-bold"
          disabled={submitting || !canPost}
        >
          {submitting ? 'Sending…' : 'Post comment'}
        </button>
      </form>

      <h6 className="support-activity__history-title small fw-bold text-muted mb-2">
        Activity & comment history
      </h6>

      {comments.length === 0 && (
        <p className="text-muted small mb-3">No activity yet.</p>
      )}

      <ul className="list-unstyled support-activity__feed mb-0">
        {comments.map((comment) => {
          const isHistory = isSupportActivityHistory(comment);
          const displayBody = isHistory
            ? formatSupportActivityBody(comment.stc_body, {
                forOwner: forOwnerActivity,
                forAdmin: forAdminActivity,
              })
            : comment.stc_body;
          const images = comment.stc_images || [];
          const edited = !isHistory && commentWasEdited(comment);
          const isEditing = editingId === comment.stc_uuid;

          const visibleExistingInEdit = isEditing
            ? images.filter((img) => {
                const p = getSupportImagePath(img);
                return p && !editRemovePaths.includes(p);
              })
            : images;

          const editExistingForComposer = isEditing
            ? visibleExistingInEdit
                .map((img) => {
                  const path = getSupportImagePath(img);
                  const preview = img.url || resolveImageUrl(img);
                  if (!path || !preview) return null;
                  return { path, preview };
                })
                .filter(Boolean)
            : [];

          const visual = getEntryVisual(comment, isHistory);
          const isSentMessage = visual.itemClass === 'support-activity__item--sent';
          const activityExpanded = expandedActivities.has(comment.stc_uuid);
          const activityCanExpand = isHistory && supportActivityNeedsExpand(displayBody);
          const activityPreview = isHistory ? getSupportActivityPreview(displayBody) : '';

          return (
            <li
              key={comment.stc_uuid}
              className={`support-activity__item ${visual.itemClass}`}
            >
              <span
                className={`support-activity__icon ${visual.iconClass}`}
                title={visual.iconLabel}
              >
                <i className={`bi ${visual.icon}`} aria-hidden="true" />
                <span className="visually-hidden">{visual.iconLabel}</span>
              </span>

              <div className="support-activity__card">
                <div className="support-comments__meta">
                  <div className="support-comments__meta-left">
                    <span className="support-comments__author">{comment.stc_author_name}</span>
                    {isHistory && forOwnerActivity && (
                      <span className="support-activity__badge support-activity__badge--activity">
                        Status & updates
                      </span>
                    )}
                    {isHistory && forAdminActivity && (
                      <span className="support-activity__badge support-activity__badge--activity">
                        Ticket update
                      </span>
                    )}
                    {!isHistory && isSentMessage && (
                      <span className="support-activity__badge support-activity__badge--sent">Sent</span>
                    )}
                    {!isHistory && !isSentMessage && (
                      <>
                        <span className="support-activity__badge support-activity__badge--received">
                          Received
                        </span>
                        <span className="support-comments__role">
                          {comment.stc_author_role === 'Admin' ? 'Super Admin' : 'Owner'}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="support-comments__meta-right">
                    {canEdit(comment) && !isEditing && (
                      <button
                        type="button"
                        className="support-icon-btn"
                        onClick={() => startEdit(comment)}
                        aria-label="Edit comment"
                        title="Edit comment"
                      >
                        <i className="bi bi-pencil" aria-hidden="true" />
                      </button>
                    )}
                    <time className="support-comments__time text-muted small" title={edited ? 'Last edited' : undefined}>
                      {edited
                        ? `Edited ${formatDateTime(comment.stc_updated_at)}`
                        : formatDateTime(comment.stc_created_at)}
                    </time>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-2 support-comment-edit">
                    <SupportCommentComposer
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Write your message…"
                      disabled={submitting}
                      newImages={editNewImages}
                      existingImages={editExistingForComposer}
                      maxCount={SUPPORT_COMMENT_MAX_IMAGES}
                      onAddNew={(item) => setEditNewImages((prev) => [...prev, item])}
                      onRemoveNew={(index) => {
                        setEditNewImages((prev) => {
                          const next = [...prev];
                          const removed = next[index];
                          if (removed?.preview?.startsWith('blob:')) {
                            URL.revokeObjectURL(removed.preview);
                          }
                          next.splice(index, 1);
                          return next;
                        });
                      }}
                      onRemoveExisting={markImageRemoved}
                      onPreview={setLightboxUrl}
                    />
                    <div className="d-flex gap-2 mt-2">
                      <button
                        type="button"
                        className="support-icon-btn support-icon-btn--primary"
                        disabled={submitting}
                        onClick={() => saveEdit(comment)}
                        aria-label="Save comment"
                        title="Save"
                      >
                        <i className="bi bi-check-lg" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="support-icon-btn"
                        onClick={cancelEdit}
                        aria-label="Cancel edit"
                        title="Cancel"
                      >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {isHistory && (displayBody || activityPreview) && (
                      activityCanExpand ? (
                        <button
                          type="button"
                          className={`support-activity__history-toggle w-100 text-start ${
                            activityExpanded ? 'is-expanded' : ''
                          }`}
                          onClick={() => toggleActivityExpand(comment.stc_uuid)}
                          aria-expanded={activityExpanded}
                          aria-label={activityExpanded ? 'Collapse activity details' : 'Show full activity details'}
                        >
                          <span
                            className={`support-activity__history-preview ${
                              activityExpanded ? 'd-none' : ''
                            }`}
                          >
                            {activityPreview}
                          </span>
                          {activityExpanded && (
                            <span className="support-activity__history-body support-comments__body d-block mb-0">
                              {displayBody}
                            </span>
                          )}
                          <i
                            className={`bi support-activity__history-chevron ${
                              activityExpanded ? 'bi-chevron-up' : 'bi-chevron-down'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <p className="support-activity__history-body support-activity__history-line support-comments__body mb-1">
                          {displayBody || `• ${activityPreview}`}
                        </p>
                      )
                    )}
                    {!isHistory && displayBody && (
                      <p className="support-comments__body mb-1">{displayBody}</p>
                    )}
                    {images.length > 0 && (
                      <div className="support-activity__images support-activity__images--row mt-2">
                        {images.map((img, imgIndex) => {
                          const url = img.url || resolveImageUrl(img);
                          if (!url) return null;
                          return (
                            <button
                              key={getSupportImagePath(img) || imgIndex}
                              type="button"
                              className="support-activity__image-thumb"
                              onClick={() => setLightboxUrl(url)}
                              title="View image"
                            >
                              <img src={url} alt={`Attachment ${imgIndex + 1}`} loading="lazy" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {lightboxUrl && (
        <div
          className="support-ticket-create-preview"
          role="dialog"
          aria-label="Attachment preview"
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
          <img src={lightboxUrl} alt="Attachment full size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default SupportCommentThread;
