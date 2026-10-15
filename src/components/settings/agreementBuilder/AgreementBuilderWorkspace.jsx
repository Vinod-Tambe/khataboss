import React, { useMemo, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';
import AgreementTemplatePreview from './AgreementTemplatePreview';
import AgreementBuilderElementsPanel from './AgreementBuilderElementsPanel';
import AgreementBuilderPropertiesPanel from './AgreementBuilderPropertiesPanel';
import AgreementBuilderFitPreview from './AgreementBuilderFitPreview';
import { getSortedSections, normalizeAgreementConfig } from '../../../utils/agreementBuilder/templateConfig';
import { resolveFormBuilderImageUrls } from '../../../utils/formTemplate/formTemplateImageAssets';
import { parseSectionBlockId } from '../../../utils/formTemplate/formBuilderCatalog';
import { isForm8DividerBlockId, isForm8DividerPaletteId } from '../../../utils/formTemplate/formDividerBlocks';
import {
  getAgreementLoanTypeLabel,
  isAgreementSecuredTemplate,
  normalizeAgreementLoanType,
} from '../../../utils/agreementBuilder/loanType';
import { STOCK_ITEM_TEST_ROWS } from '../../../utils/agreementBuilder/testData';

const AgreementBuilderWorkspace = ({
  agreementType = 'Loan',
  firmName,
  loanType,
  firm,
  formConfig,
  status,
  saving,
  preparingPdf,
  previewFormData = null,
  previewTransactionRows = null,
  onStatusChange,
  onSave,
  onBackToList,
  onPdfPreview,
  updateConfig,
  updateTheme,
  updateLayout,
  updateSection,
  updateSectionField,
  reorderSectionFields,
  updateSignatureLabel,
  reorderBuilderBlocks,
  addBlockFromPalette,
  removeBlockFromCanvas,
  toggleBlockOnCanvas,
  updateBlockLayout,
  updateFormAsset,
  readOnly = false,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [propertiesTab, setPropertiesTab] = useState('content');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const normalized = useMemo(
    () => normalizeAgreementConfig(formConfig, agreementType, loanType),
    [formConfig, agreementType, loanType]
  );
  const sections = getSortedSections(normalized);
  const stockItemRows = useMemo(() => {
    if (agreementType === 'Finance' || !isAgreementSecuredTemplate(normalized)) return null;
    return STOCK_ITEM_TEST_ROWS;
  }, [agreementType, normalized]);
  const imageUrls = useMemo(
    () => resolveFormBuilderImageUrls(normalized, firm, { useSampleAssets: true }),
    [normalized, firm]
  );

  const builderTitle =
    agreementType === 'Finance' ? 'Finance Agreement Builder' : 'Loan Agreement Builder';

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
    <div className="f8-builder f8-builder--agreement">
      <header className="f8-builder-topbar">
        <div className="f8-builder-topbar-left">
          <span className="f8-builder-brand">{builderTitle}</span>
          <span className="f8-builder-firm">{firmName}</span>
          {agreementType === 'Finance' ? (
            <span className="badge bg-info-subtle text-info-emphasis">Finance Agreement</span>
          ) : (
            <span
              className={`badge ${
                normalizeAgreementLoanType(loanType || formConfig?.loanType) === 'secured'
                  ? 'bg-primary-subtle text-primary'
                  : 'bg-warning-subtle text-warning-emphasis'
              }`}
            >
              {getAgreementLoanTypeLabel(loanType || formConfig?.loanType)}
            </span>
          )}
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
          {readOnly ? (
            <span className="badge bg-secondary-subtle text-secondary">View only</span>
          ) : (
            <button type="button" className="btn btn-sm btn-primary" onClick={onSave} disabled={saving}>
              <FiSave size={14} className="me-1" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </header>

      <div
        className={`f8-builder-body${leftPanelOpen ? '' : ' is-left-collapsed'}${rightPanelOpen ? '' : ' is-right-collapsed'}`}
      >
        <AgreementBuilderElementsPanel
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
          <AgreementBuilderFitPreview config={normalized}>
            {(fitScale) => (
              <AgreementTemplatePreview
                config={normalized}
                firmName={firmName}
                testData={previewFormData}
                transactionRows={previewTransactionRows}
                stockItemRows={stockItemRows}
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
          </AgreementBuilderFitPreview>
        </main>

        <AgreementBuilderPropertiesPanel
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

export default AgreementBuilderWorkspace;
