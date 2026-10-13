import {
  getForm8BlockOrder,
  getBlockLayout,
  isForm8BlockEnabled,
  isForm8FreeCanvasMediaBlock,
} from './form8BuilderBlocks';
import { isForm8FieldBlockId } from './form8FieldBlocks';

/** Matches `.form-custom-a4-page` padding in FormCustomization.css */
export const FORM8_PAGE_PADDING_MM = { top: 12, right: 14, bottom: 12, left: 14 };

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const horizontalWidthLimits = (blockId) => {
  if (isForm8FreeCanvasMediaBlock(blockId)) {
    return blockId === 'layout_footer_image' ? { min: 8, max: 100 } : { min: 8, max: 80 };
  }
  if (isForm8FieldBlockId(blockId)) {
    return { min: 12, max: 55 };
  }
  return { min: 20, max: 100 };
};

/** Keep block within printable content width (posX% + width% ≤ 100). */
export const clampForm8BlockLayoutHorizontal = (blockId, layoutPatch = {}) => {
  const { min, max } = horizontalWidthLimits(blockId);
  let widthPct = Number(layoutPatch.widthPct);
  if (!Number.isFinite(widthPct)) widthPct = max;
  widthPct = clamp(widthPct, min, max);
  const maxPosX = Math.max(0, 100 - widthPct);
  let posXPct = clamp(Math.round(Number(layoutPatch.posXPct) || 0), 0, maxPosX);
  widthPct = Math.min(widthPct, Math.max(min, 100 - posXPct));
  if (posXPct + widthPct > 100) {
    posXPct = Math.max(0, 100 - widthPct);
  }
  return { ...layoutPatch, posXPct, widthPct };
};

/** Max left position (%) so the block's right edge stays inside the content area. */
export const getForm8MaxPosXPct = (blockId, widthPct) => {
  const { min, max } = horizontalWidthLimits(blockId);
  const w = clamp(Number(widthPct) || max, min, max);
  return Math.max(0, 100 - w);
};

export const clampAllForm8CanvasBlockLayouts = (config) => {
  if (!config?.blockLayouts) return config;
  const blockLayouts = { ...config.blockLayouts };
  Object.keys(blockLayouts).forEach((blockId) => {
    blockLayouts[blockId] = clampForm8BlockLayoutHorizontal(
      blockId,
      blockLayouts[blockId] || {}
    );
  });
  return { ...config, blockLayouts };
};

/** Max vertical position (% of reference content height) — allows growing page below A4. */
export const FORM8_MAX_POS_Y_PCT = 220;

export const isForm8FreeCanvasLayout = (config) =>
  config?.canvasLayout === 'free' ||
  Boolean(
    config?.blockLayouts &&
      Object.values(config.blockLayouts).some(
        (l) => l && l.freePosition && l.posXPct != null && l.posYPct != null
      )
  );

const defaultPosXForBlock = (spec, blockId) => {
  if (spec.offsetXPct != null && Number.isFinite(Number(spec.offsetXPct))) {
    return Number(spec.offsetXPct);
  }
  const widthPct = spec.widthPct ?? 100;
  if (spec.hAlign === 'center') return (100 - widthPct) / 2;
  if (spec.hAlign === 'right' || blockId === 'layout_right_logo') {
    return Math.max(0, 100 - widthPct);
  }
  return 0;
};

const blockStackHeightMm = (config, blockId) => {
  const spec = getBlockLayout(config, blockId);
  if (spec.heightMode === 'auto' || blockId === 'stock_line_items') return 36;
  return spec.heightMm ?? 12;
};

/** One line-item row beyond the first sample row. Image rows are taller. */
const STOCK_EXTRA_ROW_IMAGE_MM = 16;
const STOCK_EXTRA_ROW_TEXT_MM = 8;
const STOCK_FLOW_GAP_MM = 3;

const stockRowHasImage = (row) =>
  Boolean(row?.previewImageUrl || row?.imageDataUrl);

/**
 * Extra millimetres the stock table needs when a loan has more than one item.
 * The saved canvas reserves space for a single sample row.
 */
export const form8StockFlowExtraMm = (rows, { withImages = true } = {}) => {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length <= 1) return 0;
  const body = list.slice(1).reduce((sum, row) => {
    const hasImg = withImages && stockRowHasImage(row);
    return sum + (hasImg ? STOCK_EXTRA_ROW_IMAGE_MM : STOCK_EXTRA_ROW_TEXT_MM);
  }, 0);
  return body + STOCK_FLOW_GAP_MM;
};

const SIDE_BY_SIDE_GAP_PCT = 1.5;
const SAME_ROW_Y_PCT = 12;

const blocksOverlapHorizontally = (a, b, slackPct = 0.4) =>
  a.x + a.w > b.x + slackPct && b.x + b.w > a.x + slackPct;

const shrinkLeftForRight = (widths, leftId, leftX, leftW, rightX, minW) => {
  const nextW = Math.max(minW, rightX - leftX - SIDE_BY_SIDE_GAP_PCT);
  if (nextW < leftW - 0.4) {
    widths[leftId] = nextW;
    return true;
  }
  return false;
};

const readPosYPct = (spec) => {
  if (spec?.posYPct == null || spec.posYPct === '') return null;
  const n = Number(spec.posYPct);
  return Number.isFinite(n) ? n : null;
};

const sameCanvasRow = (leftSpec, rightSpec) => {
  const leftY = readPosYPct(leftSpec);
  const rightY = readPosYPct(rightSpec);
  if (leftY == null || rightY == null) return false;
  return Math.abs(leftY - rightY) < SAME_ROW_Y_PCT;
};

/**
 * When a photo/logo sits beside a section, shrink only that same-row section
 * so PDF text does not draw under the image. Firm (and other rows above)
 * stay full width.
 */
export const withForm8SideBySideFit = (config, basePageHeightMm = 297) => {
  if (!config?.singlePageLayout) return config;

  const order = getForm8BlockOrder(config);
  if (order.length < 2) return config;

  const widths = {};
  let changed = false;

  const photoOnForm = order.includes('customer_photo');
  if (photoOnForm && order.includes('section:customer_details')) {
    const photo = getBlockLayout(config, 'customer_photo');
    const customer = getBlockLayout(config, 'section:customer_details');
    const photoX = Number(photo.posXPct);
    const photoY = Number(photo.posYPct);
    const custX = Number(customer.posXPct) || 0;
    const custY = Number(customer.posYPct);
    const custW = Number(customer.widthPct) || 100;
    const placedRight = Number.isFinite(photoX) && photoX > custX + 12;
    const sameBand =
      !Number.isFinite(photoY) ||
      !Number.isFinite(custY) ||
      Math.abs(photoY - custY) < SAME_ROW_Y_PCT;
    const photoOnLeft = Number.isFinite(photoX) && photoX <= custX + 12;
    if (placedRight || (sameBand && !photoOnLeft)) {
      const photoRightEdge = placedRight
        ? photoX
        : 100 - (Number(photo.widthPct) || 22) - SIDE_BY_SIDE_GAP_PCT;
      if (shrinkLeftForRight(widths, 'section:customer_details', custX, custW, photoRightEdge, 40)) {
        changed = true;
      }
    }
  }

  const rects = order.map((id) => {
    const spec = getBlockLayout(config, id);
    return {
      id,
      spec,
      x: Number(spec.posXPct) || 0,
      w: widths[id] ?? (Number(spec.widthPct) || 100),
      media: isForm8FreeCanvasMediaBlock(id),
    };
  });

  rects.forEach((rect) => {
    if (widths[rect.id] == null) widths[rect.id] = rect.w;
  });

  rects.forEach((right) => {
    if (!right.media) return;
    rects.forEach((left) => {
      if (left.id === right.id || left.x >= right.x - 0.2) return;
      if (right.id === 'customer_photo' && left.id !== 'section:customer_details') {
        return;
      }
      if (!sameCanvasRow(left.spec, right.spec)) return;
      const leftW = widths[left.id];
      const rightW = widths[right.id];
      if (!blocksOverlapHorizontally({ ...left, w: leftW }, { ...right, w: rightW })) return;
      if (
        shrinkLeftForRight(
          widths,
          left.id,
          left.x,
          leftW,
          right.x,
          left.media ? 8 : 20
        )
      ) {
        changed = true;
      }
    });
  });

  if (!changed) return config;

  const blockLayouts = { ...(config.blockLayouts || {}) };
  Object.keys(widths).forEach((id) => {
    const current = Number(getBlockLayout(config, id).widthPct) || 100;
    if (widths[id] === current) return;
    blockLayouts[id] = {
      ...(blockLayouts[id] || {}),
      widthPct: widths[id],
    };
  });

  return { ...config, blockLayouts };
};

const blockTopMmFromSpec = (spec, contentH) => {
  if (spec?.posYPct == null) return null;
  return FORM8_PAGE_PADDING_MM.top + (Number(spec.posYPct) / 100) * contentH;
};

/**
 * Push blocks under the stock table down when loan line items exceed one row.
 * Logos and sections above the table stay where the template placed them.
 */
export const withForm8StockRowFlow = (config, stockRows, basePageHeightMm = 297) => {
  const extraMm = form8StockFlowExtraMm(stockRows, {
    withImages: config?.layout?.showStockItemImages !== false,
  });
  if (!config?.singlePageLayout || extraMm < 0.5) return config;

  const order = getForm8BlockOrder(config);
  const stockIndex = order.indexOf('stock_line_items');
  if (stockIndex < 0) return config;

  const pageWidthMm = config.pageWidthMm || 210;
  const refH = getForm8ReferencePageHeightMm(config, basePageHeightMm);
  const contentH = getForm8ContentBoxMm(pageWidthMm, refH).height;
  const stockSpec = getBlockLayout(config, 'stock_line_items');
  const stockTop = blockTopMmFromSpec(stockSpec, contentH);
  if (stockTop == null) return config;

  const blockLayouts = { ...(config.blockLayouts || {}) };
  let changed = false;

  order.forEach((blockId, index) => {
    if (index <= stockIndex) return;
    const spec = { ...(blockLayouts[blockId] || {}), ...getBlockLayout(config, blockId) };
    const top = blockTopMmFromSpec(spec, contentH);
    if (top == null || top <= stockTop + 2) return;
    const shifted = top + extraMm;
    blockLayouts[blockId] = {
      ...spec,
      posYPct: ((shifted - FORM8_PAGE_PADDING_MM.top) / contentH) * 100,
      freePosition: true,
    };
    changed = true;
  });

  if (!changed) return config;
  return { ...config, blockLayouts };
};

/** Assign default % positions for blocks missing pos (stacked top-to-bottom). */
export const seedForm8CanvasPositions = (config) => {
  if (!config?.singlePageLayout) return config;

  const pageHeightMm = config.pageHeightMm || 297;
  const pageWidthMm = config.pageWidthMm || 210;
  const padding = FORM8_PAGE_PADDING_MM;
  const contentH = Math.max(1, pageHeightMm - padding.top - padding.bottom);

  const order = getForm8BlockOrder(config);
  const blockLayouts = { ...(config.blockLayouts || {}) };
  let yMm = padding.top;
  let changed = false;

  order.forEach((blockId) => {
    if (!isForm8BlockEnabled(config, blockId)) return;
    const existing = { ...(blockLayouts[blockId] || {}) };
    if (
      existing.freePosition &&
      existing.posXPct != null &&
      existing.posYPct != null
    ) {
      const h = blockStackHeightMm(config, blockId);
      yMm = Math.max(yMm, padding.top + (existing.posYPct / 100) * contentH + h + 2);
      return;
    }

    const spec = getBlockLayout({ ...config, blockLayouts }, blockId);
    const posXPct = clamp(Math.round(defaultPosXForBlock(spec, blockId)), 0, 100);
    const posYPct = clamp(Math.round(((yMm - padding.top) / contentH) * 100), 0, 100);

    blockLayouts[blockId] = {
      ...existing,
      posXPct,
      posYPct,
      freePosition: true,
      offsetXPct: null,
    };
    changed = true;
    yMm += blockStackHeightMm(config, blockId) + 2;
  });

  if (!changed) {
    return { ...config, canvasLayout: config.canvasLayout || 'free' };
  }

  return {
    ...config,
    blockLayouts,
    canvasLayout: 'free',
    pageHeightMm,
    pageWidthMm,
  };
};

export const getForm8ContentBoxMm = (pageWidthMm, pageHeightMm) => ({
  width: Math.max(1, pageWidthMm - FORM8_PAGE_PADDING_MM.left - FORM8_PAGE_PADDING_MM.right),
  height: Math.max(1, pageHeightMm - FORM8_PAGE_PADDING_MM.top - FORM8_PAGE_PADDING_MM.bottom),
});

/** Base A4 (or template) height used to interpret posYPct — stays fixed when canvas grows. */
export const getForm8ReferencePageHeightMm = (config, basePageHeightMm) =>
  config?.canvasReferencePageHeightMm ?? basePageHeightMm;

const HANDLE_BLEED_MM = 6;

/** Grow page height when blocks are dragged below the base sheet. */
export const computeForm8CanvasPageHeightMm = (config, basePageHeightMm) => {
  const pageWidthMm = config?.pageWidthMm || 210;
  const refH = getForm8ReferencePageHeightMm(config, basePageHeightMm);
  const baseContentH = getForm8ContentBoxMm(pageWidthMm, refH).height;
  const pad = FORM8_PAGE_PADDING_MM;
  let maxBottom = basePageHeightMm;

  getForm8BlockOrder(config).forEach((blockId) => {
    if (!isForm8BlockEnabled(config, blockId)) return;
    const spec = getBlockLayout(config, blockId);
    if (!spec.freePosition || spec.posYPct == null) return;
    const topMm = pad.top + (spec.posYPct / 100) * baseContentH;
    const blockH = blockStackHeightMm(config, blockId);
    maxBottom = Math.max(maxBottom, topMm + blockH + HANDLE_BLEED_MM + pad.bottom);
  });

  return Math.max(basePageHeightMm, Math.ceil(maxBottom));
};

/** Layout box (mm) from saved width % and height mm. */
export const getForm8MediaLayoutBoxMm = (config, blockId, pageWidthMm, basePageHeightMm) => {
  const spec = getBlockLayout(config, blockId);
  const refH = getForm8ReferencePageHeightMm(config, basePageHeightMm);
  const box = getForm8ContentBoxMm(pageWidthMm, refH);
  return {
    widthMm: ((spec.widthPct ?? 28) / 100) * box.width,
    heightMm: spec.heightMm ?? 14,
    contentWidthMm: box.width,
  };
};

/** Visible image size (mm) when fitted with object-fit contain inside the layout box. */
export const computeForm8MediaContainedSizeMm = (boxWidthMm, boxHeightMm, aspectRatio) => {
  const boxW = Math.max(0.5, Number(boxWidthMm) || 1);
  const boxH = Math.max(0.5, Number(boxHeightMm) || 1);
  if (!aspectRatio || !Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    return { widthMm: boxW, heightMm: boxH };
  }
  if (boxW / boxH > aspectRatio) {
    return { widthMm: boxH * aspectRatio, heightMm: boxH };
  }
  return { widthMm: boxW, heightMm: boxW / aspectRatio };
};

/** CSS for absolutely positioned builder / preview blocks (% of content box). */
export const blockAbsoluteFrameStyle = (config, blockId, pageWidthMm, basePageHeightMm) => {
  const spec = getBlockLayout(config, blockId);
  if (!spec.freePosition || spec.posXPct == null || spec.posYPct == null) {
    return null;
  }

  const refH = getForm8ReferencePageHeightMm(config, basePageHeightMm);
  const box = getForm8ContentBoxMm(pageWidthMm, refH);
  const posXPct = spec.posXPct ?? 0;
  const rawWidthPct = spec.widthPct ?? (isForm8FreeCanvasMediaBlock(blockId) ? 28 : 100);
  const widthPct = Math.min(rawWidthPct, Math.max(0, 100 - posXPct));
  const widthMm = (widthPct / 100) * box.width;
  const heightMm = spec.heightMm ?? 14;
  const leftMm = FORM8_PAGE_PADDING_MM.left + (posXPct / 100) * box.width;
  const topMm = FORM8_PAGE_PADDING_MM.top + (spec.posYPct / 100) * box.height;

  const mediaMaxVars = {
    '--f8-media-max-w': `${widthMm}mm`,
    '--f8-media-max-h': `${heightMm}mm`,
  };

  if (isForm8FreeCanvasMediaBlock(blockId)) {
    return {
      position: 'absolute',
      left: `${leftMm}mm`,
      top: `${topMm}mm`,
      width: `${widthMm}mm`,
      height: `${heightMm}mm`,
      minWidth: 0,
      minHeight: 0,
      boxSizing: 'border-box',
      zIndex: spec.zIndex ?? 2,
      margin: 0,
      overflow: 'visible',
      ...mediaMaxVars,
      '--f8-media-w': `${widthMm}mm`,
      '--f8-media-h': `${heightMm}mm`,
    };
  }

  return {
    position: 'absolute',
    left: `${leftMm}mm`,
    top: `${topMm}mm`,
    width: `${widthMm}mm`,
    maxWidth: `${widthMm}mm`,
    minHeight: `${heightMm}mm`,
    height: spec.heightMode === 'auto' ? 'auto' : `${heightMm}mm`,
    boxSizing: 'border-box',
    zIndex: spec.zIndex ?? 2,
    margin: 0,
    overflow: 'visible',
  };
};

/** pdfMake absolutePosition (pt) from saved layout. */
export const getForm8BlockPdfAbsolutePos = (
  config,
  blockId,
  contentWidthPt,
  refContentHeightPt,
  pageMargins
) => {
  const spec = getBlockLayout(config, blockId);
  const posXPct = spec.posXPct ?? 0;
  const posYPct = spec.posYPct ?? 0;
  const rawWidthPct = spec.widthPct ?? (isForm8FreeCanvasMediaBlock(blockId) ? 28 : 100);
  const widthPct = Math.min(rawWidthPct, Math.max(0, 100 - posXPct));
  const widthPt = Math.max(24, Math.round((widthPct / 100) * contentWidthPt));

  return {
    x: Math.round(pageMargins[0] + (posXPct / 100) * contentWidthPt),
    y: Math.round(pageMargins[1] + (posYPct / 100) * refContentHeightPt),
    widthPt,
  };
};

const mmToPx = (mm) => (mm * 96) / 25.4;

export const getPageContentMetricsFromEl = (pageEl, scale = 1) => {
  if (!pageEl) return null;
  const rect = pageEl.getBoundingClientRect();
  const s = scale > 0 ? scale : 1;
  const padTopPx = mmToPx(FORM8_PAGE_PADDING_MM.top);
  const padLeftPx = mmToPx(FORM8_PAGE_PADDING_MM.left);
  const padRightPx = mmToPx(FORM8_PAGE_PADDING_MM.right);
  const padBottomPx = mmToPx(FORM8_PAGE_PADDING_MM.bottom);
  const width = rect.width / s;

  const refHeightMm = parseFloat(pageEl.getAttribute('data-f8-ref-height-mm') || '', 10);
  const pageHeightPx =
    Number.isFinite(refHeightMm) && refHeightMm > 0 ? mmToPx(refHeightMm) : rect.height / s;

  const contentWidthPx = width - padLeftPx - padRightPx;
  const contentHeightPx = pageHeightPx - padTopPx - padBottomPx;
  return {
    pageLeft: rect.left,
    pageTop: rect.top,
    contentLeft: rect.left + padLeftPx * s,
    contentTop: rect.top + padTopPx * s,
    contentWidthPx,
    contentHeightPx,
    scale: s,
  };
};

export const pointerToCanvasPercent = (clientX, clientY, metrics, { maxYPct = FORM8_MAX_POS_Y_PCT } = {}) => {
  if (!metrics) return { posXPct: 0, posYPct: 0 };
  const x = (clientX - metrics.contentLeft) / metrics.scale;
  const y = (clientY - metrics.contentTop) / metrics.scale;
  const posXPct = clamp(Math.round((x / metrics.contentWidthPx) * 100), 0, 100);
  const posYPct = clamp(Math.round((y / metrics.contentHeightPx) * 100), 0, maxYPct);
  return { posXPct, posYPct };
};
