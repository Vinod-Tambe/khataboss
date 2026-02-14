
import React from 'react';
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
}) => (
    <div className="">
      <label className="form-label">{title}</label>
      <div className="d-flex justify-content-center gap-2 p-3 border rounded bg-light w-100 border-dark">
        {preview ? (
          <>
            <img
            className='p-1'
              src={preview}
              alt={`${title} preview`}
              style={{
                width: '65px',
                height: '65px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '1px solid rgb(0, 0, 0)'
              }}
            />
            <button
              type="button"
              className="btn btn-outline-danger btn-lg d-flex flex-column align-items-center gap-2"
              onClick={() => removeFile(fieldName, setPreview)}
            > 
              <i className="bi bi-trash fs-2 p-0 m-0"></i>
            </button>
          </>
        ) : (
          <div className="d-flex gap-4 flex-wrap justify-content-center w-100">
            <input
              type="file"
              ref={inputRef}
              style={{ display: 'none' }}
              accept={accept}
              onChange={(e) => handleFileSelect(e, fieldName, setPreview)}
            />

            <button
              type="button"
              className="btn btn-outline-primary btn-lg d-flex flex-column align-items-center gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <i className="bi bi-cloud-upload fs-2 p-0 m-0"></i>
            </button>

            {showCamera && (
              <button
                type="button"
                className="btn btn-outline-success btn-lg d-flex flex-column align-items-center gap-2"
                onClick={startWebcam}
              >
                <i className="bi bi-camera fs-2 p-0 m-0"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

export default DocumentUploadCard;
