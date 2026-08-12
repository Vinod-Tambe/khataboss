import moment from 'moment';
import { normalizeRoiType } from './loanInterest';

const CLOSED_STATUSES = new Set(['RELEASED', 'CLOSED']);

export const loanHasTransactions = (loan) =>
  (loan?.additionalPrincipals?.length > 0) ||
  (loan?.deposits?.length > 0) ||
  (loan?.releases?.length > 0);

export const getLoanUpdateRules = (loan) => {
  const status = String(loan?.girv_status || '').toUpperCase();
  const hasTransactions = loanHasTransactions(loan);
  const isActive = status === 'ACTIVE';
  const isClosed = CLOSED_STATUSES.has(status);

  return {
    status,
    hasTransactions,
    isActive,
    isClosed,
    canUpdateFinancial: isActive && !hasTransactions,
    canUpdateInterest: isActive && !hasTransactions,
    canUpdateLoan: isActive && !hasTransactions,
    canUpdateDetails: isActive || (!isClosed && hasTransactions),
  };
};

export const getInterestUpdateBlockReason = (loan, hasEditPermission = true) => {
  if (!loan) return 'Loan details are not available.';
  if (!hasEditPermission) return 'You do not have permission to update loan interest settings.';

  const { status, hasTransactions, isActive, isClosed } = getLoanUpdateRules(loan);

  if (isClosed) {
    return `Interest settings cannot be changed because this loan is ${status.toLowerCase()}.`;
  }
  if (!isActive) {
    return `Interest settings can only be updated on active loans. Current status: ${status}.`;
  }
  if (hasTransactions) {
    return 'Interest settings cannot be changed after deposits, releases, or additional principal entries exist.';
  }

  return null;
};

export const validateInterestForm = (form) => {
  const roi = parseFloat(form.girv_roi);
  if (!form.girv_roi || Number.isNaN(roi) || roi <= 0) {
    return 'Rate of interest must be greater than 0.';
  }

  const method = String(form.girv_interest_method || '').toLowerCase();
  if (!['simple', 'compound'].includes(method)) {
    return 'Please select a valid interest method.';
  }

  if (method === 'compound') {
    const freq = String(form.girv_compound_freq || '').toLowerCase();
    const allowedFreq = ['monthly', 'quarterly', 'half_yearly', 'yearly'];
    if (!allowedFreq.includes(freq)) {
      return 'Please select a compound frequency.';
    }
  }

  const roiType = normalizeRoiType(form.girv_roi_type);
  if (!['monthly', 'annually'].includes(roiType)) {
    return 'Please select a valid interest option.';
  }

  return null;
};

export const buildGirviUpdatePayload = (loan, overrides = {}) => {
  const items = Array.isArray(loan?.items)
    ? loan.items.map((item) => ({
      st_metal_type: item.st_metal_type ? item.st_metal_type.toUpperCase() : 'GOLD',
      st_item_name: item.st_item_name || '',
      st_quantity: item.st_quantity || '',
      st_gs_weight: item.st_gs_weight || '',
      st_gs_type: item.st_gs_type || 'GM',
      st_nt_weight: item.st_nt_weight || '',
      st_nt_type: item.st_nt_type || 'GM',
      st_purity: item.st_purity ? String(item.st_purity).replace('%', '') : '100',
      st_rate: item.st_rate || '',
      st_fine_weight: item.st_fine_weight || '',
      st_valuation: item.st_valuation || item.st_final_valuation || '',
      st_image: item.st_image || null,
    }))
    : [];

  return {
    girv_uuid: loan.girv_uuid,
    girv_firm_id: loan.girv_firm_id,
    girv_user_id: loan.girv_user_id,
    girv_start_date: loan.girv_start_date
      ? moment(loan.girv_start_date).format('YYYY-MM-DD')
      : moment().format('YYYY-MM-DD'),
    girv_type: loan.girv_type ? loan.girv_type.toLowerCase() : 'secured',
    girv_prin_amt: loan.girv_prin_amt || '',
    girv_process_per: loan.girv_process_per || '',
    girv_process_amt: loan.girv_process_amt || '',
    girv_packet_no: loan.girv_packet_no || '',
    girv_locker_no: loan.girv_locker_no || '',
    girv_charge_per: loan.girv_charge_per || '',
    girv_charge_amt: loan.girv_charge_amt || '',
    girv_roi: loan.girv_roi || '',
    girv_roi_type: normalizeRoiType(loan.girv_roi_type || 'monthly'),
    girv_interest_method: loan.girv_interest_method || 'simple',
    girv_compound_freq: loan.girv_compound_freq || 'monthly',
    girv_other_info: loan.girv_other_info || '',
    girv_first_int: loan.girv_first_int === 'Y',
    girv_first_int_cr_acc_id: loan.girv_first_int_cr_acc_id || '',
    girv_first_int_dr_acc_id: loan.girv_first_int_dr_acc_id || '',
    girv_cash_acc_id: loan.girv_cash_acc_id || '',
    girv_cash_amt: loan.girv_cash_amt || '',
    girv_cash_info: loan.girv_cash_info || '',
    girv_bank_acc_id: loan.girv_bank_acc_id || '',
    girv_bank_amt: loan.girv_bank_amt || '',
    girv_bank_info: loan.girv_bank_info || '',
    girv_online_acc_id: loan.girv_online_acc_id || '',
    girv_online_amt: loan.girv_online_amt || '',
    girv_online_info: loan.girv_online_info || '',
    girv_card_acc_id: loan.girv_card_acc_id || '',
    girv_card_amt: loan.girv_card_amt || '',
    girv_card_info: loan.girv_card_info || '',
    girv_pay_info: loan.girv_pay_info || '',
    items,
    ...overrides,
  };
};
