import React from 'react';
import { toast } from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import DraggableList from '../formTemplate/DraggableList';
import FormTemplateMacroPanel from '../formTemplate/FormTemplateMacroPanel';
import FormBuilderImageUpload from '../formTemplate/FormBuilderImageUpload';
import {
  parseSectionBlockId,
} from '../../../utils/formTemplate/formBuilderCatalog';
import { parseFieldBlockId } from '../../../utils/formTemplate/formFieldBlocks';
import { getAgreementFieldDisplayLabel } from '../../../utils/agreementBuilder/agreementSectionDisplay';
import {
  AGREEMENT_BLOCK_META,
  canToggleAgreementBlockOnCanvas,
  getBlockLayout,
} from '../../../utils/agreementBuilder/agreementBlocks';
import {
  getForm8MediaWidthLimits,
  isForm8MediaBlockId,
} from '../../../utils/formTemplate/formBuilderBlocks';
import { isAgreementBlockOnCanvas } from '../../../utils/agreementBuilder/agreementPalette';
import {
  getPageStyle,
  getSortedFields,
} from '../../../utils/formTemplate/formTemplateConfig';
import {
  FORM8_FONT_WEIGHT_OPTIONS,
  SECTION_STYLE_RESET_PATCH,
  isForm8SectionBorderOn,
} from '../../../utils/formTemplate/formSectionStyle';
import {
  FORM8_BLOCK_STYLE_RESET_PATCH,
  FORM8_HEADER_LINE_DEFS,
  isForm8HeaderBorderOn,
  isForm8ImageBorderOn,
  isForm8TextPartBorderOn,
  FORM8_DIVIDER_STYLE_OPTIONS,
} from '../../../utils/formTemplate/formBlockStyle';
import { isForm8TableBorderOn } from '../../../utils/formTemplate/formStockTableStyle';
import {
  FORM_FIELD_FONT_PT_MAX,
  FORM_FIELD_FONT_PT_MIN,
} from '../../../utils/formTemplate/formTemplateConfig';
import FormTypographyFields from '../formTemplate/FormTypographyFields';
import {
  BOX_COLORS,
  FRIENDLY_FIELD_LAYOUT_OPTIONS,
  TITLE_COLORS,
  getForm8ElementStyleProfile,
  resolveStyleColorFallback,
  usesForm8SectionAdvance,
} from '../../../utils/formTemplate/formElementStyleProfiles';
import {
  FORM_TEMPLATE_ASSET_KEYS,
  getFormTemplateAssets,
} from '../../../utils/formTemplate/formTemplateImageAssets';
import { FORM8_STOCK_TABLE_COLUMNS } from '../../../utils/formTemplate/formStockTable';
import {
  getForm8DividerLabel,
  isForm8DividerBlockId,
  readForm8DividerOwnStyle,
} from '../../../utils/formTemplate/formDividerBlocks';
import { form8TextTypographyPatch } from '../../../utils/formTemplate/formTypographyGroups';

const PROP_TABS = [
  { id: 'content', label: 'Content' },
  { id: 'advance', label: 'Advance' },
  { id: 'layout', label: 'Layout' },
];

const blockTitle = (blockId, config) => {
  const meta = AGREEMENT_BLOCK_META[blockId];
  if (isForm8DividerBlockId(blockId)) {
    return getForm8DividerLabel(blockId, config?.builderBlockOrder || []);
  }
  if (meta?.label) return meta.label;
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = config?.sections?.find((s) => s.id === sectionId);
    return section?.label || 'Section';
  }
  const titles = {
    page_settings: 'Page & Theme',
    macro_keywords: 'Macro Keywords',
  };
  return titles[blockId] || 'Agreement';
};

const AgreementBuilderPropertiesPanel = ({
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
  imageUrls = null,
  collapsed = false,
  onToggleCollapsed,
  onCollapse,
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
        <div className="f8-builder-panel-title-row px-2 pt-2">
          <div className="f8-builder-panel-title mb-0">Properties</div>
          <button
            type="button"
            className="f8-builder-panel-hide"
            title="Hide properties"
            onClick={onCollapse}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
        <p className="text-muted small mb-0 px-2 pb-2">Select an element on the canvas or from the left panel.</p>
      </aside>
    );
  }

  const sectionId = parseSectionBlockId(blockId);
  const section = sectionId
    ? formConfig.sections?.find((s) => s.id === sectionId)
    : null;

  const setSectionStyle = (patch) => updateSection(sectionId, patch);

  const renderColorRow = (label, key, fallback, value, onChange) => (
    <div className="mb-2">
      <label className="form-label small">{label}</label>
      <div className="form-custom-color-input-row">
        <input
          type="color"
          value={value || fallback}
          onChange={(e) => onChange({ [key]: e.target.value })}
        />
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder={fallback}
          value={value || ''}
          onChange={(e) => onChange({ [key]: e.target.value })}
        />
      </div>
    </div>
  );

  const renderFormToggleButton = () => {
    if (!canToggleAgreementBlockOnCanvas(blockId)) return null;
    const onForm = isAgreementBlockOnCanvas(formConfig, blockId);
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

    if (blockId === 'signature_lines' || isForm8DividerBlockId(blockId)) {
      return null;
    }

    if (blockId === 'customer_photo') {
      return null;
    }

    if (blockId === 'stock_line_items') {
      const hidden = new Set(
        getBlockLayout(formConfig, blockId).stockHiddenColumns || []
      );
      return (
        <div className="f8-builder-field-layout-list">
          {FORM8_STOCK_TABLE_COLUMNS.map((col) => {
            const checked = !hidden.has(col.id);
            return (
              <div key={col.id} className="form-custom-field-editor">
                <label className="form-custom-toggle-item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(hidden);
                      if (e.target.checked) next.delete(col.id);
                      else next.add(col.id);
                      if (next.size >= FORM8_STOCK_TABLE_COLUMNS.length) return;
                      updateBlockLayout(blockId, {
                        stockHiddenColumns: [...next],
                      });
                    }}
                  />
                  <span>{col.label}</span>
                </label>
              </div>
            );
          })}
        </div>
      );
    }

    if (blockId === 'layout_left_logo') {
      return (
        <FormBuilderImageUpload
          label="Left logo"
          previewUrl={templateAssets.leftLogoDataUrl || imageUrls?.leftLogoUrl}
          onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.leftLogo)}
          onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.leftLogo)}
        />
      );
    }

    if (blockId === 'layout_right_logo') {
      return (
        <FormBuilderImageUpload
          label="Right logo"
          previewUrl={templateAssets.rightLogoDataUrl || imageUrls?.rightLogoUrl}
          onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.rightLogo)}
          onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.rightLogo)}
        />
      );
    }

    if (blockId === 'layout_footer_image') {
      return (
        <FormBuilderImageUpload
          label="Footer image"
          previewUrl={templateAssets.footerImageDataUrl || imageUrls?.footerImageUrl}
          onChange={handleAssetUpload(FORM_TEMPLATE_ASSET_KEYS.footerImage)}
          onClear={handleAssetClear(FORM_TEMPLATE_ASSET_KEYS.footerImage)}
        />
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
                  <span className="small">{getAgreementFieldDisplayLabel(field)}</span>
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

  const renderAdvance = () => {
    const profile = getForm8ElementStyleProfile(
      blockId,
      usesForm8SectionAdvance(blockId, Boolean(section))
    );
    if (!profile) {
      return null;
    }

    const pageStyle = getPageStyle(formConfig);
    const theme = formConfig.theme || {};
    const layoutSpec = getBlockLayout(formConfig, blockId);
    const styleValues =
      profile.store === 'section'
        ? section || {}
        : isForm8DividerBlockId(blockId)
          ? { ...layoutSpec, ...readForm8DividerOwnStyle(formConfig, blockId) }
          : layoutSpec;
    const applyStyle =
      profile.store === 'section'
        ? setSectionStyle
        : (patch) => updateBlockLayout(blockId, patch);

    const colorValue = (key) => {
      if (profile.store === 'header' && (key === 'backgroundColor' || key === 'titleColor' || key === 'titleBackgroundColor' || key === 'bodyColor' || key === 'borderColor')) {
        return layoutSpec[key] || '';
      }
      return styleValues[key] || '';
    };

    const applyColor = (patch) => {
      if (profile.store === 'header') {
        updateBlockLayout(blockId, patch);
        return;
      }
      applyStyle(patch);
    };

    const paint = (field) => {
      const fallback = resolveStyleColorFallback(theme, field);
      return renderColorRow(
        field.label,
        field.key,
        fallback,
        colorValue(field.key),
        applyColor
      );
    };

    const typoPlaceholders = {
      titleFontSizePt: pageStyle.mainTitleFontPt ?? (pageStyle.fontPt ?? 11) + 1,
      labelFontSizePt: pageStyle.labelFontPt,
      valueFontSizePt: pageStyle.valueFontPt ?? pageStyle.fontPt,
    };

    return (
      <>
        {profile.showHeaderBox ? (
          <div className="mb-3">
            {renderColorRow(
              'Background colour',
              'backgroundColor',
              resolveStyleColorFallback(theme, {
                fallback: 'sectionBackground',
                fallbackHex: '#ffffff',
              }),
              colorValue('backgroundColor'),
              applyColor
            )}
            <div className="form-check mb-2">
              <input
                id={`f8-header-border-${blockId}`}
                className="form-check-input"
                type="checkbox"
                checked={isForm8HeaderBorderOn(styleValues)}
                onChange={(e) =>
                  applyStyle({ headerBorder: e.target.checked ? '1' : '' })
                }
              />
              <label className="form-check-label small" htmlFor={`f8-header-border-${blockId}`}>
                Border
              </label>
            </div>
            {renderColorRow(
              'Border colour',
              'borderColor',
              resolveStyleColorFallback(theme, {
                fallback: 'borderColor',
                fallbackHex: '#2c5282',
              }),
              colorValue('borderColor'),
              applyColor
            )}
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-header-width-${blockId}`}>
                Border size
              </label>
              <input
                id={`f8-header-width-${blockId}`}
                type="number"
                className="form-control form-control-sm"
                step="any"
                value={styleValues.headerBorderWidth ?? ''}
                placeholder="1"
                onChange={(e) => applyStyle({ headerBorderWidth: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-header-radius-${blockId}`}>
                Border radius
              </label>
              <input
                id={`f8-header-radius-${blockId}`}
                type="number"
                className="form-control form-control-sm"
                step="any"
                value={styleValues.headerBorderRadius ?? ''}
                placeholder="0"
                onChange={(e) => applyStyle({ headerBorderRadius: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        {profile.showHeaderLines
          ? FORM8_HEADER_LINE_DEFS.map((line) => (
              <div key={line.id} className="mb-3">
                <p className="small fw-semibold mb-2">{line.label}</p>
                {renderColorRow(
                  'Text colour',
                  line.colorKey,
                  resolveStyleColorFallback(theme, {
                    fallback: line.fallbackColor,
                    fallbackHex: line.fallbackHex,
                  }),
                  colorValue(line.colorKey),
                  applyColor
                )}
                {renderColorRow(
                  'Box background',
                  line.bgKey,
                  '#ffffff',
                  colorValue(line.bgKey),
                  applyColor
                )}
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-hdr-size-${line.id}`}>
                      Font size
                    </label>
                    <input
                      id={`f8-hdr-size-${line.id}`}
                      type="number"
                      className="form-control form-control-sm"
                      min={FORM_FIELD_FONT_PT_MIN}
                      max={FORM_FIELD_FONT_PT_MAX}
                      step={0.5}
                      value={styleValues[line.sizeKey] ?? ''}
                      placeholder={String(
                        line.id === 'title'
                          ? typoPlaceholders.titleFontSizePt
                          : line.id === 'note'
                            ? typoPlaceholders.valueFontSizePt
                            : typoPlaceholders.labelFontSizePt
                      )}
                      onChange={(e) => applyStyle({ [line.sizeKey]: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-hdr-weight-${line.id}`}>
                      Font weight
                    </label>
                    <select
                      id={`f8-hdr-weight-${line.id}`}
                      className="form-select form-select-sm"
                      value={styleValues[line.weightKey] ?? ''}
                      onChange={(e) => applyStyle({ [line.weightKey]: e.target.value })}
                    >
                      {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                        <option key={opt.value || 'default'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          : null}

        {profile.showSectionGroups ? (
          <>
            <div className="mb-3">
              <p className="small fw-semibold mb-2">Section</p>
              {renderColorRow(
                'Background colour',
                'backgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'sectionBackground',
                  fallbackHex: '#ffffff',
                }),
                colorValue('backgroundColor'),
                applyColor
              )}
              <div className="form-check mb-2">
                <input
                  id={`f8-section-border-${blockId}`}
                  className="form-check-input"
                  type="checkbox"
                  checked={isForm8SectionBorderOn(styleValues)}
                  onChange={(e) =>
                    applyStyle({ sectionBorder: e.target.checked ? '1' : '' })
                  }
                />
                <label className="form-check-label small" htmlFor={`f8-section-border-${blockId}`}>
                  Border
                </label>
              </div>
              {renderColorRow(
                'Border colour',
                'borderColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'borderColor',
                  fallbackHex: '#2c5282',
                }),
                colorValue('borderColor'),
                applyColor
              )}
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-section-width-${blockId}`}>
                  Border size
                </label>
                <input
                  id={`f8-section-width-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderWidth ?? ''}
                  placeholder="1"
                  onChange={(e) => applyStyle({ sectionBorderWidth: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-section-radius-${blockId}`}>
                  Border radius
                </label>
                <input
                  id={`f8-section-radius-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderRadius ?? ''}
                  placeholder="0"
                  onChange={(e) => applyStyle({ sectionBorderRadius: e.target.value })}
                />
              </div>
              {renderColorRow(
                'Heading text',
                'titleColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'sectionTitleColor',
                  fallbackHex: '#1e3a5f',
                }),
                colorValue('titleColor'),
                applyColor
              )}
              {renderColorRow(
                'Heading bar',
                'titleBackgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'tableHeaderBackground',
                  fallbackHex: '#e8eef5',
                }),
                colorValue('titleBackgroundColor'),
                applyColor
              )}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-sec-title-size-${blockId}`}>
                    Heading size
                  </label>
                  <input
                    id={`f8-sec-title-size-${blockId}`}
                    type="number"
                    className="form-control form-control-sm"
                    min={FORM_FIELD_FONT_PT_MIN}
                    max={FORM_FIELD_FONT_PT_MAX}
                    step={0.5}
                    value={styleValues.titleFontSizePt ?? ''}
                    placeholder={String(typoPlaceholders.titleFontSizePt)}
                    onChange={(e) => applyStyle({ titleFontSizePt: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-sec-title-weight-${blockId}`}>
                    Heading weight
                  </label>
                  <select
                    id={`f8-sec-title-weight-${blockId}`}
                    className="form-select form-select-sm"
                    value={styleValues.titleFontWeight ?? ''}
                    onChange={(e) => applyStyle({ titleFontWeight: e.target.value })}
                  >
                    {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value || 'default'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {[
              {
                id: 'label',
                title: 'Label',
                colorKey: 'labelColor',
                bgKey: 'labelBackgroundColor',
                sizeKey: 'labelFontSizePt',
                weightKey: 'labelFontWeight',
                colorFallback: 'sectionTitleColor',
                colorHex: '#1e3a5f',
                sizePlaceholder: typoPlaceholders.labelFontSizePt,
              },
              {
                id: 'value',
                title: 'Value',
                colorKey: 'valueColor',
                bgKey: 'valueBackgroundColor',
                sizeKey: 'valueFontSizePt',
                weightKey: 'valueFontWeight',
                colorFallback: 'textColor',
                colorHex: '#1a202c',
                sizePlaceholder: typoPlaceholders.valueFontSizePt,
              },
            ].map((group) => (
              <div key={group.id} className="mb-3">
                <p className="small fw-semibold mb-2">{group.title}</p>
                {renderColorRow(
                  'Text colour',
                  group.colorKey,
                  resolveStyleColorFallback(theme, {
                    fallback: group.colorFallback,
                    fallbackHex: group.colorHex,
                  }),
                  colorValue(group.colorKey),
                  applyColor
                )}
                {renderColorRow(
                  'Box background',
                  group.bgKey,
                  '#ffffff',
                  colorValue(group.bgKey),
                  applyColor
                )}
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-sec-${group.id}-size-${blockId}`}>
                      Font size
                    </label>
                    <input
                      id={`f8-sec-${group.id}-size-${blockId}`}
                      type="number"
                      className="form-control form-control-sm"
                      min={FORM_FIELD_FONT_PT_MIN}
                      max={FORM_FIELD_FONT_PT_MAX}
                      step={0.5}
                      value={styleValues[group.sizeKey] ?? ''}
                      placeholder={String(group.sizePlaceholder)}
                      onChange={(e) => applyStyle({ [group.sizeKey]: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-sec-${group.id}-weight-${blockId}`}>
                      Font weight
                    </label>
                    <select
                      id={`f8-sec-${group.id}-weight-${blockId}`}
                      className="form-select form-select-sm"
                      value={styleValues[group.weightKey] ?? ''}
                      onChange={(e) => applyStyle({ [group.weightKey]: e.target.value })}
                    >
                      {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                        <option key={opt.value || 'default'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {profile.showStockTableGroups ? (
          <>
            <div className="mb-3">
              <p className="small fw-semibold mb-2">Section</p>
              {renderColorRow(
                'Background colour',
                'backgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'sectionBackground',
                  fallbackHex: '#ffffff',
                }),
                colorValue('backgroundColor'),
                applyColor
              )}
              <div className="form-check mb-2">
                <input
                  id={`f8-stock-section-border-${blockId}`}
                  className="form-check-input"
                  type="checkbox"
                  checked={isForm8SectionBorderOn(styleValues)}
                  onChange={(e) =>
                    applyStyle({ sectionBorder: e.target.checked ? '1' : '' })
                  }
                />
                <label className="form-check-label small" htmlFor={`f8-stock-section-border-${blockId}`}>
                  Border
                </label>
              </div>
              {renderColorRow(
                'Border colour',
                'borderColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'borderColor',
                  fallbackHex: '#2c5282',
                }),
                colorValue('borderColor'),
                applyColor
              )}
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-stock-section-width-${blockId}`}>
                  Border size
                </label>
                <input
                  id={`f8-stock-section-width-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderWidth ?? ''}
                  placeholder="1"
                  onChange={(e) => applyStyle({ sectionBorderWidth: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-stock-section-radius-${blockId}`}>
                  Border radius
                </label>
                <input
                  id={`f8-stock-section-radius-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderRadius ?? ''}
                  placeholder="0"
                  onChange={(e) => applyStyle({ sectionBorderRadius: e.target.value })}
                />
              </div>
              {renderColorRow(
                'Heading text',
                'titleColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'sectionTitleColor',
                  fallbackHex: '#1e3a5f',
                }),
                colorValue('titleColor'),
                applyColor
              )}
              {renderColorRow(
                'Heading bar',
                'titleBackgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'tableHeaderBackground',
                  fallbackHex: '#e8eef5',
                }),
                colorValue('titleBackgroundColor'),
                applyColor
              )}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-stock-title-size-${blockId}`}>
                    Font size
                  </label>
                  <input
                    id={`f8-stock-title-size-${blockId}`}
                    type="number"
                    className="form-control form-control-sm"
                    min={FORM_FIELD_FONT_PT_MIN}
                    max={FORM_FIELD_FONT_PT_MAX}
                    step={0.5}
                    value={styleValues.titleFontSizePt ?? ''}
                    placeholder={String(typoPlaceholders.titleFontSizePt)}
                    onChange={(e) => applyStyle({ titleFontSizePt: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-stock-title-weight-${blockId}`}>
                    Font weight
                  </label>
                  <select
                    id={`f8-stock-title-weight-${blockId}`}
                    className="form-select form-select-sm"
                    value={styleValues.titleFontWeight ?? ''}
                    onChange={(e) => applyStyle({ titleFontWeight: e.target.value })}
                  >
                    {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value || 'default'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <p className="small fw-semibold mb-2">Table border</p>
              <div className="form-check mb-2">
                <input
                  id={`f8-stock-table-border-${blockId}`}
                  className="form-check-input"
                  type="checkbox"
                  checked={isForm8TableBorderOn(styleValues)}
                  onChange={(e) =>
                    applyStyle({ tableBorder: e.target.checked ? '1' : '' })
                  }
                />
                <label className="form-check-label small" htmlFor={`f8-stock-table-border-${blockId}`}>
                  Border
                </label>
              </div>
              {renderColorRow(
                'Border colour',
                'tableBorderColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'borderColor',
                  fallbackHex: '#2c5282',
                }),
                colorValue('tableBorderColor'),
                applyColor
              )}
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-stock-table-width-${blockId}`}>
                  Border size
                </label>
                <input
                  id={`f8-stock-table-width-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.tableBorderWidth ?? ''}
                  placeholder="1"
                  onChange={(e) => applyStyle({ tableBorderWidth: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-stock-table-radius-${blockId}`}>
                  Border radius
                </label>
                <input
                  id={`f8-stock-table-radius-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.tableBorderRadius ?? ''}
                  placeholder="0"
                  onChange={(e) => applyStyle({ tableBorderRadius: e.target.value })}
                />
              </div>
            </div>

            {[
              {
                id: 'header',
                title: 'Table header',
                bgKey: 'tableHeaderBackgroundColor',
                colorKey: 'tableHeaderColor',
                sizeKey: 'tableHeaderFontSizePt',
                weightKey: 'tableHeaderFontWeight',
                colorFallback: 'sectionTitleColor',
                colorHex: '#1e3a5f',
                bgFallback: 'tableHeaderBackground',
                bgHex: '#e8eef5',
                sizePlaceholder: typoPlaceholders.labelFontSizePt,
              },
              {
                id: 'body',
                title: 'Table body',
                bgKey: 'tableBodyBackgroundColor',
                colorKey: 'tableBodyColor',
                sizeKey: 'tableBodyFontSizePt',
                weightKey: 'tableBodyFontWeight',
                colorFallback: 'textColor',
                colorHex: '#1a202c',
                bgFallback: 'pageBackground',
                bgHex: '#ffffff',
                sizePlaceholder: typoPlaceholders.valueFontSizePt,
              },
              {
                id: 'footer',
                title: 'Table footer',
                bgKey: 'tableFooterBackgroundColor',
                colorKey: 'tableFooterColor',
                sizeKey: 'tableFooterFontSizePt',
                weightKey: 'tableFooterFontWeight',
                colorFallback: 'sectionTitleColor',
                colorHex: '#1e3a5f',
                bgFallback: 'tableHeaderBackground',
                bgHex: '#e8eef5',
                sizePlaceholder: typoPlaceholders.labelFontSizePt,
              },
            ].map((group) => (
              <div key={group.id} className="mb-3">
                <p className="small fw-semibold mb-2">{group.title}</p>
                {renderColorRow(
                  'Background colour',
                  group.bgKey,
                  resolveStyleColorFallback(theme, {
                    fallback: group.bgFallback,
                    fallbackHex: group.bgHex,
                  }),
                  colorValue(group.bgKey),
                  applyColor
                )}
                {renderColorRow(
                  'Text colour',
                  group.colorKey,
                  resolveStyleColorFallback(theme, {
                    fallback: group.colorFallback,
                    fallbackHex: group.colorHex,
                  }),
                  colorValue(group.colorKey),
                  applyColor
                )}
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-stock-${group.id}-size-${blockId}`}>
                      Font size
                    </label>
                    <input
                      id={`f8-stock-${group.id}-size-${blockId}`}
                      type="number"
                      className="form-control form-control-sm"
                      min={FORM_FIELD_FONT_PT_MIN}
                      max={FORM_FIELD_FONT_PT_MAX}
                      step={0.5}
                      value={styleValues[group.sizeKey] ?? ''}
                      placeholder={String(group.sizePlaceholder)}
                      onChange={(e) => applyStyle({ [group.sizeKey]: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-stock-${group.id}-weight-${blockId}`}>
                      Font weight
                    </label>
                    <select
                      id={`f8-stock-${group.id}-weight-${blockId}`}
                      className="form-select form-select-sm"
                      value={styleValues[group.weightKey] ?? ''}
                      onChange={(e) => applyStyle({ [group.weightKey]: e.target.value })}
                    >
                      {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                        <option key={opt.value || 'default'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {profile.showTextBlockGroups ? (
          <>
            {[
              {
                id: 'title',
                title: 'Title',
                colorKey: 'titleColor',
                bgKey: 'titleBackgroundColor',
                sizeKey: 'titleFontSizePt',
                weightKey: 'titleFontWeight',
                borderOnKey: 'titleBorder',
                borderColorKey: 'titleBorderColor',
                borderWidthKey: 'titleBorderWidth',
                borderRadiusKey: 'titleBorderRadius',
                colorFallback: 'sectionTitleColor',
                colorHex: '#1e3a5f',
                bgFallback: 'tableHeaderBackground',
                bgHex: '#e8eef5',
                sizePlaceholder: typoPlaceholders.titleFontSizePt,
              },
              {
                id: 'body',
                title: 'Body',
                colorKey: 'bodyColor',
                bgKey: 'bodyBackgroundColor',
                sizeKey: 'bodyFontSizePt',
                weightKey: 'bodyFontWeight',
                borderOnKey: 'bodyBorder',
                borderColorKey: 'bodyBorderColor',
                borderWidthKey: 'bodyBorderWidth',
                borderRadiusKey: 'bodyBorderRadius',
                colorFallback: 'textColor',
                colorHex: '#1a202c',
                bgFallback: 'pageBackground',
                bgHex: '#ffffff',
                sizePlaceholder: typoPlaceholders.valueFontSizePt,
              },
            ].map((group) => (
              <div key={group.id} className="mb-3">
                <p className="small fw-semibold mb-2">{group.title}</p>
                {renderColorRow(
                  'Text colour',
                  group.colorKey,
                  resolveStyleColorFallback(theme, {
                    fallback: group.colorFallback,
                    fallbackHex: group.colorHex,
                  }),
                  colorValue(group.colorKey),
                  applyColor
                )}
                {renderColorRow(
                  'Background colour',
                  group.bgKey,
                  resolveStyleColorFallback(theme, {
                    fallback: group.bgFallback,
                    fallbackHex: group.bgHex,
                  }),
                  colorValue(group.bgKey),
                  applyColor
                )}
                <div className="form-check mb-2">
                  <input
                    id={`f8-text-${group.id}-border-${blockId}`}
                    className="form-check-input"
                    type="checkbox"
                    checked={isForm8TextPartBorderOn(styleValues, group.id)}
                    onChange={(e) =>
                      applyStyle({ [group.borderOnKey]: e.target.checked ? '1' : '' })
                    }
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`f8-text-${group.id}-border-${blockId}`}
                  >
                    Border
                  </label>
                </div>
                {renderColorRow(
                  'Border colour',
                  group.borderColorKey,
                  resolveStyleColorFallback(theme, {
                    fallback: 'borderColor',
                    fallbackHex: '#2c5282',
                  }),
                  colorValue(group.borderColorKey),
                  applyColor
                )}
                <div className="mb-2">
                  <label className="form-label small" htmlFor={`f8-text-${group.id}-width-${blockId}`}>
                    Border size
                  </label>
                  <input
                    id={`f8-text-${group.id}-width-${blockId}`}
                    type="number"
                    className="form-control form-control-sm"
                    step="any"
                    value={styleValues[group.borderWidthKey] ?? ''}
                    placeholder="1"
                    onChange={(e) => applyStyle({ [group.borderWidthKey]: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small" htmlFor={`f8-text-${group.id}-radius-${blockId}`}>
                    Border radius
                  </label>
                  <input
                    id={`f8-text-${group.id}-radius-${blockId}`}
                    type="number"
                    className="form-control form-control-sm"
                    step="any"
                    value={styleValues[group.borderRadiusKey] ?? ''}
                    placeholder="0"
                    onChange={(e) => applyStyle({ [group.borderRadiusKey]: e.target.value })}
                  />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-text-${group.id}-size-${blockId}`}>
                      Font size
                    </label>
                    <input
                      id={`f8-text-${group.id}-size-${blockId}`}
                      type="number"
                      className="form-control form-control-sm"
                      min={FORM_FIELD_FONT_PT_MIN}
                      max={FORM_FIELD_FONT_PT_MAX}
                      step={0.5}
                      value={styleValues[group.sizeKey] ?? ''}
                      placeholder={String(group.sizePlaceholder)}
                      onChange={(e) => {
                        if (group.id === 'body') {
                          applyStyle(form8TextTypographyPatch(e.target.value, styleValues.bodyFontWeight ?? styleValues.valueFontWeight ?? ''));
                          return;
                        }
                        applyStyle({ [group.sizeKey]: e.target.value });
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small" htmlFor={`f8-text-${group.id}-weight-${blockId}`}>
                      Font weight
                    </label>
                    <select
                      id={`f8-text-${group.id}-weight-${blockId}`}
                      className="form-select form-select-sm"
                      value={styleValues[group.weightKey] ?? ''}
                      onChange={(e) => {
                        if (group.id === 'body') {
                          applyStyle(form8TextTypographyPatch(styleValues.bodyFontSizePt ?? styleValues.valueFontSizePt ?? '', e.target.value));
                          return;
                        }
                        applyStyle({ [group.weightKey]: e.target.value });
                      }}
                    >
                      {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                        <option key={opt.value || 'default'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {profile.showDividerGroups ? (
          <div className="mb-3">
            <p className="small fw-semibold mb-2">
              {getForm8DividerLabel(blockId, formConfig?.builderBlockOrder || [])} line
            </p>
            {renderColorRow(
              'Line colour',
              'dividerColor',
              resolveStyleColorFallback(theme, {
                fallback: 'borderColor',
                fallbackHex: '#2c5282',
              }),
              colorValue('dividerColor'),
              applyColor
            )}
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-divider-width-${blockId}`}>
                Line size
              </label>
              <input
                id={`f8-divider-width-${blockId}`}
                type="number"
                className="form-control form-control-sm"
                step="any"
                value={styleValues.dividerWidth ?? ''}
                placeholder="1"
                onChange={(e) => applyStyle({ dividerWidth: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-divider-style-${blockId}`}>
                Line style
              </label>
              <select
                id={`f8-divider-style-${blockId}`}
                className="form-select form-select-sm"
                value={styleValues.dividerStyle || 'solid'}
                onChange={(e) => applyStyle({ dividerStyle: e.target.value })}
              >
                {FORM8_DIVIDER_STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {profile.showSignatureGroups ? (
          <>
            <div className="mb-3">
              <p className="small fw-semibold mb-2">Section</p>
              {renderColorRow(
                'Background colour',
                'backgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'sectionBackground',
                  fallbackHex: '#ffffff',
                }),
                colorValue('backgroundColor'),
                applyColor
              )}
              <div className="form-check mb-2">
                <input
                  id={`f8-sig-section-border-${blockId}`}
                  className="form-check-input"
                  type="checkbox"
                  checked={isForm8SectionBorderOn(styleValues)}
                  onChange={(e) =>
                    applyStyle({ sectionBorder: e.target.checked ? '1' : '' })
                  }
                />
                <label className="form-check-label small" htmlFor={`f8-sig-section-border-${blockId}`}>
                  Border
                </label>
              </div>
              {renderColorRow(
                'Border colour',
                'borderColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'borderColor',
                  fallbackHex: '#2c5282',
                }),
                colorValue('borderColor'),
                applyColor
              )}
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-sig-section-width-${blockId}`}>
                  Border size
                </label>
                <input
                  id={`f8-sig-section-width-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderWidth ?? ''}
                  placeholder="1"
                  onChange={(e) => applyStyle({ sectionBorderWidth: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-sig-section-radius-${blockId}`}>
                  Border radius
                </label>
                <input
                  id={`f8-sig-section-radius-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.sectionBorderRadius ?? ''}
                  placeholder="0"
                  onChange={(e) => applyStyle({ sectionBorderRadius: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-3">
              <p className="small fw-semibold mb-2">Line</p>
              {renderColorRow(
                'Line colour',
                'signatureLineColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'textColor',
                  fallbackHex: '#111827',
                }),
                colorValue('signatureLineColor'),
                applyColor
              )}
              <div className="mb-2">
                <label className="form-label small" htmlFor={`f8-sig-line-width-${blockId}`}>
                  Line size
                </label>
                <input
                  id={`f8-sig-line-width-${blockId}`}
                  type="number"
                  className="form-control form-control-sm"
                  step="any"
                  value={styleValues.signatureLineWidth ?? ''}
                  placeholder="1"
                  onChange={(e) => applyStyle({ signatureLineWidth: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-3">
              <p className="small fw-semibold mb-2">Name</p>
              {renderColorRow(
                'Text colour',
                'bodyColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'textColor',
                  fallbackHex: '#1a202c',
                }),
                colorValue('bodyColor'),
                applyColor
              )}
              {renderColorRow(
                'Background colour',
                'bodyBackgroundColor',
                resolveStyleColorFallback(theme, {
                  fallback: 'pageBackground',
                  fallbackHex: '#ffffff',
                }),
                colorValue('bodyBackgroundColor'),
                applyColor
              )}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-sig-name-size-${blockId}`}>
                    Font size
                  </label>
                  <input
                    id={`f8-sig-name-size-${blockId}`}
                    type="number"
                    className="form-control form-control-sm"
                    min={FORM_FIELD_FONT_PT_MIN}
                    max={FORM_FIELD_FONT_PT_MAX}
                    step={0.5}
                    value={styleValues.bodyFontSizePt ?? ''}
                    placeholder={String(typoPlaceholders.valueFontSizePt)}
                    onChange={(e) =>
                      applyStyle(
                        form8TextTypographyPatch(
                          e.target.value,
                          styleValues.bodyFontWeight ?? styleValues.valueFontWeight ?? ''
                        )
                      )
                    }
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small" htmlFor={`f8-sig-name-weight-${blockId}`}>
                    Font weight
                  </label>
                  <select
                    id={`f8-sig-name-weight-${blockId}`}
                    className="form-select form-select-sm"
                    value={styleValues.bodyFontWeight ?? ''}
                    onChange={(e) =>
                      applyStyle(
                        form8TextTypographyPatch(
                          styleValues.bodyFontSizePt ?? styleValues.valueFontSizePt ?? '',
                          e.target.value
                        )
                      )
                    }
                  >
                    {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value || 'default'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {profile.showCompactness ? (
          <>
            <p className="small fw-semibold mb-2">Overall text size</p>
            <select
              className="form-select form-select-sm mb-3"
              value={formConfig.fontSize || 'small'}
              onChange={(e) => updateConfig('fontSize', e.target.value)}
            >
              <option value="small">Small (fits more on one page)</option>
              <option value="medium">Medium</option>
              <option value="large">Large (easier to read)</option>
            </select>
          </>
        ) : null}

        {profile.showBox ? (
          <>
            <p className="small fw-semibold mb-2">Box</p>
            {BOX_COLORS.map(paint)}
          </>
        ) : null}

        {profile.showImageBorder ? (
          <>
            <div className="form-check mb-2">
              <input
                id={`f8-image-border-${blockId}`}
                className="form-check-input"
                type="checkbox"
                checked={isForm8ImageBorderOn(styleValues)}
                onChange={(e) =>
                  applyStyle({ imageBorder: e.target.checked ? '1' : '' })
                }
              />
              <label className="form-check-label small" htmlFor={`f8-image-border-${blockId}`}>
                Image border
              </label>
            </div>
            {renderColorRow(
              'Border colour',
              'imageBorderColor',
              resolveStyleColorFallback(theme, {
                fallback: 'borderColor',
                fallbackHex: '#2c5282',
              }),
              colorValue('imageBorderColor'),
              applyColor
            )}
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-image-width-${blockId}`}>
                Border size
              </label>
              <input
                id={`f8-image-width-${blockId}`}
                type="number"
                className="form-control form-control-sm"
                step="any"
                value={styleValues.imageBorderWidth ?? ''}
                placeholder="1"
                onChange={(e) => applyStyle({ imageBorderWidth: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small" htmlFor={`f8-image-radius-${blockId}`}>
                Border radius
              </label>
              <input
                id={`f8-image-radius-${blockId}`}
                type="number"
                className="form-control form-control-sm"
                step="any"
                value={styleValues.imageBorderRadius ?? ''}
                placeholder="0"
                onChange={(e) => applyStyle({ imageBorderRadius: e.target.value })}
              />
            </div>
          </>
        ) : null}

        {profile.showTitleColors ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Heading colours</p>
            {TITLE_COLORS.map(paint)}
          </>
        ) : null}

        {profile.showBodyColor ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Text colour</p>
            {paint({
              key: 'bodyColor',
              label: 'Text',
              fallback: 'textColor',
              fallbackHex: '#1a202c',
            })}
          </>
        ) : null}

        {profile.extraColors?.length ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Table colours</p>
            {profile.extraColors
              .filter((field) => field.key !== 'borderColor' || blockId !== 'signature_lines')
              .map(paint)}
          </>
        ) : null}

        {profile.typography?.length ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Fonts</p>
            <FormTypographyFields
              useTextAliases={profile.store !== 'section' && profile.store !== 'header'}
              values={profile.store === 'header' ? theme : styleValues}
              groups={profile.typography}
              placeholders={typoPlaceholders}
              onPatch={(patch) =>
                profile.store === 'header' ? updateTheme(patch) : applyStyle(patch)
              }
            />
          </>
        ) : null}

        {profile.showFieldBackgrounds && section ? (
          <>
            <p className="small fw-semibold mb-2 mt-3">Field row colour</p>
            {getSortedFields(section)
              .filter((field) => field.enabled)
              .map((field) => (
                <div key={field.id} className="mb-2 d-flex align-items-center gap-2">
                  <span className="small flex-grow-1 text-truncate">
                    {getAgreementFieldDisplayLabel(field)}
                  </span>
                  <input
                    type="color"
                    className="form-control form-control-color form-control-sm"
                    title="Field background"
                    value={field.backgroundColor || '#ffffff'}
                    onChange={(e) =>
                      updateSectionField(sectionId, field.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
          </>
        ) : null}

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mt-2"
          onClick={() => {
            if (profile.store === 'section') {
              setSectionStyle({ ...SECTION_STYLE_RESET_PATCH });
              return;
            }
            if (profile.store === 'header') {
              updateTheme({
                titleFontSizePt: '',
                titleFontWeight: '',
                labelFontSizePt: '',
                labelFontWeight: '',
                valueFontSizePt: '',
                valueFontWeight: '',
              });
            }
            updateBlockLayout(blockId, { ...FORM8_BLOCK_STYLE_RESET_PATCH });
          }}
        >
          Reset styling
        </button>
      </>
    );
  };

  const renderBlockSizeControls = () => {
    if (!blockId || blockId === 'page_settings' || blockId === 'macro_keywords') return null;
    const layoutSpec = getBlockLayout(formConfig, blockId);
    const isAuto = layoutSpec.heightMode === 'auto' || blockId === 'stock_line_items';

    const showCanvasPos =
      formConfig.canvasLayout === 'free' || layoutSpec.freePosition;
    const isImageBlock = isForm8MediaBlockId(blockId);

    return (
      <div className="f8-block-size-controls mb-3">
        {showCanvasPos ? (
          <>
            {isImageBlock ? null : (
              <>
                <label className="form-label">Place from left (%)</label>
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
              </>
            )}
            <label className="form-label">Place from top (%)</label>
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
        <label className="form-label">Width on page (%)</label>
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
        {blockId === 'stock_line_items' ? null : (
          <>
            <label className="form-label">Box height</label>
            <select
              className="form-select form-select-sm mb-2"
              value={isAuto ? 'auto' : 'fixed'}
              onChange={(e) =>
                updateBlockLayout(blockId, {
                  heightMode: e.target.value,
                  heightMm: e.target.value === 'auto' ? null : layoutSpec.heightMm || 12,
                })
              }
            >
              <option value="fixed">Fixed box</option>
              <option value="auto">Grow with content</option>
            </select>
          </>
        )}
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

    if (
      blockId === 'layout_left_logo' ||
      blockId === 'layout_right_logo' ||
      blockId === 'layout_footer_image'
    ) {
      return <>{sizeControls}</>;
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
              <label className="form-custom-toggle-item mb-1">
                <input
                  type="checkbox"
                  checked={Boolean(field.enabled)}
                  onChange={(e) =>
                    updateSectionField(sectionId, field.id, { enabled: e.target.checked })
                  }
                />
                <span className="form-label small mb-0">{getAgreementFieldDisplayLabel(field)}</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={field.fieldLayout || 'half'}
                disabled={!field.enabled}
                onChange={(e) =>
                  updateSectionField(sectionId, field.id, { fieldLayout: e.target.value })
                }
              >
                {FRIENDLY_FIELD_LAYOUT_OPTIONS.map((opt) => (
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
          <div className="f8-builder-props-head-actions">
            <button type="button" className="f8-builder-props-close" onClick={onClose} aria-label="Clear selection">
              <FiX size={16} />
            </button>
            <button
              type="button"
              className="f8-builder-panel-hide"
              title="Hide properties"
              onClick={onCollapse}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
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

export default AgreementBuilderPropertiesPanel;
