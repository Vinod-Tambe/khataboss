import moment from 'moment';
import { sendWhatsAppPdfOnly } from './dispatchWhatsAppReceipt';

/** WhatsApp template keys (seeded per firm). */
export const REPORT_WHATSAPP_TEMPLATES = {
  daybook: 'report_daybook',
  balanceSheet: 'report_balance_sheet',
  trialBalance: 'report_trial_balance',
  profitLoss: 'report_profit_loss',
};

/** Logged-in owner/staff mobile for internal reports. */
export function getLoggedInUserWhatsAppNo(authUser) {
  if (!authUser) return '';
  const mobile = String(
    authUser.own_mobile_no ||
      authUser.staff_mobile_no ||
      authUser.mobile ||
      authUser.user_mobile_no ||
      ''
  ).trim();
  const phone = String(authUser.own_phone_no || authUser.staff_phone_no || '').trim();
  return mobile || phone || '';
}

export function getLoggedInUserDisplayName(authUser) {
  if (!authUser) return 'User';
  const name = [authUser.own_first_name, authUser.own_last_name].filter(Boolean).join(' ').trim();
  return name || authUser.own_login_id || authUser.login_id || 'User';
}

/**
 * Firm id required for WhatsApp instance + templates (one session per firm).
 */
export function resolveWhatsAppFirmId(selectedFirm, firms = [], globalFirmId) {
  if (selectedFirm != null && selectedFirm !== '') {
    return selectedFirm;
  }
  if (globalFirmId != null && globalFirmId !== '' && globalFirmId !== 'all') {
    return globalFirmId;
  }
  if (Array.isArray(firms) && firms.length === 1) {
    return firms[0].firm_id;
  }
  return null;
}

/**
 * Send accounting report PDF to the logged-in user on WhatsApp (owner/staff mobile).
 */
export async function sendReportWhatsAppPdf({
  reportType,
  firmId,
  authUser,
  pdfBlob,
  fileName,
  reportLabel,
  periodText = '',
}) {
  const templateKey = REPORT_WHATSAPP_TEMPLATES[reportType];
  if (!templateKey) {
    throw new Error('Unknown report type for WhatsApp.');
  }
  if (!firmId) {
    throw new Error('Select a firm to send WhatsApp (WhatsApp is linked per firm).');
  }

  const toPhone = getLoggedInUserWhatsAppNo(authUser);
  if (!toPhone) {
    throw new Error('Your profile has no mobile number. Update it under Profile / Settings.');
  }

  const recipientName = getLoggedInUserDisplayName(authUser);

  return sendWhatsAppPdfOnly({
    firmId,
    toPhone,
    templateKey,
    vars: {
      1: recipientName,
      2: reportLabel || reportType,
      3: periodText || '—',
      4: moment().format('DD-MMM-YY'),
    },
    pdfBlob,
    fileName,
  });
}

export default sendReportWhatsAppPdf;
