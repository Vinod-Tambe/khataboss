import React, { useRef } from 'react';
import { FiTrash2, FiUpload } from 'react-icons/fi';
import { readImageFileAsDataUrl } from '../../../utils/formTemplate/formTemplateImageAssets';

const Form8BuilderImageUpload = ({
  label,
  previewUrl,
  sourceHint,
  onChange,
  onClear,
  disabled = false,
}) => {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      onChange(null, err.message || 'Upload failed');
    }
  };

  return (
    <div className="f8-image-upload">
      <label className="form-label">{label}</label>
      <div className="f8-image-upload-row">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="f8-image-upload-preview" />
        ) : (
          <div className="f8-image-upload-empty">No image</div>
        )}
        <div className="f8-image-upload-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <FiUpload size={14} className="me-1" />
            Upload
          </button>
          {previewUrl ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              disabled={disabled}
              onClick={onClear}
            >
              <FiTrash2 size={14} className="me-1" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="d-none"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
      />
      {sourceHint ? <p className="form-custom-form-hint mb-0 mt-1">{sourceHint}</p> : null}
    </div>
  );
};

export default Form8BuilderImageUpload;
