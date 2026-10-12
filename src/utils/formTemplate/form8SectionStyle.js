import { clampFieldFontPt } from './formTemplateConfig';

export const FORM8_FONT_WEIGHT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semibold (600)' },
  { value: '700', label: 'Bold (700)' },
];

export const FORM8_SECTION_STYLE_KEYS = [
  'backgroundColor',
  'borderColor',
  'titleColor',
  'titleBackgroundColor',
  'titleFontSizePt',
  'titleFontWeight',
  'labelFontSizePt',
  'labelFontWeight',
  'valueFontSizePt',
  'valueFontWeight',
];

const parseSectionPt = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return clampFieldFontPt(n);
};

export const pdfBoldFromWeight = (weight, defaultBold = false) => {
  if (weight === null || weight === undefined || weight === '') return defaultBold;
  const w = String(weight);
  if (w === 'normal' || w === '400') return false;
  if (w === 'bold' || w === '700') return true;
  const n = Number(w);
  if (Number.isFinite(n)) return n >= 600;
  return defaultBold;
};

const resolveFontWeightCss = (raw, fallback) => {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const w = String(raw);
  if (w === 'normal') return '400';
  if (w === 'bold') return '700';
  return w;
};

const hasValue = (v) => v != null && String(v).trim() !== '';

/** Preview: inline styles + CSS variables for a section block. */
export const getForm8SectionPreviewStyle = (section) => {
  const style = {};
  const vars = {};

  if (hasValue(section?.backgroundColor)) {
    style.backgroundColor = section.backgroundColor;
  }
  if (hasValue(section?.borderColor)) {
    style.border = `1px solid ${section.borderColor}`;
    style.borderColor = section.borderColor;
  }

  const labelPt = parseSectionPt(section?.labelFontSizePt, null);
  const valuePt = parseSectionPt(section?.valueFontSizePt, null);
  if (labelPt != null) vars['--ft-label-font-pt'] = `${labelPt}pt`;
  if (valuePt != null) vars['--ft-value-font-pt'] = `${valuePt}pt`;

  const labelW = resolveFontWeightCss(section?.labelFontWeight, null);
  const valueW = resolveFontWeightCss(section?.valueFontWeight, null);
  if (labelW != null) vars['--ft-label-font-weight'] = labelW;
  if (valueW != null) vars['--ft-value-font-weight'] = valueW;

  const sectionStyle = { ...style, ...vars };
  const hasCustomBox =
    hasValue(section?.backgroundColor) || hasValue(section?.borderColor);

  return {
    sectionStyle,
    sectionClassName: hasCustomBox ? ' f8-section--styled' : '',
  };
};

/** Only explicit per-section overrides (defaults come from global CSS theme). */
export const getForm8SectionTitlePreviewStyle = (section) => {
  const style = {};
  const titlePt = parseSectionPt(section?.titleFontSizePt, null);
  if (titlePt != null) style.fontSize = `${titlePt}pt`;
  if (hasValue(section?.titleColor)) style.color = section.titleColor;
  if (hasValue(section?.titleBackgroundColor)) {
    style.backgroundColor = section.titleBackgroundColor;
    style.background = section.titleBackgroundColor;
  }
  const titleW = resolveFontWeightCss(section?.titleFontWeight, null);
  if (titleW != null) style.fontWeight = titleW;

  const titleClassName =
    Object.keys(style).length > 0 ? ' f8-section-title--custom' : '';

  return { titleStyle: style, titleClassName };
};

/** PDF section title row. */
export const getForm8SectionPdfTitleProps = (section, theme, fontPt) => {
  const titleDefaultPt = clampFieldFontPt(fontPt);
  const titlePt = parseSectionPt(section?.titleFontSizePt, titleDefaultPt);
  return {
    fontSize: titlePt,
    bold: pdfBoldFromWeight(section?.titleFontWeight, true),
    color: hexToRgb(
      hasValue(section?.titleColor) ? section.titleColor : theme.sectionTitleColor
    ),
    fillColor: hexToRgb(
      hasValue(section?.titleBackgroundColor)
        ? section.titleBackgroundColor
        : theme.tableHeaderBackground
    ),
  };
};

export const getForm8SectionFieldFontSizes = (section, labelFontPt, valueFontPt) => ({
  label: parseSectionPt(section?.labelFontSizePt, labelFontPt),
  value: parseSectionPt(section?.valueFontSizePt, valueFontPt),
});

export const getForm8SectionFieldPdfStyle = (section, labelFontPt, valueFontPt) => ({
  label: {
    fontSize: parseSectionPt(section?.labelFontSizePt, labelFontPt),
    bold: pdfBoldFromWeight(section?.labelFontWeight, false),
  },
  value: {
    fontSize: parseSectionPt(section?.valueFontSizePt, valueFontPt),
    bold: pdfBoldFromWeight(section?.valueFontWeight, true),
  },
});

const hexToRgb = (hex) => {
  const h = String(hex || '#000000').replace('#', '');
  if (h.length !== 6) return '#111827';
  return `#${h}`;
};

export const SECTION_STYLE_RESET_PATCH = Object.fromEntries(
  FORM8_SECTION_STYLE_KEYS.map((key) => [key, ''])
);

/** Baked-in Form 8 section look (preview + PDF); copied into default template JSON. */
export const FORM8_DEFAULT_SECTION_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#2c5282',
  titleColor: '#1e3a5f',
  titleBackgroundColor: '#e8eef5',
  titleFontSizePt: 10,
  titleFontWeight: '600',
  labelFontSizePt: 9,
  labelFontWeight: '500',
  valueFontSizePt: 9,
  valueFontWeight: '600',
};

/** Prefer saved section overrides; fall back to default template section; honor explicit reset (empty string). */
export const mergeSectionStyleFields = (section = {}, defSection = {}) => {
  const out = {};
  FORM8_SECTION_STYLE_KEYS.forEach((key) => {
    const sv = section[key];
    if (sv != null && String(sv).trim() !== '') {
      out[key] = sv;
      return;
    }
    if (Object.prototype.hasOwnProperty.call(section, key) && sv === '') {
      out[key] = '';
      return;
    }
    const dv = defSection[key];
    if (dv != null && String(dv).trim() !== '') {
      out[key] = dv;
    }
  });
  return out;
};

export const pickSectionStyleFields = (section = {}) => {
  const out = {};
  FORM8_SECTION_STYLE_KEYS.forEach((key) => {
    if (section[key] != null && section[key] !== '') {
      out[key] = section[key];
    }
  });
  return out;
};

const isPdfSectionTitleBlock = (block) =>
  block &&
  typeof block.text === 'string' &&
  (block.fillColor != null || block.style === 'sectionTitle');

/** PDF section box (outer border only) — matches preview section + title bar. */
export const wrapSectionPdfBlocks = (section, theme, blocks) => {
  if (!blocks?.length) return [];

  const lineColor = hexToRgb(
    hasValue(section?.borderColor) ? section.borderColor : theme.borderColor || '#2c5282'
  );
  const bodyFill = hexToRgb(
    hasValue(section?.backgroundColor)
      ? section.backgroundColor
      : theme.sectionBackground || '#ffffff'
  );
  const lineW = 0.75;

  const outerLayout = {
    hLineWidth: (i, node) =>
      i === 0 || i === (node?.table?.body?.length ?? 0) ? lineW : 0,
    vLineWidth: () => lineW,
    hLineColor: () => lineColor,
    vLineColor: () => lineColor,
  };

  const [first, ...rest] = blocks;
  if (isPdfSectionTitleBlock(first) && rest.length) {
    return [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: first.text,
                color: first.color,
                fillColor: first.fillColor,
                fontSize: first.fontSize,
                bold: first.bold != null ? first.bold : true,
                margin: [8, 5, 8, 5],
              },
            ],
            [
              {
                stack: rest,
                fillColor: bodyFill,
                margin: [8, 4, 8, 8],
              },
            ],
          ],
        },
        layout: outerLayout,
        margin: [0, 0, 0, 8],
      },
    ];
  }

  return [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: blocks,
              fillColor: bodyFill,
              margin: [8, 8, 8, 8],
            },
          ],
        ],
      },
      layout: outerLayout,
      margin: [0, 0, 0, 8],
    },
  ];
};
