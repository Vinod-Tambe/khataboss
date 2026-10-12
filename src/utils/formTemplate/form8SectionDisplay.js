/** Builder / PDF friendly section headings (blocks keep legal labels in config). */
export const FORM8_SECTION_DISPLAY_TITLES = {
  firm_details: 'Firm Information',
  customer_details: 'Customer Information',
  loan_details: 'Loan Information',
  item_details: 'Stock Information',
  transaction_history: 'Payment Register',
  interest_summary: 'Account Summary',
  redemption_details: 'Redemption Information',
};

/** Short field labels for preview & PDF. */
export const FORM8_FIELD_DISPLAY_LABELS = {
  firm_name: 'Firm name',
  firm_shop_name: 'Shop name',
  firm_reg_no: 'Licence / registration no.',
  firm_address: 'Address',
  firm_phone_no: 'Phone',
  firm_pan_no: 'PAN',
  firm_gstin_no: 'GSTIN',
  customer_name: 'Customer name',
  customer_address: 'Address',
  customer_mobile: 'Mobile',
  customer_aadhaar: 'Aadhaar / ID',
  customer_pan: 'Customer PAN',
  owner_name_address: 'Owner name & address',
  customer_photo: 'Customer photo',
  loan_no: 'Pledge / ticket no.',
  loan_date: 'Loan date',
  loan_amount: 'Principal amount (Rs.)',
  interest_rate: 'Interest rate',
  interest_type: 'Interest type',
  loan_period: 'Redemption period',
  due_date: 'Due date',
  loan_status: 'Pledge status',
  item_description: 'Item description',
  item_metal: 'Metal / type',
  item_gross_wt: 'Gross weight',
  item_net_wt: 'Net weight',
  item_purity: 'Purity / karat',
  item_pieces: 'No. of pieces',
  item_value: 'Value at pledge (Rs.)',
  payment_date: 'Payment date',
  principal_paid: 'Principal paid (Rs.)',
  interest_paid: 'Interest paid (Rs.)',
  balance_principal: 'Balance principal (Rs.)',
  balance_interest: 'Balance interest (Rs.)',
  initials: 'Initials',
  total_interest: 'Total interest (Rs.)',
  total_deposit: 'Total received (Rs.)',
  outstanding: 'Outstanding (Rs.)',
  last_transaction_date: 'Last payment date',
  date_of_redemption: 'Date of redemption',
  redeeming_person: 'Redeeming person',
  release_remarks: 'Remarks',
  today_date: 'Date',
};

const stripLeadingEnum = (label) =>
  String(label || '')
    .replace(/^\d+\.\s*/, '')
    .trim();

export const getForm8SectionDisplayTitle = (section) => {
  if (!section) return '';
  const id = section.id;
  if (id && FORM8_SECTION_DISPLAY_TITLES[id]) {
    return FORM8_SECTION_DISPLAY_TITLES[id];
  }
  const raw = section.label || id || '';
  return stripLeadingEnum(raw);
};

export const DEFAULT_FORM8_FOOTER_NOTE_TITLE = 'Footer note';

export const getForm8FooterNoteTitle = (config) => {
  const raw = config?.footerNoteTitle;
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim();
  }
  return DEFAULT_FORM8_FOOTER_NOTE_TITLE;
};

export const getForm8FieldDisplayLabel = (field) => {
  if (!field) return '';
  if (field.id && FORM8_FIELD_DISPLAY_LABELS[field.id]) {
    return FORM8_FIELD_DISPLAY_LABELS[field.id];
  }
  return stripLeadingEnum(field.label || field.id);
};
