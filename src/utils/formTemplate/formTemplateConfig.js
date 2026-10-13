import defaultConfig from '../../data/defaultFormTemplate.json';
import { buildDefaultTemplateVariables } from './formTemplateMacros';
import {
  normalizeBuilderBlockOrder,
  seedForm8FreeMediaBlockLayout,
} from './form8BuilderBlocks';
import { insertBlockInOrder } from './form8BuilderPalette';
import {
  clampAllForm8CanvasBlockLayouts,
  computeForm8CanvasPageHeightMm,
  seedForm8CanvasPositions,
} from './form8CanvasLayout';
import { FORM8_RETIRED_SECTION_IDS } from './form8BuilderCatalog';
import { migrateForm8DividerBlocks } from './form8DividerBlocks';
import { mergeSectionStyleFields } from './form8SectionStyle';
import { normalizeForm8SignatureLabels } from './form8Signatures';
import {
  compressDataUrlIfNeeded,
  FORM_TEMPLATE_ASSET_KEYS,
} from './formTemplateImageAssets';
import { SAMPLE_FIRM_LOGO_DATA_URL } from './formTemplatePreviewAssets';

export const DEFAULT_FORM_CONFIG = defaultConfig;

/** Ensure right logo is on the canvas when enabled (legacy templates). */
export const syncForm8LogoBlocks = (config) => {
  const layout = { ...(config.layout || {}) };
  let builderBlockOrder = normalizeBuilderBlockOrder(config.builderBlockOrder || []);
  let blockLayouts = { ...(config.blockLayouts || {}) };

  const onOrder = builderBlockOrder.includes('layout_right_logo');
  const wantsRight = layout.showRightLogo !== false || onOrder;
  if (!wantsRight) {
    blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'layout_left_logo');
    const wantsFooterEarly =
      layout.showFooterImage || builderBlockOrder.includes('layout_footer_image');
    if (wantsFooterEarly) {
      layout.showFooterImage = true;
      blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'layout_footer_image');
    }
    if (layout.showCustomerPhoto !== false || builderBlockOrder.includes('customer_photo')) {
      blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'customer_photo');
    }
    return { ...config, builderBlockOrder, layout, blockLayouts };
  }

  if (!onOrder) {
    builderBlockOrder = insertBlockInOrder(
      builderBlockOrder,
      'layout_right_logo',
      builderBlockOrder.includes('form_header') ? 'form_header' : null
    );
  }
  layout.showRightLogo = true;

  blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'layout_left_logo');
  blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'layout_right_logo');

  const wantsFooter = layout.showFooterImage || builderBlockOrder.includes('layout_footer_image');
  if (wantsFooter) {
    layout.showFooterImage = true;
    blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'layout_footer_image');
  }

  if (layout.showCustomerPhoto !== false || builderBlockOrder.includes('customer_photo')) {
    blockLayouts = seedForm8FreeMediaBlockLayout(blockLayouts, 'customer_photo');
  }

  return { ...config, builderBlockOrder, layout, blockLayouts };
};

export const PAGE_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 216, height: 279 },
};

export const FONT_SIZE_MAP = {
  small: 10,
  medium: 11,
  large: 12,
};

export const FORM_FIELD_FONT_PT_MIN = 6;
export const FORM_FIELD_FONT_PT_MAX = 18;

export const clampFieldFontPt = (n) =>
  Math.min(FORM_FIELD_FONT_PT_MAX, Math.max(FORM_FIELD_FONT_PT_MIN, n));

const readThemeFontPt = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return clampFieldFontPt(n);
};

/** Resolve section field label/value sizes (pt); theme overrides optional. */
export const resolveFieldFontSizes = (fontPt, theme = {}) => {
  const defaultLabel = clampFieldFontPt(fontPt - 1);
  const defaultValue = clampFieldFontPt(fontPt);
  return {
    labelFontPt: readThemeFontPt(theme.labelFontSizePt, defaultLabel),
    valueFontPt: readThemeFontPt(theme.valueFontSizePt, defaultValue),
  };
};

/** Form header main title (FORM 8 heading). */
export const resolveMainTitleFont = (fontPt, theme = {}) => ({
  mainTitleFontPt: readThemeFontPt(theme.titleFontSizePt, clampFieldFontPt(fontPt + 2)),
  mainTitleFontWeight: theme.titleFontWeight || '700',
});

/** Field width on form row: full = 1 per row, half = 2 per row, small = 3 per row */
export const FIELD_LAYOUT_OPTIONS = [
  { value: 'full', label: 'Full (1 per row)' },
  { value: 'half', label: 'Half (2 per row)' },
  { value: 'small', label: 'Small (3 per row)' },
];

export const normalizeFieldLayout = (layout) => {
  if (layout === 'full' || layout === 'small') return layout;
  return 'half';
};

export const getFieldLayoutClass = (layout) => {
  const key = normalizeFieldLayout(layout);
  return `layout-${key}`;
};

export const THEME_FIELDS = [
  { key: 'primaryColor', label: 'Primary / Title' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'textColor', label: 'Body text' },
  { key: 'mutedTextColor', label: 'Muted text' },
  { key: 'borderColor', label: 'Borders' },
  { key: 'headerBackground', label: 'Header background' },
  { key: 'sectionBackground', label: 'Section background' },
  { key: 'sectionTitleColor', label: 'Section titles' },
  { key: 'tableHeaderBackground', label: 'Table header' },
  { key: 'pageBackground', label: 'Page background' },
];

const findDefaultSection = (sectionId) =>
  (DEFAULT_FORM_CONFIG.sections || []).find((s) => s.id === sectionId);

const findDefaultField = (sectionId, fieldId) => {
  const section = findDefaultSection(sectionId);
  return (section?.fields || []).find((f) => f.id === fieldId);
};

const LEGACY_TXN_FIELD_IDS = new Set([
  'txn_date',
  'txn_type',
  'txn_amount',
  'txn_narration',
]);

const isLegacyTransactionSection = (section) =>
  section?.id === 'transaction_history' &&
  (section.fields || []).length > 0 &&
  (section.fields || []).every((field) => LEGACY_TXN_FIELD_IDS.has(field.id));

const mapDefaultSectionFields = (defSection) =>
  (defSection?.fields || []).map((field, fIdx) => ({
    ...field,
    order: field.order ?? fIdx + 1,
    fieldLayout: normalizeFieldLayout(field.fieldLayout),
    backgroundColor: '',
  }));

/** Pair-friendly field order for Form 8 description blocks (preview + PDF). */
const FORM8_TWO_COLUMN_FIELD_ORDER = {
  firm_details: [
    'firm_name',
    'firm_shop_name',
    'firm_reg_no',
    'firm_phone_no',
    'firm_address',
    'firm_pan_no',
    'firm_gstin_no',
  ],
  customer_details: [
    'customer_name',
    'customer_mobile',
    'customer_aadhaar',
    'customer_pan',
    'customer_address',
    'customer_photo',
  ],
  loan_details: [
    'loan_no',
    'loan_date',
    'loan_amount',
    'interest_rate',
    'interest_type',
    'loan_period',
    'due_date',
    'loan_status',
  ],
};

const applyTwoColumnFieldOrder = (sectionId, fields) => {
  const order = FORM8_TWO_COLUMN_FIELD_ORDER[sectionId];
  if (!order?.length) return fields;
  const byId = new Map((fields || []).map((f) => [f.id, f]));
  const out = [];
  order.forEach((id, idx) => {
    const field = byId.get(id);
    if (!field) return;
    out.push({
      ...field,
      order: idx + 1,
      fieldLayout: normalizeFieldLayout(field.fieldLayout),
    });
    byId.delete(id);
  });
  let nextOrder = out.length + 1;
  byId.forEach((field) => {
    out.push({
      ...field,
      order: nextOrder++,
      fieldLayout: normalizeFieldLayout(field.fieldLayout),
    });
  });
  return out;
};

export const normalizeFormConfig = (config) => {
  if (!config) return structuredClone(DEFAULT_FORM_CONFIG);

  const sourceSections =
    Array.isArray(config.sections) && config.sections.length
      ? config.sections
      : DEFAULT_FORM_CONFIG.sections;

  const mergeSectionFields = (section, defSection) => {
    if (isLegacyTransactionSection(section) && defSection) {
      return mapDefaultSectionFields(defSection);
    }

    const mergedFields = (section.fields || []).map((field, fIdx) => {
      const merged = {
        ...findDefaultField(section.id, field.id),
        ...field,
        order: field.order ?? fIdx + 1,
        fieldLayout: normalizeFieldLayout(field.fieldLayout),
        backgroundColor: field.backgroundColor || '',
      };
      if (section.id === 'customer_details' && field.id === 'owner_name_address') {
        merged.enabled = false;
      }
      if (section.id === 'item_details') {
        merged.enabled = false;
      }
      return merged;
    });

    const existingFieldIds = new Set(mergedFields.map((field) => field.id));
    (defSection?.fields || []).forEach((defField, fIdx) => {
      if (!existingFieldIds.has(defField.id)) {
        mergedFields.push({
          ...defField,
          order: defField.order ?? mergedFields.length + fIdx + 1,
          fieldLayout: normalizeFieldLayout(defField.fieldLayout),
          backgroundColor: '',
        });
      }
    });

    mergedFields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return applyTwoColumnFieldOrder(section.id, mergedFields);
  };

  const sections = sourceSections.map((section, sIdx) => {
    const defSection = findDefaultSection(section.id);
    const merged = {
      ...defSection,
      ...section,
      order: section.order ?? sIdx + 1,
      ...mergeSectionStyleFields(section, defSection),
      fields: mergeSectionFields(section, defSection),
    };
    if (FORM8_RETIRED_SECTION_IDS.has(section.id)) {
      merged.enabled = false;
    }
    return merged;
  });

  const existingSectionIds = new Set(sections.map((section) => section.id));
  DEFAULT_FORM_CONFIG.sections.forEach((defSection) => {
    if (!existingSectionIds.has(defSection.id)) {
      sections.push({
        ...defSection,
        fields: (defSection.fields || []).map((field, fIdx) => ({
          ...field,
          order: field.order ?? fIdx + 1,
          fieldLayout: normalizeFieldLayout(field.fieldLayout),
          backgroundColor: '',
        })),
      });
    }
  });

  sections.sort((a, b) => (a.order || 0) - (b.order || 0));

  const singlePageLayout =
    config.singlePageLayout !== undefined
      ? Boolean(config.singlePageLayout)
      : DEFAULT_FORM_CONFIG.singlePageLayout !== false;

  const isLegacyBuilder =
    !Array.isArray(config.builderBlockOrder) || config.builderBlockOrder.length === 0;

  const layoutFromConfig = config.layout || {};
  const showStockItemImages =
    layoutFromConfig.showStockItemImages !== undefined
      ? Boolean(layoutFromConfig.showStockItemImages)
      : DEFAULT_FORM_CONFIG.layout.showStockItemImages !== false;

  const showFooterImage =
    layoutFromConfig.showFooterImage !== undefined
      ? Boolean(layoutFromConfig.showFooterImage)
      : Boolean(DEFAULT_FORM_CONFIG.layout.showFooterImage);

  const dividerMigrated = migrateForm8DividerBlocks({
    builderBlockOrder: normalizeBuilderBlockOrder(
      Array.isArray(config.builderBlockOrder) && config.builderBlockOrder.length
        ? config.builderBlockOrder
        : DEFAULT_FORM_CONFIG.builderBlockOrder || []
    ).filter((id) => id !== 'layout_logo'),
    blockLayouts: isLegacyBuilder
      ? { ...(DEFAULT_FORM_CONFIG.blockLayouts || {}) }
      : {
          ...(DEFAULT_FORM_CONFIG.blockLayouts || {}),
          ...(config.blockLayouts || {}),
        },
  });
  const builderBlockOrder = dividerMigrated.builderBlockOrder;
  const blockLayouts = dividerMigrated.blockLayouts;

  const pageDims = getPageStyle({ ...DEFAULT_FORM_CONFIG, ...config, sections, builderBlockOrder, blockLayouts, layout: isLegacyBuilder ? DEFAULT_FORM_CONFIG.layout : { ...DEFAULT_FORM_CONFIG.layout, ...layoutFromConfig, showStockItemImages, showFooterImage } });

  let merged = syncForm8LogoBlocks({
    ...DEFAULT_FORM_CONFIG,
    ...config,
    subtitle: config.subtitle || DEFAULT_FORM_CONFIG.subtitle,
    complianceReference:
      config.complianceReference || DEFAULT_FORM_CONFIG.complianceReference || '',
    headerNote: config.headerNote || DEFAULT_FORM_CONFIG.headerNote || '',
    footerNoteTitle:
      config.footerNoteTitle || DEFAULT_FORM_CONFIG.footerNoteTitle || 'Footer note',
    footerNote: config.footerNote || DEFAULT_FORM_CONFIG.footerNote || '',
    termsAndConditions:
      config.termsAndConditions || DEFAULT_FORM_CONFIG.termsAndConditions,
    declarationText:
      config.declarationText || DEFAULT_FORM_CONFIG.declarationText,
    theme: { ...DEFAULT_FORM_CONFIG.theme, ...(config.theme || {}) },
    layout: isLegacyBuilder
      ? {
          ...DEFAULT_FORM_CONFIG.layout,
          useFirmFormHeader:
            layoutFromConfig.useFirmFormHeader !== undefined
              ? Boolean(layoutFromConfig.useFirmFormHeader)
              : DEFAULT_FORM_CONFIG.layout.useFirmFormHeader,
          useFirmFormFooter:
            layoutFromConfig.useFirmFormFooter !== undefined
              ? Boolean(layoutFromConfig.useFirmFormFooter)
              : DEFAULT_FORM_CONFIG.layout.useFirmFormFooter,
        }
      : {
          ...DEFAULT_FORM_CONFIG.layout,
          ...layoutFromConfig,
          showStockItemImages,
          showFooterImage,
        },
    builderBlockOrder,
    blockLayouts,
    assets: {
      ...(DEFAULT_FORM_CONFIG.assets || {}),
      ...(config.assets || {}),
    },
    signatureLabels: normalizeForm8SignatureLabels(config.signatureLabels),
    singlePageLayout,
    variables: config.variables?.length
      ? config.variables
      : buildDefaultTemplateVariables(),
    sections,
    pageWidthMm: pageDims.widthMm,
    pageHeightMm: pageDims.heightMm,
    canvasLayout: config.canvasLayout || 'flow',
    canvasReferencePageHeightMm:
      config.canvasReferencePageHeightMm ?? pageDims.heightMm,
    canvasPageHeightMm: config.canvasPageHeightMm ?? pageDims.heightMm,
  });

  if (merged.singlePageLayout) {
    const seeded = seedForm8CanvasPositions(merged);
    const bounded = clampAllForm8CanvasBlockLayouts(seeded);
    return {
      ...bounded,
      canvasPageHeightMm: computeForm8CanvasPageHeightMm(bounded, pageDims.heightMm),
      canvasReferencePageHeightMm: bounded.canvasReferencePageHeightMm ?? pageDims.heightMm,
    };
  }
  return merged;
};

const PREVIEW_ONLY_DATA_URLS = new Set([SAMPLE_FIRM_LOGO_DATA_URL]);

/** ~160 KB base64 — keeps JSON under typical proxy limits when combined with layout config. */
const MAX_STORED_ASSET_CHARS = 220_000;

const shrinkAssetDataUrl = async (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  const trimmed = dataUrl.trim();
  if (!trimmed) return '';
  if (PREVIEW_ONLY_DATA_URLS.has(trimmed)) return '';
  if (!trimmed.startsWith('data:image')) return '';
  if (trimmed.length <= MAX_STORED_ASSET_CHARS) return trimmed;
  try {
    const compressed = await compressDataUrlIfNeeded(trimmed);
    if (compressed.length > MAX_STORED_ASSET_CHARS) {
      return '';
    }
    return compressed;
  } catch {
    return '';
  }
};

/** Normalize layout and shrink embedded images before PUT (avoids HTTP 413). */
export const prepareFormTemplateConfigForSave = async (config) => {
  let payload = normalizeFormConfig(config);
  if (payload.singlePageLayout) {
    payload.canvasLayout = 'free';
    const baseH = getPageStyle(payload).heightMm;
    payload.canvasReferencePageHeightMm = baseH;
    payload.canvasPageHeightMm = computeForm8CanvasPageHeightMm(payload, baseH);
  }

  delete payload.printHtml;

  const assetKeys = Object.values(FORM_TEMPLATE_ASSET_KEYS);
  const assets = { ...(payload.assets || {}) };
  await Promise.all(
    assetKeys.map(async (key) => {
      assets[key] = await shrinkAssetDataUrl(assets[key]);
    })
  );

  return { ...payload, assets };
};

export const getSortedSections = (config) =>
  [...(config?.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

export const getSortedFields = (section) =>
  [...(section?.fields || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

export const reorderList = (list, fromIndex, toIndex) => {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, idx) => ({ ...item, order: idx + 1 }));
};

export const getPageStyle = (config) => {
  const size = config?.pageSize || 'A4';
  const orientation = config?.orientation || 'portrait';
  const dims = PAGE_DIMENSIONS_MM[size] || PAGE_DIMENSIONS_MM.A4;
  const width = orientation === 'landscape' ? dims.height : dims.width;
  const height = orientation === 'landscape' ? dims.width : dims.height;
  const theme = config?.theme || DEFAULT_FORM_CONFIG.theme;
  const baseFontPt = FONT_SIZE_MAP[config?.fontSize] || FONT_SIZE_MAP.medium;
  const fontPt =
    config?.singlePageLayout ? Math.max(8, baseFontPt - 1) : baseFontPt;
  const { labelFontPt, valueFontPt } = resolveFieldFontSizes(fontPt, theme);
  const { mainTitleFontPt, mainTitleFontWeight } = resolveMainTitleFont(fontPt, theme);

  return {
    widthMm: width,
    heightMm: height,
    fontPt,
    labelFontPt,
    valueFontPt,
    mainTitleFontPt,
    mainTitleFontWeight,
    theme,
    cssVars: {
      '--ft-primary': theme.primaryColor,
      '--ft-secondary': theme.secondaryColor,
      '--ft-accent': theme.accentColor,
      '--ft-text': theme.textColor,
      '--ft-muted': theme.mutedTextColor,
      '--ft-border': theme.borderColor,
      '--ft-header-bg': theme.headerBackground,
      '--ft-section-bg': theme.sectionBackground,
      '--ft-section-title': theme.sectionTitleColor,
      '--ft-table-header': theme.tableHeaderBackground,
      '--ft-page-bg': theme.pageBackground,
      '--ft-font-pt': `${fontPt}pt`,
      '--ft-label-font-pt': `${labelFontPt}pt`,
      '--ft-value-font-pt': `${valueFontPt}pt`,
      '--ft-main-title-font-pt': `${mainTitleFontPt}pt`,
      '--ft-main-title-font-weight': mainTitleFontWeight,
      '--ft-label-font-weight': theme.labelFontWeight || '600',
      '--ft-value-font-weight': theme.valueFontWeight || '500',
    },
  };
};

export const replaceTemplateVariables = (text, data = {}) => {
  if (!text) return '';
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
};

/** Group fields into PDF/preview rows by fieldLayout */
export const groupFieldsByLayout = (fields) => {
  const enabled = [...(fields || [])]
    .filter((f) => f.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const groups = [];
  let i = 0;

  while (i < enabled.length) {
    const layout = normalizeFieldLayout(enabled[i].fieldLayout);

    if (layout === 'full') {
      groups.push({ layout: 'full', fields: [enabled[i]] });
      i += 1;
      continue;
    }

    if (layout === 'small') {
      const chunk = [];
      while (
        i < enabled.length &&
        normalizeFieldLayout(enabled[i].fieldLayout) === 'small' &&
        chunk.length < 3
      ) {
        chunk.push(enabled[i]);
        i += 1;
      }
      groups.push({ layout: 'small', fields: chunk });
      continue;
    }

    const chunk = [enabled[i]];
    i += 1;
    if (
      i < enabled.length &&
      normalizeFieldLayout(enabled[i].fieldLayout) === 'half'
    ) {
      chunk.push(enabled[i]);
      i += 1;
    }
    groups.push({ layout: 'half', fields: chunk });
  }

  return groups;
};

/** @deprecated Use groupFieldsByLayout — respects half / full / small fieldLayout. */
export const groupFieldsAsTwoColumnRows = (fields) => groupFieldsByLayout(fields);
