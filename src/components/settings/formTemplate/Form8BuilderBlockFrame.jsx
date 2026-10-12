import React, { useCallback, useMemo, useRef } from 'react';
import { FiMove, FiX } from 'react-icons/fi';
import {
  blockShellStyle,
  canRemoveForm8Block,
  getBlockLayout,
  getForm8MediaWidthLimits,
  isForm8FreeCanvasMediaBlock,
} from '../../../utils/formTemplate/form8BuilderBlocks';
import {
  FORM8_MAX_POS_Y_PCT,
  blockAbsoluteFrameStyle,
  getForm8ContentBoxMm,
  getForm8MediaLayoutBoxMm,
  clampForm8BlockLayoutHorizontal,
  getForm8MaxPosXPct,
  getForm8ReferencePageHeightMm,
  getPageContentMetricsFromEl,
} from '../../../utils/formTemplate/form8CanvasLayout';
import { acceptBuilderDragOver, readPaletteDragBlockId } from '../../../utils/formTemplate/form8BuilderDnD';

const MM_PX = 96 / 25.4;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const DRAG_THRESHOLD_PX = 4;

const LOGO_MIN_W_PCT = 8;
const LOGO_MAX_W_PCT = 80;
const BLOCK_MIN_W_PCT = 20;
const BLOCK_MAX_W_PCT = 100;
const MIN_H_MM = 4;
const MAX_H_MM = 120;

const Form8BuilderBlockFrame = ({
  blockId,
  selected,
  scale = 1,
  config,
  className = '',
  onSelect,
  onBlockLayoutChange,
  onReorderBlocks,
  onAddBlockFromPalette,
  onRemoveBlock,
  onPointerReorderStart,
  onForcePointerReorder,
  isDragging = false,
  isDropTarget = false,
  blockOrder = [],
  inLogoBand = false,
  freeCanvas = false,
  pageWidthMm = 210,
  pageHeightMm = 297,
  children,
}) => {
  const frameRef = useRef(null);
  const layout = getBlockLayout(config, blockId);
  const isImageLikeBlock = isForm8FreeCanvasMediaBlock(blockId);
  const heightLocked = blockId === 'stock_line_items' || layout.heightMode === 'auto';

  const getContentMetrics = useCallback(() => {
    const page = frameRef.current?.closest('.form-custom-a4-page');
    return getPageContentMetricsFromEl(page, scale);
  }, [scale]);

  const getContentWidthPx = useCallback(() => {
    const m = getContentMetrics();
    return m?.contentWidthPx ?? 793;
  }, [getContentMetrics]);

  const widthLimits = () =>
    isImageLikeBlock
      ? getForm8MediaWidthLimits(blockId)
      : { min: BLOCK_MIN_W_PCT, max: BLOCK_MAX_W_PCT };

  const getLayoutBoxMm = useCallback(
    (layoutConfig) =>
      getForm8MediaLayoutBoxMm(layoutConfig, blockId, pageWidthMm, pageHeightMm),
    [blockId, pageWidthMm, pageHeightMm]
  );

  const startResize = (handle, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(blockId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = layout.widthPct ?? (isImageLikeBlock ? 28 : 100);
    const startH = layout.heightMm ?? (isImageLikeBlock ? 14 : 12);
    const startPosX = layout.posXPct ?? 0;
    const startPosY = layout.posYPct ?? 0;
    const metrics = getContentMetrics();
    const contentW = metrics?.contentWidthPx ?? getContentWidthPx();
    const contentHpx = metrics?.contentHeightPx ?? 900;
    const contentHmm = contentHpx / MM_PX;
    const s = scale > 0 ? scale : 1;
    const { min: minW, max: maxW } = widthLimits();
    const refH = getForm8ReferencePageHeightMm(config, pageHeightMm);
    const contentWidthMm = getForm8ContentBoxMm(pageWidthMm, refH).width;
    const minWmm = (minW / 100) * contentWidthMm;
    const maxWmm = (maxW / 100) * contentWidthMm;

    const resizeMediaBox = freeCanvas && isImageLikeBlock && !heightLocked;
    const boxAtStart = resizeMediaBox ? getLayoutBoxMm(config) : null;
    const startBoxW = boxAtStart?.widthMm ?? 0;
    const startBoxH = boxAtStart?.heightMm ?? 0;

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / s;
      const dy = (ev.clientY - startY) / s;
      const dWidthPct = (dx / contentW) * 100;
      const dHeightMm = dy / MM_PX;
      const dWmm = (dx / contentW) * contentWidthMm;
      let widthPct = startW;
      let heightMm = startH;
      let posXPct = startPosX;
      let posYPct = startPosY;

      if (resizeMediaBox) {
        let boxW = startBoxW;
        let boxH = startBoxH;
        if (handle.includes('e')) boxW += dWmm;
        if (handle.includes('w')) boxW -= dWmm;
        if (handle.includes('s')) boxH += dHeightMm;
        if (handle.includes('n')) boxH -= dHeightMm;

        const unclampedBoxW = boxW;
        const unclampedBoxH = boxH;

        boxW = clamp(boxW, minWmm, maxWmm);
        boxH = clamp(boxH, MIN_H_MM, MAX_H_MM);

        const boxWmm = Math.round(boxW * 10) / 10;
        const boxHmm = Math.round(boxH * 10) / 10;
        widthPct = clamp(Math.round((boxWmm / contentWidthMm) * 1000) / 10, minW, maxW);
        heightMm = clamp(boxHmm, MIN_H_MM, MAX_H_MM);

        if (handle.includes('w') || handle.includes('nw') || handle.includes('sw')) {
          posXPct = clamp(
            Math.round(startPosX + ((startBoxW - unclampedBoxW) / contentWidthMm) * 100),
            0,
            100
          );
        }
        if (handle.includes('n') || handle.includes('nw') || handle.includes('ne')) {
          posYPct = clamp(
            Math.round(startPosY + ((startBoxH - unclampedBoxH) / contentHmm) * 100),
            0,
            FORM8_MAX_POS_Y_PCT
          );
        }
      } else {
        if (handle.includes('e')) widthPct = startW + dWidthPct;
        if (handle.includes('w')) widthPct = startW - dWidthPct;
        if (!heightLocked) {
          if (handle.includes('s')) heightMm = startH + dHeightMm;
          if (handle.includes('n')) heightMm = startH - dHeightMm;
        }

        const unclampedW = widthPct;
        const unclampedH = heightMm;

        widthPct = clamp(Math.round(widthPct), minW, maxW);
        if (!heightLocked) {
          heightMm = clamp(Math.round(heightMm), MIN_H_MM, MAX_H_MM);
        }

        if (freeCanvas && (handle.includes('w') || handle.includes('nw') || handle.includes('sw'))) {
          posXPct = clamp(Math.round(startPosX + (startW - unclampedW)), 0, 100);
        }
        if (
          freeCanvas &&
          !heightLocked &&
          (handle.includes('n') || handle.includes('nw') || handle.includes('ne'))
        ) {
          posYPct = clamp(
            Math.round(startPosY + ((startH - unclampedH) / contentHmm) * 100),
            0,
            FORM8_MAX_POS_Y_PCT
          );
        }
      }

      const patch = {
        widthPct,
        ...(heightLocked
          ? { heightMode: 'auto' }
          : { heightMode: 'fixed', heightMm }),
      };
      if (freeCanvas) {
        patch.posXPct = clamp(Math.round(posXPct), 0, 100);
        patch.posYPct = clamp(Math.round(posYPct), 0, FORM8_MAX_POS_Y_PCT);
        patch.freePosition = true;
        patch.offsetXPct = null;
        const clamped = clampForm8BlockLayoutHorizontal(blockId, patch);
        onBlockLayoutChange?.(blockId, clamped);
        return;
      }
      onBlockLayoutChange?.(blockId, patch);
    };

    const captureTarget = e.currentTarget;
    captureTarget?.setPointerCapture?.(e.pointerId);

    const onUp = (upEv) => {
      try {
        captureTarget?.releasePointerCapture?.(upEv?.pointerId ?? e.pointerId);
      } catch {
        /* ignore */
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startFreeCanvasDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(blockId);

    const page = frameRef.current?.closest('.form-custom-a4-page');
    const metrics = getPageContentMetricsFromEl(page, scale);
    const startX = e.clientX;
    const startY = e.clientY;
    let active = false;

    const frameRect = frameRef.current?.getBoundingClientRect();
    const s = scale > 0 ? scale : 1;
    const grabOffsetX = frameRect ? (e.clientX - frameRect.left) / s : 0;
    const grabOffsetY = frameRect ? (e.clientY - frameRect.top) / s : 0;

    document.body.classList.add('f8-builder-is-pointer-dragging');

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!active) {
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        active = true;
      }
      if (!metrics) return;

      const pointerX = (ev.clientX - metrics.contentLeft) / metrics.scale - grabOffsetX;
      const pointerY = (ev.clientY - metrics.contentTop) / metrics.scale - grabOffsetY;
      const dragWidthPct =
        layout.widthPct ?? (isImageLikeBlock ? 28 : isImageLikeBlock ? 28 : 100);
      const maxPosX = getForm8MaxPosXPct(blockId, dragWidthPct);
      const posXPct = clamp(
        Math.round((pointerX / metrics.contentWidthPx) * 100),
        0,
        maxPosX
      );
      const posYPct = clamp(
        Math.round((pointerY / metrics.contentHeightPx) * 100),
        0,
        FORM8_MAX_POS_Y_PCT
      );

      onBlockLayoutChange?.(
        blockId,
        clampForm8BlockLayoutHorizontal(blockId, {
          posXPct,
          posYPct,
          freePosition: true,
          offsetXPct: null,
          widthPct: layout.widthPct,
        })
      );
    };

    const captureTarget = e.currentTarget;
    captureTarget?.setPointerCapture?.(e.pointerId);

    const onUp = (upEv) => {
      document.body.classList.remove('f8-builder-is-pointer-dragging');
      try {
        captureTarget?.releasePointerCapture?.(upEv?.pointerId ?? e.pointerId);
      } catch {
        /* ignore */
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleGripPointerDown = (e) => {
    if (freeCanvas) {
      startFreeCanvasDrag(e);
      return;
    }
    onPointerReorderStart?.(blockId, e);
  };

  const handleFramePointerDown = (e) => {
    if (e.target.closest('.f8-builder-resize-handle')) return;
    if (e.target.closest('.f8-builder-block-remove')) return;
    if (e.target.closest('.f8-builder-block-toolbar')) return;
    if (freeCanvas) {
      startFreeCanvasDrag(e);
      return;
    }
    if (isImageLikeBlock) return;
    handleGripPointerDown(e);
  };

  const handleDragOver = (e) => {
    if (freeCanvas) return;
    if (!acceptBuilderDragOver(e)) return;
    frameRef.current?.classList.add('is-drag-over');
  };

  const handleDragEnter = (e) => {
    if (freeCanvas) return;
    acceptBuilderDragOver(e);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    frameRef.current?.classList.remove('is-drag-over');
  };

  const handleDrop = (e) => {
    if (freeCanvas) return;
    e.preventDefault();
    e.stopPropagation();
    frameRef.current?.classList.remove('is-drag-over');
    const paletteId = readPaletteDragBlockId(e.dataTransfer);
    if (paletteId) {
      onAddBlockFromPalette?.(paletteId, blockId);
    }
  };

  const fixedHeightMm = layout.heightMm ?? (isImageLikeBlock ? 14 : 12);

  const shellClass = `f8-block-shell f8-block-shell--${
    heightLocked && !isImageLikeBlock ? 'auto' : 'fixed'
  } f8-block-shell--builder${isImageLikeBlock ? ' f8-block-shell--logo-fit' : ''}${
    freeCanvas && isImageLikeBlock ? ' f8-block-shell--media-fit' : ''
  }`;

  const shellStyle = {
    ...blockShellStyle(config, blockId, { inLogoBand }),
    ...(freeCanvas && isImageLikeBlock
      ? {
          width: '100%',
          height: '100%',
          minHeight: 0,
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }
      : freeCanvas && !heightLocked
        ? {
            minHeight: `${fixedHeightMm}mm`,
            height: `${fixedHeightMm}mm`,
            maxHeight: `${fixedHeightMm}mm`,
            boxSizing: 'border-box',
            overflow: 'hidden',
          }
        : isImageLikeBlock && !freeCanvas
          ? { minHeight: 'unset', maxHeight: 'unset', height: 'auto', overflow: 'visible' }
          : heightLocked
            ? {}
            : {
                minHeight: `${fixedHeightMm}mm`,
                maxHeight: `${fixedHeightMm}mm`,
                overflow: 'auto',
              }),
  };

  const absoluteStyle = freeCanvas
    ? blockAbsoluteFrameStyle(config, blockId, pageWidthMm, pageHeightMm)
    : null;

  const mediaVisualStyle = useMemo(() => {
    if (!freeCanvas || !isImageLikeBlock) return null;
    const layoutBox = getLayoutBoxMm(config);
    const w = layoutBox.widthMm;
    const h = layoutBox.heightMm;
    return {
      width: `${w}mm`,
      height: `${h}mm`,
      '--f8-media-w': `${w}mm`,
      '--f8-media-h': `${h}mm`,
      '--f8-media-max-w': `${w}mm`,
      '--f8-media-max-h': `${h}mm`,
    };
  }, [
    freeCanvas,
    isImageLikeBlock,
    config,
    getLayoutBoxMm,
    layout.widthPct,
    layout.heightMm,
  ]);

  const handleChrome = (e) => {
    e.stopPropagation();
    onSelect?.(blockId);
  };

  const frameClassName = [
    'f8-builder-block',
    isImageLikeBlock ? 'f8-builder-block--logo-chrome' : '',
    freeCanvas ? 'f8-builder-block--free-canvas' : '',
    selected ? 'is-selected is-resize-active' : '',
    isDragging ? 'is-dragging' : '',
    isDropTarget ? 'is-drop-target' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const frameStyle = useMemo(() => {
    if (!absoluteStyle && !mediaVisualStyle) return undefined;
    if (mediaVisualStyle) {
      return { ...absoluteStyle, ...mediaVisualStyle };
    }
    return absoluteStyle;
  }, [absoluteStyle, mediaVisualStyle]);
  const dragTitle = freeCanvas ? 'Drag anywhere on the page' : 'Drag to move';

  const toolbar = (
    <div
      className={`f8-builder-block-toolbar${isImageLikeBlock ? ' f8-builder-block-toolbar--logo' : ''}`}
      title={dragTitle}
      onPointerDown={handleGripPointerDown}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="f8-builder-block-grip" aria-hidden="true">
        <FiMove size={12} />
      </span>
      {!isImageLikeBlock && canRemoveForm8Block(blockId) ? (
        <button
          type="button"
          className="f8-builder-block-remove"
          title="Remove from form"
          aria-label="Remove element"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveBlock?.(blockId);
          }}
        >
          <FiX size={12} />
        </button>
      ) : null}
    </div>
  );

  const sizeLabel = selected ? (
    <div className="f8-builder-block-size-label" aria-hidden="true">
      {freeCanvas && layout.posXPct != null
        ? `${layout.posXPct}%, ${layout.posYPct}% · `
        : ''}
      {layout.widthPct ?? (isImageLikeBlock ? 28 : 100)}% ×{' '}
      {heightLocked ? 'auto' : `${fixedHeightMm}mm`}
    </div>
  ) : null;

  const resizeNodes =
    selected &&
    RESIZE_HANDLES.map((handle) => {
      if (heightLocked && (handle.includes('n') || handle.includes('s'))) {
        return null;
      }
      return (
        <span
          key={handle}
          className={`f8-builder-resize-handle f8-builder-resize-handle--${handle}`}
          role="presentation"
          onPointerDown={(ev) => startResize(handle, ev)}
        />
      );
    });

  return (
    <div
      ref={frameRef}
      data-f8-block-id={blockId}
      className={frameClassName}
      style={frameStyle}
      onClick={handleChrome}
      onPointerDown={handleFramePointerDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {toolbar}
      <div className="f8-builder-block-bounds">
        {sizeLabel}
        <div className={shellClass} style={shellStyle}>{children}</div>
        {resizeNodes}
      </div>
    </div>
  );
};

export default Form8BuilderBlockFrame;
