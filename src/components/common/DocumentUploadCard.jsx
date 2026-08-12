
import React from 'react';
import { getValidatedUploadFile } from '../../utils/fileUpload';

const DocumentUploadCard = ({
  title,
  fieldName,
  preview,
  setPreview,
  inputRef,
  accept = "image/*,.pdf",
  showCamera = false,
  handleFileSelect,
  removeFile,
  startWebcam,
  small = false,
  compact = false,
  noBorder = false,
  height = null,
  iconBorder = true,
}) => {
  const isCompact = compact || small;

  if (isCompact) {
    const isPlaceholder =
      preview &&
      typeof preview === 'string' &&
      (preview.includes('flaticon.com') || preview.includes('placeholder'));

    const showPreview = preview && !isPlaceholder;

    return (
      <div className="entity-doc-slot">
        {title && <label className="entity-doc-slot__label">{title}</label>}
        <div className="entity-doc-slot__box">
          {showPreview ? (
            <div className="entity-doc-slot__preview">
              <img src={preview} alt={`${title} preview`} />
              <button
                type="button"
                className="btn btn-danger btn-remove rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => removeFile(fieldName, setPreview)}
                aria-label={`Remove ${title}`}
              >
                <i className="bi bi-x" />
              </button>
            </div>
          ) : (
            <div className="entity-doc-slot__actions">
              <input
                type="file"
                ref={inputRef}
                style={{ display: 'none' }}
                accept={accept}
                onChange={(e) => {
                  const file = getValidatedUploadFile(e);
                  if (!file) return;
                  handleFileSelect(e, fieldName, setPreview);
                }}
              />
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                title="Upload (max 5MB)"
                onClick={() => inputRef.current?.click()}
              >
                <i className="bi bi-cloud-upload" />
              </button>
              {showCamera && (
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  title="Camera"
                  onClick={startWebcam}
                >
                  <i className="bi bi-camera" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && <label className="form-label">{title}</label>}
      <div
        className={`d-flex justify-content-center align-items-center ${noBorder ? '' : 'border rounded bg-light border-secondary p-3'} w-100`}
        style={{ minHeight: height || 'auto' }}
      >
        {preview ? (
          <div className="position-relative">
            <img
              className="p-0"
              src={preview}
              alt={`${title} preview`}
              style={{
                width: '65px',
                height: '65px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '1px solid #ddd',
              }}
            />
            <button
              type="button"
              className="btn btn-danger p-0 d-flex align-items-center justify-content-center position-absolute top-0 end-0 translate-middle rounded-circle"
              style={{ width: '16px', height: '16px', fontSize: '10px' }}
              onClick={() => removeFile(fieldName, setPreview)}
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ) : (
          <div className="d-flex gap-4 align-items-center justify-content-center w-100">
            <input
              type="file"
              ref={inputRef}
              style={{ display: 'none' }}
              accept={accept}
              onChange={(e) => {
                const file = getValidatedUploadFile(e);
                if (!file) return;
                handleFileSelect(e, fieldName, setPreview);
              }}
            />
            <button
              type="button"
              className={`btn btn-outline-primary btn-lg ${iconBorder ? '' : 'border-0'} d-flex flex-column align-items-center`}
              title="Upload (max 5MB)"
              onClick={() => inputRef.current?.click()}
            >
              <i className="bi bi-cloud-upload fs-2 p-0 m-0" />
            </button>
            {showCamera && (
              <button
                type="button"
                className={`btn btn-outline-success btn-lg ${iconBorder ? '' : 'border-0'} d-flex flex-column align-items-center`}
                title="Camera"
                onClick={startWebcam}
              >
                <i className="bi bi-camera fs-2 p-0 m-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadCard;
