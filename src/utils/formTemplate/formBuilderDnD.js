import {
  F8_CANVAS_BLOCK_DRAG_MIME,
  F8_PALETTE_DRAG_MIME,
} from './formBuilderPalette';

export const F8_PALETTE_PLAIN_PREFIX = 'f8-palette:';
export const F8_BLOCK_PLAIN_PREFIX = 'f8-block:';

export const dragTransferHas = (dataTransfer, mime) => {
  if (!dataTransfer?.types) return false;
  return Array.from(dataTransfer.types).includes(mime);
};

export const readPaletteDragBlockId = (dataTransfer) => {
  const custom = dataTransfer?.getData(F8_PALETTE_DRAG_MIME);
  if (custom) return custom;
  const plain = dataTransfer?.getData('text/plain') || '';
  if (plain.startsWith(F8_PALETTE_PLAIN_PREFIX)) {
    return plain.slice(F8_PALETTE_PLAIN_PREFIX.length);
  }
  return '';
};

export const readCanvasBlockDragId = (dataTransfer) => {
  const custom = dataTransfer?.getData(F8_CANVAS_BLOCK_DRAG_MIME);
  if (custom) return custom;
  const plain = dataTransfer?.getData('text/plain') || '';
  if (plain.startsWith(F8_BLOCK_PLAIN_PREFIX)) {
    return plain.slice(F8_BLOCK_PLAIN_PREFIX.length);
  }
  return '';
};

/** Move `fromId` to immediately before `beforeId` in order (canvas / sidebar). */
export const reorderBlockOrderIds = (order, fromId, beforeId) => {
  if (!fromId || !beforeId || fromId === beforeId) return order;
  const next = [...order];
  const fromIdx = next.indexOf(fromId);
  const toIdx = next.indexOf(beforeId);
  if (fromIdx < 0 || toIdx < 0) return order;
  next.splice(fromIdx, 1);
  const insertAt = fromIdx < toIdx ? toIdx - 1 : toIdx;
  next.splice(insertAt, 0, fromId);
  return next;
};

/** Move `fromId` to immediately after `afterId` in order. */
export const reorderBlockOrderIdsAfter = (order, fromId, afterId) => {
  if (!fromId || !afterId || fromId === afterId) return order;
  const next = [...order];
  const fromIdx = next.indexOf(fromId);
  const afterIdx = next.indexOf(afterId);
  if (fromIdx < 0 || afterIdx < 0) return order;
  next.splice(fromIdx, 1);
  const insertAt = fromIdx < afterIdx ? afterIdx : afterIdx + 1;
  next.splice(insertAt, 0, fromId);
  return next;
};

const LOGO_LEFT = 'layout_left_logo';
const LOGO_RIGHT = 'layout_right_logo';

/** Logo row: swap sides by dropping one logo on the other or on band slots. */
export const reorderLogoBlocks = (order, fromId, targetId, mode = 'before') => {
  const fromIdx = order.indexOf(fromId);
  const targetIdx = order.indexOf(targetId);
  if (fromIdx < 0 || targetIdx < 0) return order;

  const fromIsLogo = fromId === LOGO_LEFT || fromId === LOGO_RIGHT;
  const targetIsLogo = targetId === LOGO_LEFT || targetId === LOGO_RIGHT;
  if (!fromIsLogo || !targetIsLogo) {
    return mode === 'after'
      ? reorderBlockOrderIdsAfter(order, fromId, targetId)
      : reorderBlockOrderIds(order, fromId, targetId);
  }

  if (fromIdx < targetIdx) {
    return reorderBlockOrderIdsAfter(order, fromId, targetId);
  }
  return reorderBlockOrderIds(order, fromId, targetId);
};

export const writePaletteDragData = (dataTransfer, blockId) => {
  dataTransfer.setData(F8_PALETTE_DRAG_MIME, blockId);
  dataTransfer.setData('text/plain', `${F8_PALETTE_PLAIN_PREFIX}${blockId}`);
  dataTransfer.effectAllowed = 'copy';
};

export const writeCanvasBlockDragData = (dataTransfer, blockId) => {
  dataTransfer.setData(F8_CANVAS_BLOCK_DRAG_MIME, blockId);
  dataTransfer.setData('text/plain', `${F8_BLOCK_PLAIN_PREFIX}${blockId}`);
  dataTransfer.effectAllowed = 'move';
};

/** Call on dragenter/dragover for canvas drop targets (logos, blocks, band slots). */
export const acceptBuilderDragOver = (e) => {
  const types = Array.from(e.dataTransfer?.types || []);
  if (types.includes(F8_PALETTE_DRAG_MIME)) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    return true;
  }
  if (types.includes(F8_CANVAS_BLOCK_DRAG_MIME) || types.includes('text/plain')) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    return true;
  }
  return false;
};
