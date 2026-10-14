import moment from 'moment';
import { toCalendarDay } from '../formatTimePeriod';
import { getLoanInterestSummary } from '../loanInterest';

/** Form 8 item 8 / due date — standard agreed redemption window when not stored on loan. */
const FORM8_DEFAULT_REDEMPTION_MONTHS = 12;

const buildForm8AgreedRedemptionPeriod = () =>
  FORM8_DEFAULT_REDEMPTION_MONTHS === 12
    ? '12 months'
    : `${FORM8_DEFAULT_REDEMPTION_MONTHS} months`;

const buildForm8RedemptionDueDate = (loanDetails) => {
  const start = toCalendarDay(loanDetails?.girv_start_date);
  if (!start?.isValid()) return '—';
  return start.clone().add(FORM8_DEFAULT_REDEMPTION_MONTHS, 'months').format('DD-MM-YYYY');
};

const formatMoney = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (value, fallback = '—') => {
  if (!value) return fallback;
  const m = moment(value);
  return m.isValid() ? m.format('DD-MM-YYYY') : fallback;
};

const formatAmtCell = (value) => {
  const num = Number(value) || 0;
  return num > 0 ? formatMoney(num) : '—';
};

const buildAddress = (parts = []) => parts.filter(Boolean).join(', ') || '—';

const dash = (value) => {
  const text = value == null ? '' : String(value).trim();
  return text || '—';
};

const formatFirmType = (value) => {
  const raw = dash(value);
  if (raw === '—') return raw;
  return raw
    .replace(/_/g, ' ')
    .replace(/\b(pvt|ltd|llp)\b/gi, (part) => part.toUpperCase())
    .replace(/\b\w/g, (part) => part.toUpperCase());
};

const formatOptionalMoney = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '—';
  return formatMoney(num);
};

const formatAadhaar = (value) => {
  if (!value) return '—';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length >= 4) return `XXXX-XXXX-${digits.slice(-4)}`;
  return String(value);
};

const getLoanItems = (loan) => {
  if (!loan) return [];
  const candidates = [
    loan.items,
    loan.stocks,
    loan.stock_items,
    loan.Items,
    loan.girviItems,
  ];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length > 0) return list;
  }
  return Array.isArray(loan.items) ? loan.items : [];
};

const buildItemSummary = (items = []) => {
  if (!items.length) return '—';
  return items
    .map((item) => {
      const name = item.st_item_name || 'Item';
      const qty = item.st_quantity ?? 1;
      const metal = item.st_metal_type ? ` (${item.st_metal_type})` : '';
      return `${name}${metal} × ${qty}`;
    })
    .join('; ');
};

const buildMetalSummary = (items = []) => {
  const types = [...new Set(items.map((i) => i.st_metal_type).filter(Boolean))];
  return types.length ? types.join(', ') : '—';
};

const sumWeight = (items, field, typeField) => {
  const total = items.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
  if (!total) return '—';
  const unit = items.find((i) => i[typeField])?.[typeField] || 'GM';
  return `${total.toFixed(3)} ${unit}`;
};

const sumValuation = (items) =>
  formatMoney(items.reduce((sum, item) => sum + (parseFloat(item.st_final_valuation) || 0), 0));

const sumPieces = (items) => {
  const total = items.reduce((sum, item) => sum + (parseFloat(item.st_quantity) || 0), 0);
  return total > 0 ? String(total) : '—';
};

const buildPuritySummary = (items = []) => {
  const values = items.map((i) => i.st_purity).filter(Boolean);
  return values.length ? values.join(', ') : '—';
};

const buildRedemptionInfo = (loanDetails) => {
  const status = String(loanDetails.girv_status || '').toUpperCase();
  const releases = loanDetails.releases || [];

  if (status === 'RELEASED' && releases.length) {
    const last = releases[releases.length - 1];
    const person =
      last.rel_other_user_name ||
      [loanDetails.user?.user_first_name, loanDetails.user?.user_last_name].filter(Boolean).join(' ') ||
      '—';
    const address = last.rel_other_user_address || buildAddress([
      loanDetails.user?.user_curr_address || loanDetails.user?.user_per_address,
      loanDetails.user?.user_city,
      loanDetails.user?.user_state,
    ]);
    return {
      date_of_redemption: formatDate(last.rel_trans_date),
      redeeming_person: address && address !== '—' ? `${person}, ${address}` : person,
      release_remarks: 'Loan released — pledge redeemed',
    };
  }

  if (status === 'TRANSFERRED') {
    return {
      date_of_redemption: formatDate(loanDetails.updatedAt || loanDetails.updated_at),
      redeeming_person: loanDetails.girv_other_info || 'Transferred to another firm',
      release_remarks: 'Loan transferred',
    };
  }

  if (status === 'AUCTION') {
    return {
      date_of_redemption: '—',
      redeeming_person: '—',
      release_remarks: 'Pledge marked for auction',
    };
  }

  return {
    date_of_redemption: '—',
    redeeming_person: '—',
    release_remarks: 'Pledge active — not yet redeemed',
  };
};

export const buildForm8PaymentRows = (loanDetails, interestSummary) => {
  const rows = [];
  let balancePrincipal = interestSummary.originalPrincipal;

  rows.push({
    payment_date: formatDate(loanDetails.girv_start_date),
    principal_paid: '—',
    interest_paid: '—',
    balance_principal: formatMoney(balancePrincipal),
    balance_interest: '—',
    initials: '—',
    txn_date: formatDate(loanDetails.girv_start_date),
    txn_type: 'Opening',
    txn_amount: formatMoney(interestSummary.originalPrincipal),
    txn_narration: 'Initial loan disbursement',
  });

  [...(loanDetails.additionalPrincipals || [])]
    .sort((a, b) => moment(a.ap_trans_date).valueOf() - moment(b.ap_trans_date).valueOf())
    .forEach((ap, idx) => {
      const amount = parseFloat(ap.ap_prin_amt) || 0;
      balancePrincipal += amount;
      rows.push({
        payment_date: formatDate(ap.ap_trans_date),
        principal_paid: '—',
        interest_paid: '—',
        balance_principal: formatMoney(balancePrincipal),
        balance_interest: '—',
        initials: '—',
        txn_date: formatDate(ap.ap_trans_date),
        txn_type: 'Additional Principal',
        txn_amount: formatMoney(amount),
        txn_narration: `Additional principal #${idx + 1}`,
      });
    });

  if (interestSummary.firstMonthInterest > 0 && loanDetails.girv_first_int === 'Y') {
    rows.push({
      payment_date: formatDate(loanDetails.girv_start_date),
      principal_paid: '—',
      interest_paid: formatMoney(interestSummary.firstMonthInterest),
      balance_principal: formatMoney(balancePrincipal),
      balance_interest: '—',
      initials: '—',
      txn_date: formatDate(loanDetails.girv_start_date),
      txn_type: 'First Month Interest',
      txn_amount: formatMoney(interestSummary.firstMonthInterest),
      txn_narration: 'Prepaid first month interest',
    });
  }

  const payments = [
    ...(loanDetails.deposits || []).map((dep) => ({ ...dep, kind: 'deposit' })),
    ...(loanDetails.releases || []).map((rel) => ({ ...rel, kind: 'release' })),
  ].sort((a, b) => {
    const dateA = a.dep_trans_date || a.rel_trans_date;
    const dateB = b.dep_trans_date || b.rel_trans_date;
    return moment(dateA).valueOf() - moment(dateB).valueOf();
  });

  payments.forEach((entry, idx) => {
    const isDeposit = entry.kind === 'deposit';
    const date = isDeposit ? entry.dep_trans_date : entry.rel_trans_date;
    const principal = parseFloat(isDeposit ? entry.dep_prin_amt : entry.rel_prin_amt) || 0;
    const interest = parseFloat(isDeposit ? entry.dep_int_amt : entry.rel_int_amt) || 0;
    balancePrincipal = Math.max(0, balancePrincipal - principal);

    rows.push({
      payment_date: formatDate(date),
      principal_paid: formatAmtCell(principal),
      interest_paid: formatAmtCell(interest),
      balance_principal: formatMoney(balancePrincipal),
      balance_interest: idx === payments.length - 1 ? formatMoney(interestSummary.pendingInterest) : '—',
      initials: '—',
      txn_date: formatDate(date),
      txn_type: isDeposit ? 'Deposit' : 'Release',
      txn_amount: formatMoney(principal + interest),
      txn_narration: isDeposit ? `Deposit #${idx + 1}` : `Release #${idx + 1}`,
    });
  });

  if (!payments.length && interestSummary.pendingInterest > 0) {
    rows[rows.length - 1].balance_interest = formatMoney(interestSummary.pendingInterest);
  }

  return rows;
};

/**
 * Maps live loan + customer data to form template field ids.
 */
export const buildFormTemplateLoanData = (loanDetails, customer = null) => {
  if (!loanDetails) {
    return { formData: {}, transactionRows: [], firmName: '', loanItems: [] };
  }

  const firm = loanDetails.firm || {};
  const user = customer || loanDetails.user || {};
  const items = getLoanItems(loanDetails);
  const today = moment();
  const interestSummary = loanDetails.interest_summary || getLoanInterestSummary(loanDetails, today);
  const redemption = buildRedemptionInfo(loanDetails);

  const customerName = user.user_first_name
    ? `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim()
    : '—';
  const customerAddress = buildAddress([
    user.user_curr_address || user.user_per_address,
    user.user_village,
    user.user_city,
    user.user_state,
  ]);

  const totalDeposits =
    (interestSummary.totalDepositsPrincipal || 0) +
    (interestSummary.totalDepositsInterest || 0) +
    (interestSummary.totalReleasesPrincipal || 0) +
    (interestSummary.totalReleasesInterest || 0) +
    (interestSummary.firstMonthInterest || 0);

  const outstanding =
    loanDetails.girv_status === 'RELEASED' || loanDetails.girv_status === 'TRANSFERRED'
      ? 0
      : interestSummary.currentTotalPrincipal +
        interestSummary.origInterest +
        interestSummary.additionalInterestTotal -
        interestSummary.firstMonthInterest;

  const lastPaymentDate = (() => {
    const dates = [
      ...(loanDetails.deposits || []).map((d) => d.dep_trans_date),
      ...(loanDetails.releases || []).map((r) => r.rel_trans_date),
    ].filter(Boolean);
    if (!dates.length) return '—';
    return formatDate(dates.sort((a, b) => moment(b).valueOf() - moment(a).valueOf())[0]);
  })();

  const interestMethodLabel = interestSummary.interestMethod
    ? `${interestSummary.interestMethod}`.toUpperCase() +
      (interestSummary.interestMethod === 'compound' && interestSummary.compoundFreq
        ? ` (${interestSummary.compoundFreq.toUpperCase()})`
        : '')
    : 'SIMPLE';

  const formData = {
    firm_name: dash(firm.firm_name),
    firm_shop_name: dash(firm.firm_shop_name),
    firm_reg_no: dash(firm.firm_reg_no),
    firm_phone_no: dash(firm.firm_phone_no),
    firm_email_id: dash(firm.firm_email_id),
    firm_website_link: dash(firm.firm_website_link),
    firm_city: dash(firm.firm_city),
    firm_pincode: dash(firm.firm_pincode),
    firm_type: formatFirmType(firm.firm_type),
    firm_owner: dash(firm.firm_owner),
    firm_desc: dash(firm.firm_desc),
    firm_address: dash(firm.firm_address),
    firm_pan_no: dash(firm.firm_pan_no),
    firm_gstin_no: dash(firm.firm_gstin_no),
    firm_adhaar_no: dash(firm.firm_adhaar_no),
    customer_id: dash(user.user_unique_code || (user.user_id != null ? `C${user.user_id}` : '')),
    customer_name: customerName,
    customer_father_name: dash(user.user_father_name),
    customer_mobile: dash(user.user_mobile_no),
    customer_phone: dash(user.user_phone_no),
    customer_whatsapp: dash(user.user_whatsapp_no),
    customer_email: dash(user.user_email_id),
    customer_gender: dash(user.user_gender),
    customer_aadhaar: formatAadhaar(user.user_adhaar_no),
    customer_pan: dash(user.user_pan_no),
    customer_gstin: dash(user.user_gstin),
    customer_address: dash(user.user_per_address) === '—' ? customerAddress : dash(user.user_per_address),
    customer_current_address: dash(user.user_curr_address),
    customer_city: dash(user.user_city),
    customer_state: dash(user.user_state),
    customer_pincode: dash(user.user_pincode),
    customer_photo: user.user_profile_img || user.user_image || user.ur_image ? 'Photo attached' : '—',
    owner_name_address: redemption.redeeming_person !== '—' && loanDetails.girv_status === 'RELEASED'
      ? redemption.redeeming_person
      : 'Same as customer',
    loan_no: dash(
      loanDetails.girv_unique_code || loanDetails.girv_loan_no || loanDetails.girv_id
    ),
    loan_date: formatDate(loanDetails.girv_start_date),
    loan_amount: formatMoney(interestSummary.originalPrincipal),
    loan_packet_no: dash(loanDetails.girv_packet_no),
    loan_locker_no: dash(loanDetails.girv_locker_no),
    interest_rate:
      interestSummary.roi != null && interestSummary.roi !== ''
        ? `${interestSummary.roi}%`
        : '—',
    interest_type: interestMethodLabel,
    interest_option: dash(loanDetails.girv_roi_type),
    loan_process_amt: formatOptionalMoney(loanDetails.girv_process_amt),
    loan_charge_amt: formatOptionalMoney(loanDetails.girv_charge_amt),
    loan_period: buildForm8AgreedRedemptionPeriod(),
    due_date: buildForm8RedemptionDueDate(loanDetails),
    loan_status: dash(loanDetails.girv_status || 'ACTIVE').toUpperCase(),
    item_description: buildItemSummary(items),
    item_metal: buildMetalSummary(items),
    item_gross_wt: sumWeight(items, 'st_gs_weight', 'st_gs_type'),
    item_net_wt: sumWeight(items, 'st_nt_weight', 'st_nt_type'),
    item_purity: buildPuritySummary(items),
    item_pieces: sumPieces(items),
    item_value: sumValuation(items),
    total_interest: formatMoney(interestSummary.totalInterest),
    total_deposit: formatMoney(totalDeposits),
    outstanding: formatMoney(outstanding),
    last_transaction_date: lastPaymentDate,
    date_of_redemption: redemption.date_of_redemption,
    redeeming_person: redemption.redeeming_person,
    release_remarks: redemption.release_remarks,
    today_date: today.format('DD-MM-YYYY'),
    loan_amount_raw: interestSummary.originalPrincipal,
    outstanding_raw: outstanding,
  };

  return {
    formData,
    transactionRows: buildForm8PaymentRows(loanDetails, interestSummary),
    firmName: firm.firm_name || '',
    loanRef: formData.loan_no,
    loanItems: items,
  };
};

export default buildFormTemplateLoanData;
