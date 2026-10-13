import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import {
  getSortedSections,
  getSortedFields,
  clampFieldFontPt,
  getPageStyle,
  normalizeFormConfig,
  replaceTemplateVariables,
  groupFieldsByLayout,
  resolveMainTitleFont,
} from './formTemplateConfig';
import { hasFormTemplateFooterImage } from './formTemplateImageAssets';
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
  getForm8StockCellValue,
  getVisibleForm8StockColumns,
} from './form8StockTable';
import { buildStockItemsTablePdf } from './form8StockTableStyle';
import {
  computeForm8CanvasPageHeightMm,
  FORM8_PAGE_PADDING_MM,
  getForm8BlockPdfAbsolutePos,
  getForm8ContentBoxMm,
  getForm8ReferencePageHeightMm,
  isForm8FreeCanvasLayout,
  withForm8SideBySideFit,
  withForm8StockRowFlow,
} from './form8CanvasLayout';
import { parseSectionBlockId } from './form8BuilderCatalog';
import { isForm8DividerBlockId } from './form8DividerBlocks';
import {
  FORM8_HEADER_LINE_DEFS,
  getForm8BlockPdfBodyProps,
  getForm8BlockPdfTitleProps,
  buildForm8TextPartPdfBlock,
  getForm8SignatureLinePdf,
  signatureHasCustomBox,
  buildForm8DividerPdfBlock,
  getForm8HeaderLinePdfProps,
  headerHasCustomBox,
  isForm8HeaderBorderOn,
} from './form8BlockStyle';
import {
  FORM8_PDF_LINE_HEIGHT,
  FORM8_PDF_LINE_HEIGHT_COMPACT,
  getForm8SectionFieldPdfStyle,
  getForm8SectionPdfBoxMetrics,
  getForm8SectionPdfTitleProps,
  PDF_TIGHT_LAYOUT,
  wrapSectionPdfBlocks,
} from './form8SectionStyle';

const CUSTOMER_PHOTO_FIELD_ID = 'customer_photo';
const LOGO_WIDTH = 72;
const LOGO_HEIGHT = 72;
const PDF_IMAGE_DATA_URL = /^data:image\/jpe?g;base64,/i;

const sanitizePdfImage = (dataUrl) =>
  dataUrl && PDF_IMAGE_DATA_URL.test(dataUrl) ? dataUrl : null;

pdfMake.vfs = pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts;

const buildForm8SignaturePdfBlock = (normalized, formData, compact, theme, valueFontPt) => {
  const entries = getForm8SignatureEntries(normalized, formData);
  if (!entries.length) return null;
  const sigSpec = getBlockLayout(normalized, 'signature_lines');
  const body = getForm8BlockPdfBodyProps(sigSpec, theme, valueFontPt, valueFontPt);
  const line = getForm8SignatureLinePdf(sigSpec, theme, compact);
  const columns = {
    columns: entries.map((entry) => ({
      stack: [
        { text: ' ', margin: [0, 0, 0, line.gap] },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 220,
              y2: 0,
              lineWidth: line.width,
              lineColor: hexToRgb(line.color),
            },
          ],
        },
        {
          text: entry.caption,
          style: 'sigName',
          fontSize: body.fontSize,
          bold: body.bold,
          color: hexToRgb(body.color),
          fillColor: body.fillColor ? hexToRgb(body.fillColor) : undefined,
          margin: [0, compact ? 4 : 6, 0, 0],
        },
      ],
      width: '*',
    })),
    columnGap: 24,
    margin: [0, compact ? 4 : 8, 0, 0],
  };
  if (!signatureHasCustomBox(sigSpec)) return columns;
  return wrapSectionPdfBlocks(sigSpec, theme, [columns], { compact })[0] || columns;
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

const buildInlineFieldRow = (
  field,
  formData,
  theme,
  customerPhotoKey = null,
  fieldFonts = null,
  compact = false,
  boxWidthPt = 0
) => {
  if (!field) {
    return { text: '' };
  }

  const usable = Number.isFinite(boxWidthPt) && boxWidthPt > 36 ? Math.floor(boxWidthPt) : 0;
  const labelRatio = compact ? 0.44 : 0.4;
  const labelW = usable ? Math.max(20, Math.round(usable * labelRatio)) : null;
  const valueW = usable ? Math.max(20, usable - labelW) : null;
  const widths = labelW && valueW ? [labelW, valueW] : ['38%', '*'];

  const lineHeight = compact ? FORM8_PDF_LINE_HEIGHT_COMPACT : FORM8_PDF_LINE_HEIGHT;
  const { fieldPadY } = getForm8SectionPdfBoxMetrics(compact);
  const labelCell = {
    text: getForm8FieldDisplayLabel(field),
    style: 'fieldLabel',
    lineHeight,
    color: hexToRgb(fieldFonts?.label?.color || theme.textColor),
    ...(fieldFonts?.label?.fontSize != null ? { fontSize: fieldFonts.label.fontSize } : {}),
    ...(fieldFonts?.label?.bold != null ? { bold: fieldFonts.label.bold } : {}),
    ...(fieldFonts?.label?.fillColor ? { background: hexToRgb(fieldFonts.label.fillColor) } : {}),
  };

  if (field.id === CUSTOMER_PHOTO_FIELD_ID) {
    return {
      table: {
        widths,
        body: [[labelCell, buildCustomerPhotoValue(field, formData, customerPhotoKey, theme, compact)]],
      },
      layout: PDF_TIGHT_LAYOUT,
      margin: [0, fieldPadY, 0, fieldPadY],
    };
  }

  const valueFill = cellFill(field, theme);
  const valueCell = {
    text: getFormFieldValue(field.id, formData),
    style: 'fieldValue',
    lineHeight,
    color: hexToRgb(fieldFonts?.value?.color || theme.textColor),
    ...(valueFill
      ? { background: valueFill }
      : fieldFonts?.value?.fillColor
        ? { background: hexToRgb(fieldFonts.value.fillColor) }
        : {}),
    ...(fieldFonts?.value?.fontSize != null ? { fontSize: fieldFonts.value.fontSize } : {}),
    ...(fieldFonts?.value?.bold != null ? { bold: fieldFonts.value.bold } : {}),
  };

  return {
    table: {
      widths,
      body: [[labelCell, valueCell]],
    },
    layout: PDF_TIGHT_LAYOUT,
    margin: [0, fieldPadY, 0, fieldPadY],
  };
};

const buildSectionFieldTables = (
  section,
  formData,
  theme,
  customerPhotoKey = null,
  fieldFonts = null,
  compact = false,
  boxWidthPt = 0
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

  const { bodyPadX, fieldRowGap } = getForm8SectionPdfBoxMetrics(compact);
  const innerWidth =
    Number.isFinite(boxWidthPt) && boxWidthPt > bodyPadX + 40 ? boxWidthPt - bodyPadX : 0;

  const pushFieldGroupRow = (group) => {
    const row = (field, widthPt) =>
      buildInlineFieldRow(
        field,
        formData,
        theme,
        customerPhotoKey,
        fieldFonts,
        compact,
        widthPt
      );
    const rowGap = fieldRowGap;
    const { layout, fields: rowFields } = group;

    if (layout === 'full' || (layout === 'half' && rowFields.length === 1)) {
      tables.push({
        stack: [row(rowFields[0], innerWidth)],
        margin: [0, 0, 0, rowGap],
      });
      return;
    }

    if (layout === 'small') {
      const gap = compact ? 4 : 6;
      const colCount = Math.max(1, rowFields.length);
      const colW = innerWidth
        ? Math.max(28, Math.floor((innerWidth - gap * (colCount - 1)) / colCount))
        : 0;
      const widths = innerWidth
        ? rowFields.flatMap((_, i) => (i ? [gap, colW] : [colW]))
        : rowFields.map(() => '*');
      const cells = rowFields.flatMap((field, i) =>
        i ? [{ text: '' }, row(field, colW)] : [row(field, colW)]
      );
      tables.push({
        table: { widths, body: [cells] },
        layout: PDF_TIGHT_LAYOUT,
        margin: [0, 0, 0, rowGap],
      });
      return;
    }

    const [leftField, rightField] = rowFields;
    const gap = compact ? 6 : 10;
    const colW = innerWidth ? Math.max(36, Math.floor((innerWidth - gap) / 2)) : 0;
    tables.push({
      table: {
        widths: innerWidth ? [colW, gap, colW] : ['*', 10, '*'],
        body: [[
          row(leftField, colW),
          { text: '' },
          rightField ? row(rightField, colW) : { text: '' },
        ]],
      },
      layout: PDF_TIGHT_LAYOUT,
      margin: [0, 0, 0, rowGap],
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
  const normalized = normalizeFormConfig(config);
  const formData = options.formData || buildFormTemplateTestData(firmName);
  const allTxnRows = options.transactionRows || TRANSACTION_TEST_ROWS;
  const transactionRows =
    normalized.singlePageLayout && allTxnRows.length > 2
      ? allTxnRows.slice(0, 2)
      : allTxnRows;
  const stockItemRows = options.stockItemRows || null;
  const layout = normalized.layout || {};

  const registerPdfImage = (_key, dataUrl) => {
    const safe = sanitizePdfImage(dataUrl);
    return safe || null;
  };

  const leftLogoKey = registerPdfImage('firmLogoLeft', options.leftLogoDataUrl);
  const rightLogoKey = registerPdfImage('firmLogoRight', options.rightLogoDataUrl);
  const footerOnTemplate =
    isForm8BlockEnabled(normalized, 'layout_footer_image') &&
    hasFormTemplateFooterImage(normalized);
  const templateFooter = footerOnTemplate
    ? String(normalized.assets?.footerImageDataUrl || '').trim()
    : '';
  const footerRepeatsLogo =
    templateFooter &&
    (templateFooter === options.leftLogoDataUrl ||
      templateFooter === options.rightLogoDataUrl);
  const footerImageKey = registerPdfImage(
    'formFooterImage',
    footerOnTemplate && !footerRepeatsLogo ? templateFooter : null
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
  const useFreeCanvas = isForm8FreeCanvasLayout(normalized);
  const mmToPt = (mm) => (mm * 72) / 25.4;
  const pageMargins = useFreeCanvas
    ? [
        mmToPt(FORM8_PAGE_PADDING_MM.left),
        mmToPt(FORM8_PAGE_PADDING_MM.top),
        mmToPt(FORM8_PAGE_PADDING_MM.right),
        mmToPt(FORM8_PAGE_PADDING_MM.bottom),
      ]
    : compact
      ? [28, 28, 28, 28]
      : [40, 40, 40, 40];
  const pageWidthPt =
    size === 'Letter' ? 612 : size === 'A5' ? 419.53 : orientation === 'landscape' ? 841.89 : 595.28;
  const pageHeightPt =
    size === 'Letter' ? 792 : size === 'A5' ? 595.28 : orientation === 'landscape' ? 595.28 : 841.89;
  const contentWidthPt = pageWidthPt - pageMargins[0] - pageMargins[2];
  const basePageHeightMm = normalized.pageHeightMm || (pageHeightPt * 25.4) / 72;
  const showStockItemImages = layout.showStockItemImages !== false;
  const layoutConfig = withForm8SideBySideFit(
    withForm8StockRowFlow(
      normalized,
      showStockItemImages ? stockItemRows : [],
      basePageHeightMm
    ),
    basePageHeightMm
  );
  const canvasPageHeightMm = useFreeCanvas
    ? computeForm8CanvasPageHeightMm(layoutConfig, basePageHeightMm)
    : basePageHeightMm;
  const pdfPageHeightPt = (canvasPageHeightMm * 72) / 25.4;
  const refContentHeightPt =
    (getForm8ContentBoxMm(
      normalized.pageWidthMm || (pageWidthPt * 25.4) / 72,
      getForm8ReferencePageHeightMm(normalized, basePageHeightMm)
    ).height *
      72) /
    25.4;
  const content = [];
  const blockOrder = getForm8BlockOrder(normalized);
  const sectionsById = new Map(
    getSortedSections(normalized).map((section) => [section.id, section])
  );
  const photoInSeparateBlock =
    blockOrder.includes('customer_photo') && layout.showCustomerPhoto !== false;
  const sectionPhotoKey = photoInSeparateBlock ? null : customerPhotoKey;

  const pushSectionPdf = (section, target = content, widthPt = 0) => {
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
        sectionFieldFonts,
        compact,
        widthPt
      ).forEach((block) => {
        sectionChunks.push(block);
      });
    }

    wrapSectionPdfBlocks(section, theme, sectionChunks, { compact, widthPt }).forEach((block) => {
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
    const spec = getBlockLayout(layoutConfig, blockId);
    if (useFreeCanvas && spec.freePosition) {
      const img = buildForm8MediaPdfImage(layoutConfig, blockId, imageKey, contentWidthPt);
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
      const sectionPos = getForm8BlockPdfAbsolutePos(
        layoutConfig,
        blockId,
        contentWidthPt,
        refContentHeightPt,
        pageMargins
      );
      pushSectionPdf(sectionsById.get(sectionId), target, sectionPos.widthPt);
      return;
    }

    if (isForm8DividerBlockId(blockId)) {
      target.push(
        buildForm8DividerPdfBlock(
          getBlockLayout(normalized, blockId),
          theme,
          contentWidthPt
        )
      );
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
        const headerSpec = getBlockLayout(normalized, blockId);
        const headerLine = (id, fallbackPt) => {
          const line = FORM8_HEADER_LINE_DEFS.find((item) => item.id === id);
          return line
            ? getForm8HeaderLinePdfProps(headerSpec, line, fallbackPt)
            : { fontSize: fallbackPt, bold: false, color: null, fillColor: null };
        };
        const applyHeaderLinePdf = (node, props) => {
          if (props.color) node.color = hexToRgb(props.color);
          if (props.fontSize) node.fontSize = props.fontSize;
          node.bold = props.bold;
          if (props.fillColor) node.background = hexToRgb(props.fillColor);
          return node;
        };
        const headerChunks = [];
        if (layout.useFirmFormHeader && firmFormHeader) {
          headerChunks.push({
            text: templateHtmlToPlain(replaceTemplateVariables(firmFormHeader, formData)),
            style: 'note',
            alignment: 'center',
            margin: [0, 0, 0, compact ? 4 : 8],
          });
        }
        const titleProps = headerLine('title', mainTitleFontPt);
        headerChunks.push(
          applyHeaderLinePdf(
            {
              text: normalized.title || 'FORM 8',
              style: 'title',
              alignment: 'center',
              color: hexToRgb(theme.primaryColor),
              margin: [0, 0, 0, compact ? 1 : 4],
            },
            titleProps
          )
        );
        if (normalized.subtitle) {
          headerChunks.push(
            applyHeaderLinePdf(
              {
                text: normalized.subtitle,
                style: 'subtitle',
                alignment: 'center',
                color: hexToRgb(theme.sectionTitleColor),
                margin: [0, 0, 0, compact ? 1 : 4],
              },
              headerLine('subtitle', labelFontPt)
            )
          );
        }
        if (normalized.complianceReference) {
          headerChunks.push(
            applyHeaderLinePdf(
              {
                text: normalized.complianceReference,
                style: 'compliance',
                alignment: 'center',
                color: hexToRgb(theme.textColor),
                margin: [0, 0, 0, compact ? 1 : 8],
              },
              headerLine('compliance', labelFontPt)
            )
          );
        }
        if (normalized.headerNote) {
          headerChunks.push(
            applyHeaderLinePdf(
              {
                text: replaceTemplateVariables(normalized.headerNote, formData),
                style: 'note',
                alignment: 'center',
                color: hexToRgb(theme.textColor),
                margin: [0, 0, 0, 0],
              },
              headerLine('note', valueFontPt)
            )
          );
        }
        if (headerHasCustomBox(headerSpec)) {
          const fill = headerSpec.backgroundColor
            ? hexToRgb(headerSpec.backgroundColor)
            : null;
          const lineColor = hexToRgb(headerSpec.borderColor || '#2c5282');
          const showBorder = isForm8HeaderBorderOn(headerSpec);
          const borderW = Number(headerSpec.headerBorderWidth);
          const lineW = Number.isFinite(borderW) ? (borderW * 72) / 96 : 1;
          target.push({
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: headerChunks,
                    fillColor: fill,
                    margin: [8, 8, 8, 8],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => (showBorder ? lineW : 0),
              vLineWidth: () => (showBorder ? lineW : 0),
              hLineColor: () => lineColor,
              vLineColor: () => lineColor,
            },
            margin: [0, 0, 0, compact ? 0 : 10],
          });
        } else {
          headerChunks.forEach((block) => target.push(block));
        }
        break;
      }
      case 'customer_photo':
        if (customerPhotoKey) {
          if (!pushFreeCanvasMediaPdf(blockId, customerPhotoKey, target)) {
            const block = buildForm8LogoPdfDefinition(
              normalized,
              blockId,
              customerPhotoKey,
              contentWidthPt,
              { compact }
            );
            if (block) target.push(block);
          }
        }
        break;
      case 'stock_line_items': {
        const stockSpec = getBlockLayout(normalized, blockId);
        const itemSection = sectionsById.get('item_details');
        const wrapStyles = {
          backgroundColor: stockSpec.backgroundColor || itemSection?.backgroundColor || '',
          borderColor: stockSpec.borderColor || itemSection?.borderColor || '',
          sectionBorder: stockSpec.sectionBorder,
          sectionBorderWidth: stockSpec.sectionBorderWidth,
          sectionBorderRadius: stockSpec.sectionBorderRadius,
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
            getVisibleForm8StockColumns(stockSpec),
            getForm8StockCellValue
          );
          if (stockTable) stockChunks.push(stockTable);
        }
        const stockPos = getForm8BlockPdfAbsolutePos(
          layoutConfig,
          blockId,
          contentWidthPt,
          refContentHeightPt,
          pageMargins
        );
        wrapSectionPdfBlocks(wrapStyles, theme, stockChunks, {
          compact,
          widthPt: stockPos.widthPt,
        }).forEach((block) => {
          target.push(block);
        });
        break;
      }
      case 'form_terms': {
        if (!normalized.termsAndConditions) break;
        const termsSpec = getBlockLayout(normalized, blockId);
        const termsTitle = getForm8BlockPdfTitleProps(termsSpec, theme, fontPt);
        const termsBody = getForm8BlockPdfBodyProps(termsSpec, theme, labelFontPt, valueFontPt);
        target.push(
          buildForm8TextPartPdfBlock(
            termsSpec,
            'title',
            {
              text: 'Terms & Conditions',
              color: hexToRgb(termsTitle.color),
              fontSize: termsTitle.fontSize,
              bold: termsTitle.bold,
            },
            theme,
            compact
          )
        );
        target.push(
          buildForm8TextPartPdfBlock(
            termsSpec,
            'body',
            {
              text: replaceTemplateVariables(normalized.termsAndConditions, formData),
              color: hexToRgb(termsBody.color),
              fontSize: termsBody.fontSize,
              bold: termsBody.bold,
            },
            theme,
            compact
          )
        );
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
        target.push(
          buildForm8TextPartPdfBlock(
            footerSpec,
            'title',
            {
              text: getForm8FooterNoteTitle(normalized),
              color: hexToRgb(footerTitle.color),
              fontSize: footerTitle.fontSize,
              bold: footerTitle.bold,
            },
            theme,
            compact
          )
        );
        target.push(
          buildForm8TextPartPdfBlock(
            footerSpec,
            'body',
            {
              text: templateHtmlToPlain(replaceTemplateVariables(footerText, formData)),
              color: hexToRgb(footerBody.color),
              fontSize: footerBody.fontSize,
              bold: footerBody.bold,
            },
            theme,
            compact
          )
        );
        break;
      }
      case 'layout_footer_image': {
        const footerImgKey = footerOnTemplate ? footerImageKey : null;
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
        const sigBlock = buildForm8SignaturePdfBlock(
          normalized,
          formData,
          compact,
          theme,
          valueFontPt
        );
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
        const legalSig = buildForm8SignaturePdfBlock(
          normalized,
          formData,
          compact,
          theme,
          valueFontPt
        );
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
        layoutConfig,
        seg.id,
        contentWidthPt,
        refContentHeightPt,
        pageMargins
      );
      const boxed = chunk.length === 1 && chunk[0]?.table?.widths?.[0] === pos.widthPt;
      content.push(
        boxed
          ? { ...chunk[0], absolutePosition: { x: pos.x, y: pos.y } }
          : {
              absolutePosition: { x: pos.x, y: pos.y },
              table: {
                widths: [pos.widthPt],
                body: [[{ stack: chunk }]],
              },
              layout: PDF_TIGHT_LAYOUT,
            }
      );
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
    content,
    defaultStyle: {
      fontSize: fontPt,
      lineHeight: compact ? FORM8_PDF_LINE_HEIGHT_COMPACT : FORM8_PDF_LINE_HEIGHT,
      color: hexToRgb(theme.textColor),
    },
    styles: {
      title: {
        fontSize: mainTitleFontPt,
        bold: pdfBoldFromWeight(theme.titleFontWeight, true),
      },
      subtitle: { fontSize: fontPt + 1 },
      compliance: {
        fontSize: fontPt - 2,
        italics: true,
        lineHeight: compact ? FORM8_PDF_LINE_HEIGHT_COMPACT : FORM8_PDF_LINE_HEIGHT,
      },
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
      body: {
        fontSize: fontPt - 1,
        lineHeight: compact ? FORM8_PDF_LINE_HEIGHT_COMPACT : 1.35,
      },
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
