import React from 'react';
import SupportImageAttachBox from './SupportImageAttachBox';

const SupportCommentComposer = ({
  value,
  onChange,
  placeholder = 'Write your message…',
  disabled = false,
  newImages = [],
  existingImages = [],
  maxCount = 3,
  onAddNew,
  onRemoveNew,
  onRemoveExisting,
  onPreview,
}) => (
  <SupportImageAttachBox
    newImages={newImages}
    existingImages={existingImages}
    maxCount={maxCount}
    onAddNew={onAddNew}
    onRemoveNew={onRemoveNew}
    onRemoveExisting={onRemoveExisting}
    onPreview={onPreview}
    disabled={disabled}
    maxLabel="images per comment"
  >
    <textarea
      className="support-comment-compose__input"
      rows={3}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  </SupportImageAttachBox>
);

export default SupportCommentComposer;
