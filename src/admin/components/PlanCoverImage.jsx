import React from 'react';
import { getValidatedUploadFile } from '../../utils/fileUpload';

const SIZE_CLASS = {
  form: 'plan-cover-image--form',
  grid: 'plan-cover-image--grid',
};

const PlanCoverImage = ({
  preview,
  onFile,
  onRemove,
  editable = false,
  alt = 'Plan cover',
  size = 'form',
  className = '',
}) => {
  const hasImage = Boolean(preview);
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.form;

  if (!editable) {
    return (
      <div
        className={`plan-cover-image plan-cover-image--display ${sizeClass} ${className}`.trim()}
      >
        {hasImage ? (
          <img src={preview} alt={alt} className="plan-cover-image__img" />
        ) : (
          <div className="plan-cover-image__placeholder" aria-hidden="true">
            <i className="bi bi-box-seam" />
            <span>Plan cover</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`plan-cover-image plan-cover-image--upload ${sizeClass} ${className}`.trim()}
    >
      <label className="plan-cover-image__frame">
        {hasImage ? (
          <img src={preview} alt={alt} className="plan-cover-image__img" />
        ) : (
          <div className="plan-cover-image__placeholder">
            <i className="bi bi-image" />
            <span>Upload image</span>
            <small>Plan cover (max 2MB)</small>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="d-none"
          onChange={(e) => {
            const file = getValidatedUploadFile(e);
            if (file) onFile?.(file);
          }}
        />
      </label>
      {hasImage && onRemove && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger plan-cover-image__remove"
          onClick={onRemove}
        >
          <i className="bi bi-trash me-1" />
          Remove
        </button>
      )}
    </div>
  );
};

export default PlanCoverImage;
