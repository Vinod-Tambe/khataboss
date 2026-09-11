const pad2 = (value) => String(value).padStart(2, '0');

/** Parse API / form values without UTC day-shift on date-only strings. */
export const parseAdminDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();
  const datePrefix = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (datePrefix) {
    const year = Number(datePrefix[1]);
    const month = Number(datePrefix[2]) - 1;
    const day = Number(datePrefix[3]);
    const local = new Date(year, month, day, 12, 0, 0, 0);
    return Number.isNaN(local.getTime()) ? null : local;
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** dd/mm/yyyy */
export const formatAdminDate = (value) => {
  const date = parseAdminDate(value);
  if (!date) return '—';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/** dd/mm/yyyy, hh:mm AM/PM */
export const formatAdminDateTime = (value) => {
  const date = parseAdminDate(value);
  if (!date) return '—';
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}, ${pad2(hours12)}:${pad2(date.getMinutes())} ${ampm}`;
};

/** yyyy-mm-dd for API / internal state */
export const toDateInputValue = (value) => {
  const date = parseAdminDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

/** DD/MM/YYYY for admin text date inputs */
export const toDateInputDisplay = (value) => {
  const formatted = formatAdminDate(value);
  return formatted === '—' ? '' : formatted;
};

/** Parse DD/MM/YYYY or DD-MM-YYYY to yyyy-mm-dd */
export const parseDateDisplayToInput = (value) => {
  if (!value) return '';

  const str = String(value).trim();
  const match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return '';

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return '';

  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }

  return toDateInputValue(date);
};

export const isValidDateInputValue = (value) =>
  Boolean(value && parseAdminDate(value) && /^\d{4}-\d{2}-\d{2}$/.test(String(value)));

/** yyyy-mm-ddThh:mm for <input type="datetime-local" /> */
export const toDateTimeInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const nowDateTimeInputValue = () => toDateTimeInputValue(new Date());

export const todayDateInputValue = () => toDateInputValue(new Date());

/** Scheduled = future publish, Live = visible to owners, Expired = past expiry */
export const getAnnouncementScheduleStatus = (item, now = new Date()) => {
  if (!item || item.ann_status !== 'Active') return 'Inactive';
  const publishAt = item.ann_publish_at ? new Date(item.ann_publish_at) : null;
  const expiresAt = item.ann_expires_at ? new Date(item.ann_expires_at) : null;
  if (publishAt && publishAt > now) return 'Scheduled';
  if (expiresAt && expiresAt <= now) return 'Expired';
  return 'Live';
};

export const isDateBeforeToday = (value) => {
  const date = parseAdminDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const compare = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  return compare < today;
};

export const computeExpiryFromPlan = (startDate, plan = {}) => {
  if (!plan || plan.plan_billing_cycle === 'Lifetime') return '';

  const start = parseAdminDate(startDate) || parseAdminDate(new Date());
  if (!start) return '';

  const durationDays = parseInt(plan.plan_duration_days, 10);
  let expiry;

  if (!Number.isNaN(durationDays) && durationDays > 0) {
    expiry = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  } else {
    expiry = new Date(start);
    switch (plan.plan_billing_cycle) {
      case 'Monthly':
        expiry.setMonth(expiry.getMonth() + 1);
        break;
      case 'Quarterly':
        expiry.setMonth(expiry.getMonth() + 3);
        break;
      case 'Yearly':
      default:
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
    }
  }

  return toDateInputValue(expiry);
};
