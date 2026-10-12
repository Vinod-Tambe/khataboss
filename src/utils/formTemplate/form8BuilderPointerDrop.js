import { reorderBlockOrderIds, reorderBlockOrderIdsAfter } from './form8BuilderDnD';

const readDropSlotTarget = (el, fromBlockId) => {
  if (!el?.getAttribute) return null;
  const beforeId = el.getAttribute('data-f8-drop-before');
  if (beforeId && beforeId !== fromBlockId) {
    return { kind: 'before', blockId: beforeId };
  }
  const afterId = el.getAttribute('data-f8-drop-after');
  if (afterId && afterId !== fromBlockId) {
    return { kind: 'after', blockId: afterId };
  }
  return null;
};

const blockInsertKind = (blockEl, clientY, fromBlockId) => {
  const id = blockEl.getAttribute('data-f8-block-id');
  if (!id || id === fromBlockId) return null;
  const rect = blockEl.getBoundingClientRect();
  const mid = rect.top + rect.height / 2;
  return clientY < mid
    ? { kind: 'before', blockId: id }
    : { kind: 'after', blockId: id };
};

/** Find drop target under cursor (works inside CSS-transformed preview). */
export const resolveCanvasDropTarget = (clientX, clientY, fromBlockId) => {
  const elements = document.elementsFromPoint(clientX, clientY);
  for (const el of elements) {
    if (!el?.closest) continue;
    const slotEl = el.closest('[data-f8-drop-before], [data-f8-drop-after]');
    if (slotEl) {
      const hit = readDropSlotTarget(slotEl, fromBlockId);
      if (hit) return hit;
    }
  }
  for (const el of elements) {
    const blockEl = el.closest?.('[data-f8-block-id]');
    if (!blockEl || blockEl.classList?.contains('is-dragging')) continue;
    const hit = blockInsertKind(blockEl, clientY, fromBlockId);
    if (hit) return hit;
  }
  return null;
};

export const applyCanvasDropTarget = (blockOrder, fromId, target) => {
  if (!fromId || !target?.blockId) return blockOrder;
  const { kind, blockId: targetId } = target;
  if (kind === 'after') {
    return reorderBlockOrderIdsAfter(blockOrder, fromId, targetId);
  }
  return reorderBlockOrderIds(blockOrder, fromId, targetId);
};
