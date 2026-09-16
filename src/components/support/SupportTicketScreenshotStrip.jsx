import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  validateUploadFile,
  isCloudflareAccessEnabled,
  imageAccessDenied,
} from '../../utils/fileUpload';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { getSupportImagePath } from '../../utils/supportImages';

const SupportTicketScreenshotStrip = ({
  images = [],
  maxSlots = 5,
  onUploadFiles,
  onDeleteImage,
  canDelete = false,
  onPreview,
  uploading = false,
}) => {
  const inputRef = useRef(null);
  const [deletingPath, setDeletingPath] = useState(null);
  const used = images.length;
  const slotsLeft = Math.max(0, maxSlots - used);
  const canAdd = slotsLeft > 0 && !uploading && !deletingPath;
  const uploadEnabled = isCloudflareAccessEnabled();

  const openPicker = () => {
    if (!canAdd) return;
    if (!uploadEnabled) {
      toast.error(imageAccessDenied || 'Image upload is not available.');
      return;
    }
    inputRef.current?.click();
  };

  const handleFiles = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (inputRef.current) inputRef.current.value = '';
    if (!picked.length || !onUploadFiles) return;

    const valid = [];
    picked.forEach((file) => {
      if (valid.length >= slotsLeft) return;
      if (validateUploadFile(file)) valid.push(file);
    });

    if (!valid.length) return;
    if (picked.length > valid.length || picked.length > slotsLeft) {
      toast.error(`You can add up to ${slotsLeft} more screenshot${slotsLeft === 1 ? '' : 's'}`);
    }

    await onUploadFiles(valid);
  };

  const handleDelete = async (img) => {
    const path = getSupportImagePath(img);
    if (!path || !onDeleteImage || deletingPath) return;
    setDeletingPath(path);
    try {
      await onDeleteImage(path);
    } catch (error) {
      toast.error(error?.message || 'Failed to remove screenshot');
    } finally {
      setDeletingPath(null);
    }
  };

  if (used === 0 && slotsLeft === 0) {
    return (
      <p className="small text-muted mb-0">Maximum screenshots reached for this ticket.</p>
    );
  }

  return (
    <div className="support-screenshot-strip" aria-labelledby="ticket-screenshots-heading">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="d-none"
        onChange={handleFiles}
        disabled={!canAdd || !uploadEnabled}
      />

      {images.map((img, index) => {
        const url = img.url || resolveImageUrl(img);
        const path = getSupportImagePath(img);
        if (!url) return null;
        const isDeleting = deletingPath === path;
        return (
          <div key={path || index} className="support-screenshot-strip__item">
            <button
              type="button"
              className="support-screenshot-strip__thumb support-image-thumb support-image-thumb--btn"
              onClick={() => onPreview?.(url)}
              title="View screenshot"
              disabled={isDeleting}
            >
              <img src={url} alt={`Screenshot ${index + 1}`} loading="lazy" />
            </button>
            {canDelete && onDeleteImage && (
              <button
                type="button"
                className="support-thumb-delete"
                onClick={() => handleDelete(img)}
                disabled={isDeleting || uploading}
                aria-label="Remove screenshot"
              >
                {isDeleting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <i className="bi bi-x" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        );
      })}

      {slotsLeft > 0 && (
        <button
          type="button"
          className="support-screenshot-strip__add"
          onClick={openPicker}
          disabled={!canAdd}
          title={uploadEnabled ? 'Add screenshot' : 'Upload unavailable'}
          aria-label="Add screenshot"
        >
          {uploading ? (
            <span className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
          ) : (
            <i className="bi bi-image" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
};

export default SupportTicketScreenshotStrip;
