import React, { useMemo } from 'react';
import { useForm8PointerReorder } from './useForm8PointerReorder';
import moment from 'moment';
import {
  getSortedSections,
  getSortedFields,
  getPageStyle,
  replaceTemplateVariables,
  getFieldLayoutClass,
  groupFieldsByLayout,
} from '../../../utils/formTemplate/formTemplateConfig';
import {
  buildFormTemplateTestData,
  getFieldTestValue,
  TRANSACTION_TEST_ROWS,
  STOCK_ITEM_TEST_ROWS,
} from '../../../utils/formTemplate/formTemplateTestData';
import {
  SAMPLE_CUSTOMER_PHOTO_DATA_URL,
  SAMPLE_FIRM_LOGO_DATA_URL,
} from '../../../utils/formTemplate/formTemplatePreviewAssets';
import { parseSectionBlockId } from '../../../utils/formTemplate/form8BuilderCatalog';
import { parseFieldBlockId } from '../../../utils/formTemplate/form8FieldBlocks';
import {
  getBlockLayout,
  getForm8BlockOrder,
  getForm8LogoMediaStyle,
  isForm8BlockEnabled,
  isForm8MediaBlockId,
} from '../../../utils/formTemplate/form8BuilderBlocks';
import { templateLooksLikeHtml } from '../../../utils/formTemplate/formTemplateRichText';
import {
  blockAbsoluteFrameStyle,
  computeForm8CanvasPageHeightMm,
  isForm8FreeCanvasLayout,
} from '../../../utils/formTemplate/form8CanvasLayout';
import Form8BuilderBlockFrame from './Form8BuilderBlockFrame';
import Form8SignatureBlock from './Form8SignatureBlock';
import { getForm8SignatureEntries } from '../../../utils/formTemplate/form8Signatures';
import {
  getForm8SectionPreviewStyle,
  getForm8SectionTitlePreviewStyle,
} from '../../../utils/formTemplate/form8SectionStyle';
import {
  getForm8BlockBoxPreviewStyle,
  getForm8BlockTitlePreviewStyle,
  getForm8BlockBodyPreviewStyle,
} from '../../../utils/formTemplate/form8BlockStyle';
import { getForm8TextSizePt } from '../../../utils/formTemplate/form8TypographyGroups';
import {
  getForm8StockTablePreviewVars,
  stockTableHasGridBorder,
} from '../../../utils/formTemplate/form8StockTableStyle';
import {
  getForm8FieldDisplayLabel,
  getForm8FooterNoteTitle,
  getForm8SectionDisplayTitle,
} from '../../../utils/formTemplate/form8SectionDisplay';
import {
  FORM8_STOCK_TABLE_COLUMNS,
  getForm8StockCellValue,
} from '../../../utils/formTemplate/form8StockTable';
import Form8BuilderCanvasDropSlot from './Form8BuilderCanvasDropSlot';
import { F8_PALETTE_DRAG_MIME } from '../../../utils/formTemplate/form8BuilderPalette';
import {
  dragTransferHas,
  readPaletteDragBlockId,
} from '../../../utils/formTemplate/form8BuilderDnD';

const CUSTOMER_PHOTO_FIELD_ID = 'customer_photo';
const MM_PX = 96 / 25.4;

const FormTemplatePreview = ({
  config,
  firmName,
  scale = 0.72,
  testData: testDataProp,
  transactionRows: transactionRowsProp,
  leftLogoUrl = null,
  rightLogoUrl = null,
  footerImageUrl: footerImageUrlProp = null,
  customerPhotoUrl = null,
  firmFormHeader = '',
  firmFormFooter = '',
  useSampleAssets = true,
  stockItemRows: stockItemRowsProp = null,
  builderMode = false,
  fitSinglePage = false,
  selectedBlockId = null,
  onSelectBlock,
  onBlockLayoutChange = null,
  onReorderBlocks = null,
  onAddBlockFromPalette = null,
  onRemoveBlock = null,
}) => {
  const testData = useMemo(
    () => testDataProp || buildFormTemplateTestData(firmName),
    [testDataProp, firmName]
  );
  const allTxnRows = transactionRowsProp || TRANSACTION_TEST_ROWS;
  const transactionRows =
    config?.singlePageLayout && allTxnRows.length > 2
      ? allTxnRows.slice(0, 2)
      : allTxnRows;
  const singlePage = Boolean(config?.singlePageLayout);
  const blockOrder = useMemo(() => getForm8BlockOrder(config), [config]);
  const page = useMemo(() => getPageStyle(config), [config]);
  const basePageHeightMm = page.heightMm;
  const freeCanvas = Boolean(
    config?.singlePageLayout && (builderMode || isForm8FreeCanvasLayout(config))
  );
  const canvasPageHeightMm = useMemo(() => {
    if (!freeCanvas || !config) return basePageHeightMm;
    return computeForm8CanvasPageHeightMm(config, basePageHeightMm);
  }, [config, freeCanvas, basePageHeightMm]);
  const { startPointerReorder, forcePointerReorder, getBlockDragUi, isCanvasSlotActive } =
    useForm8PointerReorder(blockOrder, onReorderBlocks, builderMode && !freeCanvas);
  const lastCanvasBlockId = blockOrder[blockOrder.length - 1];
  const signatureEntries = useMemo(
    () => getForm8SignatureEntries(config, testData),
    [config, testData]
  );

  const sectionsById = useMemo(() => {
    const map = new Map();
    if (config) {
      getSortedSections(config).forEach((s) => map.set(s.id, s));
    }
    return map;
  }, [config]);

  const wrapBlock = (blockId, className, children, { inLogoBand = false } = {}) => {
    if (!children) return null;
    if (!builderMode) {
      if (freeCanvas) {
        const absoluteStyle = blockAbsoluteFrameStyle(
          config,
          blockId,
          page.widthMm,
          basePageHeightMm
        );
        if (absoluteStyle) {
          return (
            <div className={`f8-preview-block-abs ${className || ''}`} style={absoluteStyle}>
              {children}
            </div>
          );
        }
      }
      return children;
    }
    const selected = selectedBlockId === blockId;
    const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
    const { isDragging, isDropTarget } = getBlockDragUi(blockId);
    return (
      <Form8BuilderBlockFrame
        blockId={blockId}
        selected={selected}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        scale={safeScale}
        config={config}
        className={className || ''}
        onSelect={onSelectBlock}
        onBlockLayoutChange={onBlockLayoutChange}
        onReorderBlocks={onReorderBlocks}
        onAddBlockFromPalette={onAddBlockFromPalette}
        onRemoveBlock={onRemoveBlock}
        onPointerReorderStart={startPointerReorder}
        onForcePointerReorder={forcePointerReorder}
        blockOrder={blockOrder}
        inLogoBand={inLogoBand}
        freeCanvas={freeCanvas}
        pageWidthMm={page.widthMm}
        pageHeightMm={basePageHeightMm}
      >
        {children}
      </Form8BuilderBlockFrame>
    );
  };

  if (!config) {
    return <div className="form-custom-a4-empty">Select a template to preview</div>;
  }

  const layout = config.layout || {};
  const showStockItemImages = layout.showStockItemImages !== false;
  const stockItemRows =
    stockItemRowsProp || (showStockItemImages ? STOCK_ITEM_TEST_ROWS : null);
  const showCustomerPhoto = layout.showCustomerPhoto !== false;
  const resolvedLeftLogo =
    leftLogoUrl || (useSampleAssets && layout.showLeftLogo ? SAMPLE_FIRM_LOGO_DATA_URL : null);
  const rightLogoBlockActive = isForm8BlockEnabled(config, 'layout_right_logo');
  const resolvedRightLogo =
    rightLogoUrl ||
    (useSampleAssets && rightLogoBlockActive ? SAMPLE_FIRM_LOGO_DATA_URL : null);
  const resolvedCustomerPhoto =
    showCustomerPhoto &&
    (customerPhotoUrl || (useSampleAssets ? SAMPLE_CUSTOMER_PHOTO_DATA_URL : null));
  const footerImageUrl =
    footerImageUrlProp ||
    resolvedRightLogo ||
    resolvedLeftLogo ||
    (useSampleAssets ? SAMPLE_FIRM_LOGO_DATA_URL : null);

  const renderStockItemsTable = (stockBlockSpec = {}) => {
    if (!showStockItemImages || !stockItemRows?.length) return null;
    const gridClass = stockTableHasGridBorder(stockBlockSpec) ? ' f8-stock-table--grid' : '';
    return (
      <table className={`form-custom-a4-table form-custom-a4-stock-table${gridClass}`}>
        <thead>
          <tr>
            {FORM8_STOCK_TABLE_COLUMNS.map((col) => (
              <th key={col.id} className={`form-custom-a4-stock-th--${col.align}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stockItemRows.map((row, idx) => (
            <tr key={row.imageKey || idx}>
              {FORM8_STOCK_TABLE_COLUMNS.map((col) => (
                <td key={col.id} className={`form-custom-a4-stock-td--${col.align}`}>
                  {col.id === 'image' ? (
                    row.previewImageUrl ? (
                      <img
                        src={row.previewImageUrl}
                        alt={row.item_name || 'Item'}
                        className="form-custom-a4-stock-thumb"
                      />
                    ) : (
                      '—'
                    )
                  ) : (
                    getForm8StockCellValue(row, col.id)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderFieldValue = (field, skipPhoto = false) => {
    if (field.id === CUSTOMER_PHOTO_FIELD_ID) {
      if (skipPhoto || !showCustomerPhoto) return '—';
      if (!resolvedCustomerPhoto) return getFieldTestValue(field.id, testData);
      return (
        <img
          src={resolvedCustomerPhoto}
          alt="Customer"
          className="form-custom-a4-customer-photo"
        />
      );
    }
    return getFieldTestValue(field.id, testData);
  };

  const renderSectionFields = (section, { excludePhoto = false } = {}) => {
    const fields = (section.fields || []).filter(
      (f) => f.enabled && !(excludePhoto && f.id === CUSTOMER_PHOTO_FIELD_ID)
    );
    return (
      <div className="form-custom-a4-fields">
        {groupFieldsByLayout(fields).map((group, gIdx) => (
          <div
            key={`${section.id}-row-${gIdx}`}
            className={`form-custom-a4-field-row row-${group.layout}`}
          >
            {group.fields.map((field) => (
              <div
                key={field.id}
                className={`form-custom-a4-field ${getFieldLayoutClass(field.fieldLayout)}`}
                style={
                  field.backgroundColor ? { backgroundColor: field.backgroundColor } : undefined
                }
              >
                <span className="label">{getForm8FieldDisplayLabel(field)}</span>
                <span className="value">
                  {renderFieldValue(field, excludePhoto)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (section) => {
    if (!section?.enabled) return null;
    const excludePhoto =
      blockOrder.includes('customer_photo') && layout.showCustomerPhoto !== false;

    const { sectionStyle, sectionClassName } = getForm8SectionPreviewStyle(section);
    const { titleStyle, titleClassName } = getForm8SectionTitlePreviewStyle(section);

    return (
      <section
        data-f8-section-id={section.id}
        className={`form-custom-a4-section form-custom-a4-section--block${sectionClassName}`}
        style={Object.keys(sectionStyle).length ? sectionStyle : undefined}
      >
        <h3
          className={`form-custom-a4-section__title${titleClassName}`}
          style={Object.keys(titleStyle).length ? titleStyle : undefined}
        >
          {getForm8SectionDisplayTitle(section)}
        </h3>
        {section.id === 'transaction_history' || section.id === 'emi_schedule' ? (
          <table className="form-custom-a4-table">
            <thead>
              <tr>
                {getSortedFields(section)
                  .filter((f) => f.enabled)
                  .map((field) => (
                    <th key={field.id}>{field.label}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {transactionRows.map((row, idx) => (
                <tr key={idx}>
                  {getSortedFields(section)
                    .filter((f) => f.enabled)
                    .map((field) => (
                      <td key={field.id}>{row[field.id] ?? '—'}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          renderSectionFields(section, { excludePhoto })
        )}
      </section>
    );
  };

  const logoPageWidthPx = page.widthMm * MM_PX;

  const logoFillsBlockBox = (blockId) =>
    Boolean(freeCanvas && isForm8MediaBlockId(blockId));

  const logoMediaProps = (blockId) => {
    if (!builderMode || logoFillsBlockBox(blockId)) return {};
    const style = getForm8LogoMediaStyle(config, blockId, logoPageWidthPx);
    return { style };
  };

  const mediaSlotSide = (blockId) => {
    if (blockId === 'layout_left_logo') return 'left';
    if (blockId === 'layout_right_logo') return 'right';
    if (blockId === 'layout_footer_image') return 'center';
    return 'center';
  };

  const mediaSlotClass = (blockId) =>
    [
      'form-custom-a4-logo-slot',
      `form-custom-a4-logo-slot--${mediaSlotSide(blockId)}`,
      logoFillsBlockBox(blockId) ? 'form-custom-a4-logo-slot--fill' : '',
    ]
      .filter(Boolean)
      .join(' ');

  const logoImgClass = (blockId) =>
    `form-custom-a4-logo-img${logoFillsBlockBox(blockId) ? ' form-custom-a4-logo-img--fill-box' : ''}`;

  const logoPlaceholderClass = (blockId) =>
    `form-custom-a4-logo-placeholder${
      logoFillsBlockBox(blockId) ? ' form-custom-a4-logo-placeholder--fill-box' : ''
    }`;

  const renderFirmHeaderHtml = (raw) => {
    const html = replaceTemplateVariables(raw, testData);
    if (!html) return null;
    if (templateLooksLikeHtml(html)) {
      return (
        <div
          className="form-custom-a4-firm-header"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return <div className="form-custom-a4-firm-header">{html}</div>;
  };

  const renderFooterNoteBody = (raw) => {
    const html = replaceTemplateVariables(raw, testData);
    if (!html) return null;
    if (templateLooksLikeHtml(html)) {
      return (
        <div
          className="form-custom-a4-footer-note-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    return <p className="form-custom-a4-footer-note-body">{html}</p>;
  };

  const renderBlock = (blockId, { inLogoBand = false } = {}) => {
    if (!isForm8BlockEnabled(config, blockId)) return null;

    const fieldId = parseFieldBlockId(blockId);
    if (fieldId) {
      const label = getForm8FieldDisplayLabel({ id: fieldId });
      const value = getFieldTestValue(fieldId, testData);
      return wrapBlock(
        blockId,
        'f8-builder-block--field-line',
        <div className="form-custom-a4-field-line">
          <span className="form-custom-a4-field-line__label">{label}</span>
          <span className="form-custom-a4-field-line__value">{value}</span>
        </div>
      );
    }

    const sectionId = parseSectionBlockId(blockId);
    if (sectionId) {
      const section = sectionsById.get(sectionId);
      if (!section?.enabled) return null;
      const sectionClass = inLogoBand
        ? 'f8-builder-block--section f8-builder-block--band-section'
        : 'f8-builder-block--section';
      return wrapBlock(blockId, sectionClass, renderSection(section), { inLogoBand });
    }

    switch (blockId) {
      case 'layout_left_logo':
        return wrapBlock(
          blockId,
          'f8-builder-block--logo f8-builder-block--logo-left',
          <div className={mediaSlotClass(blockId)}>
            {resolvedLeftLogo ? (
              <img
                src={resolvedLeftLogo}
                alt="Left logo"
                className={logoImgClass(blockId)}
                {...logoMediaProps(blockId)}
              />
            ) : (
              <div className={logoPlaceholderClass(blockId)} {...logoMediaProps(blockId)}>
                Left logo
              </div>
            )}
          </div>,
          { inLogoBand }
        );

      case 'layout_right_logo':
        return wrapBlock(
          blockId,
          'f8-builder-block--logo f8-builder-block--logo-right',
          <div className={mediaSlotClass(blockId)}>
            {resolvedRightLogo ? (
              <img
                src={resolvedRightLogo}
                alt="Right logo"
                className={logoImgClass(blockId)}
                {...logoMediaProps(blockId)}
              />
            ) : (
              <div className={logoPlaceholderClass(blockId)} {...logoMediaProps(blockId)}>
                Right logo
              </div>
            )}
          </div>,
          { inLogoBand }
        );

      case 'layout_logo':
        if (!layout.showLeftLogo && !layout.showRightLogo) return null;
        return wrapBlock(
          blockId,
          'f8-builder-block--logo',
          <div className="form-custom-a4-logos">
            {layout.showLeftLogo ? (
              resolvedLeftLogo ? (
                <img src={resolvedLeftLogo} alt="Left logo" className="form-custom-a4-logo-img" />
              ) : (
                <div className="form-custom-a4-logo-placeholder">LOGO</div>
              )
            ) : (
              <span />
            )}
            {layout.showRightLogo ? (
              resolvedRightLogo ? (
                <img src={resolvedRightLogo} alt="Right logo" className="form-custom-a4-logo-img" />
              ) : (
                <div className="form-custom-a4-logo-placeholder">LOGO</div>
              )
            ) : null}
          </div>
        );

      case 'form_header':
        return wrapBlock(
          blockId,
          'f8-builder-block--header',
          <>
            {layout.useFirmFormHeader && firmFormHeader
              ? renderFirmHeaderHtml(firmFormHeader)
              : null}
            <header className="form-custom-a4-header form-custom-a4-header--title">
              <h1>{config.title || 'FORM 8'}</h1>
              {config.subtitle ? <p className="subtitle">{config.subtitle}</p> : null}
              {config.complianceReference ? (
                <p className="compliance">{config.complianceReference}</p>
              ) : null}
              {config.headerNote ? (
                <p className="note">{replaceTemplateVariables(config.headerNote, testData)}</p>
              ) : null}
            </header>
          </>
        );

      case 'customer_photo':
        if (!showCustomerPhoto) return null;
        return wrapBlock(
          blockId,
          'f8-builder-block--photo',
          <div
            className={`form-custom-a4-photo-block${
              logoFillsBlockBox(blockId) ? ' form-custom-a4-photo-block--fill' : ''
            }`}
          >
            {!logoFillsBlockBox(blockId) ? (
              <span className="form-custom-a4-photo-label">Photo of Pawner</span>
            ) : null}
            {resolvedCustomerPhoto ? (
              <img
                src={resolvedCustomerPhoto}
                alt="Customer"
                className={`form-custom-a4-customer-photo${
                  logoFillsBlockBox(blockId) ? ' form-custom-a4-logo-img--fill-box' : ''
                }`}
              />
            ) : (
              <div
                className={`form-custom-a4-photo-placeholder${
                  logoFillsBlockBox(blockId) ? ' form-custom-a4-logo-placeholder--fill-box' : ''
                }`}
              >
                Photo
              </div>
            )}
          </div>
        );

      case 'stock_line_items': {
        const itemSection = sectionsById.get('item_details');
        if (!showStockItemImages) return null;
        const stockBlockSpec = getBlockLayout(config, blockId);
        const stockStyle = itemSection
          ? getForm8SectionPreviewStyle(itemSection)
          : { sectionStyle: {}, sectionClassName: '' };
        const stockTitle = itemSection
          ? getForm8SectionTitlePreviewStyle(itemSection)
          : { titleStyle: {}, titleClassName: '' };
        const blockTitleOverride = getForm8BlockTitlePreviewStyle(
          stockBlockSpec,
          config.theme || {},
          page.fontPt + 1
        );
        const theme = config.theme || {};
        const mergedStockSectionStyle = {
          ...stockStyle.sectionStyle,
          ...getForm8BlockBoxPreviewStyle(stockBlockSpec, theme),
          ...getForm8StockTablePreviewVars(stockBlockSpec, theme),
        };
        if (stockBlockSpec.labelFontSizePt) {
          mergedStockSectionStyle['--ft-label-font-pt'] = `${stockBlockSpec.labelFontSizePt}pt`;
        }
        if (stockBlockSpec.labelFontWeight) {
          mergedStockSectionStyle['--ft-label-font-weight'] = stockBlockSpec.labelFontWeight;
        }
        const stockTextPt = getForm8TextSizePt(stockBlockSpec);
        if (stockTextPt) {
          mergedStockSectionStyle['--ft-value-font-pt'] = `${stockTextPt}pt`;
        }
        const stockTextW = stockBlockSpec.valueFontWeight || stockBlockSpec.bodyFontWeight;
        if (stockTextW) {
          mergedStockSectionStyle['--ft-value-font-weight'] = stockTextW;
        }
        const mergedTitleStyle = {
          ...stockTitle.titleStyle,
          ...blockTitleOverride,
        };
        return wrapBlock(
          blockId,
          'f8-builder-block--stock',
          <section
            className={`form-custom-a4-section form-custom-a4-section--block form-custom-a4-section--stock${stockStyle.sectionClassName}`}
            style={
              Object.keys(mergedStockSectionStyle).length ? mergedStockSectionStyle : undefined
            }
          >
            <h3
              className={`form-custom-a4-section__title${stockTitle.titleClassName}`}
              style={Object.keys(mergedTitleStyle).length ? mergedTitleStyle : undefined}
            >
              {itemSection
                ? getForm8SectionDisplayTitle(itemSection)
                : 'Stock Information'}
            </h3>
            {renderStockItemsTable(stockBlockSpec)}
          </section>
        );
      }

      case 'form_terms': {
        if (!config.termsAndConditions) return null;
        const termsSpec = getBlockLayout(config, blockId);
        const theme = config.theme || {};
        const termsBox = getForm8BlockBoxPreviewStyle(termsSpec, theme);
        const termsTitle = getForm8BlockTitlePreviewStyle(termsSpec, theme, page.fontPt + 1);
        const termsBody = getForm8BlockBodyPreviewStyle(termsSpec, theme, page.fontPt);
        return wrapBlock(
          blockId,
          'f8-builder-block--legal',
          <section
            className="form-custom-a4-section form-custom-a4-terms form-custom-a4-section--block"
            style={Object.keys(termsBox).length ? termsBox : undefined}
          >
            <h3 style={Object.keys(termsTitle).length ? termsTitle : undefined}>
              Terms &amp; Conditions
            </h3>
            <p style={Object.keys(termsBody).length ? termsBody : undefined}>
              {replaceTemplateVariables(config.termsAndConditions, testData)}
            </p>
          </section>
        );
      }

      case 'form_footer': {
        const footerText =
          layout.useFirmFormFooter && firmFormFooter
            ? firmFormFooter
            : config.footerNote;
        if (!footerText) return null;
        const footerSpec = getBlockLayout(config, blockId);
        const theme = config.theme || {};
        const footerBox = getForm8BlockBoxPreviewStyle(footerSpec, theme);
        const footerTitle = getForm8BlockTitlePreviewStyle(footerSpec, theme, page.fontPt + 1);
        const footerBody = getForm8BlockBodyPreviewStyle(footerSpec, theme, page.fontPt);
        return wrapBlock(
          blockId,
          'f8-builder-block--footer',
          <section
            className="form-custom-a4-section form-custom-a4-section--block form-custom-a4-section--footer-note"
            style={Object.keys(footerBox).length ? footerBox : undefined}
          >
            <h3 style={Object.keys(footerTitle).length ? footerTitle : undefined}>
              {getForm8FooterNoteTitle(config)}
            </h3>
            <div
              className="form-custom-a4-footer-note-body"
              style={Object.keys(footerBody).length ? footerBody : undefined}
            >
              {renderFooterNoteBody(footerText)}
            </div>
          </section>
        );
      }

      case 'layout_footer_image':
        if (!layout.showFooterImage) return null;
        return wrapBlock(
          blockId,
          'f8-builder-block--footer-img f8-builder-block--logo f8-builder-block--logo-center',
          <div className={mediaSlotClass(blockId)}>
            {footerImageUrl ? (
              <img
                src={footerImageUrl}
                alt="Footer image"
                className={logoImgClass(blockId)}
                {...logoMediaProps(blockId)}
              />
            ) : (
              <div
                className={logoPlaceholderClass(blockId)}
                {...logoMediaProps(blockId)}
              >
                Footer image
              </div>
            )}
          </div>
        );

      case 'signature_lines':
        return wrapBlock(
          blockId,
          'f8-builder-block--signatures',
          <Form8SignatureBlock entries={signatureEntries} />
        );

      case 'form_legal':
        return wrapBlock(
          blockId,
          'f8-builder-block--legal',
          <>
            {config.termsAndConditions ? (
              <section className="form-custom-a4-section form-custom-a4-terms">
                <h3>Terms &amp; Conditions</h3>
                <p>{replaceTemplateVariables(config.termsAndConditions, testData)}</p>
              </section>
            ) : null}
            {config.declarationText ? (
              <p className="form-custom-a4-declaration">
                {replaceTemplateVariables(config.declarationText, testData)}
              </p>
            ) : null}
            <Form8SignatureBlock entries={signatureEntries} />
          </>
        );

      default:
        return null;
    }
  };

  const pageClass = [
    'form-custom-a4-page',
    singlePage ? 'form-custom-a4-page--single form-custom-a4-page--gov' : '',
    fitSinglePage ? 'form-custom-a4-page--fit form-custom-a4-page--builder-preview' : '',
    freeCanvas ? 'form-custom-a4-page--free-canvas' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 0.65;
  const pageWPx = page.widthMm * MM_PX;
  const pageHPx = canvasPageHeightMm * MM_PX;

  const handleCanvasDragOver = (e) => {
    if (!builderMode || !dragTransferHas(e.dataTransfer, F8_PALETTE_DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e) => {
    if (!builderMode) return;
    const blockId = readPaletteDragBlockId(e.dataTransfer);
    if (!blockId) return;
    e.preventDefault();
    onAddBlockFromPalette?.(blockId, null);
  };

  const renderCanvasDropBefore = (beforeId) =>
    builderMode ? (
      <Form8BuilderCanvasDropSlot
        key={`drop-before-${beforeId}`}
        dropBeforeId={beforeId}
        active={isCanvasSlotActive({ beforeId })}
        onAddBlockFromPalette={onAddBlockFromPalette}
      />
    ) : null;

  const pageStyleExtras = freeCanvas
    ? {
        '--f8-base-page-height-mm': `${basePageHeightMm}mm`,
        '--f8-page-width-mm': `${page.widthMm}mm`,
      }
    : {};

  const pageInner = freeCanvas ? (
    <div className="f8-builder-canvas-layer">
      {builderMode ? (
        <>
          <div className="f8-a4-sheet-frame" aria-hidden="true" />
          <div className="f8-a4-content-guide" aria-hidden="true" />
          {canvasPageHeightMm > basePageHeightMm + 0.5 ? (
            <>
              <div className="f8-a4-overflow-surface" aria-hidden="true" />
              <div className="f8-a4-page-continuation" aria-hidden="true">
                <span className="f8-a4-page-continuation__label">
                  Extra height — PDF adds pages when content continues
                </span>
              </div>
            </>
          ) : null}
        </>
      ) : null}
      {blockOrder.map((blockId) => (
        <React.Fragment key={blockId}>{renderBlock(blockId)}</React.Fragment>
      ))}
      {config.layout?.showQrCode ? <div className="form-custom-a4-qr">QR</div> : null}
      {config.showPageNumbers && !builderMode ? (
        <div className="form-custom-a4-pagenum">Page 1 of 1 · {config.pageSize || 'A4'}</div>
      ) : null}
    </div>
  ) : (
    <>
      {blockOrder.map((blockId) => (
        <React.Fragment key={blockId}>
          {renderCanvasDropBefore(blockId)}
          {renderBlock(blockId)}
        </React.Fragment>
      ))}
      {builderMode && lastCanvasBlockId ? (
        <Form8BuilderCanvasDropSlot
          dropAfterId={lastCanvasBlockId}
          active={isCanvasSlotActive({ afterId: lastCanvasBlockId })}
          onAddBlockFromPalette={onAddBlockFromPalette}
        />
      ) : null}
      {config.layout?.showQrCode ? <div className="form-custom-a4-qr">QR</div> : null}
      {config.showPageNumbers && !builderMode ? (
        <div className="form-custom-a4-pagenum">Page 1 of 1 · {config.pageSize || 'A4'}</div>
      ) : null}
    </>
  );

  const handleBleedPx = freeCanvas && builderMode ? 14 : 0;
  const clipW = pageWPx * safeScale + handleBleedPx * 2;
  const clipH = pageHPx * safeScale + handleBleedPx * 2;

  if (fitSinglePage && singlePage) {
    return (
      <div className="form-custom-a4-viewport form-custom-a4-viewport--fit">
        <div
          className={`f8-preview-scale-clip${freeCanvas ? ' f8-preview-scale-clip--free-canvas' : ''}`}
          style={{
            width: clipW,
            height: clipH,
            minHeight: clipH,
            padding: handleBleedPx ? `${handleBleedPx}px` : undefined,
            boxSizing: 'border-box',
          }}
        >
          <div
            className={`${pageClass}${builderMode ? ' form-custom-a4-page--builder-drop' : ''}`}
            data-f8-ref-height-mm={basePageHeightMm}
            style={{
              ...page.cssVars,
              ...pageStyleExtras,
              width: pageWPx,
              height: pageHPx,
              minHeight: pageHPx,
              transform: `scale(${safeScale})`,
              transformOrigin: 'top left',
            }}
            onDragOver={builderMode ? handleCanvasDragOver : undefined}
            onDrop={builderMode ? handleCanvasDrop : undefined}
          >
            {pageInner}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-custom-a4-viewport">
      <div
        className={pageClass}
        style={{
          ...page.cssVars,
          width: `${page.widthMm}mm`,
          minHeight: `${page.heightMm}mm`,
          ...(singlePage ? { height: `${page.heightMm}mm` } : {}),
          transform: `scale(${safeScale})`,
          transformOrigin: 'top center',
        }}
      >
        {pageInner}
      </div>
      <p className="form-custom-a4-size-label">
        {config.pageSize || 'A4'} · {config.orientation || 'portrait'}
        {singlePage ? ' · Single-page Form 8' : ''} · Test data ·{' '}
        {moment().format('DD-MM-YYYY')}
      </p>
    </div>
  );
};

export default FormTemplatePreview;
