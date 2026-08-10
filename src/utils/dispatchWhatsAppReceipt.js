import { dispatchMessage } from '../api/smsApi';

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

export const LOAN_RECEIPT_TEMPLATE_BY_TYPE = {
  deposit: 'loan_deposit',
  release: 'loan_release',
  principal: 'loan_add_principal',
  add: 'loan_add_principal',
  transfer: 'loan_transfer',
};
