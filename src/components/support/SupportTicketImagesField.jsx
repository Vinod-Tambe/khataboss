import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import { validateUploadFile, isCloudflareAccessEnabled, imageAccessDenied } from '../../utils/fileUpload';
import { DEFAULT_MAX_OTHER_IMAGES } from '../common/OtherImagesUpload';

const thumbStyle = {
  width: 72,
  height: 72,
  objectFit: 'cover',
  borderRadius: 10,
  border: '1px solid var(--app-border, #dee2e6)',
};

const SupportTicketImagesField = ({
  newImages = [],
  onAddNew,
  onRemoveNew,
  onPreview,
  maxCount = DEFAULT_MAX_OTHER_IMAGES,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const totalCount = newImages.length;
  const canAdd = !disabled && totalCount < maxCount;

  const handlePick = () => {
    if (!canAdd) return;
    inputRef.current?.click();
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let added = 0;
    files.forEach((file) => {
      if (totalCount + added >= maxCount) return;
      if (!validateUploadFile(file)) return;
      onAddNew?.({ file, preview: URL.createObjectURL(file) });
      added += 1;
    });

    if (totalCount + added >= maxCount && files.length > added) {
      toast.error(`Maximum ${maxCount} screenshots allowed`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="support-ticket-images">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <label className="form-label fw-bold small text-muted mb-0">
          Screenshots <span className="fw-normal">(optional, max {maxCount})</span>
        </label>
        <span className="small text-muted">{totalCount}/{maxCount}</span>
      </div>

      {!isCloudflareAccessEnabled() && (
        <p className="small text-warning mb-2">
          {imageAccessDenied || 'Image upload is disabled until Cloudflare storage is enabled.'}
        </p>
      )}

      <div className="support-ticket-images__dropzone">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="d-none"
          onChange={handleFiles}
          disabled={!canAdd}
        />
        <button
          type="button"
          className="support-ticket-images__add-btn"
          onClick={handlePick}
          disabled={!canAdd}
        >
          <i className="bi bi-image fs-4 d-block mb-1" aria-hidden="true" />
          <span className="fw-semibold">Add screenshot</span>
          <span className="small text-muted">JPG, PNG · max 2MB each</span>
        </button>

        {newImages.length > 0 && (
          <div className="support-ticket-images__gallery">
            {newImages.map((img, index) => (
              <div key={img.preview || index} className="support-ticket-images__thumb-wrap">
                <button
                  type="button"
                  className="btn btn-link p-0 border-0"
                  onClick={() => onPreview?.(img.preview)}
                  title="View"
                >
                  <img src={img.preview} alt={`Screenshot ${index + 1}`} style={thumbStyle} />
                </button>
                <button
                  type="button"
                  className="support-ticket-images__remove"
                  onClick={() => onRemoveNew?.(index)}
                  aria-label="Remove screenshot"
                >
                  <i className="bi bi-x" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketImagesField;
