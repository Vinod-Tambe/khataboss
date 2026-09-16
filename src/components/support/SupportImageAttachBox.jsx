import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  validateUploadFile,
  isCloudflareAccessEnabled,
  imageAccessDenied,
} from '../../utils/fileUpload';

const SupportImageAttachBox = ({
  children,
  newImages = [],
  existingImages = [],
  maxCount = 3,
  onAddNew,
  onRemoveNew,
  onRemoveExisting,
  onPreview,
  disabled = false,
  maxLabel = 'images',
  className = '',
}) => {
  const inputRef = useRef(null);
  const existingCount = (existingImages || []).length;
  const newCount = newImages.length;
  const totalCount = existingCount + newCount;
  const canAdd = !disabled && totalCount < maxCount;
  const uploadEnabled = isCloudflareAccessEnabled();

  const handlePick = () => {
    if (!canAdd) {
      if (totalCount >= maxCount) {
        toast.error(`Maximum ${maxCount} ${maxLabel} allowed`);
      }
      return;
    }
    if (!uploadEnabled) {
      toast.error(imageAccessDenied || 'Image upload is not available.');
      return;
    }
    inputRef.current?.click();
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let added = 0;
    const startTotal = existingCount + newCount;
    files.forEach((file) => {
      if (startTotal + added >= maxCount) return;
      if (!validateUploadFile(file)) return;
      onAddNew?.({ file, preview: URL.createObjectURL(file) });
      added += 1;
    });

    if (startTotal + added >= maxCount && files.length > added) {
      toast.error(`Maximum ${maxCount} ${maxLabel} allowed`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const attachTitle = uploadEnabled
    ? `Add image (${totalCount}/${maxCount})`
    : 'Image upload unavailable';

  return (
    <div className={`support-comment-compose ${className}`.trim()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="d-none"
        onChange={handleFiles}
        disabled={!canAdd || !uploadEnabled}
      />

      <button
        type="button"
        className="support-comment-compose__attach"
        onClick={handlePick}
        disabled={disabled || !canAdd}
        title={attachTitle}
        aria-label="Add image"
      >
        <i className="bi bi-image" aria-hidden="true" />
      </button>

      {children}

      {(existingCount > 0 || newCount > 0) && (
        <div className="support-comment-compose__thumbs">
          {(existingImages || []).map((img) => (
            <div key={img.path || img.preview} className="support-comment-compose__thumb">
              <button
                type="button"
                className="support-comment-compose__thumb-btn"
                onClick={() => onPreview?.(img.preview)}
                title="Preview"
              >
                <img src={img.preview} alt="Attachment" />
              </button>
              <button
                type="button"
                className="support-comment-compose__thumb-remove"
                onClick={() => onRemoveExisting?.(img.path)}
                disabled={disabled}
                aria-label="Remove image"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            </div>
          ))}
          {newImages.map((img, index) => (
            <div key={img.preview || `new-${index}`} className="support-comment-compose__thumb">
              <button
                type="button"
                className="support-comment-compose__thumb-btn"
                onClick={() => onPreview?.(img.preview)}
                title="Preview"
              >
                <img src={img.preview} alt={`New attachment ${index + 1}`} />
              </button>
              <button
                type="button"
                className="support-comment-compose__thumb-remove"
                onClick={() => onRemoveNew?.(index)}
                disabled={disabled}
                aria-label="Remove image"
              >
                <i className="bi bi-x" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportImageAttachBox;
