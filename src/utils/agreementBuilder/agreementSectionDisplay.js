import {
  FORM8_FIELD_DISPLAY_LABELS,
  FORM8_SECTION_DISPLAY_TITLES,
  getForm8FieldDisplayLabel as baseFieldLabel,
  getForm8FooterNoteTitle,
  getForm8SectionDisplayTitle as baseSectionTitle,
} from '../formTemplate/formSectionDisplay';

const AGREEMENT_SECTION_TITLES = {
  ...FORM8_SECTION_DISPLAY_TITLES,
  firm_details: 'Lender / Firm Details',
  customer_details: 'Borrower Details',
  loan_details: 'Loan Terms',
  finance_details: 'Finance Terms',
  emi_schedule: 'EMI Schedule',
  payment_summary: 'Payment Summary',
};

const AGREEMENT_FIELD_LABELS = {
  ...FORM8_FIELD_DISPLAY_LABELS,
  finance_no: 'Finance no.',
  finance_date: 'Start date',
  finance_prin_amt: 'Principal amount',
  finance_emi_amt: 'EMI amount',
  finance_no_of_emi: 'No. of EMIs',
  finance_roi: 'Rate of interest',
  finance_freq_type: 'Frequency',
  finance_time_period: 'Time period',
  finance_final_amt: 'Total payable',
  finance_status: 'Finance status',
  emi_no: 'EMI no.',
  emi_due_date: 'Due date',
  emi_amount: 'EMI amount',
  emi_paid_amt: 'Paid amount',
  emi_pending_amt: 'Pending amount',
  emi_status: 'EMI status',
  total_paid: 'Total paid',
  total_pending: 'Total pending',
  total_fine: 'Total fine',
  disbursement_mode: 'Disbursement mode',
};

export const getAgreementSectionDisplayTitle = (section) => {
  if (!section) return '';
  const id = section.id;
  if (id && AGREEMENT_SECTION_TITLES[id]) {
    return AGREEMENT_SECTION_TITLES[id];
  }
  return baseSectionTitle(section);
};

export const getAgreementFieldDisplayLabel = (field) => {
  if (!field) return '';
  if (field.id && AGREEMENT_FIELD_LABELS[field.id]) {
    return AGREEMENT_FIELD_LABELS[field.id];
  }
  return baseFieldLabel(field);
};

export { getForm8FooterNoteTitle as getAgreementFooterNoteTitle };
