import defaultConfig from '../../data/defaultFormTemplate.json';
import { buildDefaultTemplateVariables } from './formTemplateMacros';
import {
  normalizeBuilderBlockOrder,
  seedForm8FreeMediaBlockLayout,
} from './formBuilderBlocks';
import { insertBlockInOrder } from './formBuilderPalette';
import {
  clampAllForm8CanvasBlockLayouts,
  computeForm8CanvasPageHeightMm,
  seedForm8CanvasPositions,
} from './formCanvasLayout';
import { FORM8_RETIRED_SECTION_IDS } from './formBuilderCatalog';
import { migrateForm8DividerBlocks } from './formDividerBlocks';
import { mergeSectionStyleFields } from './formSectionStyle';
import { normalizeFormSignatureLabels } from './formSignatures';
import {
  compressDataUrlIfNeeded,
  FORM_TEMPLATE_ASSET_KEYS,
  hasFormTemplateFooterImage,
} from './formTemplateImageAssets';
import { SAMPLE_FIRM_LOGO_DATA_URL } from './formTemplatePreviewAssets';
import {
  ensureForm8StockBlock,
  normalizeForm8LoanType,
  stripForm8StockBlocks,
} from './formLoanType';

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

/** Old seed used boxes shorter than the text, so the footer note sat on the terms. */
const isCrampedForm8Seed = (layouts = {}) =>
  Number(layouts.form_terms?.heightMm) === 14 && Number(layouts.form_footer?.heightMm) === 9;

const READABLE_FORM8_BLOCK_IDS = [
  'form_header',
  'section:firm_details',
  'section:customer_details',
  'customer_photo',
  'section:loan_details',
  'stock_line_items',
  'form_terms',
  'form_footer',
  'layout_footer_image',
  'signature_lines',
];

const applyReadableForm8Layouts = (blockLayouts, showFooterImage, assets) => {
  if (!isCrampedForm8Seed(blockLayouts)) {
    return { blockLayouts, showFooterImage, showCustomerPhoto: null };
  }
  const nextLayouts = { ...blockLayouts };
  READABLE_FORM8_BLOCK_IDS.forEach((id) => {
    const def = DEFAULT_FORM_CONFIG.blockLayouts?.[id];
    if (def) nextLayouts[id] = { ...def };
  });
  const pinnedFooter =
    blockLayouts.layout_footer_image?.freePosition &&
    Number(blockLayouts.layout_footer_image?.posYPct) >= 80;
  const hasFooterImage = Boolean(assets?.footerImageDataUrl);
  return {
    blockLayouts: nextLayouts,
    showFooterImage: pinnedFooter && !hasFooterImage ? false : showFooterImage,
    showCustomerPhoto: false,
  };
};

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
    'firm_email_id',
    'firm_website_link',
    'firm_city',
    'firm_pincode',
    'firm_type',
    'firm_owner',
    'firm_desc',
    'firm_address',
    'firm_pan_no',
    'firm_gstin_no',
    'firm_adhaar_no',
  ],
  customer_details: [
    'customer_id',
    'customer_name',
    'customer_father_name',
    'customer_mobile',
    'customer_phone',
    'customer_whatsapp',
    'customer_email',
    'customer_gender',
    'customer_aadhaar',
    'customer_pan',
    'customer_gstin',
    'customer_address',
    'customer_current_address',
    'customer_city',
    'customer_state',
    'customer_pincode',
    'owner_name_address',
    'customer_photo',
  ],
  loan_details: [
    'loan_no',
    'loan_date',
    'loan_amount',
    'loan_packet_no',
    'loan_locker_no',
    'interest_rate',
    'interest_type',
    'interest_option',
    'loan_process_amt',
    'loan_charge_amt',
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

  let sections = sourceSections.map((section, sIdx) => {
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

  if (!config.form8AllDescFields) {
    const descIds = new Set(['firm_details', 'customer_details', 'loan_details']);
    sections = sections.map((section) => {
      if (!descIds.has(section.id)) return section;
      return {
        ...section,
        fields: (section.fields || []).map((field) =>
          field.id === 'customer_photo' ? field : { ...field, enabled: true }
        ),
      };
    });
  }

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

  const readable = applyReadableForm8Layouts(
    isLegacyBuilder
      ? { ...(DEFAULT_FORM_CONFIG.blockLayouts || {}) }
      : {
          ...(DEFAULT_FORM_CONFIG.blockLayouts || {}),
          ...(config.blockLayouts || {}),
        },
    showFooterImage,
    config.assets || {}
  );

  const dividerMigrated = migrateForm8DividerBlocks({
    builderBlockOrder: normalizeBuilderBlockOrder(
      Array.isArray(config.builderBlockOrder) && config.builderBlockOrder.length
        ? config.builderBlockOrder
        : DEFAULT_FORM_CONFIG.builderBlockOrder || []
    ).filter((id) => id !== 'layout_logo'),
    blockLayouts: readable.blockLayouts,
  });
  const hasFooterImageAsset = hasFormTemplateFooterImage(config);
  const resolvedShowFooterImage = hasFooterImageAsset && Boolean(readable.showFooterImage);
  const loanType = normalizeForm8LoanType(config.loanType || config.formLoanType);
  const builderBlockOrder = (
    loanType === 'unsecured'
      ? stripForm8StockBlocks(dividerMigrated.builderBlockOrder)
      : ensureForm8StockBlock(dividerMigrated.builderBlockOrder)
  ).filter((id) => id !== 'layout_footer_image' || resolvedShowFooterImage);
  const blockLayouts = dividerMigrated.blockLayouts;
  const resolvedShowStockItemImages = loanType === 'unsecured' ? false : showStockItemImages;
  const resolvedShowCustomerPhoto =
    readable.showCustomerPhoto == null
      ? layoutFromConfig.showCustomerPhoto !== false
      : readable.showCustomerPhoto;

  const pageDims = getPageStyle({ ...DEFAULT_FORM_CONFIG, ...config, sections, builderBlockOrder, blockLayouts, layout: isLegacyBuilder ? DEFAULT_FORM_CONFIG.layout : { ...DEFAULT_FORM_CONFIG.layout, ...layoutFromConfig, showStockItemImages: resolvedShowStockItemImages, showFooterImage: resolvedShowFooterImage, showCustomerPhoto: resolvedShowCustomerPhoto } });

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
          showStockItemImages: resolvedShowStockItemImages,
          showFooterImage: resolvedShowFooterImage,
          showCustomerPhoto: resolvedShowCustomerPhoto,
        },
    builderBlockOrder,
    blockLayouts,
    loanType,
    assets: {
      ...(DEFAULT_FORM_CONFIG.assets || {}),
      ...(config.assets || {}),
      footerImageDataUrl: resolvedShowFooterImage
        ? String(config.assets?.footerImageDataUrl || '').trim()
        : '',
    },
    signatureLabels: normalizeFormSignatureLabels(config.signatureLabels),
    singlePageLayout,
    variables: config.variables?.length
      ? config.variables
      : buildDefaultTemplateVariables(),
    sections,
    form8AllDescFields: true,
    pageWidthMm: pageDims.widthMm,
    pageHeightMm: pageDims.heightMm,
    canvasLayout: config.canvasLayout || 'flow',
    canvasReferencePageHeightMm:
      config.canvasReferencePageHeightMm ?? pageDims.heightMm,
    canvasPageHeightMm: config.canvasPageHeightMm ?? pageDims.heightMm,
  });

  const heightUpgrade = {
    'section:firm_details': { from: [28, 36], to: 52 },
    'section:customer_details': { from: [24, 36], to: 56 },
    'section:loan_details': { from: [32, 42], to: 52 },
    customer_photo: { from: [24], to: 36 },
  };
  const nextLayouts = { ...(merged.blockLayouts || {}) };
  let layoutsChanged = false;
  Object.entries(heightUpgrade).forEach(([id, { from, to }]) => {
    const spec = nextLayouts[id];
    if (!spec || !from.includes(Number(spec.heightMm))) return;
    nextLayouts[id] = { ...spec, heightMm: to };
    layoutsChanged = true;
  });
  if (layoutsChanged) {
    merged = { ...merged, blockLayouts: nextLayouts };
  }

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
