import { getForm8BlockOrder, getBlockLayout, isForm8BlockEnabled } from './form8BuilderBlocks';
import { parseSectionBlockId } from './form8BuilderCatalog';
import { parseFieldBlockId } from './form8FieldBlocks';
import { isForm8DividerBlockId } from './form8DividerBlocks';
import { getForm8FieldDisplayLabel, getForm8FooterNoteTitle } from './form8SectionDisplay';
import { getSortedFields, replaceTemplateVariables } from './formTemplateConfig';
import { templateLooksLikeHtml } from './formTemplateRichText';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const blockStyleAttr = (config, blockId) => {
  const { widthPct, heightMm, offsetXPct, hAlign, posXPct, posYPct, freePosition } = getBlockLayout(
    config,
    blockId
  );
  const parts = [`width:${widthPct ?? 100}%`];
  if (heightMm != null) parts.push(`min-height:${heightMm}mm`);
  if (freePosition && posXPct != null && posYPct != null) {
    parts.push('position:absolute');
    parts.push(`left:${posXPct}%`);
    parts.push(`top:${posYPct}%`);
  } else if (offsetXPct != null && Number.isFinite(offsetXPct)) {
    parts.push(`margin-left:${offsetXPct}%`);
  } else if (hAlign === 'center') {
    parts.push('margin-left:auto;margin-right:auto');
  } else if (hAlign === 'right') {
    parts.push('margin-left:auto;margin-right:0');
  }
  return parts.join(';');
};

/**
 * Serializable HTML snapshot of block order + layouts (stored in template config for print/archive).
 * Macros are left as {{tokens}} — resolved at print time with live loan data.
 */
export const buildFormTemplatePrintHtml = (config, { firmName = '', firmFormHeader = '', firmFormFooter = '' } = {}) => {
  if (!config) return '';

  const layout = config.layout || {};
  const order = getForm8BlockOrder(config);
  const chunks = [];

  order.forEach((blockId) => {
    if (!isForm8BlockEnabled(config, blockId)) return;

    const style = blockStyleAttr(config, blockId);
    const sectionId = parseSectionBlockId(blockId);
    if (sectionId) {
      const section = (config.sections || []).find((s) => s.id === sectionId);
      if (!section?.enabled) return;
      const fields = getSortedFields(section)
        .filter((f) => f.enabled)
        .map(
          (f) =>
            `<div class="f8-field"><span class="f8-label">${esc(f.label)}</span><span class="f8-value">{{${esc(f.id)}}}</span></div>`
        )
        .join('');
      chunks.push(
        `<section class="f8-block" data-block-id="${esc(blockId)}" style="${esc(style)}"><h3>${esc(section.label)}</h3>${fields}</section>`
      );
      return;
    }

    if (isForm8DividerBlockId(blockId)) {
      chunks.push(
        `<hr class="f8-block f8-divider" data-block-id="${esc(blockId)}" style="${esc(style)}" />`
      );
      return;
    }

    const fieldId = parseFieldBlockId(blockId);
    if (fieldId) {
      const label = getForm8FieldDisplayLabel({ id: fieldId });
      const macro =
        fieldId === 'today_date' ? '{{today_date}}' : `{{${fieldId}}}`;
      chunks.push(
        `<div class="f8-block f8-field-line" data-block-id="${esc(blockId)}" style="${esc(style)}">` +
          `<span class="f8-field-label">${esc(label)}:</span> ` +
          `<span class="f8-field-value">${esc(macro)}</span>` +
          `</div>`
      );
      return;
    }

    switch (blockId) {
      case 'layout_left_logo':
        if (layout.showLeftLogo === false) break;
        chunks.push(
          `<div class="f8-block f8-logo f8-logo-left" data-block-id="${blockId}" style="${esc(style)}"><img data-asset="leftLogo" alt="Left logo" /></div>`
        );
        break;
      case 'layout_right_logo':
        if (layout.showRightLogo === false) break;
        chunks.push(
          `<div class="f8-block f8-logo f8-logo-right" data-block-id="${blockId}" style="${esc(style)}"><img data-asset="rightLogo" alt="Right logo" /></div>`
        );
        break;
      case 'form_header':
        chunks.push(
          `<header class="f8-block" data-block-id="form_header" style="${esc(style)}">` +
            (layout.useFirmFormHeader && firmFormHeader
              ? `<div class="f8-firm-header">${firmFormHeader}</div>`
              : '') +
            `<h1>${esc(config.title || 'FORM 8')}</h1>` +
            (config.subtitle ? `<p class="f8-subtitle">${esc(config.subtitle)}</p>` : '') +
            (config.complianceReference
              ? `<p class="f8-compliance">${esc(config.complianceReference)}</p>`
              : '') +
            (config.headerNote
              ? `<p class="f8-note">${esc(replaceTemplateVariables(config.headerNote, {}))}</p>`
              : '') +
            `</header>`
        );
        break;
      case 'form_footer': {
        const footerText =
          layout.useFirmFormFooter && firmFormFooter ? firmFormFooter : config.footerNote;
        if (!footerText) break;
        const inner = templateLooksLikeHtml(footerText) ? footerText : esc(footerText);
        const title = esc(getForm8FooterNoteTitle(config));
        chunks.push(
          `<section class="f8-block f8-footer-note" data-block-id="form_footer" style="${esc(style)}">` +
            `<h3>${title}</h3><div class="f8-footer-note-body">${inner}</div></section>`
        );
        break;
      }
      case 'form_terms':
        if (!config.termsAndConditions) break;
        chunks.push(
          `<section class="f8-block" data-block-id="form_terms" style="${esc(style)}"><h3>Terms &amp; Conditions</h3><p>${esc(config.termsAndConditions)}</p></section>`
        );
        break;
      case 'signature_lines':
        chunks.push(
          `<section class="f8-block f8-block--signatures" data-block-id="signature_lines" style="${esc(style)}"></section>`
        );
        break;
      default:
        chunks.push(`<div class="f8-block" data-block-id="${esc(blockId)}" style="${esc(style)}"></div>`);
        break;
    }
  });

  return `<div class="f8-document" data-form-template-version="1">${chunks.join('')}</div>`;
};
