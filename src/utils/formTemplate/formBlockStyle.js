import { clampFieldFontPt } from './formTemplateConfig';
import { getForm8TextSizePt, getForm8TextWeight } from './formTypographyGroups';
import {
  FORM8_FONT_WEIGHT_OPTIONS,
  FORM8_PDF_LINE_HEIGHT,
  isForm8SectionBorderOn,
  pdfBoldFromWeight,
} from './formSectionStyle';

export { FORM8_FONT_WEIGHT_OPTIONS };

export const FORM8_BLOCK_STYLE_KEYS = [
  'backgroundColor',
  'borderColor',
  'titleColor',
  'titleBackgroundColor',
  'titleFontSizePt',
  'titleFontWeight',
  'bodyFontSizePt',
  'bodyFontWeight',
  'bodyColor',
  'bodyBackgroundColor',
  'titleBorder',
  'titleBorderColor',
  'titleBorderWidth',
  'titleBorderRadius',
  'bodyBorder',
  'bodyBorderColor',
  'bodyBorderWidth',
  'bodyBorderRadius',
  'labelFontSizePt',
  'labelFontWeight',
  'labelColor',
  'valueFontSizePt',
  'valueFontWeight',
  'sectionBorder',
  'sectionBorderWidth',
  'sectionBorderRadius',
  'tableBorder',
  'tableBorderColor',
  'tableBorderWidth',
  'tableBorderRadius',
  'tableHeaderBackgroundColor',
  'tableHeaderColor',
  'tableHeaderFontSizePt',
  'tableHeaderFontWeight',
  'tableBodyBackgroundColor',
  'tableBodyColor',
  'tableBodyFontSizePt',
  'tableBodyFontWeight',
  'tableFooterBackgroundColor',
  'tableFooterColor',
  'tableFooterFontSizePt',
  'tableFooterFontWeight',
  'imageBorder',
  'imageBorderColor',
  'imageBorderWidth',
  'imageBorderRadius',
  'subtitleColor',
  'subtitleFontSizePt',
  'subtitleFontWeight',
  'subtitleBackgroundColor',
  'complianceColor',
  'complianceFontSizePt',
  'complianceFontWeight',
  'complianceBackgroundColor',
  'noteColor',
  'noteFontSizePt',
  'noteFontWeight',
  'noteBackgroundColor',
  'headerBorder',
  'headerBorderWidth',
  'headerBorderRadius',
  'signatureLineColor',
  'signatureLineWidth',
  'dividerColor',
  'dividerWidth',
  'dividerStyle',
];

export const FORM8_HEADER_LINE_DEFS = [
  {
    id: 'title',
    label: 'Form title',
    colorKey: 'titleColor',
    sizeKey: 'titleFontSizePt',
    weightKey: 'titleFontWeight',
    bgKey: 'titleBackgroundColor',
    fallbackColor: 'primaryColor',
    fallbackHex: '#3d4f63',
    defaultBold: true,
  },
  {
    id: 'subtitle',
    label: 'Subtitle',
    colorKey: 'subtitleColor',
    sizeKey: 'subtitleFontSizePt',
    weightKey: 'subtitleFontWeight',
    bgKey: 'subtitleBackgroundColor',
    fallbackColor: 'sectionTitleColor',
    fallbackHex: '#5b6b7c',
    defaultBold: false,
  },
  {
    id: 'compliance',
    label: 'Compliance reference',
    colorKey: 'complianceColor',
    sizeKey: 'complianceFontSizePt',
    weightKey: 'complianceFontWeight',
    bgKey: 'complianceBackgroundColor',
    fallbackColor: 'textColor',
    fallbackHex: '#4a5568',
    defaultBold: false,
  },
  {
    id: 'note',
    label: 'Header note',
    colorKey: 'noteColor',
    sizeKey: 'noteFontSizePt',
    weightKey: 'noteFontWeight',
    bgKey: 'noteBackgroundColor',
    fallbackColor: 'textColor',
    fallbackHex: '#4a5568',
    defaultBold: false,
  },
];

export const FORM8_BLOCK_STYLE_RESET_PATCH = Object.fromEntries(
  FORM8_BLOCK_STYLE_KEYS.map((key) => [key, ''])
);

const hasValue = (v) => v != null && String(v).trim() !== '';

const parsePt = (raw, fallback) => {
  if (!hasValue(raw)) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? clampFieldFontPt(n) : fallback;
};

const resolveWeightCss = (raw, fallback) => {
  if (!hasValue(raw)) return fallback;
  const w = String(raw);
  if (w === 'normal') return '400';
  if (w === 'bold') return '700';
  return w;
};

export const pickBlockStyleFields = (layoutSpec = {}) => {
  const out = {};
  FORM8_BLOCK_STYLE_KEYS.forEach((key) => {
    if (hasValue(layoutSpec[key])) out[key] = layoutSpec[key];
  });
  return out;
};

/** Blocks that support Advance typography (stored on blockLayouts). */
export const FORM8_TYPOGRAPHY_BLOCK_IDS = new Set([
  'form_header',
  'form_terms',
  'form_footer',
  'stock_line_items',
  'signature_lines',
  'customer_photo',
  'layout_left_logo',
  'layout_right_logo',
  'layout_footer_image',
]);

export const getForm8BlockBoxPreviewStyle = (layoutSpec) => {
  const style = {};
  if (hasValue(layoutSpec?.backgroundColor)) style.backgroundColor = layoutSpec.backgroundColor;
  if (hasValue(layoutSpec?.borderColor)) {
    style.border = `1px solid ${layoutSpec.borderColor}`;
  }
  return style;
};

export const blockHasCustomBox = (layoutSpec) =>
  hasValue(layoutSpec?.backgroundColor) || hasValue(layoutSpec?.borderColor);

export const isForm8HeaderBorderOn = (layoutSpec) => {
  const v = layoutSpec?.headerBorder;
  return v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';
};

export const getForm8HeaderBoxPreviewStyle = (layoutSpec) => {
  const style = {};
  if (hasValue(layoutSpec?.backgroundColor)) {
    style.backgroundColor = layoutSpec.backgroundColor;
  }
  if (isForm8HeaderBorderOn(layoutSpec)) {
    const color = hasValue(layoutSpec?.borderColor) ? layoutSpec.borderColor : '#2c5282';
    const width = parseImageNumber(layoutSpec?.headerBorderWidth, 1);
    style.border = `${width}px solid ${color}`;
  }
  const radius = parseImageNumber(layoutSpec?.headerBorderRadius, null);
  if (radius != null) style.borderRadius = `${radius}px`;
  if (Object.keys(style).length) {
    style.padding = '8px 10px';
    style.boxSizing = 'border-box';
  }
  return style;
};

export const headerHasCustomBox = (layoutSpec) =>
  hasValue(layoutSpec?.backgroundColor) || isForm8HeaderBorderOn(layoutSpec);

const parseImageNumber = (raw, fallback) => {
  if (!hasValue(raw)) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

export const isForm8ImageBorderOn = (layoutSpec) => {
  const v = layoutSpec?.imageBorder;
  return v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';
};

/** Preview: border + radius on the picture itself (not a box behind it). */
export const getForm8ImageBorderPreviewStyle = (layoutSpec) => {
  if (!isForm8ImageBorderOn(layoutSpec)) return {};
  const color = hasValue(layoutSpec?.imageBorderColor)
    ? layoutSpec.imageBorderColor
    : '#2c5282';
  const width = parseImageNumber(layoutSpec?.imageBorderWidth, 1);
  const radius = parseImageNumber(layoutSpec?.imageBorderRadius, 0);
  return {
    border: `${width}px solid ${color}`,
    borderRadius: `${radius}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };
};

/** pdfMake: draw a rounded stroke over the image so print matches preview. */
export const wrapPdfImageWithBorder = (imageNode, layoutSpec) => {
  if (!imageNode || !isForm8ImageBorderOn(layoutSpec)) return imageNode;
  const w = Number(imageNode.width);
  const h = Number(imageNode.height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return imageNode;
  const color = hasValue(layoutSpec?.imageBorderColor)
    ? layoutSpec.imageBorderColor
    : '#2c5282';
  const widthPx = parseImageNumber(layoutSpec?.imageBorderWidth, 1);
  const radiusPx = parseImageNumber(layoutSpec?.imageBorderRadius, 0);
  const lineWidth = (widthPx * 72) / 96;
  const radiusPt = (radiusPx * 72) / 96;
  const inset = lineWidth / 2;
  return {
    stack: [
      imageNode,
      {
        canvas: [
          {
            type: 'rect',
            x: inset,
            y: inset,
            w: Math.max(0.5, w - lineWidth),
            h: Math.max(0.5, h - lineWidth),
            r: radiusPt,
            lineWidth,
            lineColor: color,
          },
        ],
        margin: [0, -h, 0, 0],
      },
    ],
  };
};

export const getForm8HeaderLinePreviewStyle = (layoutSpec, line) => {
  const style = {};
  const pt = parsePt(layoutSpec?.[line.sizeKey], null);
  if (pt != null) style.fontSize = `${pt}pt`;
  if (hasValue(layoutSpec?.[line.colorKey])) style.color = layoutSpec[line.colorKey];
  const w = resolveWeightCss(layoutSpec?.[line.weightKey], null);
  if (w != null) style.fontWeight = w;
  if (hasValue(layoutSpec?.[line.bgKey])) {
    style.backgroundColor = layoutSpec[line.bgKey];
    style.padding = '2px 6px';
    style.display = 'inline-block';
    style.maxWidth = '100%';
    style.boxSizing = 'border-box';
  }
  return style;
};

export const getForm8HeaderLinePdfProps = (layoutSpec, line, fallbackPt) => {
  const color = hasValue(layoutSpec?.[line.colorKey])
    ? layoutSpec[line.colorKey]
    : null;
  const fillColor = hasValue(layoutSpec?.[line.bgKey])
    ? layoutSpec[line.bgKey]
    : null;
  return {
    fontSize: parsePt(layoutSpec?.[line.sizeKey], fallbackPt),
    bold: pdfBoldFromWeight(layoutSpec?.[line.weightKey], Boolean(line.defaultBold)),
    color,
    fillColor,
  };
};

export const getForm8BlockTitlePreviewStyle = (layoutSpec, theme, baseTitlePt = 11) => {
  const style = {};
  const pt = parsePt(layoutSpec?.titleFontSizePt, null);
  if (pt != null) style.fontSize = `${pt}pt`;
  if (hasValue(layoutSpec?.titleColor)) style.color = layoutSpec.titleColor;
  else if (theme?.sectionTitleColor) style.color = theme.sectionTitleColor;
  if (hasValue(layoutSpec?.titleBackgroundColor)) {
    style.backgroundColor = layoutSpec.titleBackgroundColor;
  }
  const w = resolveWeightCss(layoutSpec?.titleFontWeight, null);
  if (w != null) style.fontWeight = w;
  if (!pt && baseTitlePt) style.fontSize = style.fontSize || `${baseTitlePt}pt`;
  return style;
};

export const getForm8BlockLabelPreviewStyle = (layoutSpec, theme, baseLabelPt = 9) => {
  const style = {};
  const pt = parsePt(layoutSpec?.labelFontSizePt, null);
  if (pt != null) style.fontSize = `${pt}pt`;
  else if (baseLabelPt) style.fontSize = `${baseLabelPt}pt`;
  if (hasValue(layoutSpec?.labelColor)) style.color = layoutSpec.labelColor;
  else if (hasValue(layoutSpec?.titleColor)) style.color = layoutSpec.titleColor;
  else if (theme?.sectionTitleColor) style.color = theme.sectionTitleColor;
  const w = resolveWeightCss(layoutSpec?.labelFontWeight, null);
  if (w != null) style.fontWeight = w;
  return style;
};

export const getForm8BlockBodyPreviewStyle = (layoutSpec, theme, baseBodyPt = 10) => {
  const style = {};
  const pt = parsePt(getForm8TextSizePt(layoutSpec), null);
  if (pt != null) style.fontSize = `${pt}pt`;
  else if (baseBodyPt) style.fontSize = `${baseBodyPt}pt`;
  if (hasValue(layoutSpec?.bodyColor)) style.color = layoutSpec.bodyColor;
  else if (theme?.textColor) style.color = theme.textColor;
  const w = resolveWeightCss(getForm8TextWeight(layoutSpec), null);
  if (w != null) style.fontWeight = w;
  return style;
};

export const getForm8BlockPdfTitleProps = (layoutSpec, theme, fontPt) => {
  const defaultPt = clampFieldFontPt(fontPt);
  const titlePt = parsePt(layoutSpec?.titleFontSizePt, defaultPt);
  return {
    fontSize: titlePt,
    bold: pdfBoldFromWeight(layoutSpec?.titleFontWeight, true),
    color: hasValue(layoutSpec?.titleColor) ? layoutSpec.titleColor : theme.sectionTitleColor,
    fillColor: hasValue(layoutSpec?.titleBackgroundColor)
      ? layoutSpec.titleBackgroundColor
      : theme.tableHeaderBackground,
  };
};

export const getForm8BlockPdfLabelProps = (layoutSpec, theme, labelFontPt) => ({
  fontSize: parsePt(layoutSpec?.labelFontSizePt, labelFontPt),
  bold: pdfBoldFromWeight(layoutSpec?.labelFontWeight, true),
  color: hasValue(layoutSpec?.labelColor)
    ? layoutSpec.labelColor
    : hasValue(layoutSpec?.titleColor)
      ? layoutSpec.titleColor
      : theme.sectionTitleColor,
});

export const getForm8BlockPdfBodyProps = (layoutSpec, theme, labelFontPt, valueFontPt) => {
  const bodyPt = parsePt(getForm8TextSizePt(layoutSpec), valueFontPt);
  return {
    fontSize: bodyPt,
    bold: pdfBoldFromWeight(getForm8TextWeight(layoutSpec), false),
    color: hasValue(layoutSpec?.bodyColor) ? layoutSpec.bodyColor : theme.textColor,
    fillColor: hasValue(layoutSpec?.bodyBackgroundColor)
      ? layoutSpec.bodyBackgroundColor
      : null,
  };
};

const isFlagOn = (v) =>
  v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';

export const isForm8TextPartBorderOn = (layoutSpec, part) =>
  isFlagOn(part === 'body' ? layoutSpec?.bodyBorder : layoutSpec?.titleBorder);

export const form8TextPartHasBox = (layoutSpec, part) => {
  const bg = part === 'body' ? layoutSpec?.bodyBackgroundColor : layoutSpec?.titleBackgroundColor;
  return hasValue(bg) || isForm8TextPartBorderOn(layoutSpec, part);
};

/** Preview `.form-custom-a4-section` box for terms / footer note. */
export const getForm8TextSectionPdfBoxSpec = (layoutSpec = {}, theme = {}) => ({
  ...layoutSpec,
  borderColor: hasValue(layoutSpec.borderColor)
    ? layoutSpec.borderColor
    : theme.borderColor || '#2c5282',
  backgroundColor: hasValue(layoutSpec.backgroundColor)
    ? layoutSpec.backgroundColor
    : theme.sectionBackground || '#ffffff',
  sectionBorder: isForm8SectionBorderOn(layoutSpec) ? layoutSpec.sectionBorder || true : false,
});

const hexToPdf = (hex, fallback) => {
  const h = String(hex || fallback || '#000000').replace('#', '');
  return h.length === 6 ? `#${h}` : fallback || '#000000';
};

/** Preview styles for Terms title or body (color, fill, border, type). */
export const getForm8TextPartPreviewStyle = (layoutSpec = {}, part, theme = {}, fallbackPt = 10) => {
  const isBody = part === 'body';
  const style = {};
  const color = isBody ? layoutSpec.bodyColor : layoutSpec.titleColor;
  const bg = isBody ? layoutSpec.bodyBackgroundColor : layoutSpec.titleBackgroundColor;
  const size = isBody
    ? getForm8TextSizePt(layoutSpec) || layoutSpec.bodyFontSizePt
    : layoutSpec.titleFontSizePt;
  const weight = isBody
    ? getForm8TextWeight(layoutSpec) || layoutSpec.bodyFontWeight
    : layoutSpec.titleFontWeight;

  if (hasValue(color)) style.color = color;
  else if (isBody && theme.textColor) style.color = theme.textColor;
  else if (!isBody && theme.sectionTitleColor) style.color = theme.sectionTitleColor;

  if (hasValue(bg)) style.backgroundColor = bg;

  const pt = parsePt(size, null);
  if (pt != null) style.fontSize = `${pt}pt`;
  else if (fallbackPt) style.fontSize = `${fallbackPt}pt`;

  const w = resolveWeightCss(weight, null);
  if (w != null) style.fontWeight = w;
  else if (!isBody) style.fontWeight = '700';

  if (style.color) style['--ft-text-part-color'] = style.color;
  if (style.fontSize) style['--ft-text-part-size'] = style.fontSize;
  if (style.fontWeight) style['--ft-text-part-weight'] = style.fontWeight;

  if (isForm8TextPartBorderOn(layoutSpec, part)) {
    const borderColor = isBody
      ? layoutSpec.bodyBorderColor || '#2c5282'
      : layoutSpec.titleBorderColor || '#2c5282';
    const width = parseImageNumber(
      isBody ? layoutSpec.bodyBorderWidth : layoutSpec.titleBorderWidth,
      1
    );
    style.border = `${width}px solid ${borderColor}`;
  }
  const radius = parseImageNumber(
    isBody ? layoutSpec.bodyBorderRadius : layoutSpec.titleBorderRadius,
    null
  );
  if (radius != null) style.borderRadius = `${radius}px`;

  style.display = 'block';
  style.width = '100%';
  style.boxSizing = 'border-box';
  if (style.backgroundColor || style.border || style.borderRadius) {
    style.padding = isBody ? '6px 8px' : '5px 8px';
    style.margin = isBody ? '4px 0 0' : '0';
  }

  return style;
};

/** pdfMake block for a Terms title or body row with its own box. */
export const buildForm8TextPartPdfBlock = (layoutSpec, part, textProps, theme, compact = false) => {
  const isBody = part === 'body';
  const showBorder = isForm8TextPartBorderOn(layoutSpec, part);
  const borderColor = hexToPdf(
    isBody ? layoutSpec.bodyBorderColor : layoutSpec.titleBorderColor,
    theme.borderColor || '#2c5282'
  );
  const widthPx = parseImageNumber(
    isBody ? layoutSpec.bodyBorderWidth : layoutSpec.titleBorderWidth,
    1
  );
  const lineW = showBorder ? Math.max(0.3, (widthPx * 72) / 96) : 0;
  const fill = isBody ? layoutSpec.bodyBackgroundColor : layoutSpec.titleBackgroundColor;

  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            text: textProps.text,
            color: hexToPdf(textProps.color, isBody ? theme.textColor : theme.sectionTitleColor),
            fillColor: hasValue(fill) ? hexToPdf(fill, fill) : undefined,
            fontSize: textProps.fontSize,
            bold: textProps.bold,
            lineHeight: FORM8_PDF_LINE_HEIGHT,
            margin: compact ? [4, 2, 4, 2] : [8, 5, 8, 5],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => lineW,
      vLineWidth: () => lineW,
      hLineColor: () => borderColor,
      vLineColor: () => borderColor,
    },
    margin: [0, 0, 0, compact || isBody ? 0 : 2],
  };
};

export const signatureHasCustomBox = (layoutSpec) =>
  hasValue(layoutSpec?.backgroundColor) || isForm8SectionBorderOn(layoutSpec);

export const getFormSignatureSectionBoxStyle = (layoutSpec = {}) => {
  const style = {};
  if (hasValue(layoutSpec.backgroundColor)) style.backgroundColor = layoutSpec.backgroundColor;
  if (isForm8SectionBorderOn(layoutSpec)) {
    const color = hasValue(layoutSpec.borderColor) ? layoutSpec.borderColor : '#2c5282';
    const width = parseImageNumber(layoutSpec.sectionBorderWidth, 1);
    style.border = `${width}px solid ${color}`;
  }
  const radius = parseImageNumber(layoutSpec.sectionBorderRadius, null);
  if (radius != null) style.borderRadius = `${radius}px`;
  if (Object.keys(style).length) {
    style.padding = '8px 10px';
    style.boxSizing = 'border-box';
  }
  return style;
};

export const getFormSignatureLinePreviewStyle = (layoutSpec = {}, theme = {}) => {
  const color = hasValue(layoutSpec.signatureLineColor)
    ? layoutSpec.signatureLineColor
    : theme.textColor || '#111827';
  const width = parseImageNumber(layoutSpec.signatureLineWidth, 1);
  return {
    borderBottomColor: color,
    borderBottomWidth: `${width}px`,
    borderBottomStyle: 'solid',
    '--ft-sig-line-color': color,
    '--ft-sig-line-width': `${width}px`,
  };
};

export const getFormSignatureNamePreviewStyle = (layoutSpec = {}, theme = {}, fallbackPt = 9) => {
  const style = {};
  const color = hasValue(layoutSpec.bodyColor) ? layoutSpec.bodyColor : theme.textColor || '#111827';
  const bg = layoutSpec.bodyBackgroundColor;
  const size = getForm8TextSizePt(layoutSpec) || layoutSpec.bodyFontSizePt;
  const weight = getForm8TextWeight(layoutSpec) || layoutSpec.bodyFontWeight;
  const pt = parsePt(size, fallbackPt);

  style.color = color;
  style['--ft-sig-name-color'] = color;
  if (hasValue(bg)) {
    style.backgroundColor = bg;
    style['--ft-sig-name-bg'] = bg;
    style.padding = '2px 4px';
    style.display = 'inline-block';
  }
  if (pt != null) {
    style.fontSize = `${pt}pt`;
    style['--ft-sig-name-size'] = `${pt}pt`;
  }
  const w = resolveWeightCss(weight, null);
  if (w != null) {
    style.fontWeight = w;
    style['--ft-sig-name-weight'] = w;
  }
  return style;
};

export const getFormSignatureLinePdf = (layoutSpec = {}, theme = {}, compact = false) => {
  const color = hexToPdf(
    layoutSpec.signatureLineColor,
    theme.textColor || '#111827'
  );
  const widthPx = parseImageNumber(layoutSpec.signatureLineWidth, 1);
  return {
    color,
    width: Math.max(0.3, (widthPx * 72) / 96),
    gap: compact ? 14 : 22,
  };
};

export const FORM8_DIVIDER_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const dividerLineStyle = (layoutSpec) => {
  const raw = String(layoutSpec?.dividerStyle || 'solid').toLowerCase();
  if (raw === 'dashed' || raw === 'dotted') return raw;
  return 'solid';
};

export const getForm8DividerPreviewStyle = (layoutSpec = {}, theme = {}) => {
  const color = hasValue(layoutSpec.dividerColor)
    ? layoutSpec.dividerColor
    : theme.borderColor || '#2c5282';
  const width = parseImageNumber(layoutSpec.dividerWidth, 1);
  const lineStyle = dividerLineStyle(layoutSpec);
  return {
    border: 0,
    borderTopWidth: `${width}px`,
    borderTopStyle: lineStyle,
    borderTopColor: color,
    width: '100%',
    margin: 0,
  };
};

export const buildForm8DividerPdfBlock = (layoutSpec = {}, theme = {}, contentWidthPt = 500) => {
  const color = hexToPdf(layoutSpec.dividerColor, theme.borderColor || '#2c5282');
  const widthPx = parseImageNumber(layoutSpec.dividerWidth, 1);
  const lineW = Math.max(0.3, (widthPx * 72) / 96);
  const lineStyle = dividerLineStyle(layoutSpec);
  const line = {
    type: 'line',
    x1: 0,
    y1: 0,
    x2: Math.max(40, contentWidthPt),
    y2: 0,
    lineWidth: lineW,
    lineColor: color,
  };
  if (lineStyle === 'dashed') line.dash = { length: 6, space: 4 };
  if (lineStyle === 'dotted') line.dash = { length: 1.2, space: 2 };
  return {
    canvas: [line],
    margin: [0, 6, 0, 6],
  };
};
