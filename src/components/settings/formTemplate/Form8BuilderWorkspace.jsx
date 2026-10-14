import React, { useMemo, useState } from 'react';
import {
  FiSave,
} from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';
import FormTemplatePreview from './FormTemplatePreview';
import Form8BuilderElementsPanel from './Form8BuilderElementsPanel';
import Form8BuilderPropertiesPanel from './Form8BuilderPropertiesPanel';
import Form8BuilderFitPreview from './Form8BuilderFitPreview';
import { getSortedSections, normalizeFormConfig } from '../../../utils/formTemplate/formTemplateConfig';
import { resolveForm8BuilderImageUrls } from '../../../utils/formTemplate/formTemplateImageAssets';
import { parseSectionBlockId } from '../../../utils/formTemplate/form8BuilderCatalog';
import { isForm8DividerBlockId, isForm8DividerPaletteId } from '../../../utils/formTemplate/form8DividerBlocks';
import { getForm8LoanTypeLabel, normalizeForm8LoanType } from '../../../utils/formTemplate/form8LoanType';

const Form8BuilderWorkspace = ({
  firmName,
  loanType,
  firm,
  formConfig,
  status,
  saving,
  preparingPdf,
  onStatusChange,
  onSave,
  onBackToList,
  onPdfPreview,
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
  const [selectedBlockId, setSelectedBlockId] = useState(null);
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
    if (isForm8DividerPaletteId(blockId)) return;
    setSelectedBlockId(blockId || null);
    if (blockId && (parseSectionBlockId(blockId) || isForm8DividerBlockId(blockId))) {
      setPropertiesTab('advance');
    }
  };

  const handleDeselectBlock = () => {
    setSelectedBlockId(null);
  };

  return (
    <div className="f8-builder">
      <header className="f8-builder-topbar">
        <div className="f8-builder-topbar-left">
          <span className="f8-builder-brand">Form 8 Builder</span>
          <span className="f8-builder-firm">{firmName}</span>
          <span className={`badge ${normalizeForm8LoanType(loanType || formConfig?.loanType) === 'secured' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis'}`}>
            {getForm8LoanTypeLabel(loanType || formConfig?.loanType)}
          </span>
        </div>
        <div className="f8-builder-topbar-actions">
          {typeof onBackToList === 'function' ? (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onBackToList}>
              Back to list
            </button>
          ) : null}
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onPdfPreview} disabled={saving}>
            <FaFilePdf size={14} className="me-1" /> {preparingPdf ? 'Preparing…' : saving ? 'Saving…' : 'View'}
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
          onCollapse={() => setLeftPanelOpen(false)}
        />

        <main
          className="f8-builder-canvas-wrap f8-builder-canvas-wrap--fit"
          onPointerDown={(e) => {
            if (e.target.closest('.f8-builder-block')) return;
            handleDeselectBlock();
          }}
        >
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
          onCollapse={() => setRightPanelOpen(false)}
          blockId={selectedBlockId}
          propertiesTab={propertiesTab}
          onTabChange={setPropertiesTab}
          onClose={handleDeselectBlock}
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
