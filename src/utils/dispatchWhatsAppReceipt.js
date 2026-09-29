import moment from 'moment';
import { dispatchMessage } from '../api/smsApi';
import { getCustomerWhatsAppNo } from './customerFormatters';

export const FINANCE_RECEIPT_TEMPLATE = 'finance_collection_receipt';
export const FINANCE_PAYMENT_TEMPLATE = 'finance_payment_received';
export const FINANCE_STATEMENT_TEMPLATE = 'finance_statement';
export const LOAN_DOCUMENT_TEMPLATE = 'loan_document';
export const LOAN_ALERT_TEMPLATE = 'loan_due_reminder';
export const LOAN_NOTICE_TEMPLATE = 'loan_notice';

/** Normalize 10-digit Indian mobile for API (backend adds country code). */
export function normalizeDispatchPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 10 ? digits : digits;
}

/** Open native SMS app with pre-filled body (Indian mobile). */
export function openSmsWithBody(phone, body) {
  const normalized = normalizeDispatchPhone(phone);
  if (normalized.length !== 10) {
    throw new Error('Valid customer mobile number is required for SMS.');
  }
  const text = String(body || '').trim();
  const href = text
    ? `sms:+91${normalized}?body=${encodeURIComponent(text)}`
    : `sms:+91${normalized}`;
  window.location.href = href;
}

/** Open WhatsApp chat to a number (fallback when no PDF context). */
export function openWhatsAppChat(phone) {
  const normalized = normalizeDispatchPhone(phone);
  if (normalized.length !== 10) {
    throw new Error('Valid customer mobile or WhatsApp number is required.');
  }
  window.open(`https://wa.me/91${normalized}`, '_blank', 'noopener,noreferrer');
}

const formatInr = (value) => {
  const n = Number(value) || 0;
  return `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMsgDate = (value) => {
  if (!value) return moment().format('DD-MMM-YY');
  const m = moment(value);
  return m.isValid() ? m.format('DD-MMM-YY') : String(value);
};

export const LOAN_RECEIPT_TEMPLATE_BY_TYPE = {
  deposit: 'loan_deposit',
  release: 'loan_release',
  principal: 'loan_add_principal',
  add: 'loan_add_principal',
  transfer: 'loan_transfer',
};

/**
 * Customer contact + ids from a finance record.
 */
export function getFinanceDispatchContext(initialFinance) {
  const customerName = initialFinance?.user?.user_first_name
    ? `${initialFinance.user.user_first_name} ${initialFinance.user.last_name || ''}`.trim()
    : 'Customer';

  return {
    firmId: initialFinance?.fin_firm_id || initialFinance?.firm?.firm_id,
    toPhone: getCustomerWhatsAppNo(initialFinance?.user),
    toEmail: initialFinance?.user?.user_email_id,
    customerName,
    regNo: String(initialFinance?.fin_unique_code || initialFinance?.fin_id || 'N/A'),
  };
}

/**
 * Try sending a receipt via the messaging dispatch API (WhatsApp / email).
 * Returns { dispatched: boolean, result?, reason? }
 */
export async function tryDispatchReceipt({
  firmId,
  templateKey,
  toPhone,
  toEmail,
  vars,
  pdfBlob,
  fileName,
  sendWhatsApp = true,
  sendEmail = true,
  sendSms = false,
}) {
  if (!firmId || (!toPhone && !toEmail)) {
    return { dispatched: false, reason: 'missing_contact' };
  }

  const normalizedPhone = toPhone ? normalizeDispatchPhone(toPhone) : '';

  const formData = new FormData();
  formData.append('firmId', String(firmId));
  formData.append('templateKey', templateKey);
  if (normalizedPhone) formData.append('toPhone', normalizedPhone);
  if (toEmail) formData.append('toEmail', String(toEmail));
  formData.append('vars', JSON.stringify(vars || {}));
  formData.append('sendWhatsApp', sendWhatsApp === false ? 'false' : 'true');
  formData.append('sendEmail', sendEmail === false ? 'false' : 'true');
  if (sendSms) formData.append('sendSms', 'true');
  if (pdfBlob && fileName) {
    formData.append(
      'document',
      pdfBlob instanceof File ? pdfBlob : new File([pdfBlob], fileName, { type: 'application/pdf' })
    );
  }

  const res = await dispatchMessage(formData);
  const payload = res?.data && typeof res.data === 'object' && ('whatsapp' in res.data || 'email' in res.data || 'sms' in res.data)
    ? res.data
    : res;
  const wa = payload?.whatsapp;
  const em = payload?.email;
  const sms = payload?.sms;

  if (wa?.success || em?.success || sms?.success) {
    return { dispatched: true, result: payload };
  }

  return {
    dispatched: false,
    reason: wa?.message || em?.message || sms?.message || res?.message || 'send_failed',
    result: payload,
  };
}

/**
 * Send PDF on WhatsApp via backend only — no redirect, no navigator.share.
 * Use for customer-facing documents (loan/finance receipts, invoices): pass customer mobile via getCustomerWhatsAppNo.
 * For internal reports (daybook, balance sheet, etc.) use sendReportWhatsAppPdf instead.
 * @throws {Error} with user-friendly message on failure
 */
export async function sendWhatsAppPdfOnly({
  firmId,
  toPhone,
  toEmail,
  templateKey,
  vars,
  pdfBlob,
  fileName,
}) {
  if (!firmId) {
    throw new Error('Firm not found. Select a firm and try again.');
  }
  if (!toPhone && !toEmail) {
    throw new Error('Customer mobile or email is required to send WhatsApp.');
  }
  if (!pdfBlob || !fileName) {
    throw new Error('PDF could not be generated.');
  }

  let dispatch;
  try {
    dispatch = await tryDispatchReceipt({
      firmId,
      templateKey,
      toPhone,
      toEmail,
      vars,
      pdfBlob,
      fileName,
    });
  } catch (err) {
    throw new Error(err.message || 'Failed to connect to messaging service.');
  }

  if (dispatch.dispatched) {
    const via = dispatch.result?.whatsapp?.success ? 'WhatsApp' : 'email';
    return { success: true, message: `PDF sent on ${via} successfully.` };
  }

  const reason = dispatch.reason || '';
  if (/not connected|scan qr/i.test(reason)) {
    throw new Error('WhatsApp is not connected. Open SMS → WhatsApp Settings and scan QR.');
  }
  if (/template.*not found/i.test(reason)) {
    throw new Error(`Message template missing. Add "${templateKey}" in SMS templates.`);
  }

  throw new Error(reason || 'Could not send WhatsApp message. Check WhatsApp settings.');
}

/** Build template vars for finance_collection_receipt */
export function buildFinanceReceiptVars(initialFinance, amount, transDate) {
  const ctx = getFinanceDispatchContext(initialFinance);
  return {
    1: ctx.customerName,
    2: ctx.regNo,
    3: formatInr(amount),
    4: formatMsgDate(transDate),
  };
}

/** Loan receipt WhatsApp vars (deposit / release / add principal). */
export function buildLoanReceiptVars(customer, loanDetails, amount, transDate, loanRefOverride) {
  const customerName = customer?.user_first_name
    ? `${customer.user_first_name} ${customer.user_last_name || ''}`.trim()
    : 'Customer';
  const loanNo =
    loanRefOverride ||
    loanDetails?.girv_unique_code ||
    loanDetails?.girv_loan_no ||
    loanDetails?.girv_id ||
    'N/A';
  return {
    1: customerName,
    2: String(loanNo),
    3: formatInr(amount),
    4: formatMsgDate(transDate),
  };
}

/** Form 8, agreement, or other loan PDF sent on WhatsApp. */
export function buildLoanDocumentVars(customer, loanDetails, documentLabel, transDate) {
  const customerName = customer?.user_first_name
    ? `${customer.user_first_name} ${customer.user_last_name || ''}`.trim()
    : 'Customer';
  const loanNo =
    loanDetails?.girv_unique_code ||
    loanDetails?.girv_loan_no ||
    loanDetails?.girv_id ||
    'N/A';
  return {
    1: customerName,
    2: String(loanNo),
    3: String(documentLabel || 'Loan Document'),
    4: formatMsgDate(transDate || loanDetails?.girv_start_date),
  };
}

/** EMI schedule / payment history PDF vars. */
export function buildFinanceStatementVars(initialFinance, statementLabel, transDate) {
  const ctx = getFinanceDispatchContext(initialFinance);
  return {
    1: ctx.customerName,
    2: ctx.regNo,
    3: String(statementLabel || 'Finance Statement'),
    4: formatMsgDate(transDate),
  };
}

/** Loan panel: customer contact + loan reference for messaging. */
export function getLoanDispatchContext(customer, loanDetails) {
  const customerName = customer?.user_first_name
    ? `${customer.user_first_name} ${customer.user_last_name || ''}`.trim()
    : 'Customer';
  const loanNo =
    loanDetails?.girv_unique_code ||
    loanDetails?.girv_loan_no ||
    (loanDetails?.girv_id ? `LN-${loanDetails.girv_id}` : 'N/A');

  return {
    firmId: loanDetails?.girv_firm_id || loanDetails?.firm?.firm_id,
    toPhone: getCustomerWhatsAppNo(customer),
    toEmail: customer?.user_email_id,
    customerName,
    loanNo: String(loanNo),
  };
}

/** Template vars for loan_due_reminder / loan_notice ({{1}}–{{4}}, firm_name on server). */
export function buildLoanReminderVars(ctx, amountDue, dueDate) {
  return {
    1: ctx.customerName,
    2: ctx.loanNo,
    3: formatInr(amountDue),
    4: formatMsgDate(dueDate),
  };
}

function summarizeDispatchResult(result) {
  const parts = [];
  if (result?.whatsapp?.success) parts.push('WhatsApp');
  if (result?.email?.success) parts.push('Email');
  if (result?.sms?.success) {
    parts.push(result.sms.preview ? 'SMS (draft opened)' : 'SMS');
  }
  return parts;
}

/**
 * Send loan payment reminder (Alert) or official notice using seeded templates.
 * @param {'alert'|'notice'} kind
 */
export async function dispatchLoanCustomerMessage({
  kind = 'alert',
  customer,
  loanDetails,
  amountDue,
  dueDate,
  channels = { whatsapp: true, email: true, sms: true },
  pdfBlob,
  fileName,
}) {
  const ctx = getLoanDispatchContext(customer, loanDetails);
  const templateKey = kind === 'notice' ? LOAN_NOTICE_TEMPLATE : LOAN_ALERT_TEMPLATE;
  const vars = buildLoanReminderVars(ctx, amountDue, dueDate);

  const wantWhatsApp = Boolean(channels.whatsapp);
  const wantEmail = Boolean(channels.email);
  const wantSms = Boolean(channels.sms);

  if (!ctx.firmId) {
    throw new Error('Firm not found for this loan.');
  }
  if (wantWhatsApp && !ctx.toPhone) {
    throw new Error('Customer mobile is required for WhatsApp.');
  }
  if (wantEmail && !ctx.toEmail) {
    throw new Error('Customer email is required for email.');
  }
  if (wantSms && !ctx.toPhone) {
    throw new Error('Customer mobile is required for SMS.');
  }
  if (!wantWhatsApp && !wantEmail && !wantSms) {
    throw new Error('Select at least one channel.');
  }
  if (!wantWhatsApp && !wantEmail && wantSms && !ctx.toPhone) {
    throw new Error('Customer mobile is required.');
  }

  const toPhone = ctx.toPhone && (wantWhatsApp || wantSms) ? ctx.toPhone : undefined;
  const toEmail = wantEmail ? ctx.toEmail : undefined;

  if (!toPhone && !toEmail) {
    throw new Error('Add customer mobile or email to send this message.');
  }

  let dispatch;
  try {
    dispatch = await tryDispatchReceipt({
      firmId: ctx.firmId,
      templateKey,
      toPhone,
      toEmail,
      vars,
      pdfBlob: kind === 'notice' ? pdfBlob : undefined,
      fileName: kind === 'notice' ? fileName : undefined,
      sendWhatsApp: wantWhatsApp,
      sendEmail: wantEmail,
      sendSms: wantSms,
    });
  } catch (err) {
    throw new Error(err.message || 'Failed to connect to messaging service.');
  }

  if (wantSms && dispatch.result?.sms?.formattedBody) {
    try {
      openSmsWithBody(ctx.toPhone, dispatch.result.sms.formattedBody);
    } catch (smsErr) {
      if (!dispatch.dispatched) {
        throw smsErr;
      }
    }
  }

  if (dispatch.dispatched) {
    const via = summarizeDispatchResult(dispatch.result);
    const label = kind === 'notice' ? 'Notice' : 'Payment reminder';
    return {
      success: true,
      message: via.length
        ? `${label} sent via ${via.join(', ')}.`
        : `${label} processed.`,
      result: dispatch.result,
    };
  }

  const reason = dispatch.reason || '';
  if (/not connected|scan qr/i.test(reason)) {
    throw new Error('WhatsApp is not connected. Open SMS → WhatsApp Settings and scan QR.');
  }
  if (/template.*not found/i.test(reason)) {
    throw new Error(`Message template missing. Add "${templateKey}" in SMS templates.`);
  }
  if (/email is not configured/i.test(reason)) {
    throw new Error('Email is not configured. Open Email Settings and save credentials.');
  }

  throw new Error(reason || 'Could not send message. Check messaging settings.');
}
