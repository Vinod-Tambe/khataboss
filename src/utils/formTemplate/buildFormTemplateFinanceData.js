import moment from 'moment';
import { getFinanceTimePeriod } from '../listFormatters';

const formatMoney = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;
  const m = moment(value);
  return m.isValid() ? m.format('DD-MM-YYYY') : fallback;
};

const buildAddress = (parts = []) => parts.filter(Boolean).join(', ') || '—';

const formatAadhaar = (value) => {
  if (!value) return '—';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length >= 4) return `XXXX-XXXX-${digits.slice(-4)}`;
  return String(value);
};

const formatEmiNo = (value) => {
  if (value == null || value === '') return '—';
  const raw = String(value).trim();
  return `EMI-${raw.replace(/^emi[-\s]?/i, '')}`;
};

const buildDisbursementMode = (finance) => {
  const modes = [];
  if (parseFloat(finance.fin_cash_amt) > 0) modes.push('Cash');
  if (parseFloat(finance.fin_bank_amt) > 0) modes.push('Bank');
  if (parseFloat(finance.fin_online_amt) > 0) modes.push('Online');
  if (parseFloat(finance.fin_card_amt) > 0) modes.push('Card');
  return modes.length ? modes.join(', ') : '—';
};

export const buildFinanceEmiRows = (financeData = {}, emiRows = []) => {
  const rows = (emiRows.length ? emiRows : financeData.finance_trans || []).map((item) => ({
    emi_no: formatEmiNo(item.ft_emi_no),
    emi_due_date: formatDate(item.ft_due_date),
    emi_amount: formatMoney(item.ft_emi_amt),
    emi_paid_amt: formatMoney(item.ft_paid_amt),
    emi_pending_amt: formatMoney(item.ft_pending_amt),
    emi_status: String(item.ft_emi_status || 'PENDING').toUpperCase(),
  }));

  return rows;
};

export const buildFormTemplateFinanceData = (
  financeData = {},
  initialFinance = {},
  customer = null,
  emiRows = []
) => {
  const finance = { ...initialFinance, ...financeData };
  const firm = finance.firm || initialFinance?.firm || {};
  const user = customer || finance.user || initialFinance?.user || {};
  const transactions = emiRows.length ? emiRows : finance.finance_trans || [];
  const today = moment();

  const customerName = user.user_first_name
    ? `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim()
    : '—';

  const totals = transactions.reduce(
    (acc, row) => {
      acc.paid += parseFloat(row.ft_paid_amt) || 0;
      acc.pending += parseFloat(row.ft_pending_amt) || 0;
      acc.fine += parseFloat(row.ft_fine_amt) || 0;
      return acc;
    },
    { paid: 0, pending: 0, fine: 0 }
  );

  const financeNo =
    finance.fin_unique_code ||
    (finance.fin_id ? `FIN-${finance.fin_id}` : '—');

  const formData = {
    firm_name: firm.firm_name || '—',
    firm_shop_name: firm.firm_shop_name || '—',
    firm_reg_no: firm.firm_reg_no || '—',
    firm_address: buildAddress([firm.firm_address, firm.firm_city, firm.firm_pincode]),
    firm_phone_no: firm.firm_phone_no || '—',
    firm_pan_no: firm.firm_pan_no || '—',
    customer_name: customerName,
    customer_address: buildAddress([
      user.user_curr_address || user.user_per_address,
      user.user_village,
      user.user_city,
      user.user_state,
    ]),
    customer_mobile: user.user_mobile_no || '—',
    customer_aadhaar: formatAadhaar(user.user_adhaar_no),
    customer_pan: user.user_pan_no || '—',
    finance_no: financeNo,
    finance_date: formatDate(finance.fin_start_date),
    finance_prin_amt: formatMoney(finance.fin_prin_amt),
    finance_emi_amt: formatMoney(finance.fin_emi_amt),
    finance_no_of_emi: finance.fin_no_of_emi != null ? String(finance.fin_no_of_emi) : '—',
    finance_roi: finance.fin_roi ? `${finance.fin_roi}%` : '—',
    finance_freq_type: String(finance.fin_freq_type || finance.fin_freq || '—').replace(/_/g, ' '),
    finance_time_period: getFinanceTimePeriod(finance) || '—',
    finance_final_amt: formatMoney(finance.fin_final_amt),
    finance_status: String(finance.fin_status || 'ACTIVE').toUpperCase(),
    total_paid: formatMoney(totals.paid),
    total_pending: formatMoney(totals.pending),
    total_fine: formatMoney(totals.fine),
    disbursement_mode: buildDisbursementMode(finance),
    today_date: today.format('DD-MM-YYYY'),
  };

  return {
    formData,
    transactionRows: buildFinanceEmiRows(finance, transactions),
    firmName: firm.firm_name || '',
    financeRef: financeNo,
  };
};

export default buildFormTemplateFinanceData;
