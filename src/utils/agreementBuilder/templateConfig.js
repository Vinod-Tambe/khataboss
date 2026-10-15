import defaultLoanAgreement from '../../data/defaultLoanAgreementTemplate.json';
import defaultFinanceAgreement from '../../data/defaultFinanceAgreementTemplate.json';
import {
  normalizeFormConfig,
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
  getSortedSections,
  getSortedFields,
  reorderList,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
  getFieldLayoutClass,
  PAGE_DIMENSIONS_MM,
  FONT_SIZE_MAP,
} from '../formTemplate/formTemplateConfig';
import { buildAgreementBuilderConfig, normalizeAgreementType } from './builderConfig';
import { normalizeAgreementLoanType } from './loanType';
import { applyFinanceAgreementCanvas } from './financeCanvas';
import { applyLoanAgreementCanvas } from './loanAgreementCanvas';

export const DEFAULT_LOAN_AGREEMENT_CONFIG = defaultLoanAgreement;
export const DEFAULT_FINANCE_AGREEMENT_CONFIG = defaultFinanceAgreement;

export const AGREEMENT_TYPES = [
  { id: 'Loan', label: 'Loan Agreement' },
  { id: 'Finance', label: 'Finance Agreement' },
];

export const normalizeAgreementConfig = (config, type = 'Loan', loanType = 'secured') => {
  const docType = normalizeAgreementType(type || config?.agreementDocumentType);
  const resolvedLoanType =
    docType === 'Finance' ? 'secured' : normalizeAgreementLoanType(loanType || config?.loanType);
  const base = buildAgreementBuilderConfig(docType, resolvedLoanType);
  if (!config) return normalizeFormConfig(base);

  let normalized = normalizeFormConfig({
    ...base,
    ...config,
    agreementDocumentType: docType,
    loanType: resolvedLoanType,
  });
  if (docType === 'Finance') {
    normalized = applyFinanceAgreementCanvas(normalized);
  } else {
    normalized = applyLoanAgreementCanvas(normalized, resolvedLoanType);
  }
  return normalized;
};

export {
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
  getSortedSections,
  getSortedFields,
  reorderList,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
  getFieldLayoutClass,
  PAGE_DIMENSIONS_MM,
  FONT_SIZE_MAP,
};
