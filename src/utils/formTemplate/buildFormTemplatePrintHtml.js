import { getForm8BlockOrder, getBlockLayout, isForm8BlockEnabled } from './form8BuilderBlocks';
import { parseSectionBlockId } from './form8BuilderCatalog';
import { parseFieldBlockId } from './form8FieldBlocks';
import { isForm8DividerBlockId } from './form8DividerBlocks';
import {
  getForm8FieldDisplayLabel,
  getForm8FooterNoteTitle,
  getForm8SectionDisplayTitle,
} from './form8SectionDisplay';
import {
  getFieldLayoutClass,
  getPageStyle,
  getSortedFields,
  groupFieldsByLayout,
} from './formTemplateConfig';
import {
  getForm8SectionFieldTextStyle,
  getForm8SectionPreviewStyle,
  getForm8SectionTitlePreviewStyle,
} from './form8SectionStyle';
import {
  blockAbsoluteFrameStyle,
  computeForm8CanvasPageHeightMm,
  getForm8EditorSheetHeightMm,
} from './form8CanvasLayout';
import { getVisibleForm8StockColumns } from './form8StockTable';
import { getForm8SignatureEntries } from './form8Signatures';
import { isForm8SecuredTemplate } from './form8LoanType';
import {
  FORM8_HEADER_LINE_DEFS,
  getForm8HeaderBoxPreviewStyle,
  getForm8HeaderLinePreviewStyle,
} from './form8BlockStyle';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const cssEsc = (s) => String(s ?? '').replace(/[;{}]/g, '');

const styleAttr = (style = {}) => {
  const parts = [];
  Object.entries(style).forEach(([key, value]) => {
    if (value == null || value === '') return;
    const cssKey = key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
    parts.push(`${cssKey}:${cssEsc(value)}`);
  });
  return parts.join(';');
};

const blockBoxStyle = (config, blockId, page) => {
  const spec = getBlockLayout(config, blockId);
  const frame = blockAbsoluteFrameStyle(config, blockId, page.widthMm, page.heightMm);
  if (frame) {
    return styleAttr({
      ...frame,
      ...(blockId === 'customer_photo' ? { overflow: 'hidden' } : {}),
    });
  }
  const parts = ['box-sizing:border-box', `width:${Number(spec.widthPct ?? 100)}%`];
  if (spec.heightMode !== 'auto' && spec.heightMm != null) {
    parts.push(`height:${Number(spec.heightMm)}mm`);
    parts.push(`min-height:${Number(spec.heightMm)}mm`);
  }
  if (blockId === 'customer_photo') {
    parts.push('overflow:hidden');
  }
  return parts.join(';');
};

const previewCss = (page) => `
@font-face {
  font-family: 'Noto Sans Devanagari';
  src: url('/fonts/NotoSansDevanagari-Regular.ttf') format('truetype');
  font-weight: 400;
}
@font-face {
  font-family: 'Noto Sans Devanagari';
  src: url('/fonts/NotoSansDevanagari-Bold.ttf') format('truetype');
  font-weight: 700;
}
@page { size: ${page.widthMm}mm ${page.sheetHeightMm || 297}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; width: ${page.widthMm}mm; }
.form-custom-a4-page {
  width: ${page.widthMm}mm;
  height: ${page.heightMm}mm;
  min-height: ${page.heightMm}mm;
  padding: 0;
  box-sizing: border-box;
  background: var(--ft-page-bg, #fff);
  color: var(--ft-text, #334155);
  font-family: 'Noto Sans Devanagari', Roboto, Arial, sans-serif;
  font-size: 9.25pt;
  line-height: 1.3;
  position: relative;
  overflow: hidden;
}
.f8-builder-canvas-layer {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
}
.f8-block { box-sizing: border-box; }
.form-custom-a4-firm-header {
  text-align: center;
  font-size: 7pt;
  line-height: 1.2;
  color: var(--ft-muted, #64748b);
  margin-bottom: 2px;
  white-space: pre-wrap;
}
.form-custom-a4-header {
  text-align: center;
  background: var(--ft-header-bg, #f7f9fc);
  padding: 4px 0;
  margin-bottom: 4px;
}
.form-custom-a4-header--title { background: transparent; border-bottom: none; }
.form-custom-a4-header h1 {
  margin: 0 0 2px;
  font-size: 13pt;
  font-weight: var(--ft-main-title-font-weight, 800);
  color: var(--ft-primary, #3d4f63);
  letter-spacing: 0.06em;
}
.form-custom-a4-header .subtitle {
  margin: 0 0 2px;
  color: var(--ft-secondary, #5b6b7c);
  font-size: 9pt;
}
.form-custom-a4-header .compliance {
  margin: 0 0 2px;
  font-size: 6.5pt;
  line-height: 1.2;
  color: var(--ft-muted, #64748b);
}
.form-custom-a4-header .note {
  margin: 0;
  font-size: 7.5pt;
  color: var(--ft-muted, #64748b);
  font-style: italic;
}
.form-custom-a4-section {
  margin-bottom: 0.2rem;
  background: var(--ft-section-bg, #fff);
  border: none;
  padding: 4px 5px;
  box-sizing: border-box;
}
.form-custom-a4-section h3,
.form-custom-a4-section__title {
  margin: -4px -5px 3px;
  padding: 2px 4px;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--ft-section-title, #3d4f63);
  background: var(--ft-table-header, #eef3f8);
}
.form-custom-a4-section--block h3,
.form-custom-a4-section--block .form-custom-a4-section__title {
  text-transform: none;
  font-size: 8pt;
}
.form-custom-a4-fields { display: flex; flex-direction: column; gap: 2px; }
.form-custom-a4-field-row { display: flex; flex-wrap: nowrap; gap: 6px; width: 100%; }
.form-custom-a4-field {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 4px 6px;
  padding: 2px 4px;
  min-width: 0;
  box-sizing: border-box;
  line-height: 1.3;
  font-size: 7.5pt;
}
.form-custom-a4-field-row.row-half .form-custom-a4-field { flex: 1 1 0; width: 50%; max-width: 50%; }
.form-custom-a4-field-row.row-half .form-custom-a4-field:only-child { flex: 1 1 100%; width: 100%; max-width: 100%; }
.form-custom-a4-field-row.row-full .form-custom-a4-field { flex: 1 1 100%; width: 100%; max-width: 100%; }
.form-custom-a4-field-row.row-small .form-custom-a4-field { flex: 1 1 0; width: 33.333%; max-width: 33.333%; }
.form-custom-a4-field .label {
  flex: 0 1 44%;
  max-width: 42%;
  min-width: 0;
  font-weight: var(--ft-label-font-weight, 500);
  color: var(--ft-label-color, #64748b);
  font-size: var(--ft-label-font-pt, 9pt);
}
.form-custom-a4-field .value {
  flex: 1 1 50%;
  min-width: 0;
  font-weight: var(--ft-value-font-weight, 600);
  color: var(--ft-value-color, #334155);
  word-break: break-word;
  font-size: var(--ft-value-font-pt, 9pt);
}
.form-custom-a4-field-line {
  display: flex;
  align-items: baseline;
  gap: 4px 8px;
  font-size: 7.5pt;
  line-height: 1.35;
}
.form-custom-a4-field-line__label { font-weight: 700; font-size: var(--ft-label-font-pt, 9pt); }
.form-custom-a4-field-line__value { font-size: var(--ft-value-font-pt, 9pt); }
.form-custom-a4-logo-img, .form-custom-a4-footer-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.form-custom-a4-photo-block,
.form-custom-a4-photo-block--fill {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.form-custom-a4-customer-photo {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: center center;
  display: block;
}
.form-custom-a4-table, .form-custom-a4-stock-table, .f8-stock {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 7pt;
}
.form-custom-a4-table th, .form-custom-a4-table td,
.f8-stock th, .f8-stock td {
  padding: 2px 3px;
  vertical-align: top;
  text-align: left;
}
.form-custom-a4-table th, .f8-stock th {
  background: var(--ft-table-header, #eef3f8);
  color: var(--ft-section-title, #3d4f63);
  font-weight: 700;
}
.form-custom-a4-terms h3 { font-size: 7.5pt; }
.form-custom-a4-terms p, .form-custom-a4-declaration, .form-custom-a4-footer-note-body {
  font-size: 6.5pt;
  line-height: 1.15;
  margin: 1mm 0 0;
  white-space: pre-wrap;
}
.form-custom-a4-signatures, .f8-signatures {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
  padding-top: 4mm;
}
.form-custom-a4-sign-cell, .f8-sign { flex: 1; text-align: center; }
.form-custom-a4-sign-cell__space, .f8-sign-line {
  border-top: 1px solid #94a3b8;
  min-height: 20px;
  margin-bottom: 2px;
}
.form-custom-a4-sign-cell__caption, .f8-sign-name { font-size: 7pt; font-weight: 600; }
.f8-sign-role { color: var(--ft-muted, #64748b); font-size: 6.5pt; }
.form-custom-a4-divider { border: none; border-top: 1px solid var(--ft-border, #d8e0ea); margin: 2mm 0; }
`;

const renderSectionHtml = (section) => {
  const fields = getSortedFields(section).filter((f) => f.enabled && f.id !== 'customer_photo');
  const { sectionStyle, sectionClassName } = getForm8SectionPreviewStyle(section);
  const { titleStyle, titleClassName } = getForm8SectionTitlePreviewStyle(section);
  const labelStyle = getForm8SectionFieldTextStyle(section, 'label');
  const valueStyle = getForm8SectionFieldTextStyle(section, 'value');
  const rows = groupFieldsByLayout(fields)
    .map(
      (group) =>
        `<div class="form-custom-a4-field-row row-${esc(group.layout)}">` +
        group.fields
          .map((field) => {
            const label = esc(getForm8FieldDisplayLabel(field));
            return (
              `<div class="form-custom-a4-field ${getFieldLayoutClass(field.fieldLayout)}">` +
              `<span class="label"${labelStyle && Object.keys(labelStyle).length ? ` style="${styleAttr(labelStyle)}"` : ''}>${label}</span>` +
              `<span class="value"${valueStyle && Object.keys(valueStyle).length ? ` style="${styleAttr(valueStyle)}"` : ''}>{{${esc(field.id)}}}</span>` +
              `</div>`
            );
          })
          .join('') +
        `</div>`
    )
    .join('');
  return (
    `<section class="form-custom-a4-section form-custom-a4-section--block${sectionClassName}" style="${styleAttr(sectionStyle)}">` +
    `<h3 class="form-custom-a4-section__title${titleClassName}" style="${styleAttr(titleStyle)}">${esc(getForm8SectionDisplayTitle(section))}</h3>` +
    `<div class="form-custom-a4-fields">${rows}</div>` +
    `</section>`
  );
};

const renderStockHtml = (config) => {
  const spec = getBlockLayout(config, 'stock_line_items');
  const cols = getVisibleForm8StockColumns(spec);
  const head = cols
    .map((col) => `<th data-col="${esc(col.id)}" style="text-align:${esc(col.align || 'left')}">${esc(col.label)}</th>`)
    .join('');
  const template = cols
    .map((col) => `<td data-col="${esc(col.id)}"></td>`)
    .join('');
  return (
    `<section class="form-custom-a4-section form-custom-a4-section--block form-custom-a4-section--stock">` +
    `<h3 class="form-custom-a4-section__title">Stock Information</h3>` +
    `<table class="form-custom-a4-table form-custom-a4-stock-table f8-stock" data-role="stock-table"><thead><tr>${head}</tr></thead>` +
    `<tbody data-role="stock-body"><tr data-role="stock-row-template" hidden>${template}</tr></tbody>` +
    `</table></section>`
  );
};

const renderSignaturesHtml = (config) => {
  const entries = getForm8SignatureEntries(config, {});
  const cells = entries
    .map(
      (entry) =>
        `<div class="form-custom-a4-sign-cell f8-sign" data-sign="${esc(entry.id)}">` +
        `<div class="form-custom-a4-sign-cell__space f8-sign-line"></div>` +
        `<div class="form-custom-a4-sign-cell__caption f8-sign-name">{{${entry.id === 'owner' ? 'firm_name' : 'customer_name'}}}</div>` +
        `<div class="f8-sign-role">${esc(entry.signatureSuffix)}</div></div>`
    )
    .join('');
  return `<section class="form-custom-a4-signatures f8-signatures">${cells}</section>`;
};

const headerLineStyle = (headerSpec, id) => {
  const line = FORM8_HEADER_LINE_DEFS.find((item) => item.id === id);
  if (!line) return '';
  return styleAttr(getForm8HeaderLinePreviewStyle(headerSpec, line));
};

/**
 * Self-contained Form 8 HTML snapshot stored in DB.
 * Markup and CSS follow the editor preview so View PDF matches the canvas.
 */
export const buildFormTemplatePrintHtml = (
  config,
  { firmName = '', firmFormHeader = '', firmFormFooter = '' } = {}
) => {
  if (!config) return '';

  const page = getPageStyle(config);
  const layout = config.layout || {};
  const order = getForm8BlockOrder(config);
  const contentHeightMm = computeForm8CanvasPageHeightMm(config, page.heightMm);
  const sheetHeightMm = getForm8EditorSheetHeightMm(contentHeightMm, page.heightMm);
  const cssVars = Object.entries(page.cssVars || {})
    .map(([k, v]) => `${k}:${cssEsc(v)}`)
    .join(';');

  const chunks = [];
  order.forEach((blockId) => {
    if (!isForm8BlockEnabled(config, blockId)) return;
    const box = blockBoxStyle(config, blockId, page);
    const wrap = (inner, extraClass = '') =>
      `<div class="f8-block ${extraClass}" data-block-id="${esc(blockId)}" style="${esc(box)}">${inner}</div>`;

    const sectionId = parseSectionBlockId(blockId);
    if (sectionId) {
      const section = (config.sections || []).find((s) => s.id === sectionId);
      if (!section?.enabled) return;
      chunks.push(wrap(renderSectionHtml(section)));
      return;
    }

    if (isForm8DividerBlockId(blockId)) {
      chunks.push(
        `<hr class="form-custom-a4-divider" data-block-id="${esc(blockId)}" style="${esc(box)}" />`
      );
      return;
    }

    const fieldId = parseFieldBlockId(blockId);
    if (fieldId) {
      const label = esc(getForm8FieldDisplayLabel({ id: fieldId }));
      const macro = fieldId === 'today_date' ? '{{today_date}}' : `{{${fieldId}}}`;
      chunks.push(
        wrap(
          `<div class="form-custom-a4-field-line"><span class="form-custom-a4-field-line__label">${label}</span><span class="form-custom-a4-field-line__value">${macro}</span></div>`
        )
      );
      return;
    }

    switch (blockId) {
      case 'layout_left_logo':
        if (layout.showLeftLogo === false) break;
        chunks.push(
          wrap(
            `<div class="form-custom-a4-logo-slot form-custom-a4-logo-slot--left"><img class="form-custom-a4-logo-img" data-asset="leftLogo" alt="Left logo" /></div>`
          )
        );
        break;
      case 'layout_right_logo':
        if (layout.showRightLogo === false) break;
        chunks.push(
          wrap(
            `<div class="form-custom-a4-logo-slot form-custom-a4-logo-slot--right"><img class="form-custom-a4-logo-img" data-asset="rightLogo" alt="Right logo" /></div>`
          )
        );
        break;
      case 'customer_photo':
        chunks.push(
          wrap(
            `<div class="form-custom-a4-photo-block form-custom-a4-photo-block--fill"><img class="form-custom-a4-customer-photo" data-asset="customerPhoto" alt="Customer photo" style="width:100%;height:100%;object-fit:cover;object-position:center center;display:block" /></div>`
          )
        );
        break;
      case 'form_header': {
        const headerSpec = getBlockLayout(config, blockId);
        const headerBox = styleAttr(getForm8HeaderBoxPreviewStyle(headerSpec));
        chunks.push(
          wrap(
            (layout.useFirmFormHeader
              ? `<div class="form-custom-a4-firm-header" data-role="firm-header">${firmFormHeader || ''}</div>`
              : '') +
              `<header class="form-custom-a4-header form-custom-a4-header--title"${headerBox ? ` style="${headerBox}"` : ''}>` +
              `<h1${headerLineStyle(headerSpec, 'title') ? ` style="${headerLineStyle(headerSpec, 'title')}"` : ''}>${esc(config.title || 'FORM 8')}</h1>` +
              (config.subtitle
                ? `<p class="subtitle"${headerLineStyle(headerSpec, 'subtitle') ? ` style="${headerLineStyle(headerSpec, 'subtitle')}"` : ''}>${esc(config.subtitle)}</p>`
                : '') +
              (config.complianceReference
                ? `<p class="compliance"${headerLineStyle(headerSpec, 'compliance') ? ` style="${headerLineStyle(headerSpec, 'compliance')}"` : ''}>${esc(config.complianceReference)}</p>`
                : '') +
              (config.headerNote
                ? `<p class="note"${headerLineStyle(headerSpec, 'note') ? ` style="${headerLineStyle(headerSpec, 'note')}"` : ''}>${config.headerNote}</p>`
                : '') +
              `</header>`
          )
        );
        break;
      }
      case 'stock_line_items':
        if (!isForm8SecuredTemplate(config)) break;
        chunks.push(wrap(renderStockHtml(config)));
        break;
      case 'form_terms':
        if (!config.termsAndConditions) break;
        chunks.push(
          wrap(
            `<section class="form-custom-a4-section form-custom-a4-terms"><h3>Terms &amp; Conditions</h3><p>${esc(config.termsAndConditions)}</p></section>`
          )
        );
        break;
      case 'form_footer': {
        const footerText =
          layout.useFirmFormFooter && firmFormFooter ? firmFormFooter : config.footerNote;
        if (!footerText) break;
        chunks.push(
          wrap(
            `<section class="form-custom-a4-section form-custom-a4-footer"><h3>${esc(getForm8FooterNoteTitle(config))}</h3>` +
              `<div class="form-custom-a4-footer-note-body" data-role="footer-body">${esc(footerText)}</div></section>`
          )
        );
        break;
      }
      case 'layout_footer_image':
        chunks.push(
          wrap(`<div class="form-custom-a4-footer-image"><img data-asset="footerImage" alt="" /></div>`)
        );
        break;
      case 'signature_lines':
        chunks.push(wrap(renderSignaturesHtml(config)));
        break;
      default:
        chunks.push(wrap(''));
    }
  });

  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8" />` +
    `<title>${esc(config.title || 'FORM 8')}</title><style>${previewCss({
      ...page,
      heightMm: sheetHeightMm,
      sheetHeightMm: page.heightMm,
    })}</style></head>` +
    `<body><div class="form-custom-a4-page form-custom-a4-page--single form-custom-a4-page--builder-preview" data-firm="${esc(firmName)}" style="${cssVars};width:${page.widthMm}mm;height:${sheetHeightMm}mm;min-height:${sheetHeightMm}mm;padding:0">` +
    `<div class="f8-builder-canvas-layer" style="height:${sheetHeightMm}mm;min-height:${sheetHeightMm}mm">` +
    `${chunks.join('')}</div></div></body></html>`
  );
};

export const resolveFormTemplatePrintHtml = (templateOrHtml, config, extras = {}) => {
  if (config?.blockLayouts || config?.builderBlockOrder) {
    return buildFormTemplatePrintHtml(config, extras);
  }
  if (typeof templateOrHtml === 'string' && templateOrHtml.trim()) {
    return templateOrHtml;
  }
  const stored = templateOrHtml?.html || templateOrHtml?.printHtml || config?.printHtml;
  if (stored && String(stored).trim()) return String(stored);
  return buildFormTemplatePrintHtml(config, extras);
};
