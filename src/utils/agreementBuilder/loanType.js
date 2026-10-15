export {
  FORM8_LOAN_TYPES,
  FORM8_STOCK_BLOCK_ID as AGREEMENT_STOCK_BLOCK_ID,
  normalizeForm8LoanType as normalizeAgreementLoanType,
  isForm8SecuredTemplate as isAgreementSecuredTemplate,
  getForm8LoanTypeLabel as getAgreementLoanTypeLabel,
  applyForm8LoanTypeToConfig as applyAgreementLoanTypeToConfig,
} from '../formTemplate/formLoanType';
