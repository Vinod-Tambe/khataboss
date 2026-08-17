import moment from 'moment';
import { formatTimePeriod } from '../../../utils/formatTimePeriod';
import {
  calculateInterest,
  getLoanInterestSummary,
  getTenureMonths,
} from '../../../utils/loanInterest';
import { resolveImageUrl } from '../../../utils/imageHelpers';

const formatMoney = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (value, fallback = '-') => {
  if (!value) return fallback;
  const m = moment(value);
  return m.isValid() ? m.format('DD-MM-YYYY') : fallback;
};

const getPaymentMode = (record, prefixes) => {
  if (!record) return '-';
  const modes = [];
  prefixes.forEach(({ key, label }) => {
    const amt = parseFloat(record[key]) || 0;
    if (amt > 0) modes.push(label);
  });
  return modes.length ? modes.join(' + ') : (record.dep_pay_info || record.ap_pay_info || record.rel_pay_info || record.girv_pay_info || '-');
};

const buildAddress = (parts = []) => parts.filter(Boolean).join(', ') || '-';

const getImageUrl = (img) => resolveImageUrl(img);

/**
 * Builds a reusable loan invoice data object from API loan + customer.
 * Keep this shape stable so LoanInvoiceTemplate stays reusable.
 */
export const buildLoanInvoiceData = (loanDetails, customer = null) => {
  if (!loanDetails) return null;

  const firm = loanDetails.firm || {};
  const today = moment();
  const startDate = moment(loanDetails.girv_start_date);
  const isUnsecured = loanDetails.girv_type === 'unsecured';

  const additionalPrincipals = loanDetails.additionalPrincipals || [];
  const deposits = loanDetails.deposits || [];
  const releases = loanDetails.releases || [];
  const items = loanDetails.items || [];

  const interestSummary = getLoanInterestSummary(loanDetails, today);
  const {
    originalPrincipal,
    currentTotalPrincipal,
    totalDepositsPrincipal,
    totalReleasesPrincipal,
    origInterest,
    additionalInterestTotal,
    totalInterest,
    firstMonthInterest,
    totalDepositsInterest,
    totalReleasesInterest,
    pendingInterest,
    roi,
    roiType,
    interestMethod,
    compoundFreq,
  } = interestSummary;

  const payableAmount =
    currentTotalPrincipal + origInterest + additionalInterestTotal - firstMonthInterest;
  const totalValuation = items.reduce((sum, item) => sum + (parseFloat(item.st_final_valuation) || 0), 0);
  const profitLoss = parseFloat((totalValuation - payableAmount).toFixed(2));
  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.st_nt_weight) || parseFloat(item.st_gs_weight) || 0), 0);

  // Unified chronological transaction ledger
  const rawTransactions = [];
  let runningBalance = originalPrincipal;

  rawTransactions.push({
    sortDate: startDate.valueOf(),
    date: formatDate(loanDetails.girv_start_date),
    type: 'Opening Balance',
    description: 'Initial loan disbursement',
    paymentMode: getPaymentMode(loanDetails, [
      { key: 'girv_cash_amt', label: 'Cash' },
      { key: 'girv_bank_amt', label: 'Bank' },
      { key: 'girv_online_amt', label: 'Online' },
      { key: 'girv_card_amt', label: 'Card' },
    ]),
    principal: originalPrincipal,
    interest: 0,
    discount: 0,
    extra: 0,
    balance: runningBalance,
    principalSigned: originalPrincipal,
  });

  if (firstMonthInterest > 0) {
    rawTransactions.push({
      sortDate: startDate.valueOf() + 1,
      date: formatDate(loanDetails.girv_start_date),
      type: 'First Month Interest',
      description: 'Prepaid first month interest',
      paymentMode: '-',
      principal: 0,
      interest: firstMonthInterest,
      discount: 0,
      extra: 0,
      balance: runningBalance,
      principalSigned: 0,
    });
  }

  additionalPrincipals.forEach((ap, idx) => {
    const apPrin = parseFloat(ap.ap_prin_amt) || 0;
    const apRoi = parseFloat(ap.ap_roi) || 0;
    const apDate = moment(ap.ap_trans_date);
    const apMonths = getTenureMonths(ap.ap_trans_date, today);
    const apInterest = calculateInterest(
      apPrin,
      apRoi,
      apMonths,
      interestMethod,
      compoundFreq,
      roiType
    );
    runningBalance += apPrin;

    rawTransactions.push({
      sortDate: apDate.valueOf(),
      date: formatDate(ap.ap_trans_date),
      type: 'Additional Principal',
      description: `Loan top-up #${idx + 1} @ ${apRoi}% ROI`,
      paymentMode: getPaymentMode(ap, [
        { key: 'ap_cash_amt', label: 'Cash' },
        { key: 'ap_bank_amt', label: 'Bank' },
        { key: 'ap_online_amt', label: 'Online' },
        { key: 'ap_card_amt', label: 'Card' },
      ]),
      principal: apPrin,
      interest: apInterest,
      discount: 0,
      extra: 0,
      balance: runningBalance,
      principalSigned: apPrin,
    });
  });

  deposits.forEach((dep, idx) => {
    const depPrin = parseFloat(dep.dep_prin_amt) || 0;
    const depInt = parseFloat(dep.dep_int_amt) || 0;
    const depDisc = parseFloat(dep.dep_disc_amt) || 0;
    const depExtra = parseFloat(dep.dep_extra_amt) || 0;
    const depDate = moment(dep.dep_trans_date);
    runningBalance = Math.max(0, runningBalance - depPrin);

    rawTransactions.push({
      sortDate: depDate.valueOf(),
      date: formatDate(dep.dep_trans_date),
      type: 'Deposit',
      description: `Payment / Deposit #${idx + 1}`,
      paymentMode: getPaymentMode(dep, [
        { key: 'dep_cash_amt', label: 'Cash' },
        { key: 'dep_bank_amt', label: 'Bank' },
        { key: 'dep_online_amt', label: 'Online' },
        { key: 'dep_card_amt', label: 'Card' },
      ]),
      principal: depPrin,
      interest: depInt,
      discount: depDisc,
      extra: depExtra,
      balance: runningBalance,
      principalSigned: -depPrin,
    });
  });

  releases.forEach((rel, idx) => {
    const relPrin = parseFloat(rel.rel_prin_amt) || 0;
    const relInt = parseFloat(rel.rel_int_amt) || 0;
    const relDisc = parseFloat(rel.rel_disc_amt) || 0;
    const relExtra = parseFloat(rel.rel_extra_amt) || 0;
    const relDate = moment(rel.rel_trans_date);
    runningBalance = Math.max(0, runningBalance - relPrin);

    rawTransactions.push({
      sortDate: relDate.valueOf(),
      date: formatDate(rel.rel_trans_date),
      type: 'Release Loan',
      description: `Loan release #${idx + 1}`,
      paymentMode: getPaymentMode(rel, [
        { key: 'rel_cash_amt', label: 'Cash' },
        { key: 'rel_bank_amt', label: 'Bank' },
        { key: 'rel_online_amt', label: 'Online' },
        { key: 'rel_card_amt', label: 'Card' },
      ]),
      principal: relPrin,
      interest: relInt,
      discount: relDisc,
      extra: relExtra,
      balance: runningBalance,
      principalSigned: -relPrin,
    });
  });

  if (loanDetails.girv_status === 'TRANSFERRED') {
    rawTransactions.push({
      sortDate: today.valueOf(),
      date: formatDate(loanDetails.updatedAt || loanDetails.updated_at || today),
      type: 'Transfer Loan',
      description: loanDetails.girv_other_info || 'Loan transferred to another firm',
      paymentMode: '-',
      principal: currentTotalPrincipal,
      interest: pendingInterest,
      discount: 0,
      extra: 0,
      balance: 0,
      principalSigned: -currentTotalPrincipal,
    });
  }

  rawTransactions.sort((a, b) => a.sortDate - b.sortDate);

  // Recalculate running balance in chronological order for accuracy
  let balance = 0;
  const transactions = rawTransactions.map((txn) => {
    if (txn.type === 'Opening Balance') {
      balance = txn.principal;
    } else if (txn.type === 'Additional Principal') {
      balance += txn.principal;
    } else if (txn.type === 'Deposit' || txn.type === 'Release Loan') {
      balance = Math.max(0, balance - txn.principal);
    } else if (txn.type === 'Transfer Loan') {
      balance = 0;
    }
    return {
      date: txn.date,
      type: txn.type,
      description: txn.description,
      paymentMode: txn.paymentMode,
      principal: formatMoney(txn.principal),
      interest: formatMoney(txn.interest),
      discount: formatMoney(txn.discount),
      extra: formatMoney(txn.extra),
      balance: formatMoney(balance),
      typeKey: txn.type,
    };
  });

  const customerName = customer
    ? `${customer.user_first_name || ''} ${customer.user_last_name || ''}`.trim()
    : loanDetails.user
      ? `${loanDetails.user.user_first_name || ''} ${loanDetails.user.user_last_name || ''}`.trim()
      : '-';

  const customerObj = customer || loanDetails.user || {};

  const interestMethodLabel = interestMethod
    ? interestMethod.toUpperCase() +
      (interestMethod === 'compound' && compoundFreq ? ` (${compoundFreq.toUpperCase()})` : '')
    : 'SIMPLE';

  return {
    firm: {
      name: firm.firm_name || 'Firm Name',
      address: firm.firm_address || '-',
      phone: firm.firm_phone_no || '-',
      email: firm.firm_email_id || '-',
      website: firm.firm_website_link || '-',
      logoUrl: getImageUrl(firm.firm_left_logo_img),
    },
    customer: {
      name: customerName || '-',
      address: buildAddress([
        customerObj.user_curr_address || customerObj.user_per_address,
        customerObj.user_village,
        customerObj.user_city,
        customerObj.user_state,
      ]),
      accountId: customerObj.user_id || loanDetails.girv_user_id || '-',
      mobile: customerObj.user_mobile_no || '-',
      email: customerObj.user_email_id || '-',
    },
    meta: {
      statementDate: today.format('DD-MM-YYYY'),
      loanRef: loanDetails.girv_unique_code || loanDetails.girv_loan_no || loanDetails.girv_uuid || loanDetails.girv_id || '-',
      packetNo: loanDetails.girv_packet_no || '-',
      lockerNo: loanDetails.girv_locker_no || '-',
      generatedOn: today.format('DD MMM YYYY, hh:mm A'),
    },
    status: (loanDetails.girv_status || 'ACTIVE').toUpperCase(),
    isUnsecured,
    loan: {
      loanNumber: loanDetails.girv_unique_code || loanDetails.girv_loan_no || loanDetails.girv_packet_no || loanDetails.girv_id || '-',
      startDate: formatDate(loanDetails.girv_start_date),
      roi: `${roi}% ${loanDetails.girv_roi_type ? loanDetails.girv_roi_type.toUpperCase() : ''}`.trim(),
      roiType: loanDetails.girv_roi_type ? loanDetails.girv_roi_type.toUpperCase() : '-',
      interestMethod: interestMethodLabel,
      originalPrincipal: formatMoney(originalPrincipal),
      currentPrincipal: formatMoney(currentTotalPrincipal),
      processingAmt: formatMoney(loanDetails.girv_process_amt),
      chargeAmt: formatMoney(loanDetails.girv_charge_amt),
      firstMonthInt: loanDetails.girv_first_int === 'Y',
      timePeriod: formatTimePeriod(startDate, today),
    },
    items: items.map((item) => ({
      metalType: (item.st_metal_type || '-').toUpperCase(),
      description: item.st_item_name || '-',
      quantity: item.st_quantity ?? '-',
      gsWeight: `${item.st_gs_weight || 0} ${item.st_gs_type || 'GM'}`,
      ntWeight: `${item.st_nt_weight || 0} ${item.st_nt_type || 'GM'}`,
      weight: parseFloat(item.st_nt_weight) || parseFloat(item.st_gs_weight) || 0,
      purity: item.st_purity ?? '-',
      fineWeight: item.st_fine_weight ?? '-',
      valuation: formatMoney(item.st_final_valuation),
    })),
    itemsTotal: {
      weight: `${totalWeight.toFixed(2)} GM`,
      valuation: formatMoney(totalValuation),
    },
    transactions,
    transfer:
      loanDetails.girv_status === 'TRANSFERRED'
        ? {
            info: loanDetails.girv_other_info || 'This loan has been transferred to another firm.',
            targetFirmId: loanDetails.girv_transfer_firm_id || '-',
            newLoanId: loanDetails.girv_transfer_girv_id || '-',
          }
        : null,
    summary: {
      totalPrincipalPaid: formatMoney(totalDepositsPrincipal + totalReleasesPrincipal),
      outstandingPrincipal: formatMoney(
        loanDetails.girv_status === 'RELEASED' || loanDetails.girv_status === 'TRANSFERRED'
          ? 0
          : currentTotalPrincipal
      ),
      totalInterestDue: formatMoney(pendingInterest),
      totalInterest: formatMoney(totalInterest),
      totalInterestPaid: formatMoney(
        totalDepositsInterest + totalReleasesInterest + firstMonthInterest
      ),
      firstMonthInterest: formatMoney(firstMonthInterest),
      totalPayable: formatMoney(
        loanDetails.girv_status === 'RELEASED' || loanDetails.girv_status === 'TRANSFERRED'
          ? 0
          : payableAmount
      ),
      totalValuation: formatMoney(totalValuation),
      profitLoss: formatMoney(Math.abs(profitLoss)),
      profitLossSign: profitLoss >= 0 ? '+' : '-',
      profitLossRaw: profitLoss,
    },
  };
};

export default buildLoanInvoiceData;
