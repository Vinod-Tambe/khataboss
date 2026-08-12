import React, { useRef } from "react";
import { toast } from "react-hot-toast";
import { validateUploadFile } from "../../utils/fileUpload";
import { resolveImageUrl } from "../../utils/imageHelpers";

export const DEFAULT_MAX_OTHER_IMAGES = 5;

const thumbStyle = {
  width: 56,
  height: 56,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #ccc",
};

const OtherImagesUpload = ({
  title = "Other Images",
  existingImages = [],
  newImages = [],
  onAddNew,
  onRemoveNew,
  onRemoveExisting,
  maxCount = DEFAULT_MAX_OTHER_IMAGES,
  onPreview,
  compactInline = false,
  galleryOnly = false,
}) => {
  const inputRef = useRef(null);
  const totalCount = existingImages.length + newImages.length;

  const handleAdd = (e) => {
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
      toast.error(`Maximum ${maxCount} other images allowed`);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const renderThumb = (src, key, onRemove, alt) => (
    <div key={key} className="position-relative">
      <button
        type="button"
        className="btn btn-link p-0 border-0"
        onClick={() => onPreview?.(src)}
        title="View image"
      >
        <img src={src} alt={alt} style={thumbStyle} />
      </button>
      {onRemove && (
        <button
          type="button"
          className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle p-0"
          style={{ width: 18, height: 18, fontSize: 11 }}
          onClick={onRemove}
          aria-label="Remove image"
        >
          ×
        </button>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="d-flex flex-wrap gap-2 align-items-start">
      {existingImages.map((img) => {
        const src = resolveImageUrl(img);
        if (!src) return null;
        return renderThumb(
          src,
          img.path || img.filename,
          () => onRemoveExisting?.(img.path),
          "Other document"
        );
      })}
      {newImages.map((img, index) =>
        renderThumb(
          img.preview,
          `new-${index}`,
          () => onRemoveNew?.(index),
          `New upload ${index + 1}`
        )
      )}
    </div>
  );

  const renderAddControl = () => (
    <>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleAdd}
      />
      <button
        type="button"
        className="btn btn-outline-secondary entity-doc-slot__add-btn"
        onClick={() => inputRef.current?.click()}
        title={`Add other images (${totalCount}/${maxCount})`}
        disabled={totalCount >= maxCount}
      >
        <i className="bi bi-plus-lg" />
      </button>
    </>
  );

  if (galleryOnly) {
    if (!totalCount) return null;
    return (
      <div className="other-images-gallery">
        <div className="small text-muted mb-1">
          Uploaded other images ({totalCount}/{maxCount})
        </div>
        {renderGallery()}
      </div>
    );
  }

  if (compactInline) {
    return (
      <div className="entity-doc-slot">
        <label className="entity-doc-slot__label">
          {title}
          <span className="d-block text-muted fw-normal" style={{ fontSize: "0.65rem" }}>
            {totalCount}/{maxCount}
          </span>
        </label>
        <div className="entity-doc-slot__box">
          {totalCount >= maxCount ? (
            <span className="small text-muted">Full</span>
          ) : (
            renderAddControl()
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="other-images-upload">
      <label className="form-label fw-semibold">{title}</label>
      <div className="d-flex flex-wrap gap-2 align-items-start">
        {renderGallery()}
        {totalCount < maxCount && renderAddControl()}
      </div>
      <small className="text-muted">
        {totalCount}/{maxCount} images
      </small>
    </div>
  );
};

export default OtherImagesUpload;
