import moment from 'moment';
import { buildFormTemplateTestData, TRANSACTION_TEST_ROWS } from './formTemplateTestData';

export const buildLoanAgreementTestData = (firmName = 'Sample Firm') =>
  buildFormTemplateTestData(firmName);

export const buildFinanceAgreementTestData = (firmName = 'Sample Firm') => ({
  firm_name: firmName,
  firm_shop_name: `${firmName} — Main Branch`,
  firm_reg_no: 'FIN-2024-00125',
  firm_address: '12, MG Road, Pune, Maharashtra - 411001',
  firm_phone_no: '9876543210',
  firm_pan_no: 'ABCDE1234F',
  customer_name: 'Rajesh Kumar Sharma',
  customer_address: 'Flat 302, Sai Residency, Kothrud, Pune - 411038',
  customer_mobile: '9123456789',
  customer_aadhaar: 'XXXX-XXXX-4521',
  customer_pan: 'FGHIJ5678K',
  finance_no: 'FIN-2026-00482',
  finance_date: moment().subtract(30, 'days').format('DD-MM-YYYY'),
  finance_prin_amt: '5,00,000.00',
  finance_emi_amt: '12,500.00',
  finance_no_of_emi: '48',
  finance_roi: '12%',
  finance_freq_type: 'MONTHLY',
  finance_time_period: '48 Months',
  finance_final_amt: '6,00,000.00',
  finance_status: 'ACTIVE',
  total_paid: '37,500.00',
  total_pending: '5,62,500.00',
  total_fine: '0.00',
  disbursement_mode: 'Bank',
  today_date: moment().format('DD-MM-YYYY'),
  emi_no: 'EMI-1',
  emi_due_date: moment().add(5, 'days').format('DD-MM-YYYY'),
  emi_amount: '12,500.00',
  emi_paid_amt: '12,500.00',
  emi_pending_amt: '0.00',
  emi_status: 'PAID',
});

export const FINANCE_EMI_TEST_ROWS = [
  {
    emi_no: 'EMI-1',
    emi_due_date: moment().subtract(25, 'days').format('DD-MM-YYYY'),
    emi_amount: '12,500.00',
    emi_paid_amt: '12,500.00',
    emi_pending_amt: '0.00',
    emi_status: 'PAID',
  },
  {
    emi_no: 'EMI-2',
    emi_due_date: moment().subtract(5, 'days').format('DD-MM-YYYY'),
    emi_amount: '12,500.00',
    emi_paid_amt: '12,500.00',
    emi_pending_amt: '0.00',
    emi_status: 'PAID',
  },
  {
    emi_no: 'EMI-3',
    emi_due_date: moment().add(25, 'days').format('DD-MM-YYYY'),
    emi_amount: '12,500.00',
    emi_paid_amt: '12,500.00',
    emi_pending_amt: '0.00',
    emi_status: 'PAID',
  },
];

export const getAgreementTestData = (type = 'Loan', firmName = 'Sample Firm') =>
  type === 'Finance'
    ? buildFinanceAgreementTestData(firmName)
    : buildLoanAgreementTestData(firmName);

export const getAgreementTransactionRows = (type = 'Loan') =>
  type === 'Finance' ? FINANCE_EMI_TEST_ROWS : TRANSACTION_TEST_ROWS;

export { TRANSACTION_TEST_ROWS };
