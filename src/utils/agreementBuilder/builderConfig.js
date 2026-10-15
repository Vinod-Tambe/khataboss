import defaultLoanMeta from '../../data/defaultLoanAgreementTemplate.json';
import defaultFinanceMeta from '../../data/defaultFinanceAgreementTemplate.json';
import { applyAgreementLoanTypeToConfig, normalizeAgreementLoanType } from './loanType';
import { applyFinanceAgreementCanvas } from './financeCanvas';
import { applyLoanAgreementCanvas } from './loanAgreementCanvas';

export const normalizeAgreementType = (type) =>
  String(type || 'Loan').trim() === 'Finance' ? 'Finance' : 'Loan';

const loadMeta = (type) =>
  normalizeAgreementType(type) === 'Finance' ? defaultFinanceMeta : defaultLoanMeta;

const mergeFirmName = (config, firmName = '') => {
  const next = structuredClone(config);
  const replaceFirm = (val) =>
    typeof val === 'string'
      ? val.replace(/\{\{firm_name\}\}/g, firmName || '{{firm_name}}')
      : val;
  next.headerNote = replaceFirm(next.headerNote || '');
  next.footerNote = replaceFirm(next.footerNote || '');
  next.termsAndConditions = replaceFirm(next.termsAndConditions || '');
  next.declarationText = replaceFirm(next.declarationText || '');
  return next;
};

/** Builder-ready agreement config (canvas + JSON) — not Form 8 seed. */
export const buildAgreementBuilderConfig = (
  agreementType = 'Loan',
  loanType = 'secured',
  firmName = ''
) => {
  const docType = normalizeAgreementType(agreementType);
  const meta = loadMeta(docType);
  const resolvedLoanType =
    docType === 'Finance' ? 'secured' : normalizeAgreementLoanType(loanType);

  let merged = {
    title: meta.title || 'LOAN AGREEMENT',
    subtitle: meta.subtitle || '',
    complianceReference: meta.complianceReference || '',
    headerNote: meta.headerNote || '',
    footerNote: meta.footerNote || '',
    termsAndConditions: meta.termsAndConditions || '',
    declarationText: meta.declarationText || '',
    signatureLabels: { ...(meta.signatureLabels || {}) },
    variables: meta.variables?.length ? meta.variables : [],
    theme: { ...(meta.theme || {}) },
    layout: { ...(meta.layout || {}) },
    sections: Array.isArray(meta.sections) ? structuredClone(meta.sections) : [],
    pageSize: meta.pageSize || 'A4',
    orientation: meta.orientation || 'portrait',
    fontSize: meta.fontSize || 'medium',
    showPageNumbers: meta.showPageNumbers !== false,
    agreementDocumentType: docType,
    loanType: resolvedLoanType,
    canvasLayout: 'free',
    singlePageLayout: true,
    form8AllDescFields: false,
    builderBlockOrder: [],
    blockLayouts: {},
    assets: {},
  };

  merged = mergeFirmName(merged, firmName);

  if (docType === 'Finance') {
    merged = applyAgreementLoanTypeToConfig(merged, 'unsecured');
    merged.loanType = 'secured';
    merged.agreementDocumentType = 'Finance';
    merged = applyFinanceAgreementCanvas(merged);
  } else {
    merged = applyAgreementLoanTypeToConfig(merged, resolvedLoanType);
    merged = applyLoanAgreementCanvas(merged, resolvedLoanType);
  }

  return merged;
};
