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

const CUSTOMER_PHOTO_FIELD_ID = 'customer_photo';
const LOGO_WIDTH = 72;
const LOGO_HEIGHT = 72;
const PDF_IMAGE_DATA_URL = /^data:image\/jpe?g;base64,/i;

const sanitizePdfImage = (dataUrl) =>
  dataUrl && PDF_IMAGE_DATA_URL.test(dataUrl) ? dataUrl : null;

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const buildLogoRow = (layout, leftLogoKey, rightLogoKey) => {
  const showLeft = Boolean(layout?.showLeftLogo);
  const showRight = Boolean(layout?.showRightLogo);
  if (!showLeft && !showRight) return null;
  if (showLeft && !leftLogoKey && showRight && !rightLogoKey) return null;

  const columns = [];

  if (showLeft) {
    columns.push(
      leftLogoKey
        ? { image: leftLogoKey, width: LOGO_WIDTH, height: LOGO_HEIGHT }
        : { width: LOGO_WIDTH, text: '' }
    );
  }

  columns.push({ width: '*', text: '' });

  if (showRight) {
    columns.push(
      rightLogoKey
        ? {
            image: rightLogoKey,
            width: LOGO_WIDTH,
            height: LOGO_HEIGHT,
            alignment: 'right',
          }
        : { width: LOGO_WIDTH, text: '' }
    );
  }

  return {
    columns,
    margin: [0, 0, 0, 8],
  };
};

const hexToRgb = (hex) => {
  const h = String(hex || '#000000').replace('#', '');
  if (h.length !== 6) return '#111827';
  return `#${h}`;
};

const cellFill = (field, theme) =>
  field.backgroundColor ? hexToRgb(field.backgroundColor) : null;

const buildCustomerPhotoValue = (field, formData, customerPhotoKey, theme, compact = false) => {
  if (customerPhotoKey) {
    return {
      image: customerPhotoKey,
      width: compact ? 56 : 72,
      height: compact ? 70 : 90,
      margin: [0, 4, 0, 0],
    };
  }

  return {
    text: getFormFieldValue(field.id, formData),
    style: compact ? 'fieldValueSmall' : 'fieldValue',
    color: hexToRgb(theme.textColor),
    margin: [0, 2, 0, 0],
  };
};

const buildCustomerPhotoInjectBlock = (customerPhotoKey, theme) => ({
  columns: [
    {
      width: 84,
      stack: [
        {
          text: 'Customer Photo',
          style: 'fieldLabelSmall',
          color: hexToRgb(theme.mutedTextColor),
        },
        {
          image: customerPhotoKey,
          width: 72,
          height: 90,
          margin: [0, 4, 0, 0],
        },
      ],
    },
    { width: '*', text: '' },
  ],
  margin: [0, 0, 0, 6],
});

const buildFieldCell = (field, formData, theme, compact = false, customerPhotoKey = null) => ({
  stack: [
    {
      text: field.label,
      style: compact ? 'fieldLabelSmall' : 'fieldLabel',
      color: hexToRgb(theme.mutedTextColor),
    },
    field.id === CUSTOMER_PHOTO_FIELD_ID
      ? buildCustomerPhotoValue(field, formData, customerPhotoKey, theme, compact)
      : {
          text: getFormFieldValue(field.id, formData),
          style: compact ? 'fieldValueSmall' : 'fieldValue',
          color: hexToRgb(theme.textColor),
          margin: [0, 2, 0, 0],
        },
  ],
  fillColor: cellFill(field, theme),
  margin: [2, 2, 2, 2],
});

const buildSectionFieldTables = (section, formData, theme, customerPhotoKey = null) => {
  const tables = [];
  const enabledFields = getSortedFields(section).filter((field) => field.enabled);
  const hasPhotoField = enabledFields.some((field) => field.id === CUSTOMER_PHOTO_FIELD_ID);

  if (
    customerPhotoKey &&
    section.id === 'customer_details' &&
    !hasPhotoField
  ) {
    tables.push(buildCustomerPhotoInjectBlock(customerPhotoKey, theme));
  }

  groupFieldsByLayout(section.fields).forEach((group) => {
    if (group.layout === 'full') {
      const field = group.fields[0];
      const valueCell =
        field.id === CUSTOMER_PHOTO_FIELD_ID
          ? {
              stack: [buildCustomerPhotoValue(field, formData, customerPhotoKey, theme)],
              fillColor: cellFill(field, theme),
            }
          : {
              text: getFormFieldValue(field.id, formData),
              style: 'fieldValue',
              color: hexToRgb(theme.textColor),
              fillColor: cellFill(field, theme),
            };

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
              valueCell,
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
            group.fields.map((field) =>
              buildFieldCell(field, formData, theme, true, customerPhotoKey)
            ),
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
      ...buildFieldCell(field, formData, theme, false, customerPhotoKey),
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
  const layout = normalized.layout || {};
  const pdfImages = {};

  const registerPdfImage = (key, dataUrl) => {
    const safe = sanitizePdfImage(dataUrl);
    if (!safe) return null;
    pdfImages[key] = safe;
    return key;
  };

  const leftLogoKey = registerPdfImage('firmLogoLeft', options.leftLogoDataUrl);
  const rightLogoKey = registerPdfImage('firmLogoRight', options.rightLogoDataUrl);
  const customerPhotoKey = registerPdfImage(
    'customerPhoto',
    layout.showCustomerPhoto === false ? null : options.customerPhotoDataUrl || null
  );
  const firmFormHeader = options.formHeader || options.firmFormHeader || '';
  const firmFormFooter = options.formFooter || options.firmFormFooter || '';
  const { theme, fontPt } = getPageStyle(normalized);
  const size = normalized.pageSize || 'A4';
  const orientation = normalized.orientation || 'portrait';

  const content = [];

  const logoRow = buildLogoRow(layout, leftLogoKey, rightLogoKey);
  if (logoRow) {
    content.push(logoRow);
  }

  if (layout.useFirmFormHeader && firmFormHeader) {
    content.push({
      text: replaceTemplateVariables(firmFormHeader, formData),
      style: 'note',
      alignment: 'center',
      margin: [0, 0, 0, 8],
    });
  }

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

      if (section.id === 'transaction_history' || section.id === 'emi_schedule') {
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

      buildSectionFieldTables(section, formData, theme, customerPhotoKey).forEach((block) => {
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

  const footerText =
    layout.useFirmFormFooter && firmFormFooter
      ? firmFormFooter
      : normalized.footerNote;
  if (footerText) {
    content.push({
      text: replaceTemplateVariables(footerText, formData),
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
    ...(Object.keys(pdfImages).length ? { images: pdfImages } : {}),
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
