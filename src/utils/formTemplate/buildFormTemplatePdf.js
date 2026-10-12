import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import {
  getSortedSections,
  getSortedFields,
  clampFieldFontPt,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
  resolveMainTitleFont,
} from './formTemplateConfig';
import { pdfBoldFromWeight } from './form8SectionStyle';
import {
  buildFormTemplateTestData,
  getFormFieldValue,
  TRANSACTION_TEST_ROWS,
} from './formTemplateTestData';
import {
  buildForm8LogoPdfDefinition,
  buildForm8MediaPdfImage,
  getBlockLayout,
  getForm8BlockOrder,
  isForm8BlockEnabled,
  partitionForm8BlockOrder,
} from './form8BuilderBlocks';
import { templateHtmlToPlain } from './formTemplateRichText';
import { getForm8SignatureEntries } from './form8Signatures';
import {
  getForm8FieldDisplayLabel,
  getForm8FooterNoteTitle,
  getForm8SectionDisplayTitle,
} from './form8SectionDisplay';
import { getForm8FieldBlockValue, parseFieldBlockId } from './form8FieldBlocks';
import {
  FORM8_STOCK_TABLE_COLUMNS,
  getForm8StockCellValue,
} from './form8StockTable';
import { buildStockItemsTablePdf } from './form8StockTableStyle';
import {
  computeForm8CanvasPageHeightMm,
  getForm8BlockPdfAbsolutePos,
  getForm8ContentBoxMm,
  getForm8ReferencePageHeightMm,
  isForm8FreeCanvasLayout,
} from './form8CanvasLayout';
import { parseSectionBlockId } from './form8BuilderCatalog';
import {
  getForm8BlockPdfBodyProps,
  getForm8BlockPdfTitleProps,
} from './form8BlockStyle';
import {
  getForm8SectionFieldPdfStyle,
  getForm8SectionPdfTitleProps,
  wrapSectionPdfBlocks,
} from './form8SectionStyle';

const CUSTOMER_PHOTO_FIELD_ID = 'customer_photo';
const LOGO_WIDTH = 72;
const LOGO_HEIGHT = 72;
const PDF_IMAGE_DATA_URL = /^data:image\/jpe?g;base64,/i;

const sanitizePdfImage = (dataUrl) =>
  dataUrl && PDF_IMAGE_DATA_URL.test(dataUrl) ? dataUrl : null;

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const buildForm8SignaturePdfBlock = (normalized, formData, compact) => {
  const entries = getForm8SignatureEntries(normalized, formData);
  if (!entries.length) return null;
  return {
    columns: entries.map((entry) => ({
      stack: [
        { text: ' ', margin: [0, 0, 0, compact ? 14 : 22] },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 220,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#111827',
            },
          ],
        },
        {
          text: entry.caption,
          style: 'sigName',
          margin: [0, compact ? 4 : 6, 0, 0],
        },
      ],
      width: '*',
    })),
    columnGap: 24,
    margin: [0, compact ? 4 : 8, 0, 0],
  };
};

const buildLogoRow = (layout, leftLogoKey, rightLogoKey, centerText = '') => {
  const showLeft = layout?.showLeftLogo !== false;
  const showRight = layout?.showRightLogo !== false;
  const center = (centerText || '').trim();
  if (!showLeft && !showRight && !center) return null;

  const columns = [];

  if (showLeft) {
    columns.push(
      leftLogoKey
        ? { image: leftLogoKey, width: LOGO_WIDTH, height: LOGO_HEIGHT }
        : { width: LOGO_WIDTH, text: '' }
    );
  }

  columns.push({
    width: '*',
    text: center,
    alignment: 'center',
    style: center ? 'note' : undefined,
  });

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

const tableGridLayout = (theme) => ({
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => hexToRgb(theme.borderColor),
  vLineColor: () => hexToRgb(theme.borderColor),
});

const tableNoBorderLayout = () => ({
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 1,
  paddingBottom: () => 1,
});

const buildInlineFieldRow = (
  field,
  formData,
  theme,
  customerPhotoKey = null,
  fieldFonts = null
) => {
  if (!field) {
    return { text: '' };
  }

  if (field.id === CUSTOMER_PHOTO_FIELD_ID) {
    return {
      columns: [
        {
        width: '38%',
        text: getForm8FieldDisplayLabel(field),
        style: 'fieldLabel',
        color: hexToRgb(theme.textColor),
        ...(fieldFonts?.label?.fontSize != null ? { fontSize: fieldFonts.label.fontSize } : {}),
        ...(fieldFonts?.label?.bold != null ? { bold: fieldFonts.label.bold } : {}),
      },
      {
        width: '*',
        stack: [buildCustomerPhotoValue(field, formData, customerPhotoKey, theme)],
        },
      ],
      columnGap: 6,
      margin: [0, 1, 0, 1],
    };
  }

  const valueFill = cellFill(field, theme);
  return {
    columns: [
      {
        width: '38%',
        text: getForm8FieldDisplayLabel(field),
        style: 'fieldLabel',
        color: hexToRgb(theme.textColor),
        ...(fieldFonts?.label?.fontSize != null ? { fontSize: fieldFonts.label.fontSize } : {}),
        ...(fieldFonts?.label?.bold != null ? { bold: fieldFonts.label.bold } : {}),
      },
      {
        width: '*',
        text: getFormFieldValue(field.id, formData),
        style: 'fieldValue',
        color: hexToRgb(theme.textColor),
        ...(valueFill ? { background: valueFill } : {}),
        ...(fieldFonts?.value?.fontSize != null ? { fontSize: fieldFonts.value.fontSize } : {}),
        ...(fieldFonts?.value?.bold != null ? { bold: fieldFonts.value.bold } : {}),
      },
    ],
    columnGap: 6,
    margin: [0, 1, 0, 1],
  };
};

const buildSectionFieldTables = (
  section,
  formData,
  theme,
  customerPhotoKey = null,
  fieldFonts = null
) => {
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

  const pushFieldGroupRow = (group) => {
    const row = (field) =>
      buildInlineFieldRow(field, formData, theme, customerPhotoKey, fieldFonts);
    const { layout, fields: rowFields } = group;

    if (layout === 'full' || (layout === 'half' && rowFields.length === 1)) {
      tables.push({
        stack: [row(rowFields[0])],
        margin: [0, 0, 0, 2],
      });
      return;
    }

    if (layout === 'small') {
      tables.push({
        columns: rowFields.map((field) => ({
          width: '*',
          stack: [row(field)],
        })),
        columnGap: 6,
        margin: [0, 0, 0, 2],
      });
      return;
    }

    const [leftField, rightField] = rowFields;
    tables.push({
      columns: [
        { width: '*', stack: [row(leftField)] },
        {
          width: '*',
          stack: [rightField ? row(rightField) : { text: '' }],
        },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 2],
    });
  };

  groupFieldsByLayout(section.fields).forEach(pushFieldGroupRow);

  return tables;
};

export const buildFormTemplatePdfDefinition = (
  config,
  firmName = 'Sample Firm',
  options = {}
) => {
  const normalized = config;
  const formData = options.formData || buildFormTemplateTestData(firmName);
  const allTxnRows = options.transactionRows || TRANSACTION_TEST_ROWS;
  const transactionRows =
    normalized.singlePageLayout && allTxnRows.length > 2
      ? allTxnRows.slice(0, 2)
      : allTxnRows;
  const stockItemRows = options.stockItemRows || null;
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
  const footerImageKey = registerPdfImage(
    'formFooterImage',
    options.footerImageDataUrl || null
  );
  const customerPhotoKey = registerPdfImage(
    'customerPhoto',
    layout.showCustomerPhoto === false ? null : options.customerPhotoDataUrl || null
  );
  const firmFormHeader = options.formHeader || options.firmFormHeader || '';
  const firmFormFooter = options.formFooter || options.firmFormFooter || '';
  const { theme, fontPt, labelFontPt, valueFontPt } = getPageStyle(normalized);
  const { mainTitleFontPt } = resolveMainTitleFont(fontPt, theme);
  const size = normalized.pageSize || 'A4';
  const orientation = normalized.orientation || 'portrait';
  const compact = Boolean(normalized.singlePageLayout);
  const sectionMargin = compact ? [0, 4, 0, 2] : [0, 6, 0, 4];
  const pageMargins = compact ? [28, 28, 28, 28] : [40, 40, 40, 40];
  const pageWidthPt =
    size === 'Letter' ? 612 : size === 'A5' ? 419.53 : orientation === 'landscape' ? 841.89 : 595.28;
  const pageHeightPt =
    size === 'Letter' ? 792 : size === 'A5' ? 595.28 : orientation === 'landscape' ? 595.28 : 841.89;
  const contentWidthPt = pageWidthPt - pageMargins[0] - pageMargins[2];
  const contentHeightPt = pageHeightPt - pageMargins[1] - pageMargins[3];
  const useFreeCanvas = isForm8FreeCanvasLayout(normalized);
  const basePageHeightMm = normalized.pageHeightMm || (pageHeightPt * 25.4) / 72;
  const canvasPageHeightMm = useFreeCanvas
    ? computeForm8CanvasPageHeightMm(normalized, basePageHeightMm)
    : basePageHeightMm;
  const pdfPageHeightPt = (canvasPageHeightMm * 72) / 25.4;
  const refContentHeightPt =
    (getForm8ContentBoxMm(
      normalized.pageWidthMm || (pageWidthPt * 25.4) / 72,
      getForm8ReferencePageHeightMm(normalized, basePageHeightMm)
    ).height *
      72) /
    25.4;
  const showStockItemImages = layout.showStockItemImages !== false;

  const content = [];
  const blockOrder = getForm8BlockOrder(normalized);
  const sectionsById = new Map(
    getSortedSections(normalized).map((section) => [section.id, section])
  );
  const photoInSeparateBlock =
    blockOrder.includes('customer_photo') && layout.showCustomerPhoto !== false;
  const sectionPhotoKey = photoInSeparateBlock ? null : customerPhotoKey;

  const pushSectionPdf = (section, target = content) => {
    if (!section?.enabled) return;
    const titleProps = getForm8SectionPdfTitleProps(section, theme, fontPt);
    const sectionFieldFonts = getForm8SectionFieldPdfStyle(section, labelFontPt, valueFontPt);
    const sectionChunks = [];

    sectionChunks.push({
      text: getForm8SectionDisplayTitle(section),
      style: 'sectionTitle',
      color: titleProps.color,
      fillColor: titleProps.fillColor,
      fontSize: titleProps.fontSize,
      bold: titleProps.bold,
      margin: [0, 0, 0, 0],
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
      sectionChunks.push({
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
    } else {
      const fieldsForSection =
        section.id === 'customer_details' && photoInSeparateBlock
          ? {
              ...section,
              fields: (section.fields || []).filter((f) => f.id !== CUSTOMER_PHOTO_FIELD_ID),
            }
          : section;

      buildSectionFieldTables(
        fieldsForSection,
        formData,
        theme,
        sectionPhotoKey,
        sectionFieldFonts
      ).forEach((block) => {
        sectionChunks.push(block);
      });
    }

    wrapSectionPdfBlocks(section, theme, sectionChunks).forEach((block) => {
      target.push(block);
    });
  };

  const pushLogoBandPdf = () => {
    const row = buildLogoRow(layout, leftLogoKey, rightLogoKey, '');
    if (row) {
      row.margin = [0, 0, 0, compact ? 4 : 8];
      content.push(row);
    }
  };

  const pushFreeCanvasMediaPdf = (blockId, imageKey, target) => {
    if (!imageKey) return false;
    const spec = getBlockLayout(normalized, blockId);
    if (useFreeCanvas && spec.freePosition) {
      const img = buildForm8MediaPdfImage(normalized, blockId, imageKey, contentWidthPt);
      if (img) target.push(img);
      return true;
    }
    return false;
  };

  const pushBlockPdf = (blockId, target = content) => {
    if (!isForm8BlockEnabled(normalized, blockId)) return;

    const sectionId = parseSectionBlockId(blockId);
    if (sectionId) {
      if (sectionId === 'item_details') return;
      pushSectionPdf(sectionsById.get(sectionId), target);
      return;
    }

    const fieldId = parseFieldBlockId(blockId);
    if (fieldId) {
      const label = getForm8FieldDisplayLabel({ id: fieldId });
      const value = getForm8FieldBlockValue(fieldId, formData);
      target.push({
        text: [
          { text: `${label}: `, bold: true },
          { text: value, style: 'meta' },
        ],
        style: 'body',
        margin: [0, 0, 0, 0],
      });
      return;
    }

    switch (blockId) {
      case 'layout_left_logo': {
        if (layout.showLeftLogo !== false && leftLogoKey) {
          if (!pushFreeCanvasMediaPdf(blockId, leftLogoKey, target)) {
            const block = buildForm8LogoPdfDefinition(normalized, blockId, leftLogoKey, contentWidthPt, {
              compact,
            });
            if (block) target.push(block);
          }
        }
        break;
      }
      case 'layout_right_logo': {
        if (layout.showRightLogo !== false && rightLogoKey) {
          if (!pushFreeCanvasMediaPdf(blockId, rightLogoKey, target)) {
            const block = buildForm8LogoPdfDefinition(normalized, blockId, rightLogoKey, contentWidthPt, {
              compact,
            });
            if (block) target.push(block);
          }
        }
        break;
      }
      case 'layout_logo': {
        const logoRow = buildLogoRow(layout, leftLogoKey, rightLogoKey);
        if (logoRow) target.push(logoRow);
        break;
      }
      case 'form_header': {
        if (layout.useFirmFormHeader && firmFormHeader) {
          target.push({
            text: templateHtmlToPlain(replaceTemplateVariables(firmFormHeader, formData)),
            style: 'note',
            alignment: 'center',
            margin: [0, 0, 0, compact ? 4 : 8],
          });
        }
        target.push({
          text: normalized.title || 'FORM 8',
          style: 'title',
          alignment: 'center',
          color: hexToRgb(theme.primaryColor),
          margin: [0, 0, 0, 4],
        });
        if (normalized.subtitle) {
          target.push({
            text: normalized.subtitle,
            style: 'subtitle',
            alignment: 'center',
            margin: [0, 0, 0, 4],
          });
        }
        if (normalized.complianceReference) {
          target.push({
            text: normalized.complianceReference,
            style: 'compliance',
            alignment: 'center',
            margin: [0, 0, 0, compact ? 4 : 8],
          });
        }
        if (normalized.headerNote) {
          target.push({
            text: replaceTemplateVariables(normalized.headerNote, formData),
            style: 'note',
            alignment: 'center',
            margin: [0, 0, 0, compact ? 4 : 10],
          });
        }
        break;
      }
      case 'customer_photo':
        if (customerPhotoKey) {
          target.push(buildCustomerPhotoInjectBlock(customerPhotoKey, theme));
        }
        break;
      case 'stock_line_items': {
        const stockSpec = getBlockLayout(normalized, blockId);
        const itemSection = sectionsById.get('item_details');
        const wrapStyles = {
          backgroundColor:
            itemSection?.backgroundColor || stockSpec.backgroundColor || '',
          borderColor: itemSection?.borderColor || stockSpec.borderColor || '',
        };
        const stockChunks = [];
        if (itemSection) {
          const titleProps = getForm8SectionPdfTitleProps(itemSection, theme, fontPt);
          const blockTitle = getForm8BlockPdfTitleProps(stockSpec, theme, fontPt);
          const useBlockTitle =
            stockSpec.titleFontSizePt || stockSpec.titleColor || stockSpec.titleBackgroundColor;
          const t = useBlockTitle ? blockTitle : titleProps;
          stockChunks.push({
            text: getForm8SectionDisplayTitle(itemSection),
            style: 'sectionTitle',
            color: hexToRgb(t.color),
            fillColor: hexToRgb(t.fillColor),
            fontSize: t.fontSize,
            bold: t.bold,
            margin: [0, 0, 0, 0],
          });
        } else {
          const blockTitle = getForm8BlockPdfTitleProps(stockSpec, theme, fontPt);
          stockChunks.push({
            text: 'Stock Information',
            style: 'sectionTitle',
            color: hexToRgb(blockTitle.color),
            fillColor: hexToRgb(blockTitle.fillColor),
            fontSize: blockTitle.fontSize,
            bold: blockTitle.bold,
            margin: [0, 0, 0, 0],
          });
        }
        if (showStockItemImages && stockItemRows?.length) {
          const stockTable = buildStockItemsTablePdf(
            stockItemRows,
            registerPdfImage,
            theme,
            stockSpec,
            labelFontPt,
            valueFontPt,
            FORM8_STOCK_TABLE_COLUMNS,
            getForm8StockCellValue
          );
          if (stockTable) stockChunks.push(stockTable);
        }
        wrapSectionPdfBlocks(wrapStyles, theme, stockChunks).forEach((block) => {
          target.push(block);
        });
        break;
      }
      case 'form_terms': {
        if (!normalized.termsAndConditions) break;
        const termsSpec = getBlockLayout(normalized, blockId);
        const termsTitle = getForm8BlockPdfTitleProps(termsSpec, theme, fontPt);
        const termsBody = getForm8BlockPdfBodyProps(termsSpec, theme, labelFontPt, valueFontPt);
        const termsChunks = [
          {
            text: 'Terms & Conditions',
            style: 'sectionTitle',
            color: hexToRgb(termsTitle.color),
            fillColor: hexToRgb(termsTitle.fillColor),
            fontSize: termsTitle.fontSize,
            bold: termsTitle.bold,
            margin: [0, 0, 0, 0],
          },
          {
            text: replaceTemplateVariables(normalized.termsAndConditions, formData),
            style: 'body',
            color: hexToRgb(termsBody.color),
            fontSize: termsBody.fontSize,
            bold: termsBody.bold,
            margin: [0, 4, 0, 0],
          },
        ];
        wrapSectionPdfBlocks(termsSpec, theme, termsChunks).forEach((block) => {
          target.push(block);
        });
        break;
      }
      case 'form_footer': {
        const footerText =
          layout.useFirmFormFooter && firmFormFooter
            ? firmFormFooter
            : normalized.footerNote;
        if (!footerText) break;
        const footerSpec = getBlockLayout(normalized, blockId);
        const footerTitle = getForm8BlockPdfTitleProps(footerSpec, theme, fontPt);
        const footerBody = getForm8BlockPdfBodyProps(footerSpec, theme, labelFontPt, valueFontPt);
        const footerChunks = [
          {
            text: getForm8FooterNoteTitle(normalized),
            style: 'sectionTitle',
            color: hexToRgb(footerTitle.color),
            fillColor: hexToRgb(footerTitle.fillColor),
            fontSize: footerTitle.fontSize,
            bold: footerTitle.bold,
            margin: [0, 0, 0, 0],
          },
          {
            text: templateHtmlToPlain(replaceTemplateVariables(footerText, formData)),
            style: 'body',
            alignment: 'left',
            color: hexToRgb(footerBody.color),
            fontSize: footerBody.fontSize,
            bold: footerBody.bold,
            margin: [0, 4, 0, 0],
          },
        ];
        wrapSectionPdfBlocks(footerSpec, theme, footerChunks).forEach((block) => {
          target.push(block);
        });
        break;
      }
      case 'layout_footer_image': {
        const footerImgKey = footerImageKey || rightLogoKey || leftLogoKey;
        if (footerImgKey) {
          if (!pushFreeCanvasMediaPdf(blockId, footerImgKey, target)) {
            const block = buildForm8LogoPdfDefinition(
              normalized,
              blockId,
              footerImgKey,
              contentWidthPt,
              { compact }
            );
            if (block) target.push(block);
          }
        }
        break;
      }
      case 'signature_lines': {
        const sigBlock = buildForm8SignaturePdfBlock(normalized, formData, compact);
        if (sigBlock) target.push(sigBlock);
        break;
      }
      case 'form_legal':
        if (normalized.termsAndConditions) {
          target.push({
            text: 'Terms & Conditions',
            style: 'sectionTitle',
            color: hexToRgb(theme.sectionTitleColor),
            margin: [0, 8, 0, 4],
          });
          target.push({
            text: replaceTemplateVariables(normalized.termsAndConditions, formData),
            style: 'body',
            margin: [0, 0, 0, 8],
          });
        }
        if (normalized.declarationText) {
          target.push({
            text: replaceTemplateVariables(normalized.declarationText, formData),
            style: 'body',
            italics: true,
            margin: [0, 0, 0, 16],
          });
        }
        const legalSig = buildForm8SignaturePdfBlock(normalized, formData, compact);
        if (legalSig) target.push(legalSig);
        break;
      default:
        break;
    }
  };

  if (useFreeCanvas) {
    partitionForm8BlockOrder(blockOrder).forEach((seg) => {
      if (seg.type === 'logo_band') return;
      const chunk = [];
      pushBlockPdf(seg.id, chunk);
      if (!chunk.length) return;
      const pos = getForm8BlockPdfAbsolutePos(
        normalized,
        seg.id,
        contentWidthPt,
        refContentHeightPt,
        pageMargins
      );
      content.push({
        stack: chunk,
        absolutePosition: { x: pos.x, y: pos.y },
      });
    });
  } else {
    partitionForm8BlockOrder(blockOrder).forEach((seg) => {
      if (seg.type === 'logo_band') {
        pushLogoBandPdf();
        return;
      }
      pushBlockPdf(seg.id);
    });
  }

  if (normalized.showPageNumbers) {
    content.push({
      text: compact ? 'Page 1 of 1' : 'Page 1',
      style: 'pageNum',
      alignment: 'center',
      margin: [0, 8, 0, 0],
    });
  }

  const pageSize =
    useFreeCanvas && canvasPageHeightMm > basePageHeightMm + 0.5
      ? { width: pageWidthPt, height: pdfPageHeightPt }
      : size === 'Letter'
        ? 'LETTER'
        : size;

  return {
    pageSize,
    pageOrientation: useFreeCanvas && canvasPageHeightMm > basePageHeightMm + 0.5 ? undefined : orientation,
    pageMargins,
    background: () => null,
    ...(Object.keys(pdfImages).length ? { images: pdfImages } : {}),
    content,
    defaultStyle: {
      fontSize: fontPt,
      color: hexToRgb(theme.textColor),
    },
    styles: {
      title: {
        fontSize: mainTitleFontPt,
        bold: pdfBoldFromWeight(theme.titleFontWeight, true),
      },
      subtitle: { fontSize: fontPt + 1 },
      compliance: { fontSize: fontPt - 2, italics: true, lineHeight: 1.25 },
      sectionTitle: { fontSize: fontPt, bold: true },
      meta: { fontSize: fontPt - 1, color: hexToRgb(theme.mutedTextColor) },
      note: { fontSize: fontPt - 1, color: hexToRgb(theme.mutedTextColor) },
      fieldLabel: {
        fontSize: labelFontPt,
        bold: pdfBoldFromWeight(theme.labelFontWeight, false),
      },
      fieldValue: {
        fontSize: valueFontPt,
        bold: pdfBoldFromWeight(theme.valueFontWeight, true),
      },
      fieldLabelSmall: { fontSize: clampFieldFontPt(labelFontPt - 1) },
      fieldValueSmall: { fontSize: clampFieldFontPt(valueFontPt - 1), bold: true },
      tableHeader: { fontSize: fontPt - 1, bold: true },
      tableCell: { fontSize: fontPt - 1 },
      body: { fontSize: fontPt - 1, lineHeight: 1.35 },
      sigLabel: { fontSize: fontPt - 2, color: hexToRgb(theme.mutedTextColor) },
      sigTitle: { fontSize: fontPt - 0.5, color: hexToRgb(theme.textColor) },
      sigName: { fontSize: fontPt, color: hexToRgb(theme.textColor) },
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

export const getFormTemplatePdfFileName = (config, firmName, options = {}) => {
  const loanRef = options.loanRef ? `_${String(options.loanRef).replace(/[^\w-]+/g, '_')}` : '';
  return `${(config?.title || 'form').replace(/\s+/g, '_')}${loanRef}_${(firmName || 'firm').replace(/\s+/g, '_')}_${moment().format('DDMMYYYY')}.pdf`;
};

export const getFormTemplatePdfBlob = (config, firmName, options = {}) => {
  const doc = buildFormTemplatePdfDefinition(config, firmName, options);
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(doc).getBlob((blob) => resolve(blob));
    } catch (err) {
      reject(err);
    }
  });
};

export const downloadFormTemplatePdf = (config, firmName, options = {}) => {
  const fileName = getFormTemplatePdfFileName(config, firmName, options);
  const doc = buildFormTemplatePdfDefinition(config, firmName, options);
  pdfMake.createPdf(doc).download(fileName);
  return fileName;
};
