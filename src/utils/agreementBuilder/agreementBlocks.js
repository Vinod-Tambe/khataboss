import {
  FORM8_BLOCK_META as BASE_BLOCK_META,
  FORM8_DEFAULT_BLOCK_ORDER,
  canRemoveForm8Block,
  canToggleForm8BlockOnCanvas,
  getForm8BlockOrder,
  getBlockLayout,
  isForm8BlockEnabled,
  isForm8RequiredBlock,
  normalizeBuilderBlockOrder,
} from '../formTemplate/formBuilderBlocks';
import { FINANCE_AGREEMENT_BLOCK_ORDER, isFinanceAgreementConfig } from './financeCanvas';
import { getLoanAgreementBlockOrder } from './loanAgreementCanvas';

export {
  FORM8_DEFAULT_BLOCK_ORDER as LOAN_AGREEMENT_BLOCK_ORDER,
  canRemoveForm8Block as canRemoveAgreementBlock,
  canToggleForm8BlockOnCanvas as canToggleAgreementBlockOnCanvas,
  getForm8BlockOrder as getAgreementBlockOrder,
  getBlockLayout,
  isForm8BlockEnabled as isAgreementBlockEnabled,
  isForm8RequiredBlock as isAgreementRequiredBlock,
  normalizeBuilderBlockOrder,
  FINANCE_AGREEMENT_BLOCK_ORDER,
};

export const AGREEMENT_BLOCK_META = {
  ...BASE_BLOCK_META,
  'section:loan_details': {
    label: 'Loan terms',
    group: 'sections',
  },
  stock_line_items: {
    label: 'Pledged articles',
    group: 'blocks',
  },
  'section:finance_details': {
    label: 'Finance desc',
    group: 'sections',
  },
  'section:emi_schedule': {
    label: 'EMI schedule',
    group: 'sections',
  },
  'section:payment_summary': {
    label: 'Payment summary',
    group: 'sections',
  },
};

export const getAgreementDefaultBlockOrder = (config) => {
  if (isFinanceAgreementConfig(config)) return FINANCE_AGREEMENT_BLOCK_ORDER;
  if (config?.agreementDocumentType === 'Loan' || config?.agreementDocumentType == null) {
    return getLoanAgreementBlockOrder(config);
  }
  return FORM8_DEFAULT_BLOCK_ORDER;
};
