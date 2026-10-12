import React, { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiExternalLink,
  FiSave,
} from 'react-icons/fi';
import FormTemplatePreview from './FormTemplatePreview';
import Form8BuilderElementsPanel from './Form8BuilderElementsPanel';
import Form8BuilderPropertiesPanel from './Form8BuilderPropertiesPanel';
import Form8BuilderFitPreview from './Form8BuilderFitPreview';
import { getSortedSections, normalizeFormConfig } from '../../../utils/formTemplate/formTemplateConfig';
import { resolveForm8BuilderImageUrls } from '../../../utils/formTemplate/formTemplateImageAssets';

const Form8BuilderWorkspace = ({
  firmName,
  firm,
  formConfig,
  status,
  saving,
  onStatusChange,
  onSave,
  onDiscard,
  onPdfPreview,
  onPdfDownload,
  updateConfig,
  updateTheme,
  updateLayout,
  updateSection,
  updateSectionField,
  reorderSections,
  reorderSectionFields,
  updateSignatureLabel,
  reorderBuilderBlocks,
  addBlockFromPalette,
  removeBlockFromCanvas,
  toggleBlockOnCanvas,
  updateBlockLayout,
  updateFormAsset,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState('form_header');
  const [propertiesTab, setPropertiesTab] = useState('content');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const normalized = normalizeFormConfig(formConfig);
  const sections = getSortedSections(normalized);
  const imageUrls = useMemo(
    () => resolveForm8BuilderImageUrls(normalized, firm, { useSampleAssets: true }),
    [normalized, firm]
  );

  const handleSelectBlock = (blockId) => {
    setSelectedBlockId(blockId);
    setPropertiesTab('content');
  };

  return (
    <div className="f8-builder">
      <header className="f8-builder-topbar">
        <div className="f8-builder-topbar-left">
          <span className="f8-builder-brand">Form 8 Builder</span>
          <span className="f8-builder-firm">{firmName}</span>
        </div>
        <div className="f8-builder-topbar-actions">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onPdfPreview}>
            <FiExternalLink size={14} className="me-1" /> PDF
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onPdfDownload}>
            <FiDownload size={14} className="me-1" /> Download
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onDiscard}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary" onClick={onSave} disabled={saving}>
            <FiSave size={14} className="me-1" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div
        className={`f8-builder-body${leftPanelOpen ? '' : ' is-left-collapsed'}${rightPanelOpen ? '' : ' is-right-collapsed'}`}
      >
        <Form8BuilderElementsPanel
          config={normalized}
          sections={sections}
          selectedBlockId={selectedBlockId}
          onSelectBlock={handleSelectBlock}
          onReorderBlocks={reorderBuilderBlocks}
          onToggleBlockOnCanvas={toggleBlockOnCanvas}
          collapsed={!leftPanelOpen}
          onToggleCollapsed={() => setLeftPanelOpen(true)}
        />

        <main className="f8-builder-canvas-wrap f8-builder-canvas-wrap--fit">
          <div className="f8-builder-canvas-rails">
            <button
              type="button"
              className="f8-builder-rail-btn"
              title={leftPanelOpen ? 'Hide elements' : 'Show elements'}
              onClick={() => setLeftPanelOpen((v) => !v)}
            >
              {leftPanelOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </button>
            <button
              type="button"
              className="f8-builder-rail-btn f8-builder-rail-btn--end"
              title={rightPanelOpen ? 'Hide properties' : 'Show properties'}
              onClick={() => setRightPanelOpen((v) => !v)}
            >
              {rightPanelOpen ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>
          </div>
          <Form8BuilderFitPreview config={normalized}>
            {(fitScale) => (
              <FormTemplatePreview
                config={normalized}
                firmName={firmName}
                scale={fitScale}
                builderMode
                fitSinglePage
                selectedBlockId={selectedBlockId}
                onSelectBlock={handleSelectBlock}
                onBlockLayoutChange={updateBlockLayout}
                onReorderBlocks={reorderBuilderBlocks}
                onAddBlockFromPalette={addBlockFromPalette}
                onRemoveBlock={removeBlockFromCanvas}
                leftLogoUrl={imageUrls.leftLogoUrl}
                rightLogoUrl={imageUrls.rightLogoUrl}
                footerImageUrl={imageUrls.footerImageUrl}
                firmFormHeader={firm?.firm_form_header || ''}
                firmFormFooter={firm?.firm_form_footer || ''}
              />
            )}
          </Form8BuilderFitPreview>
        </main>

        <Form8BuilderPropertiesPanel
          collapsed={!rightPanelOpen}
          onToggleCollapsed={() => setRightPanelOpen(true)}
          blockId={selectedBlockId}
          propertiesTab={propertiesTab}
          onTabChange={setPropertiesTab}
          onClose={() => setSelectedBlockId('form_header')}
          formConfig={normalized}
          status={status}
          onStatusChange={onStatusChange}
          updateConfig={updateConfig}
          updateTheme={updateTheme}
          updateLayout={updateLayout}
          updateSection={updateSection}
          updateSectionField={updateSectionField}
          reorderSectionFields={reorderSectionFields}
          updateSignatureLabel={updateSignatureLabel}
          updateBlockLayout={updateBlockLayout}
          updateFormAsset={updateFormAsset}
          onToggleBlockOnCanvas={toggleBlockOnCanvas}
          firm={firm}
          imageUrls={imageUrls}
        />
      </div>
    </div>
  );
};

export default Form8BuilderWorkspace;
