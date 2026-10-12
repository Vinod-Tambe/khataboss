import React from 'react';
import {
  acceptBuilderDragOver,
  readCanvasBlockDragId,
  readPaletteDragBlockId,
  reorderBlockOrderIdsAfter,
  reorderLogoBlocks,
} from '../../../utils/formTemplate/form8BuilderDnD';

const DropSlot = ({
  active,
  dropBeforeId,
  dropAfterId,
  onDrop,
}) => (
  <div
    className={`f8-logo-band-drop-slot${active ? ' is-drag-over' : ''}`}
    data-f8-drop-before={dropBeforeId || undefined}
    data-f8-drop-after={dropAfterId || undefined}
    onDragEnter={(e) => acceptBuilderDragOver(e)}
    onDragOver={(e) => acceptBuilderDragOver(e)}
    onDrop={onDrop}
  />
);

const Form8BuilderLogoBand = ({
  ids,
  bandKey,
  blockOrder,
  renderBlock,
  onReorderBlocks,
  onAddBlockFromPalette,
  isSlotTarget,
}) => {
  const lastId = ids[ids.length - 1];

  const handleDropBefore = (beforeId) => (e) => {
    const paletteId = readPaletteDragBlockId(e.dataTransfer);
    if (paletteId) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlockFromPalette?.(paletteId, beforeId);
      return;
    }
    const fromId = readCanvasBlockDragId(e.dataTransfer);
    if (fromId) {
      e.preventDefault();
      e.stopPropagation();
      onReorderBlocks?.(reorderLogoBlocks(blockOrder, fromId, beforeId, 'before'));
    }
  };

  const handleDropEnd = (e) => {
    const paletteId = readPaletteDragBlockId(e.dataTransfer);
    if (paletteId) {
      e.preventDefault();
      e.stopPropagation();
      onAddBlockFromPalette?.(paletteId, null);
      return;
    }
    const fromId = readCanvasBlockDragId(e.dataTransfer);
    if (fromId && lastId) {
      e.preventDefault();
      e.stopPropagation();
      onReorderBlocks?.(reorderBlockOrderIdsAfter(blockOrder, fromId, lastId));
    }
  };

  return (
    <div className="form-custom-a4-logo-band form-custom-a4-logo-band--builder">
      {ids.map((blockId) => (
          <React.Fragment key={blockId}>
            <DropSlot
              active={isSlotTarget?.('before', blockId)}
              dropBeforeId={blockId}
              onDrop={handleDropBefore(blockId)}
            />
            {renderBlock(blockId, { inLogoBand: true })}
          </React.Fragment>
      ))}
      {lastId ? (
        <DropSlot
          active={isSlotTarget?.('after', lastId)}
          dropAfterId={lastId}
          onDrop={handleDropEnd}
        />
      ) : null}
    </div>
  );
};

export default Form8BuilderLogoBand;
