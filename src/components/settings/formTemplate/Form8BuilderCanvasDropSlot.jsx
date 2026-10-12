import React from 'react';
import { acceptBuilderDragOver, readPaletteDragBlockId } from '../../../utils/formTemplate/form8BuilderDnD';

/** Full-width insertion line between canvas blocks (PO-builder style). */
const Form8BuilderCanvasDropSlot = ({
  dropBeforeId,
  dropAfterId,
  active = false,
  onAddBlockFromPalette,
}) => {
  const handleDrop = (e) => {
    const paletteId = readPaletteDragBlockId(e.dataTransfer);
    if (!paletteId) return;
    e.preventDefault();
    e.stopPropagation();
    onAddBlockFromPalette?.(paletteId, dropBeforeId || null);
  };

  return (
    <div
      className={`f8-canvas-drop-slot${active ? ' is-active' : ''}`}
      data-f8-drop-before={dropBeforeId || undefined}
      data-f8-drop-after={dropAfterId || undefined}
      onDragEnter={(e) => acceptBuilderDragOver(e)}
      onDragOver={(e) => acceptBuilderDragOver(e)}
      onDrop={handleDrop}
      aria-hidden="true"
    />
  );
};

export default Form8BuilderCanvasDropSlot;
