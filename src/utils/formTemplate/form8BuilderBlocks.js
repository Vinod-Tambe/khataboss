import { pickBlockStyleFields, wrapPdfImageWithBorder } from './form8BlockStyle';
import { hasFormTemplateFooterImage } from './formTemplateImageAssets';
import {
  FORM8_OPTIONAL_SECTION_IDS,
  isForm8PaletteBlockHidden,
  parseSectionBlockId,
  sectionBlockId,
} from './form8BuilderCatalog';
import {
  fieldBlockId,
  FORM8_POSITIONABLE_FIELDS,
  isForm8FieldBlockId,
  parseFieldBlockId,
} from './form8FieldBlocks';
import { isForm8DividerBlockId, readForm8DividerOwnStyle } from './form8DividerBlocks';
import { isForm8SecuredTemplate } from './form8LoanType';

const FORM8_SETTINGS_BLOCKS = new Set(['page_settings', 'macro_keywords']);
const FORM8_OPTIONAL_BLOCK_IDS = new Set([
  'layout_right_logo',
  'customer_photo',
  'stock_line_items',
  'form_terms',
  'form_footer',
  'layout_footer_image',
  'signature_lines',
  'form_divider',
  'form_legal',
  ...FORM8_POSITIONABLE_FIELDS.map((f) => fieldBlockId(f.id)),
]);

export const isForm8RequiredBlock = (blockId) => {
  if (FORM8_SETTINGS_BLOCKS.has(blockId)) return false;
  if (isForm8FieldBlockId(blockId)) return false;
  if (isForm8DividerBlockId(blockId)) return false;
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    return !FORM8_OPTIONAL_SECTION_IDS.has(sectionId);
  }
  return !FORM8_OPTIONAL_BLOCK_IDS.has(blockId);
};

/** Section blocks the user may remove from the canvas (includes core sections). */
export const canRemoveForm8SectionBlock = (blockId) => Boolean(parseSectionBlockId(blockId));

/** Any canvas block except template tools (page settings / macros). */
export const canRemoveForm8Block = (blockId) => !FORM8_SETTINGS_BLOCKS.has(blockId);

export const canToggleForm8BlockOnCanvas = (blockId) => canRemoveForm8Block(blockId);

/** Default canvas block order for Form 8 single-page pledge register. */
export const FORM8_LOGO_BAND_LEFT = 'layout_left_logo';
export const FORM8_LOGO_BAND_RIGHT = 'layout_right_logo';

/** Blocks allowed between left and right logos in one row (optional middle). */
export const FORM8_LOGO_BAND_CENTER_IDS = new Set(['section:firm_details']);

export const isForm8LogoBlockId = (blockId) =>
  blockId === 'layout_left_logo' || blockId === 'layout_right_logo';

export const isForm8FooterImageBlockId = (blockId) => blockId === 'layout_footer_image';

/** Logos, footer banner, customer photo — shared resize / aspect / PDF sizing. */
export const isForm8MediaBlockId = (blockId) =>
  isForm8LogoBlockId(blockId) ||
  isForm8FooterImageBlockId(blockId) ||
  blockId === 'customer_photo';

export const isForm8FreeCanvasMediaBlock = (blockId) => isForm8MediaBlockId(blockId);

/** Logo/photo max 80% width; footer banner may span full content width. */
export const getForm8MediaWidthLimits = (blockId) => {
  if (isForm8FooterImageBlockId(blockId)) {
    return { min: 8, max: 100 };
  }
  if (isForm8MediaBlockId(blockId)) {
    return { min: 8, max: 80 };
  }
  return { min: 20, max: 100 };
};

export const FORM8_DEFAULT_BLOCK_ORDER = [
  'layout_left_logo',
  'layout_right_logo',
  'form_header',
  'section:firm_details',
  'section:customer_details',
  'customer_photo',
  'section:loan_details',
  'stock_line_items',
  'form_terms',
  'form_footer',
  'signature_lines',
];

export const FORM8_BLOCK_META = {
  layout_left_logo: {
    label: 'Left logo',
    group: 'blocks',
  },
  layout_right_logo: {
    label: 'Right logo',
    group: 'blocks',
  },
  layout_logo: {
    label: 'Firm logos (legacy)',
    group: 'blocks',
  },
  form_header: {
    label: 'Form header',
    group: 'blocks',
  },
  ...Object.fromEntries(
    FORM8_POSITIONABLE_FIELDS.map((f) => [
      fieldBlockId(f.id),
      { label: f.label, group: 'blocks' },
    ])
  ),
  'section:firm_details': {
    label: 'Firm desc',
    group: 'sections',
  },
  'section:customer_details': {
    label: 'Customer desc',
    group: 'sections',
  },
  customer_photo: {
    label: 'Customer photo',
    group: 'blocks',
  },
  'section:loan_details': {
    label: 'Loan desc',
    group: 'sections',
  },
  stock_line_items: {
    label: 'Stock desc',
    group: 'blocks',
  },
  form_divider: {
    label: 'Divider',
    group: 'blocks',
  },
  form_terms: {
    label: 'Terms & conditions',
    group: 'blocks',
  },
  form_footer: {
    label: 'Footer note',
    group: 'blocks',
  },
  layout_footer_image: {
    label: 'Footer image',
    group: 'blocks',
  },
  signature_lines: {
    label: 'Signatures (Owner / Customer)',
    group: 'blocks',
  },
  'section:transaction_history': {
    label: 'Payment register',
    description: 'Item 5 — payments table',
    group: 'sections',
  },
  'section:item_details': {
    label: 'Item fields (legacy)',
    description: 'Use stock line items block instead',
    group: 'sections',
  },
  'section:redemption_details': {
    label: 'Redemption details',
    description: 'Items 9–11',
    group: 'sections',
  },
  'section:interest_summary': {
    label: 'Account summary',
    description: 'Optional totals',
    group: 'sections',
  },
  form_legal: {
    label: 'Terms & signatures (legacy)',
    description: 'Split into terms + signature blocks',
    group: 'blocks',
  },
  page_settings: { label: 'Page & theme', group: 'settings' },
  macro_keywords: { label: 'Macro keywords', group: 'settings' },
};

/** Default block sizes (mm height, % width). Stock table uses heightMode auto. */
export const FORM8_DEFAULT_BLOCK_LAYOUTS = {
  layout_left_logo: { widthPct: 28, heightMm: 14, heightMode: 'fixed' },
  layout_right_logo: { widthPct: 28, heightMm: 14, heightMode: 'fixed' },
  layout_logo: { widthPct: 100, heightMm: 11, heightMode: 'fixed' },
  form_header: { widthPct: 100, heightMm: 22, heightMode: 'fixed' },
  'field:today_date': {
    widthPct: 34,
    heightMm: 6,
    heightMode: 'fixed',
    posXPct: 66,
    posYPct: 1.5,
    freePosition: true,
    hAlign: 'right',
  },
  'field:loan_date': {
    widthPct: 34,
    heightMm: 6,
    heightMode: 'fixed',
    posXPct: 66,
    posYPct: 4,
    freePosition: true,
    hAlign: 'right',
  },
  'field:loan_no': {
    widthPct: 40,
    heightMm: 6,
    heightMode: 'fixed',
    posXPct: 60,
    posYPct: 6.5,
    freePosition: true,
    hAlign: 'right',
  },
  'section:firm_details': { widthPct: 100, heightMm: 52, heightMode: 'fixed' },
  'section:customer_details': { widthPct: 100, heightMm: 56, heightMode: 'fixed' },
  customer_photo: { widthPct: 22, heightMm: 36, heightMode: 'fixed' },
  'section:loan_details': { widthPct: 100, heightMm: 52, heightMode: 'fixed' },
  stock_line_items: { widthPct: 100, heightMm: null, heightMode: 'auto' },
  form_divider: { widthPct: 100, heightMm: 6, heightMode: 'fixed' },
  form_terms: { widthPct: 100, heightMm: 28, heightMode: 'fixed' },
  form_footer: { widthPct: 100, heightMm: 18, heightMode: 'fixed' },
  layout_footer_image: { widthPct: 100, heightMm: 12, heightMode: 'fixed', hAlign: 'center' },
  signature_lines: { widthPct: 100, heightMm: 20, heightMode: 'fixed' },
  'section:transaction_history': { widthPct: 100, heightMm: 14, heightMode: 'fixed' },
  'section:item_details': { widthPct: 100, heightMm: 16, heightMode: 'fixed' },
  'section:redemption_details': { widthPct: 100, heightMm: 10, heightMode: 'fixed' },
  'section:interest_summary': { widthPct: 100, heightMm: 10, heightMode: 'fixed' },
};

const legacyLogoLayout = (config) => config?.blockLayouts?.layout_logo;

/** Same free-canvas box as logos (width %, height mm, drag + resize). */
export const seedForm8FreeMediaBlockLayout = (blockLayouts, blockId) => {
  const defaults = FORM8_DEFAULT_BLOCK_LAYOUTS[blockId];
  if (!defaults || !isForm8MediaBlockId(blockId)) {
    return blockLayouts;
  }
  const cur = blockLayouts[blockId] || {};
  const widthPct = cur.widthPct ?? defaults.widthPct ?? 28;
  if (cur.freePosition && cur.posXPct != null && cur.posYPct != null) {
    return blockLayouts;
  }
  let defaultPosX = defaults.posXPct;
  if (defaultPosX == null) {
    if (blockId === 'layout_right_logo') {
      defaultPosX = Math.max(0, 100 - widthPct);
    } else if (isForm8FooterImageBlockId(blockId)) {
      defaultPosX = Math.max(0, (100 - widthPct) / 2);
    } else {
      defaultPosX = 0;
    }
  }
  return {
    ...blockLayouts,
    [blockId]: {
      ...defaults,
      ...cur,
      widthPct,
      heightMm: cur.heightMm ?? defaults.heightMm ?? 14,
      heightMode: cur.heightMode ?? 'fixed',
      posXPct: cur.posXPct ?? defaultPosX,
      posYPct: cur.posYPct ?? defaults.posYPct ?? 0,
      freePosition: true,
      hAlign:
        cur.hAlign ??
        defaults.hAlign ??
        (blockId === 'layout_right_logo' ? 'right' : isForm8FooterImageBlockId(blockId) ? 'center' : 'left'),
      offsetXPct: null,
    },
  };
};

export const normalizeBuilderBlockOrder = (order = []) => {
  const out = [];
  order.forEach((id) => {
    if (id === 'layout_logo') {
      if (!out.includes('layout_left_logo')) out.push('layout_left_logo');
      if (!out.includes('layout_right_logo')) out.push('layout_right_logo');
      return;
    }
    if (id === 'layout_firm_center') return;
    if (isForm8PaletteBlockHidden(id)) return;
    if (!out.includes(id)) out.push(id);
  });
  return out;
};

/**
 * One segment per block so any element can be placed anywhere in the vertical flow.
 * (Legacy logo_band grouping removed for free reorder in builder + PDF.)
 */
export const partitionForm8BlockOrder = (order = []) =>
  order.map((id) => ({ type: 'single', id }));

export const getBlockLayout = (config, blockId) => {
  let custom = config?.blockLayouts?.[blockId] || {};
  if (!Object.keys(custom).length && blockId === 'layout_left_logo') {
    custom = legacyLogoLayout(config) || {};
  }
  if (!Object.keys(custom).length && blockId === 'layout_right_logo') {
    custom = legacyLogoLayout(config) || {};
  }
  const defaults = FORM8_DEFAULT_BLOCK_LAYOUTS[blockId]
    || (isForm8DividerBlockId(blockId) ? FORM8_DEFAULT_BLOCK_LAYOUTS.form_divider : null)
    || {
      widthPct: 100,
      heightMm: 12,
      heightMode: 'fixed',
    };
  const hAlign =
    custom.hAlign ??
    defaults.hAlign ??
    (blockId === 'layout_right_logo' ? 'right' : blockId === 'layout_left_logo' ? 'left' : 'left');

  return {
    widthPct: custom.widthPct ?? defaults.widthPct ?? 100,
    heightMm: custom.heightMm ?? defaults.heightMm ?? 12,
    heightMode: custom.heightMode ?? defaults.heightMode ?? 'fixed',
    hAlign,
    offsetXPct:
      custom.offsetXPct !== undefined && custom.offsetXPct !== null
        ? custom.offsetXPct
        : defaults.offsetXPct ?? null,
    posXPct:
      custom.posXPct !== undefined && custom.posXPct !== null
        ? custom.posXPct
        : defaults.posXPct ?? null,
    posYPct:
      custom.posYPct !== undefined && custom.posYPct !== null
        ? custom.posYPct
        : defaults.posYPct ?? null,
    freePosition: Boolean(custom.freePosition),
    zIndex: custom.zIndex ?? defaults.zIndex ?? 2,
    stockHiddenColumns: Array.isArray(custom.stockHiddenColumns)
      ? custom.stockHiddenColumns
      : defaults.stockHiddenColumns || [],
    ...pickBlockStyleFields(defaults),
    ...pickBlockStyleFields(custom),
    ...(isForm8DividerBlockId(blockId)
      ? readForm8DividerOwnStyle({ blockLayouts: { [blockId]: custom } }, blockId)
      : {}),
  };
};

export const getForm8BlockOrder = (config) => {
  const order = config?.builderBlockOrder;
  const merged =
    Array.isArray(order) && order.length
      ? normalizeBuilderBlockOrder(order)
      : [...FORM8_DEFAULT_BLOCK_ORDER];
  return merged
    .filter((id) => id !== 'layout_logo' && id !== 'layout_firm_center')
    .filter((id) => isForm8BlockEnabled(config, id));
};

export const buildForm8PaletteItems = (config, sections = []) => {
  const order = getForm8BlockOrder(config);
  const sectionIds = new Set(sections.map((s) => sectionBlockId(s.id)));

  const items = order
    .filter((blockId) => {
      if (blockId === 'section:item_details') return false;
      const sectionId = parseSectionBlockId(blockId);
      if (sectionId) return sectionIds.has(blockId);
      if (blockId === 'layout_logo') return false;
      if (isForm8DividerBlockId(blockId)) return true;
      return Boolean(FORM8_BLOCK_META[blockId]);
    })
    .map((blockId) => {
      const meta = FORM8_BLOCK_META[blockId] || { label: blockId, description: '' };
      const sectionId = parseSectionBlockId(blockId);
      let enabled = true;
      if (sectionId) {
        const section = sections.find((s) => s.id === sectionId);
        enabled = Boolean(section?.enabled);
      } else if (blockId === 'layout_left_logo') {
        enabled = config.layout?.showLeftLogo !== false;
      } else if (blockId === 'layout_right_logo') {
        enabled = config.layout?.showRightLogo !== false;
      } else if (blockId === 'customer_photo') {
        enabled = config.layout?.showCustomerPhoto !== false;
      } else if (blockId === 'stock_line_items') {
        enabled = isForm8SecuredTemplate(config);
      } else if (blockId === 'layout_footer_image') {
        enabled =
          Boolean(config.layout?.showFooterImage) && hasFormTemplateFooterImage(config);
      } else if (blockId === 'form_terms') {
        enabled = Boolean(config.termsAndConditions);
      } else if (blockId === 'form_footer') {
        enabled = Boolean(
          config.footerNote || config.layout?.useFirmFormFooter
        );
      } else if (blockId === 'signature_lines') {
        enabled = Boolean(Object.keys(config.signatureLabels || {}).length);
      }

      return {
        id: blockId,
        label: meta.label || blockId,
        enabled,
        onForm: enabled,
      };
    });

  return items;
};

export const isForm8BlockEnabled = (config, blockId) => {
  const order = config?.builderBlockOrder;
  if (Array.isArray(order) && order.length) {
    if (!isForm8RequiredBlock(blockId) && !order.includes(blockId)) {
      return false;
    }
  }
  const layout = config?.layout || {};
  const fieldId = parseFieldBlockId(blockId);
  if (fieldId) {
    return Boolean(order?.includes(blockId));
  }
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = (config?.sections || []).find((s) => s.id === sectionId);
    return Boolean(section?.enabled);
  }
  if (isForm8DividerBlockId(blockId)) {
    return Boolean(order?.includes(blockId));
  }
  switch (blockId) {
    case 'layout_left_logo':
      return layout.showLeftLogo !== false;
    case 'layout_right_logo':
      return layout.showRightLogo !== false;
    case 'layout_logo':
      return Boolean(layout.showLeftLogo || layout.showRightLogo);
    case 'customer_photo':
      return layout.showCustomerPhoto !== false;
    case 'stock_line_items':
      if (!isForm8SecuredTemplate(config)) return false;
      if (Array.isArray(order) && order.length && !order.includes(blockId)) return false;
      return true;
    case 'layout_footer_image':
      return Boolean(layout.showFooterImage) && hasFormTemplateFooterImage(config);
    case 'form_terms':
      return Boolean(config?.termsAndConditions);
    case 'form_footer':
      return Boolean(config?.footerNote || layout.useFirmFormFooter);
    case 'signature_lines':
      return Boolean(Object.keys(config?.signatureLabels || {}).length);
    case 'form_header':
      return true;
    default:
      return true;
  }
};

export const blockShellStyle = (config, blockId, { inLogoBand = false } = {}) => {
  const spec = getBlockLayout(config, blockId);
  const { widthPct, heightMm, hAlign, offsetXPct, freePosition, heightMode } = spec;

  if (freePosition) {
    const style = {
      width: '100%',
      maxWidth: '100%',
      height: heightMode === 'auto' ? 'auto' : '100%',
      boxSizing: 'border-box',
    };
    if (heightMode !== 'auto' && heightMm != null) {
      style.minHeight = `${heightMm}mm`;
    }
    if (isForm8MediaBlockId(blockId)) {
      const fillPhoto = blockId === 'customer_photo';
      style.display = 'flex';
      style.alignItems = fillPhoto ? 'stretch' : 'center';
      style.justifyContent = fillPhoto
        ? 'stretch'
        : hAlign === 'center' || isForm8FooterImageBlockId(blockId)
          ? 'center'
          : hAlign === 'right' || blockId === 'layout_right_logo'
            ? 'flex-end'
            : 'flex-start';
      style['--f8-logo-max-mm'] = `${heightMm ?? 14}mm`;
    }
    return style;
  }

  if (isForm8MediaBlockId(blockId)) {
    const defaultWidth = isForm8FooterImageBlockId(blockId) ? 40 : 28;
    const style = {
      width: `${widthPct ?? defaultWidth}%`,
      maxWidth: '100%',
      display: 'block',
      '--f8-logo-max-mm': `${heightMm ?? 14}mm`,
    };
    if (offsetXPct != null && Number.isFinite(Number(offsetXPct))) {
      style.marginLeft = `${offsetXPct}%`;
      style.marginRight = 'auto';
    } else if (hAlign === 'center' || isForm8FooterImageBlockId(blockId)) {
      style.marginLeft = 'auto';
      style.marginRight = 'auto';
    } else if (hAlign === 'right' || blockId === 'layout_right_logo') {
      style.marginLeft = 'auto';
      style.marginRight = 0;
    } else {
      style.marginLeft = 0;
      style.marginRight = 'auto';
    }
    return style;
  }

  if (inLogoBand) {
    if (parseSectionBlockId(blockId)) {
      return {
        flex: `1 1 ${widthPct}%`,
        minWidth: 0,
        maxWidth: '100%',
        width: 'auto',
      };
    }
  }

  const style = {
    width: `${widthPct}%`,
    maxWidth: '100%',
  };
  if (blockId === 'layout_right_logo') {
    style.marginLeft = 'auto';
    style.marginRight = 0;
  } else if (blockId === 'layout_left_logo') {
    style.marginRight = 'auto';
    style.marginLeft = 0;
  } else if (widthPct < 100) {
    style.marginLeft = 'auto';
    style.marginRight = 'auto';
  }
  return style;
};

/** Builder preview: cap logo image size in px (widthPct is % of page content width). */
export const getForm8LogoMediaStyle = (config, blockId, pageWidthPx) => {
  const { widthPct, heightMm } = getBlockLayout(config, blockId);
  const w = Number(pageWidthPx) > 0 ? pageWidthPx : 793;
  return {
    maxHeight: `${heightMm ?? 14}mm`,
    maxWidth: Math.max(20, Math.round((widthPct / 100) * w)),
    width: '100%',
    height: 'auto',
  };
};

const mmToPt = (mm) => (Number(mm) * 72) / 25.4;

/** pdfMake logo block from saved blockLayouts (position + size). */
export const buildForm8LogoPdfDefinition = (
  normalized,
  blockId,
  imageKey,
  contentWidthPt,
  { compact = false } = {}
) => {
  if (!imageKey) return null;
  const { widthPct, heightMm, hAlign, offsetXPct } = getBlockLayout(normalized, blockId);
  const widthPt = Math.max(24, Math.round(((widthPct ?? 28) / 100) * contentWidthPt));
  const heightPt = Math.max(24, Math.round(mmToPt(heightMm ?? 14)));
  const imageCell = wrapPdfImageWithBorder(
    { image: imageKey, width: widthPt, height: heightPt },
    getBlockLayout(normalized, blockId)
  );

  let margin = [0, 0, 0, compact ? 4 : 8];
  if (offsetXPct != null && Number.isFinite(Number(offsetXPct))) {
    const offsetPt = Math.round((Number(offsetXPct) / 100) * Math.max(0, contentWidthPt - widthPt));
    return {
      columns: [
        { width: offsetPt, text: '' },
        { width: widthPt, ...imageCell },
        { width: '*', text: '' },
      ],
      margin,
    };
  }

  const align =
    hAlign === 'center' ? 'center' : hAlign === 'right' || blockId === 'layout_right_logo' ? 'right' : 'left';

  if (align === 'left') {
    return {
      columns: [imageCell, { width: '*', text: '' }],
      margin,
    };
  }
  if (align === 'right') {
    return {
      columns: [{ width: '*', text: '' }, { ...imageCell, alignment: 'right' }],
      margin,
    };
  }
  return {
    columns: [
      { width: '*', text: '' },
      { width: widthPt, ...imageCell, alignment: 'center' },
      { width: '*', text: '' },
    ],
    margin,
  };
};

/** Free canvas: image sized exactly to saved layout box (pt). */
export const buildForm8MediaPdfImage = (normalized, blockId, imageKey, contentWidthPt) => {
  if (!imageKey) return null;
  const { widthPct, heightMm, posXPct } = getBlockLayout(normalized, blockId);
  const rawWidthPct = widthPct ?? 28;
  const clampedWidthPct = Math.min(rawWidthPct, Math.max(0, 100 - (posXPct ?? 0)));
  const widthPt = Math.max(24, Math.round((clampedWidthPct / 100) * contentWidthPt));
  const heightPt = Math.max(24, Math.round(mmToPt(heightMm ?? 14)));
  return wrapPdfImageWithBorder(
    {
      image: imageKey,
      width: widthPt,
      height: heightPt,
    },
    getBlockLayout(normalized, blockId)
  );
};

export const blockShellClass = (config, blockId) => {
  const { heightMode } = getBlockLayout(config, blockId);
  return `f8-block-shell f8-block-shell--${heightMode === 'auto' ? 'auto' : 'fixed'}`;
};
