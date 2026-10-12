import React from 'react';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiX } from 'react-icons/fi';
import DraggableList from './DraggableList';
import FormTemplateMacroPanel from './FormTemplateMacroPanel';
import Form8BuilderImageUpload from './Form8BuilderImageUpload';
import {
  parseSectionBlockId,
} from '../../../utils/formTemplate/form8BuilderCatalog';
import { parseFieldBlockId } from '../../../utils/formTemplate/form8FieldBlocks';
import { getForm8FieldDisplayLabel } from '../../../utils/formTemplate/form8SectionDisplay';
import {
  canToggleForm8BlockOnCanvas,
  FORM8_BLOCK_META,
  getBlockLayout,
  getForm8MediaWidthLimits,
  isForm8MediaBlockId,
} from '../../../utils/formTemplate/form8BuilderBlocks';
import { isForm8BlockOnCanvas } from '../../../utils/formTemplate/form8BuilderPalette';
import {
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
  getPageStyle,
  getSortedFields,
  resolveFieldFontSizes,
} from '../../../utils/formTemplate/formTemplateConfig';
import { getForm8SectionDisplayTitle } from '../../../utils/formTemplate/form8SectionDisplay';
import { SECTION_STYLE_RESET_PATCH } from '../../../utils/formTemplate/form8SectionStyle';
import {
  FORM8_BLOCK_STYLE_RESET_PATCH,
  FORM8_TYPOGRAPHY_BLOCK_IDS,
} from '../../../utils/formTemplate/form8BlockStyle';
import Form8TypographyFields from './Form8TypographyFields';
import {
  FORM_TEMPLATE_ASSET_KEYS,
  getFormTemplateAssets,
} from '../../../utils/formTemplate/formTemplateImageAssets';
import {
  resolveFirmLeftLogoUrl,
  resolveFirmRightLogoUrl,
} from '../../../utils/formTemplate/loadFirmAssetsForPdf';

const PROP_TABS = [
  { id: 'content', label: 'Content' },
  { id: 'advance', label: 'Advance' },
  { id: 'layout', label: 'Layout' },
];

const blockTitle = (blockId, config) => {
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = config?.sections?.find((s) => s.id === sectionId);
    return section?.label || 'Section';
  }
  const meta = FORM8_BLOCK_META[blockId];
  if (meta?.label) return meta.label;
  const titles = {
    page_settings: 'Page & Theme',
    macro_keywords: 'Macro Keywords',
  };
  return titles[blockId] || 'Form 8';
};

const Form8BuilderPropertiesPanel = ({
  blockId,
  propertiesTab,
  onTabChange,
  onClose,
  formConfig,
  status,
  onStatusChange,
  updateConfig,
  updateTheme,
  updateLayout,
  updateSection,
  updateSectionField,
  reorderSectionFields,
  updateSignatureLabel,
  updateBlockLayout,
  updateFormAsset,
  onToggleBlockOnCanvas,
  firm = null,
  imageUrls = null,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const toggleBlockOnCanvas = onToggleBlockOnCanvas;

  if (collapsed) {
    return (
      <aside className="f8-builder-panel f8-builder-panel--props f8-builder-panel--collapsed">
        <button
          type="button"
          className="f8-builder-panel-expand"
          title="Show properties"
          onClick={onToggleCollapsed}
        >
          <FiChevronLeft size={16} />
        </button>
      </aside>
    );
  }

  const templateAssets = getFormTemplateAssets(formConfig);

  const handleAssetUpload = (assetKey) => (dataUrl, errorMessage) => {
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }
    updateFormAsset?.(assetKey, dataUrl || '');
    if (dataUrl) toast.success('Image added — click Save to keep on template');
  };

  const handleAssetClear = (assetKey) => () => {
    updateFormAsset?.(assetKey, '');
  };
  if (!formConfig || !blockId) {
    return (
      <aside className="f8-builder-panel f8-builder-panel--props f8-builder-panel--empty">
        <p className="text-muted small mb-0">Select an element on the canvas or from the left panel.</p>
      </aside>
    );
  }

  const sectionId = parseSectionBlockId(blockId);
  const section = sectionId
    ? formConfig.sections?.find((s) => s.id === sectionId)
    : null;

  const setSectionStyle = (patch) => updateSection(sectionId, patch);

  const renderSectionColorField = (label, key, fallback = '#ffffff') => (
    <div className="mb-2">
      <label className="form-label small">{label}</label>
      <div className="form-custom-color-input-row">
        <input
          type="color"
          value={section?.[key] || fallback}
          onChange={(e) => setSectionStyle({ [key]: e.target.value })}
        />
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder={`Default (${fallback})`}
          value={section?.[key] || ''}
          onChange={(e) => setSectionStyle({ [key]: e.target.value })}
        />
      </div>
    </div>
  );

  const renderSectionAdvancePanel = () => {
    const pageStyle = getPageStyle(formConfig);
    const globalLabel = pageStyle.labelFontPt;
    const globalValue = pageStyle.valueFontPt;
    const globalTitle = (pageStyle.fontPt ?? 11) + 1;
    const fields = getSortedFields(section);

    return (
      <>
        <p className="small fw-semibold mb-2">{getForm8SectionDisplayTitle(section)}</p>
        <p className="small fw-semibold mb-2 mt-2">Box</p>
        {renderSectionColorField('Background', 'backgroundColor', '#ffffff')}
        {renderSectionColorField('Border', 'borderColor', formConfig.theme?.borderColor || '#2c5282')}
        <p className="small fw-semibold mb-2 mt-3">Main title colors</p>
        {renderSectionColorField('Text color', 'titleColor', formConfig.theme?.sectionTitleColor || '#1e3a5f')}
        {renderSectionColorField(
          'Bar background',
          'titleBackgroundColor',
          formConfig.theme?.tableHeaderBackground || '#e8eef5'
        )}
        <p className="small fw-semibold mb-2 mt-3">Typography</p>
        <Form8TypographyFields
          values={section}
          placeholders={{
            titleFontSizePt: globalTitle,
            labelFontSizePt: globalLabel,
            valueFontSizePt: globalValue,
          }}
          onPatch={(patch) => setSectionStyle(patch)}
        />
        {fields.length ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Field backgrounds</p>
            {fields.map((field) => (
              <div key={field.id} className="mb-2 d-flex align-items-center gap-2">
                <span className="small flex-grow-1 text-truncate">
                  {field.label || field.id}
                </span>
                <input
                  type="color"
                  className="form-control form-control-color form-control-sm"
                  title="Field background"
                  value={field.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    updateSectionField(sectionId, field.id, { backgroundColor: e.target.value })
                  }
                />
              </div>
            ))}
          </>
        ) : null}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mt-2"
          onClick={() => setSectionStyle({ ...SECTION_STYLE_RESET_PATCH })}
        >
          Reset styling
        </button>
      </>
    );
  };

  const renderThemeFields = () => (
    <div className="form-custom-color-grid">
      {THEME_FIELDS.map(({ key, label }) => (
        <div key={key} className="form-custom-color-field">
          <label className="form-label" htmlFor={`f8-theme-${key}`}>{label}</label>
          <div className="form-custom-color-input-row">
            <input
              id={`f8-theme-${key}`}
              type="color"
              value={formConfig.theme?.[key] || '#000000'}
              onChange={(e) => updateTheme(key, e.target.value)}
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={formConfig.theme?.[key] || ''}
              onChange={(e) => updateTheme(key, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormToggleButton = () => {
    if (!canToggleForm8BlockOnCanvas(blockId)) return null;
    const onForm = isForm8BlockOnCanvas(formConfig, blockId);
    return (
      <button
        type="button"
        className={`btn btn-sm mb-3 ${onForm ? 'btn-outline-danger' : 'btn-primary'}`}
        onClick={() => toggleBlockOnCanvas?.(blockId)}
      >
        {onForm ? 'Remove from form' : 'Add to form'}
      </button>
    );
  };

  const renderContent = () => {
    if (blockId === 'macro_keywords') {
      return <FormTemplateMacroPanel />;
    }

    const fieldBlockFieldId = parseFieldBlockId(blockId);
    if (fieldBlockFieldId) {
      return null;
    }

    if (blockId === 'form_header') {
      return (
        <>
          <label className="form-label">Form title</label>
          <input
            className="form-control form-control-sm mb-2"
            value={formConfig.title || ''}
            onChange={(e) => updateConfig('title', e.target.value)}
          />
          <label className="form-label">Subtitle</label>
          <input
            className="form-control form-control-sm mb-2"
            value={formConfig.subtitle || ''}
            onChange={(e) => updateConfig('subtitle', e.target.value)}
          />
          <label className="form-label">Compliance reference</label>
          <textarea
            className="form-control form-control-sm mb-2"
            rows={3}
            value={formConfig.complianceReference || ''}
            onChange={(e) => updateConfig('complianceReference', e.target.value)}
          />
          <label className="form-label">Header note (macros allowed)</label>
          <textarea
            className="form-control form-control-sm"
            rows={2}
            value={formConfig.headerNote || ''}
            onChange={(e) => updateConfig('headerNote', e.target.value)}
          />
        </>
      );
    }

    if (blockId === 'form_footer') {
      return (
        <>
          <label className="form-label">Section title</label>
          <input
            className="form-control form-control-sm mb-2"
            value={formConfig.footerNoteTitle || 'Footer note'}
            onChange={(e) => updateConfig('footerNoteTitle', e.target.value)}
          />
          <label className="form-label">Footer note text</label>
          <textarea
            className="form-control form-control-sm"
            rows={4}
            value={formConfig.footerNote || ''}
            onChange={(e) => updateConfig('footerNote', e.target.value)}
          />
        </>
      );
    }

    if (blockId === 'form_terms' || blockId === 'form_legal') {
      return (
        <>
          <label className="form-label">Terms &amp; conditions</label>
          <textarea
            className="form-control form-control-sm mb-2"
            rows={4}
            value={formConfig.termsAndConditions || ''}
            onChange={(e) => updateConfig('termsAndConditions', e.target.value)}
          />
        </>
      );
    }

    if (blockId === 'signature_lines' || blockId === 'customer_photo' || blockId === 'stock_line_items') {
      return null;
    }

    if (blockId === 'layout_left_logo') {
      const firmLeft = resolveFirmLeftLogoUrl(firm);
      return (
        <Form8BuilderImageUpload
          label="Left logo"
          previewUrl={templateAssets.leftLogoDataUrl || imageUrls?.leftLogoUrl}
          sourceHint={
            templateAssets.leftLogoDataUrl
              ? 'Stored on this Form 8 template.'
              : firmLeft
                ? 'Using firm left logo. Upload here to override for Form 8 only.'
                : 'Upload here, or set in Firm settings.'
          }
          onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.leftLogo)}
          onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.leftLogo)}
        />
      );
    }

    if (blockId === 'layout_right_logo') {
      const firmRight = resolveFirmRightLogoUrl(firm);
      return (
        <Form8BuilderImageUpload
          label="Right logo"
          previewUrl={templateAssets.rightLogoDataUrl || imageUrls?.rightLogoUrl}
          sourceHint={
            templateAssets.rightLogoDataUrl
              ? 'Stored on this Form 8 template.'
              : firmRight
                ? 'Using firm right logo. Upload here to override for Form 8 only.'
                : 'Upload here, or set in Firm settings.'
          }
          onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.rightLogo)}
          onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.rightLogo)}
        />
      );
    }

    if (blockId === 'layout_footer_image') {
      return (
        <>
          <Form8BuilderImageUpload
            label="Footer image"
            previewUrl={templateAssets.footerImageDataUrl || imageUrls?.footerImageUrl}
            sourceHint={
              templateAssets.footerImageDataUrl
                ? 'Stored on this Form 8 template.'
                : 'Uses footer upload, else right/left logo. Upload a dedicated footer banner if needed.'
            }
            onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.footerImage)}
            onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.footerImage)}
          />
        </>
      );
    }

    if (blockId === 'page_settings') {
      return (
        <>
          <label className="form-label">Template status</label>
          <select
            className="form-select form-select-sm mb-2"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </>
      );
    }

    if (section) {
      return (
        <>
          <label className="form-label">Section title</label>
          <input
            className="form-control form-control-sm mb-3"
            value={section.label || ''}
            onChange={(e) => updateSection(sectionId, { label: e.target.value })}
          />
          <DraggableList
            items={getSortedFields(section)}
            onReorder={(next) => reorderSectionFields(sectionId, next)}
            itemKey="id"
            renderItem={(field) => (
              <div className="form-custom-field-editor">
                <label className="form-custom-toggle-item">
                  <input
                    type="checkbox"
                    checked={Boolean(field.enabled)}
                    onChange={(e) =>
                      updateSectionField(sectionId, field.id, { enabled: e.target.checked })
                    }
                  />
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={field.label || ''}
                  onChange={(e) =>
                    updateSectionField(sectionId, field.id, { label: e.target.value })
                  }
                />
              </div>
            )}
          />
        </>
      );
    }

    return null;
  };

  const renderFormHeaderTypographySettings = () => {
    const pageStyle = getPageStyle(formConfig);
    const autoSizes = resolveFieldFontSizes(pageStyle.fontPt, {});
    const autoMainTitle = pageStyle.mainTitleFontPt;

    return (
      <div className="f8-form-header-typography mb-3 pb-3 border-bottom">
        <p className="small fw-semibold mb-2">Page defaults (all sections)</p>
        <label className="form-label">Compactness</label>
        <select
          className="form-select form-select-sm mb-3"
          value={formConfig.fontSize || 'small'}
          onChange={(e) => updateConfig('fontSize', e.target.value)}
        >
          <option value="small">Small (compact)</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
        <p className="small text-muted mb-2">
          Main title, label, and text sizes below apply when a block does not set its own.
        </p>
        <Form8TypographyFields
          values={formConfig.theme || {}}
          placeholders={{
            titleFontSizePt: autoMainTitle,
            labelFontSizePt: autoSizes.labelFontPt,
            valueFontSizePt: autoSizes.valueFontPt,
          }}
          onPatch={(patch) => updateTheme(patch)}
        />
      </div>
    );
  };

  const renderBlockAdvancePanel = () => {
    const layoutSpec = getBlockLayout(formConfig, blockId);
    const pageStyle = getPageStyle(formConfig);
    const globalTitle = (pageStyle.fontPt ?? 11) + 1;
    const globalBody = pageStyle.fontPt ?? 11;

    const setBlockStyle = (patch) => updateBlockLayout(blockId, patch);

    const renderBlockColorField = (label, key, fallback = '#ffffff') => (
      <div className="mb-2">
        <label className="form-label small">{label}</label>
        <div className="form-custom-color-input-row">
          <input
            type="color"
            value={layoutSpec[key] || fallback}
            onChange={(e) => setBlockStyle({ [key]: e.target.value })}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder={`Default (${fallback})`}
            value={layoutSpec[key] || ''}
            onChange={(e) => setBlockStyle({ [key]: e.target.value })}
          />
        </div>
      </div>
    );

    return (
      <>
        <p className="small fw-semibold mb-2">{blockTitle(blockId, formConfig)}</p>
        <p className="small fw-semibold mb-2 mt-2">Box</p>
        {renderBlockColorField('Background', 'backgroundColor', '#ffffff')}
        {renderBlockColorField('Border', 'borderColor', formConfig.theme?.borderColor || '#2c5282')}
        <p className="small fw-semibold mb-2 mt-3">Main title colors</p>
        {renderBlockColorField('Text color', 'titleColor', formConfig.theme?.sectionTitleColor || '#1e3a5f')}
        {renderBlockColorField(
          'Bar background',
          'titleBackgroundColor',
          formConfig.theme?.tableHeaderBackground || '#e8eef5'
        )}
        {blockId !== 'stock_line_items' ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Text color</p>
            {renderBlockColorField('Text color', 'bodyColor', formConfig.theme?.textColor || '#1a202c')}
          </>
        ) : null}
        {blockId === 'stock_line_items' ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Line item table</p>
            <p className="small text-muted mb-2">
              Column headers use <strong>Label</strong> typography; row values use <strong>Text</strong>.
            </p>
            {renderBlockColorField(
              'Header background',
              'tableHeaderBackgroundColor',
              formConfig.theme?.tableHeaderBackground || '#e8eef5'
            )}
            {renderBlockColorField(
              'Header text',
              'labelColor',
              formConfig.theme?.sectionTitleColor || '#1e3a5f'
            )}
            {renderBlockColorField('Cell background', 'tableBodyBackgroundColor', '#ffffff')}
            {renderBlockColorField(
              'Cell text',
              'bodyColor',
              formConfig.theme?.textColor || '#1a202c'
            )}
            {renderBlockColorField(
              'Grid lines (optional)',
              'tableBorderColor',
              formConfig.theme?.borderColor || '#2c5282'
            )}
          </>
        ) : null}
        <p className="small fw-semibold mb-2 mt-3">Typography</p>
        <Form8TypographyFields
          useTextAliases
          values={layoutSpec}
          placeholders={{
            titleFontSizePt: globalTitle,
            labelFontSizePt: pageStyle.labelFontPt,
            valueFontSizePt: globalBody,
          }}
          onPatch={(patch) => setBlockStyle(patch)}
        />
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mt-2"
          onClick={() => setBlockStyle({ ...FORM8_BLOCK_STYLE_RESET_PATCH })}
        >
          Reset styling
        </button>
      </>
    );
  };

  const renderAdvance = () => {
    if (blockId === 'page_settings' || blockId === 'form_header') {
      return (
        <>
          {renderFormHeaderTypographySettings()}
          {renderThemeFields()}
        </>
      );
    }

    if (section) {
      return renderSectionAdvancePanel();
    }

    if (FORM8_TYPOGRAPHY_BLOCK_IDS.has(blockId)) {
      return renderBlockAdvancePanel();
    }

    return (
      <p className="small text-muted mb-0">
        No advance options for this element. Use Form header for global theme colors.
      </p>
    );
  };

  const renderBlockSizeControls = () => {
    if (!blockId || blockId === 'page_settings' || blockId === 'macro_keywords') return null;
    const layoutSpec = getBlockLayout(formConfig, blockId);
    const isAuto = layoutSpec.heightMode === 'auto' || blockId === 'stock_line_items';

    const showCanvasPos =
      formConfig.canvasLayout === 'free' || layoutSpec.freePosition;

    return (
      <div className="f8-block-size-controls mb-3">
        {showCanvasPos ? (
          <>
            <label className="form-label">Position from left (%)</label>
            <input
              type="number"
              min={0}
              max={Math.max(0, 100 - (layoutSpec.widthPct ?? 100))}
              className="form-control form-control-sm mb-2"
              value={layoutSpec.posXPct ?? 0}
              onChange={(e) => {
                const posXPct = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                updateBlockLayout(blockId, {
                  posXPct,
                  freePosition: true,
                  widthPct: layoutSpec.widthPct,
                });
              }}
            />
            <label className="form-label">Position from top (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="form-control form-control-sm mb-2"
              value={layoutSpec.posYPct ?? 0}
              onChange={(e) =>
                updateBlockLayout(blockId, {
                  posYPct: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  freePosition: true,
                })
              }
            />
          </>
        ) : null}
        <label className="form-label">Width (% of content area)</label>
        <input
          type="number"
          min={isForm8MediaBlockId(blockId) ? getForm8MediaWidthLimits(blockId).min : 20}
          max={Math.min(
            isForm8MediaBlockId(blockId) ? getForm8MediaWidthLimits(blockId).max : 100,
            100 - (layoutSpec.posXPct ?? 0)
          )}
          className="form-control form-control-sm mb-2"
          value={layoutSpec.widthPct ?? 100}
          onChange={(e) => {
            const widthPct = Number(e.target.value) || 100;
            const patch = { widthPct };
            if (blockId === 'layout_footer_image' && widthPct >= 100) {
              patch.posXPct = 0;
            }
            updateBlockLayout(blockId, patch);
          }}
        />
        <label className="form-label">Height mode</label>
        <select
          className="form-select form-select-sm mb-2"
          value={isAuto ? 'auto' : 'fixed'}
          disabled={blockId === 'stock_line_items'}
          onChange={(e) =>
            updateBlockLayout(blockId, {
              heightMode: e.target.value,
              heightMm: e.target.value === 'auto' ? null : layoutSpec.heightMm || 12,
            })
          }
        >
          <option value="fixed">Fixed height</option>
          <option value="auto">Auto (dynamic rows)</option>
        </select>
        {!isAuto ? (
          <>
            <label className="form-label">Height (mm)</label>
            <input
              type="number"
              min={4}
              max={80}
              step={1}
              className="form-control form-control-sm"
              value={layoutSpec.heightMm ?? 12}
              onChange={(e) =>
                updateBlockLayout(blockId, { heightMm: Number(e.target.value) || 12 })
              }
            />
          </>
        ) : null}
      </div>
    );
  };

  const renderLayout = () => {
    const sizeControls = renderBlockSizeControls();

    const logoAlignControls = (id) => {
      const spec = getBlockLayout(formConfig, id);
      return (
        <>
          <label className="form-label">Horizontal align</label>
          <select
            className="form-select form-select-sm mb-2"
            value={spec.hAlign || (id === 'layout_right_logo' ? 'right' : 'left')}
            onChange={(e) =>
              updateBlockLayout(id, { hAlign: e.target.value, offsetXPct: null })
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <label className="form-label">Position from left (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className="form-control form-control-sm mb-2"
            value={spec.offsetXPct ?? ''}
            placeholder="Auto (use align)"
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                updateBlockLayout(id, { offsetXPct: null });
                return;
              }
              updateBlockLayout(id, {
                offsetXPct: Math.min(100, Math.max(0, Number(raw) || 0)),
                hAlign: 'left',
              });
            }}
          />
        </>
      );
    };

    if (blockId === 'layout_left_logo') {
      return (
        <>
          {sizeControls}
          {logoAlignControls('layout_left_logo')}
        </>
      );
    }

    if (blockId === 'layout_right_logo') {
      return (
        <>
          {sizeControls}
          {logoAlignControls('layout_right_logo')}
        </>
      );
    }

    if (blockId === 'layout_footer_image') {
      return (
        <>
          {sizeControls}
          {logoAlignControls('layout_footer_image')}
        </>
      );
    }

    if (blockId === 'customer_photo') {
      return <>{sizeControls}</>;
    }

    if (blockId === 'stock_line_items') {
      return <>{sizeControls}</>;
    }

    if (section) {
      const fields = getSortedFields(section);
      return (
        <>
        {sizeControls}
        <div className="f8-builder-field-layout-list">
          {fields.map((field) => (
            <div key={field.id} className="mb-2">
              <label className="form-label small">
                {getForm8FieldDisplayLabel(field)}
              </label>
              <select
                className="form-select form-select-sm"
                value={field.fieldLayout || 'half'}
                onChange={(e) =>
                  updateSectionField(sectionId, field.id, { fieldLayout: e.target.value })
                }
              >
                {FIELD_LAYOUT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        </>
      );
    }

    if (sizeControls) return sizeControls;

    return null;
  };

  return (
    <aside className="f8-builder-panel f8-builder-panel--props f8-builder-panel--compact">
      <div className="f8-builder-panel-fixed f8-builder-props-fixed">
        <div className="f8-builder-props-head">
          <h3>{blockTitle(blockId, formConfig)}</h3>
          <button type="button" className="f8-builder-props-close" onClick={onClose} aria-label="Clear selection">
            <FiX size={18} />
          </button>
        </div>
        {renderFormToggleButton()}
        <div className="f8-builder-props-tabs" role="tablist">
          {PROP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`f8-builder-props-tab${propertiesTab === tab.id ? ' is-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="f8-builder-panel-scroll f8-builder-props-body">
        {propertiesTab === 'content' && renderContent()}
        {propertiesTab === 'advance' && renderAdvance()}
        {propertiesTab === 'layout' && renderLayout()}
      </div>
    </aside>
  );
};

export default Form8BuilderPropertiesPanel;
