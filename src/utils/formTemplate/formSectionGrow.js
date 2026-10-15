import { getSortedFields, groupFieldsByLayout, replaceTemplateVariables } from './formTemplateConfig';
import { getFormFieldValue } from './formTemplateTestData';
import { getForm8FieldDisplayLabel } from './formSectionDisplay';
import { parseSectionBlockId } from './formBuilderCatalog';
import {
  FORM8_PDF_LINE_HEIGHT,
  getForm8SectionFieldFontSizes,
  getForm8SectionPdfBoxMetrics,
} from './formSectionStyle';
import { templateHtmlToPlain } from './formTemplateRichText';
import {
  getForm8BlockOrder,
  getBlockLayout,
  isForm8BlockEnabled,
  isForm8FreeCanvasMediaBlock,
} from './formBuilderBlocks';
import {
  FORM8_PAGE_PADDING_MM,
  getForm8ContentBoxMm,
  getForm8ReferencePageHeightMm,
} from './formCanvasLayout';

const mmToPt = (mm) => (Number(mm) * 72) / 25.4;
const ptToMm = (pt) => (Number(pt) * 25.4) / 72;
const SIDE_BY_SIDE_MM = 5;

const wrapLineCount = (text, widthPt, fontPt) => {
  const parts = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n');
  const charW = Math.max(3.2, Number(fontPt) * 0.52);
  const perLine = Math.max(8, Math.floor(Math.max(16, widthPt) / charW));
  return parts.reduce((sum, part) => sum + Math.max(1, Math.ceil((part.length || 1) / perLine)), 0);
};

const estimateSectionContentMm = (section, formData, widthPt, compact, labelFontPt, valueFontPt) => {
  if (!section) return 0;
  const metrics = getForm8SectionPdfBoxMetrics(compact);
  const lineH = FORM8_PDF_LINE_HEIGHT;
  const fonts = getForm8SectionFieldFontSizes(section, labelFontPt, valueFontPt);
  const titlePt = fonts.value * lineH + metrics.titleMargin[1] + metrics.titleMargin[3];
  const innerW = Math.max(40, widthPt - metrics.bodyPadX);
  let bodyPt = metrics.bodyMargin[1] + metrics.bodyMargin[3];

  const fields = getSortedFields(section).filter((field) => field.enabled);
  groupFieldsByLayout(fields).forEach((group) => {
    const gap = compact ? 6 : 10;
    const colCount =
      group.layout === 'small' ? Math.max(1, group.fields.length) : group.fields.length > 1 ? 2 : 1;
    const colW =
      colCount > 1
        ? Math.max(36, Math.floor((innerW - gap * (colCount - 1)) / colCount))
        : innerW;
    const labelRatio = compact ? 0.44 : 0.4;
    let rowLines = 1;
    group.fields.forEach((field) => {
      const labelW = Math.max(20, colW * labelRatio);
      const valueW = Math.max(20, colW - labelW);
      rowLines = Math.max(
        rowLines,
        wrapLineCount(getForm8FieldDisplayLabel(field), labelW, fonts.label),
        wrapLineCount(getFormFieldValue(field.id, formData), valueW, fonts.value)
      );
    });
    bodyPt += rowLines * fonts.value * lineH + metrics.fieldPadY * 2 + metrics.fieldRowGap;
  });

  if (section.id === 'transaction_history' || section.id === 'emi_schedule') {
    bodyPt += 28;
  }

  return ptToMm(titlePt + bodyPt);
};

const estimateTextBlockMm = (text, widthPt, fontPt, compact) => {
  const metrics = getForm8SectionPdfBoxMetrics(compact);
  const titleFont = Number(fontPt) + 1;
  const titlePt = titleFont * FORM8_PDF_LINE_HEIGHT;
  const innerW = Math.max(40, widthPt - metrics.bodyPadX);
  const lines = wrapLineCount(text, innerW, fontPt);
  const bodyPt =
    metrics.bodyMargin[1] +
    metrics.bodyMargin[3] +
    titlePt +
    4 +
    lines * fontPt * FORM8_PDF_LINE_HEIGHT;
  return ptToMm(bodyPt);
};

const estimateHeaderMm = (config, widthPt, fontPt, compact, formData, firmFormHeader) => {
  const innerW = Math.max(40, widthPt);
  let lines = 1;
  if (config.subtitle) lines += wrapLineCount(config.subtitle, innerW, fontPt);
  if (config.complianceReference) {
    lines += wrapLineCount(config.complianceReference, innerW, Math.max(6, fontPt - 2));
  }
  if (config.headerNote) {
    lines += wrapLineCount(replaceTemplateVariables(config.headerNote, formData || {}), innerW, fontPt);
  }
  if (config.layout?.useFirmFormHeader && firmFormHeader) {
    lines += wrapLineCount(templateHtmlToPlain(firmFormHeader), innerW, fontPt);
  }
  return ptToMm(lines * fontPt * FORM8_PDF_LINE_HEIGHT + (compact ? 8 : 14));
};

const estimateStockMm = (options = {}) => {
  const rows = Array.isArray(options.stockItemRows) ? options.stockItemRows : [];
  const withImages = options.showStockItemImages !== false;
  const chromeMm = 16;
  const headerMm = 7;
  const footerMm = 7;
  if (!rows.length) return chromeMm + headerMm + footerMm + 10;
  const body = rows.reduce((sum, row) => {
    const hasImg = withImages && Boolean(row?.previewImageUrl || row?.imageDataUrl);
    return sum + (hasImg ? 15 : 10);
  }, 0);
  return chromeMm + headerMm + footerMm + body;
};

const reservedHeightMm = (blockId, spec) => {
  const saved = Number(spec.heightMm);
  if (blockId === 'stock_line_items' || spec.heightMode === 'auto') {
    return Number.isFinite(saved) && saved > 0 ? Math.max(saved, 36) : 36;
  }
  return Number.isFinite(saved) && saved > 0 ? saved : 12;
};

const overlapsX = (a, b) => a.x + a.w > b.x + 0.6 && b.x + b.w > a.x + 0.6;

export const measureForm8BlockContentMm = (config, blockId, options = {}) => {
  const spec = getBlockLayout(config, blockId);
  const reservedMm = Math.max(8, Number(spec.heightMm) || 12);
  const compact = options.compact !== false;
  const pageWidthMm = config.pageWidthMm || 210;
  const refH = getForm8ReferencePageHeightMm(config, options.basePageHeightMm || 297);
  const contentW = getForm8ContentBoxMm(pageWidthMm, refH).width;
  const widthPct = Math.min(Number(spec.widthPct) || 100, Math.max(0, 100 - (spec.posXPct ?? 0)));
  const widthPt = mmToPt((widthPct / 100) * contentW);
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId && sectionId !== 'item_details') {
    const sections = Array.isArray(options.sections) ? options.sections : config.sections || [];
    const section = sections.find((item) => item.id === sectionId);
    const photoSeparate =
      getForm8BlockOrder(config).includes('customer_photo') &&
      config.layout?.showCustomerPhoto !== false;
    const fieldsForSection =
      sectionId === 'customer_details' && photoSeparate
        ? {
            ...section,
            fields: (section?.fields || []).filter((field) => field.id !== 'customer_photo'),
          }
        : section;
    return estimateSectionContentMm(
      fieldsForSection,
      options.formData || {},
      widthPt,
      compact,
      Number(options.labelFontPt) || 9,
      Number(options.valueFontPt) || 9
    );
  }
  return reservedMm;
};

export const getForm8BlockFillSpacerPt = (config, blockId, contentMm) => {
  const reservedMm = Number(getBlockLayout(config, blockId).heightMm) || 0;
  const usedContent = Number(contentMm);
  if (!(reservedMm > 2) || !Number.isFinite(usedContent) || usedContent <= 0) return 0;
  const gapMm = reservedMm - usedContent;
  if (gapMm < 1) return 0;
  return mmToPt(Math.min(gapMm, reservedMm * 0.55));
};

const blockContentMm = (config, blockId, spec, widthPt, options) => {
  const reservedMm = reservedHeightMm(blockId, spec);
  const formData = options.formData || {};
  const compact = options.compact !== false;
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId && sectionId !== 'item_details') {
    const sections = Array.isArray(options.sections) ? options.sections : config.sections || [];
    const section = sections.find((item) => item.id === sectionId);
    const photoSeparate =
      getForm8BlockOrder(config).includes('customer_photo') &&
      config.layout?.showCustomerPhoto !== false;
    const fieldsForSection =
      sectionId === 'customer_details' && photoSeparate
        ? {
            ...section,
            fields: (section?.fields || []).filter((field) => field.id !== 'customer_photo'),
          }
        : section;
    return estimateSectionContentMm(
      fieldsForSection,
      formData,
      widthPt,
      compact,
      Number(options.labelFontPt) || 9,
      Number(options.valueFontPt) || 9
    );
  }
  if (blockId === 'form_header') {
    return estimateHeaderMm(
      config,
      widthPt,
      Number(options.fontPt) || 9,
      compact,
      formData,
      options.firmFormHeader
    );
  }
  if (blockId === 'form_terms') {
    return estimateTextBlockMm(
      replaceTemplateVariables(config.termsAndConditions || '', formData),
      widthPt,
      Number(options.fontPt) || 9,
      compact
    );
  }
  if (blockId === 'form_footer') {
    const footerText =
      config.layout?.useFirmFormFooter && options.firmFormFooter
        ? options.firmFormFooter
        : config.footerNote || '';
    return estimateTextBlockMm(
      templateHtmlToPlain(replaceTemplateVariables(footerText, formData)),
      widthPt,
      Number(options.fontPt) || 9,
      compact
    );
  }
  if (blockId === 'stock_line_items') {
    return estimateStockMm(options);
  }
  if (isForm8FreeCanvasMediaBlock(blockId)) {
    return reservedMm;
  }
  return reservedMm;
};

const MIN_BOX_GAP_MM = 1.6;

const resolveForm8Overlaps = (config, options = {}) => {
  if (!config?.singlePageLayout) return config;

  const mode = options.mode === 'box' ? 'box' : 'content';
  const basePageHeightMm = options.basePageHeightMm || config.pageHeightMm || 297;
  const pageWidthMm = config.pageWidthMm || 210;
  const refH = getForm8ReferencePageHeightMm(config, basePageHeightMm);
  const contentBox = getForm8ContentBoxMm(pageWidthMm, refH);
  const contentH = contentBox.height;
  const contentW = contentBox.width;
  const order = getForm8BlockOrder(config);
  const stockOptions = {
    ...options,
    stockItemRows:
      options.stockItemRows ||
      (config.layout?.showStockItemImages !== false ? [{ previewImageUrl: '1' }] : [{}]),
    showStockItemImages: options.showStockItemImages ?? config.layout?.showStockItemImages !== false,
  };

  const items = [];
  order.forEach((blockId) => {
    if (!isForm8BlockEnabled(config, blockId)) return;
    const spec = getBlockLayout(config, blockId);
    if (spec.posYPct == null) return;
    const reservedMm = reservedHeightMm(blockId, spec);
    const widthPct = Math.min(Number(spec.widthPct) || 100, Math.max(0, 100 - (spec.posXPct ?? 0)));
    const contentMm = blockContentMm(
      config,
      blockId,
      spec,
      mmToPt((widthPct / 100) * contentW),
      stockOptions
    );
    const usedMm =
      mode === 'box'
        ? blockId === 'stock_line_items'
          ? Math.max(reservedMm, contentMm)
          : reservedMm
        : Math.max(reservedMm, contentMm);
    items.push({
      id: blockId,
      x: Number(spec.posXPct) || 0,
      w: widthPct,
      topMm: FORM8_PAGE_PADDING_MM.top + (Number(spec.posYPct) / 100) * contentH,
      reservedMm,
      usedMm,
      contentMm,
      media: isForm8FreeCanvasMediaBlock(blockId),
    });
  });

  if (items.length < 2) return config;

  items.sort((a, b) => a.topMm - b.topMm || a.x - b.x || a.id.localeCompare(b.id));
  const topById = Object.fromEntries(items.map((item) => [item.id, item.topMm]));

  const isSideBySide = (upper, lower) =>
    (upper.media || lower.media) && Math.abs(upper.topMm - lower.topMm) < SIDE_BY_SIDE_MM;

  const resolveOverlaps = () => {
    let moved = false;
    items.forEach((upper, index) => {
      const upperBottom = topById[upper.id] + upper.usedMm;
      items.slice(index + 1).forEach((lower) => {
        if (isSideBySide(upper, lower)) return;
        if (!overlapsX(upper, lower)) return;
        const templateGap = lower.topMm - (upper.topMm + upper.reservedMm);
        const keepGap = templateGap > 0.4 ? templateGap : mode === 'box' ? MIN_BOX_GAP_MM : 0;
        const needed = upperBottom + keepGap - topById[lower.id];
        if (needed > 0.4) {
          topById[lower.id] += needed;
          moved = true;
        }
      });
    });
    return moved;
  };
  let pass = 0;
  while (resolveOverlaps() && pass < 8) {
    pass += 1;
  }

  const blockLayouts = { ...(config.blockLayouts || {}) };
  let changed = false;

  items.forEach((item) => {
    const nextTop = topById[item.id];
    const shift = nextTop - item.topMm;
    const skipHeightWrite = item.id === 'stock_line_items' || mode === 'box';
    const heightChanged = !skipHeightWrite && Math.abs(item.usedMm - item.reservedMm) > 0.4;
    if (shift < 0.4 && !heightChanged) return;
    blockLayouts[item.id] = {
      ...(blockLayouts[item.id] || {}),
      ...(heightChanged ? { heightMm: item.usedMm } : {}),
      ...(shift >= 0.4
        ? {
            posYPct: ((nextTop - FORM8_PAGE_PADDING_MM.top) / contentH) * 100,
            freePosition: true,
          }
        : {}),
      templateHeightMm: item.reservedMm,
      contentHeightMm: item.contentMm,
    };
    changed = true;
  });

  if (!changed) return config;
  return { ...config, blockLayouts };
};

/** Editor: keep placed boxes apart. Does not change saved heights. */
export const withForm8BoxOverlapFlow = (config, options = {}) =>
  resolveForm8Overlaps(config, { ...options, mode: 'box' });

/** PDF / loan: grow a box only when values are taller, then keep the editor gap. */
export const withForm8SectionGrowFlow = (config, options = {}) =>
  resolveForm8Overlaps(config, { ...options, mode: options.mode || 'content' });
