import {
  SUPPORT_TITLE_MIN,
  SUPPORT_TITLE_MAX,
  SUPPORT_BODY_MIN,
  SUPPORT_BODY_MAX,
} from '../constants/supportTicket';

/**
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export const validateSupportTicketFields = (title, body) => {
  const trimmedTitle = String(title ?? '').trim();
  const trimmedBody = String(body ?? '').trim();

  if (!trimmedTitle) {
    return { ok: false, message: 'Title is required.' };
  }
  if (trimmedTitle.length < SUPPORT_TITLE_MIN) {
    return {
      ok: false,
      message: `Title must be at least ${SUPPORT_TITLE_MIN} characters.`,
    };
  }
  if (trimmedTitle.length > SUPPORT_TITLE_MAX) {
    return {
      ok: false,
      message: `Title cannot exceed ${SUPPORT_TITLE_MAX} characters.`,
    };
  }
  if (!trimmedBody) {
    return { ok: false, message: 'Description is required.' };
  }
  if (trimmedBody.length < SUPPORT_BODY_MIN) {
    return {
      ok: false,
      message: `Description must be at least ${SUPPORT_BODY_MIN} characters.`,
    };
  }
  if (trimmedBody.length > SUPPORT_BODY_MAX) {
    return {
      ok: false,
      message: `Description cannot exceed ${SUPPORT_BODY_MAX} characters.`,
    };
  }

  return { ok: true };
};

export const isSupportTicketFormValid = (title, body) =>
  validateSupportTicketFields(title, body).ok;
