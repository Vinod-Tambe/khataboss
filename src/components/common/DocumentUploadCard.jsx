
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
  noBorder = false,
  height = null,
  iconBorder = true,
}) => (
  <div className={small ? "d-flex flex-column align-items-center" : ""}>
    {title && <label className={`form-label ${small ? 'mb-1 small fw-bold' : ''}`}>{title}</label>}
    <div
      className={`d-flex justify-content-center align-items-center ${noBorder ? '' : 'border rounded bg-light border-secondary'} ${small ? 'p-0' : 'p-3'} w-100`}
      style={{ minHeight: height || (small ? '40px' : 'auto') }}
    >
      {preview ? (
        <div className="position-relative">
          <img
            className='p-0'
            src={preview}
            alt={`${title} preview`}
            style={{
              width: small ? '35px' : '65px',
              height: small ? '35px' : '65px',
              objectFit: 'cover',
              borderRadius: small ? '6px' : '12px',
              border: '1px solid #ddd'
            }}
          />
          <button
            type="button"
            className={`btn btn-danger p-0 d-flex align-items-center justify-content-center position-absolute top-0 end-0 translate-middle rounded-circle`}
            style={{ width: '16px', height: '16px', fontSize: '10px' }}
            onClick={() => removeFile(fieldName, setPreview)}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      ) : (
        <div className={`d-flex ${small ? 'gap-3' : 'gap-4'} align-items-center justify-content-center w-100`}>
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
            className={`btn btn-outline-primary ${small ? 'btn-sm' : 'btn-lg'} ${iconBorder ? '' : 'border-0'} d-flex flex-column align-items-center`}
            title="Upload (max 5MB)"
            style={{ padding: small ? '2px 13px' : undefined }}
            onClick={() => inputRef.current?.click()}
          >
            <i className={`bi bi-cloud-upload ${small ? 'fs-5' : 'fs-2'} p-0 m-0`}></i>
          </button>

          {showCamera && (
            <button
              type="button"
              className={`btn btn-outline-success ${small ? 'btn-sm' : 'btn-lg'} ${iconBorder ? '' : 'border-0'} d-flex flex-column align-items-center`}
              title="Camera"
              style={{ padding: small ? '2px 13px' : undefined }}
              onClick={startWebcam}
            >
              <i className={`bi bi-camera ${small ? 'fs-5' : 'fs-2'} p-0 m-0`}></i>
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

export default DocumentUploadCard;
