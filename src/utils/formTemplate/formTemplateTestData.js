import moment from 'moment';
import { SAMPLE_FIRM_LOGO_DATA_URL } from './formTemplatePreviewAssets';

/** Demo pledge data for Form 8 preview / PDF (matches training demo customer). */
export const buildFormTemplateTestData = (firmName = 'Sample Firm') => ({
  firm_name: firmName,
  firm_shop_name: `${firmName} — Main Branch`,
  firm_reg_no: 'ML-2024-00125',
  firm_address: 'Shop No. 12, Main Market Road, Near Bus Stand, Wagholi, Pune - 412207',
  firm_phone_no: '9876500101',
  firm_pan_no: 'ABCPR1234D',
  firm_gstin_no: '27ABCPR1234D1Z5',
  customer_name: 'Rajesh Patil',
  customer_address:
    'Shop No. 12, Main Market Road, Wagholi, Pune, Maharashtra - 412207',
  customer_mobile: '9876500101',
  customer_aadhaar: '2345-6789-0123',
  customer_pan: 'ABCPR1234D',
  customer_photo: 'On file',
  owner_name_address: 'Same as pawner (owner)',
  loan_no: 'GL-2026-00482',
  loan_date: moment().subtract(45, 'days').format('DD-MM-YYYY'),
  loan_amount: '1,50,000.00',
  interest_rate: '18% p.a. (Simple)',
  interest_type: 'Simple Monthly',
  loan_period: '12 Months',
  due_date: moment().add(320, 'days').format('DD-MM-YYYY'),
  loan_status: 'ACTIVE — Pledge in custody',
  item_description: 'Gold necklace with pendant (22K, 1 piece)',
  item_metal: 'Gold',
  item_gross_wt: '45.250 g',
  item_net_wt: '42.100 g',
  item_purity: '22K (916)',
  item_pieces: '1',
  item_value: '2,85,000.00',
  total_interest: '11,250.00',
  total_deposit: '15,000.00',
  outstanding: '1,36,250.00',
  last_transaction_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
  date_of_redemption: '—',
  redeeming_person: '—',
  release_remarks: 'Pledge active — not yet redeemed',
  payment_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
  principal_paid: '5,000.00',
  interest_paid: '2,250.00',
  balance_principal: '1,45,000.00',
  balance_interest: '9,000.00',
  initials: 'RP',
  txn_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
  txn_type: 'Deposit',
  txn_amount: '7,250.00',
  txn_narration: 'Partial interest + principal payment',
  today_date: moment().format('DD-MM-YYYY'),
  loan_amount_raw: 150000,
  outstanding_raw: 136250,
});

export const getFormFieldValue = (fieldId, data) =>
  data?.[fieldId] ?? '—';

export const getFieldTestValue = getFormFieldValue;

export const TRANSACTION_TEST_ROWS = [
  {
    payment_date: moment().subtract(45, 'days').format('DD-MM-YYYY'),
    principal_paid: '—',
    interest_paid: '—',
    balance_principal: '1,50,000.00',
    balance_interest: '—',
    initials: 'RP',
    txn_date: moment().subtract(45, 'days').format('DD-MM-YYYY'),
    txn_type: 'Opening',
    txn_amount: '1,50,000.00',
    txn_narration: 'Loan disbursed — principal',
  },
  {
    payment_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
    principal_paid: '5,000.00',
    interest_paid: '2,250.00',
    balance_principal: '1,45,000.00',
    balance_interest: '9,000.00',
    initials: 'RP',
    txn_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
    txn_type: 'Deposit',
    txn_amount: '7,250.00',
    txn_narration: 'Partial payment',
  },
];

export const STOCK_ITEM_TEST_ROWS = [
  {
    imageKey: 'stockItem0',
    metal: 'GOLD',
    item_name: 'Gold necklace with pendant',
    quantity: '1',
    gs_weight: '45.250 GM',
    nt_weight: '42.100 GM',
    purity: '22K (916)',
    fine_weight: '38.50',
    valuation: '2,85,000.00',
    previewImageUrl: SAMPLE_FIRM_LOGO_DATA_URL,
  },
];
