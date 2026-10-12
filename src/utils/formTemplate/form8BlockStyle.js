import { clampFieldFontPt } from './formTemplateConfig';
import { getForm8TextSizePt, getForm8TextWeight } from './form8TypographyGroups';
import { FORM8_FONT_WEIGHT_OPTIONS, pdfBoldFromWeight } from './form8SectionStyle';

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
  'labelFontSizePt',
  'labelFontWeight',
  'labelColor',
  'valueFontSizePt',
  'valueFontWeight',
  'tableHeaderBackgroundColor',
  'tableBodyBackgroundColor',
  'tableBorderColor',
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
  'form_terms',
  'form_footer',
  'stock_line_items',
  'signature_lines',
  'customer_photo',
]);

export const getForm8BlockBoxPreviewStyle = (layoutSpec, theme) => {
  const style = {};
  if (hasValue(layoutSpec?.backgroundColor)) style.backgroundColor = layoutSpec.backgroundColor;
  if (hasValue(layoutSpec?.borderColor)) {
    style.border = `1px solid ${layoutSpec.borderColor}`;
  } else if (hasValue(theme?.borderColor)) {
    style.border = `1px solid ${theme.borderColor}`;
  }
  return style;
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
  };
};
