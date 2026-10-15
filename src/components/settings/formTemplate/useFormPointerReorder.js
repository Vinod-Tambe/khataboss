import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyCanvasDropTarget,
  resolveCanvasDropTarget,
} from '../../../utils/formTemplate/formBuilderPointerDrop';

const DRAG_THRESHOLD_PX = 4;

/** Pointer-based block reorder (reliable inside scaled CSS transform preview). */
export function useFormPointerReorder(blockOrder, onReorderBlocks, enabled) {
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const pendingRef = useRef(null);
  const orderRef = useRef(blockOrder);
  const reorderRef = useRef(onReorderBlocks);
  const isDraggingRef = useRef(false);
  reorderRef.current = onReorderBlocks;
  if (!isDraggingRef.current) {
    orderRef.current = blockOrder;
  }

  const beginDrag = useCallback((fromId) => {
    isDraggingRef.current = true;
    document.body.classList.add('f8-builder-is-pointer-dragging');
    const next = { fromId, target: null };
    dragRef.current = next;
    setDrag(next);
  }, []);

  const startPointerReorder = useCallback(
    (blockId, e) => {
      if (!enabled) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      pendingRef.current = {
        blockId,
        startX: e.clientX,
        startY: e.clientY,
      };

      const onPendingMove = (ev) => {
        const pending = pendingRef.current;
        if (!pending || pending.blockId !== blockId) return;
        const dx = ev.clientX - pending.startX;
        const dy = ev.clientY - pending.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        pendingRef.current = null;
        window.removeEventListener('pointermove', onPendingMove);
        window.removeEventListener('pointerup', onPendingUp);
        beginDrag(blockId);
      };

      const onPendingUp = () => {
        pendingRef.current = null;
        window.removeEventListener('pointermove', onPendingMove);
        window.removeEventListener('pointerup', onPendingUp);
      };

      window.addEventListener('pointermove', onPendingMove);
      window.addEventListener('pointerup', onPendingUp);
    },
    [enabled, beginDrag]
  );

  useEffect(() => {
    if (!drag?.fromId) return undefined;

    const targetsEqual = (a, b) =>
      a?.kind === b?.kind && a?.blockId === b?.blockId;

    const onMove = (e) => {
      const fromId = dragRef.current?.fromId;
      if (!fromId) return;
      const target = resolveCanvasDropTarget(e.clientX, e.clientY, fromId);
      const prevTarget = dragRef.current?.target;
      if (target && !targetsEqual(target, prevTarget) && reorderRef.current) {
        const nextOrder = applyCanvasDropTarget(orderRef.current, fromId, target);
        if (nextOrder !== orderRef.current) {
          orderRef.current = nextOrder;
          reorderRef.current(nextOrder);
        }
      }
      const next = { fromId, target };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = () => {
      isDraggingRef.current = false;
      document.body.classList.remove('f8-builder-is-pointer-dragging');
      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      document.body.classList.remove('f8-builder-is-pointer-dragging');
      isDraggingRef.current = false;
    };
  }, [drag?.fromId]);

  const getBlockDragUi = useCallback(
    (blockId) => {
      const isDragging = drag?.fromId === blockId;
      const t = drag?.target;
      const isDropTarget =
        Boolean(drag?.fromId) &&
        t?.blockId === blockId &&
        (t.kind === 'before' || t.kind === 'after' || t.kind === 'on');
      return { isDragging, isDropTarget };
    },
    [drag]
  );

  const isSlotTarget = useCallback(
    (slotKind, slotBlockId) => {
      const t = drag?.target;
      return Boolean(drag?.fromId) && t?.kind === slotKind && t?.blockId === slotBlockId;
    },
    [drag]
  );

  const isCanvasSlotActive = useCallback(
    ({ beforeId, afterId }) => {
      const t = drag?.target;
      if (!drag?.fromId || !t) return false;
      if (beforeId && t.kind === 'before' && t.blockId === beforeId) return true;
      if (afterId && t.kind === 'after' && t.blockId === afterId) return true;
      return false;
    },
    [drag]
  );

  const forcePointerReorder = useCallback(
    (blockId) => {
      if (!enabled || !blockId) return;
      beginDrag(blockId);
    },
    [enabled, beginDrag]
  );

  return {
    startPointerReorder,
    forcePointerReorder,
    drag,
    getBlockDragUi,
    isSlotTarget,
    isCanvasSlotActive,
  };
};
