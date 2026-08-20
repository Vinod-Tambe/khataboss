import moment from 'moment';
import { dispatchMessage } from '../api/smsApi';
import { getCustomerWhatsAppNo } from './customerFormatters';

export const FINANCE_RECEIPT_TEMPLATE = 'finance_collection_receipt';

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
}) {
  if (!firmId || (!toPhone && !toEmail)) {
    return { dispatched: false, reason: 'missing_contact' };
  }

  const formData = new FormData();
  formData.append('firmId', String(firmId));
  formData.append('templateKey', templateKey);
  if (toPhone) formData.append('toPhone', String(toPhone));
  if (toEmail) formData.append('toEmail', String(toEmail));
  formData.append('vars', JSON.stringify(vars || {}));
  if (pdfBlob && fileName) {
    formData.append(
      'document',
      pdfBlob instanceof File ? pdfBlob : new File([pdfBlob], fileName, { type: 'application/pdf' })
    );
  }

  const res = await dispatchMessage(formData);
  const wa = res.data?.whatsapp;
  const em = res.data?.email;

  if (wa?.success || em?.success) {
    return { dispatched: true, result: res.data };
  }

  return {
    dispatched: false,
    reason: wa?.message || em?.message || res.message || 'send_failed',
    result: res.data,
  };
}

/**
 * Send PDF on WhatsApp via backend only — no redirect, no navigator.share.
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
    3: String(amount ?? 0),
    4: transDate || moment().format('DD-MMM-YY'),
  };
}
