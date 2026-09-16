import React from 'react';
import SupportImageAttachBox from './SupportImageAttachBox';

const SupportCompactScreenshotPicker = ({
  newImages = [],
  maxCount,
  onAddNew,
  onRemoveNew,
  onPreview,
  disabled = false,
}) => {
  const remaining = Math.max(0, maxCount - newImages.length);

  return (
    <SupportImageAttachBox
      newImages={newImages}
      maxCount={maxCount}
      onAddNew={onAddNew}
      onRemoveNew={onRemoveNew}
      onPreview={onPreview}
      disabled={disabled}
      maxLabel="screenshots"
      className="support-compact-screenshots"
    >
      <div className="support-compact-screenshots__hint" aria-live="polite">
        {newImages.length > 0
          ? `${newImages.length} selected · ${remaining} slot${remaining === 1 ? '' : 's'} left`
          : `Add screenshot (optional) · JPG, PNG · max 2MB · up to ${maxCount}`}
      </div>
    </SupportImageAttachBox>
  );
};

export default SupportCompactScreenshotPicker;
