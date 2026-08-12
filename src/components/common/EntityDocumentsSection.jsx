import React from "react";
import DocumentUploadCard from "./DocumentUploadCard";
import OtherImagesUpload from "./OtherImagesUpload";

export const MAX_OTHER_IMAGES = 5;

/**
 * One row: Profile, Aadhaar Front/Back, PAN (small) + Other Images add button.
 * Other uploaded images shown in a gallery row below.
 */
const EntityDocumentsSection = ({
  documents = [],
  handleFileSelect,
  removeFile,
  existingOtherImages = [],
  newOtherImages = [],
  onAddOther,
  onRemoveOtherNew,
  onRemoveOtherExisting,
  maxOtherImages = MAX_OTHER_IMAGES,
  onOtherPreview,
}) => {
  const hasOtherGallery = existingOtherImages.length > 0 || newOtherImages.length > 0;

  const slotCount = documents.length + 1;
  const rowStyle = {
    gridTemplateColumns: `repeat(${Math.min(slotCount, 5)}, minmax(0, 1fr))`,
  };

  return (
    <div className="entity-documents-section mt-2">
      <div className="entity-documents-section__row" style={rowStyle}>
        {documents.map((doc) => (
          <div key={doc.fieldName} className="entity-documents-section__slot">
            <DocumentUploadCard
              compact
              title={doc.title}
              fieldName={doc.fieldName}
              preview={doc.preview}
              setPreview={doc.setPreview}
              inputRef={doc.inputRef}
              showCamera={doc.showCamera}
              startWebcam={doc.startWebcam}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
            />
          </div>
        ))}

        <div className="entity-documents-section__slot">
          <OtherImagesUpload
            compactInline
            maxCount={maxOtherImages}
            existingImages={existingOtherImages}
            newImages={newOtherImages}
            onAddNew={onAddOther}
            onRemoveNew={onRemoveOtherNew}
            onRemoveExisting={onRemoveOtherExisting}
            onPreview={onOtherPreview}
          />
        </div>
      </div>

      {hasOtherGallery && (
        <div className="entity-documents-section__gallery mt-2 pt-2 border-top">
          <OtherImagesUpload
            galleryOnly
            maxCount={maxOtherImages}
            existingImages={existingOtherImages}
            newImages={newOtherImages}
            onAddNew={onAddOther}
            onRemoveNew={onRemoveOtherNew}
            onRemoveExisting={onRemoveOtherExisting}
            onPreview={onOtherPreview}
          />
        </div>
      )}
    </div>
  );
};

export default EntityDocumentsSection;
