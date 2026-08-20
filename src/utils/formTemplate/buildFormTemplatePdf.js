import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import {
  getSortedSections,
  getSortedFields,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
} from './formTemplateConfig';
import {
  buildFormTemplateTestData,
  getFormFieldValue,
  TRANSACTION_TEST_ROWS,
} from './formTemplateTestData';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const hexToRgb = (hex) => {
  const h = String(hex || '#000000').replace('#', '');
  if (h.length !== 6) return '#111827';
  return `#${h}`;
};

const cellFill = (field, theme) =>
  field.backgroundColor ? hexToRgb(field.backgroundColor) : null;

const buildFieldCell = (field, formData, theme, compact = false) => ({
  stack: [
    {
      text: field.label,
      style: compact ? 'fieldLabelSmall' : 'fieldLabel',
      color: hexToRgb(theme.mutedTextColor),
    },
    {
      text: getFormFieldValue(field.id, formData),
      style: compact ? 'fieldValueSmall' : 'fieldValue',
      color: hexToRgb(theme.textColor),
      margin: [0, 2, 0, 0],
    },
  ],
  fillColor: cellFill(field, theme),
  margin: [2, 2, 2, 2],
});

const buildSectionFieldTables = (section, formData, theme) => {
  const tables = [];

  groupFieldsByLayout(section.fields).forEach((group) => {
    if (group.layout === 'full') {
      const field = group.fields[0];
      tables.push({
        table: {
          widths: ['32%', '*'],
          body: [
            [
              {
                text: field.label,
                style: 'fieldLabel',
                color: hexToRgb(theme.mutedTextColor),
                fillColor: cellFill(field, theme),
              },
              {
                text: getFormFieldValue(field.id, formData),
                style: 'fieldValue',
                color: hexToRgb(theme.textColor),
                fillColor: cellFill(field, theme),
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => hexToRgb(theme.borderColor),
          vLineColor: () => hexToRgb(theme.borderColor),
        },
        margin: [0, 0, 0, 4],
      });
      return;
    }

    if (group.layout === 'small') {
      const widths = group.fields.map(() => '*');
      tables.push({
        table: {
          widths,
          body: [
            group.fields.map((field) => buildFieldCell(field, formData, theme, true)),
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 4],
      });
      return;
    }

    // half — 2 columns side by side
    const cells = group.fields.map((field) => ({
      width: '*',
      ...buildFieldCell(field, formData, theme),
    }));
    while (cells.length < 2) {
      cells.push({ width: '*', text: '' });
    }
    tables.push({
      columns: cells,
      columnGap: 8,
      margin: [0, 0, 0, 4],
    });
  });

  return tables;
};

export const buildFormTemplatePdfDefinition = (
  config,
  firmName = 'Sample Firm',
  options = {}
) => {
  const normalized = config;
  const formData = options.formData || buildFormTemplateTestData(firmName);
  const transactionRows = options.transactionRows || TRANSACTION_TEST_ROWS;
  const { theme, fontPt } = getPageStyle(normalized);
  const size = normalized.pageSize || 'A4';
  const orientation = normalized.orientation || 'portrait';

  const content = [];

  content.push({
    text: normalized.title || 'FORM 8',
    style: 'title',
    alignment: 'center',
    color: hexToRgb(theme.primaryColor),
    margin: [0, 0, 0, 4],
  });

  if (normalized.subtitle) {
    content.push({
      text: normalized.subtitle,
      style: 'subtitle',
      alignment: 'center',
      margin: [0, 0, 0, 4],
    });
  }

  if (normalized.complianceReference) {
    content.push({
      text: normalized.complianceReference,
      style: 'compliance',
      alignment: 'center',
      margin: [0, 0, 0, 8],
    });
  }

  if (normalized.headerNote) {
    content.push({
      text: replaceTemplateVariables(normalized.headerNote, formData),
      style: 'note',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    });
  }

  content.push({
    columns: [
      { text: `Firm: ${firmName}`, style: 'meta' },
      { text: `Date: ${formData.today_date}`, style: 'meta', alignment: 'right' },
    ],
    margin: [0, 0, 0, 12],
  });

  getSortedSections(normalized)
    .filter((s) => s.enabled)
    .forEach((section) => {
      content.push({
        text: section.label,
        style: 'sectionTitle',
        color: hexToRgb(theme.sectionTitleColor),
        fillColor: hexToRgb(theme.tableHeaderBackground),
        margin: [0, 6, 0, 4],
      });

      if (section.id === 'transaction_history') {
        const fields = getSortedFields(section).filter((f) => f.enabled);
        const header = fields.map((f) => ({
          text: f.label,
          style: 'tableHeader',
          fillColor: hexToRgb(theme.tableHeaderBackground),
          color: hexToRgb(theme.primaryColor),
        }));
        const body = transactionRows.map((row) =>
          fields.map((f) => ({
            text: row[f.id] ?? getFormFieldValue(f.id, formData),
            style: 'tableCell',
          }))
        );
        content.push({
          table: {
            headerRows: 1,
            widths: fields.map(() => '*'),
            body: [header, ...body],
          },
          layout: {
            hLineColor: () => hexToRgb(theme.borderColor),
            vLineColor: () => hexToRgb(theme.borderColor),
          },
          margin: [0, 0, 0, 8],
        });
        return;
      }

      buildSectionFieldTables(section, formData, theme).forEach((block) => {
        content.push(block);
      });
    });

  if (normalized.termsAndConditions) {
    content.push({
      text: 'Terms & Conditions',
      style: 'sectionTitle',
      color: hexToRgb(theme.sectionTitleColor),
      margin: [0, 8, 0, 4],
    });
    content.push({
      text: replaceTemplateVariables(normalized.termsAndConditions, formData),
      style: 'body',
      margin: [0, 0, 0, 8],
    });
  }

  if (normalized.declarationText) {
    content.push({
      text: replaceTemplateVariables(normalized.declarationText, formData),
      style: 'body',
      italics: true,
      margin: [0, 0, 0, 16],
    });
  }

  const sigLabels = normalized.signatureLabels || {};
  content.push({
    columns: Object.values(sigLabels).map((label) => ({
      stack: [
        { text: ' ', margin: [0, 24, 0, 0] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 120, y2: 0, lineWidth: 0.5 }] },
        { text: label, style: 'sigLabel', margin: [0, 4, 0, 0] },
      ],
      width: '*',
    })),
    margin: [0, 12, 0, 0],
  });

  if (normalized.footerNote) {
    content.push({
      text: replaceTemplateVariables(normalized.footerNote, formData),
      style: 'note',
      alignment: 'center',
      margin: [0, 16, 0, 0],
    });
  }

  if (normalized.showPageNumbers) {
    content.push({
      text: 'Page 1 of 1',
      style: 'pageNum',
      alignment: 'center',
      margin: [0, 12, 0, 0],
    });
  }

  return {
    pageSize: size === 'Letter' ? 'LETTER' : size,
    pageOrientation: orientation,
    pageMargins: [40, 40, 40, 40],
    background: () => null,
    content,
    defaultStyle: {
      fontSize: fontPt,
      color: hexToRgb(theme.textColor),
    },
    styles: {
      title: { fontSize: fontPt + 6, bold: true },
      subtitle: { fontSize: fontPt + 1 },
      compliance: { fontSize: fontPt - 2, italics: true, lineHeight: 1.25 },
      sectionTitle: { fontSize: fontPt, bold: true },
      meta: { fontSize: fontPt - 1, color: hexToRgb(theme.mutedTextColor) },
      note: { fontSize: fontPt - 1, color: hexToRgb(theme.mutedTextColor) },
      fieldLabel: { fontSize: fontPt - 1 },
      fieldValue: { fontSize: fontPt, bold: true },
      fieldLabelSmall: { fontSize: fontPt - 2 },
      fieldValueSmall: { fontSize: fontPt - 1, bold: true },
      tableHeader: { fontSize: fontPt - 1, bold: true },
      tableCell: { fontSize: fontPt - 1 },
      body: { fontSize: fontPt - 1, lineHeight: 1.35 },
      sigLabel: { fontSize: fontPt - 2, color: hexToRgb(theme.mutedTextColor) },
      pageNum: { fontSize: fontPt - 2, color: hexToRgb(theme.mutedTextColor) },
    },
    info: {
      title: `${normalized.title || 'Form'} - ${firmName}`,
      author: firmName,
    },
  };
};

export const openFormTemplatePdfPreview = (config, firmName, options = {}) => {
  const doc = buildFormTemplatePdfDefinition(config, firmName, options);
  pdfMake.createPdf(doc).open();
};

export const downloadFormTemplatePdf = (config, firmName, options = {}) => {
  const doc = buildFormTemplatePdfDefinition(config, firmName, options);
  const loanRef = options.loanRef ? `_${String(options.loanRef).replace(/[^\w-]+/g, '_')}` : '';
  const fileName = `${(config?.title || 'form').replace(/\s+/g, '_')}${loanRef}_${(firmName || 'firm').replace(/\s+/g, '_')}_${moment().format('DDMMYYYY')}.pdf`;
  pdfMake.createPdf(doc).download(fileName);
  return fileName;
};
