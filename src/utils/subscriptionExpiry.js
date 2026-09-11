const WARNING_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

const pad2 = (value) => String(Math.max(0, value)).padStart(2, '0');

const parseExpiryDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  const str = String(value).trim();

  // yyyy-mm-dd or ISO datetime — always use the calendar date in local time
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

const getExpiryEnd = (expiryDate) => {
  const date = parseExpiryDate(expiryDate);
  if (!date) return null;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const isSubscriptionExpired = (expiryDate, now = new Date()) => {
  const end = getExpiryEnd(expiryDate);
  if (!end) return false;
  return now.getTime() > end.getTime();
};

export const getSubscriptionStatus = (expiryDate, now = new Date()) => {
  const end = getExpiryEnd(expiryDate);
  if (!end) {
    return {
      expired: false,
      showWarning: false,
      daysRemaining: null,
      hoursRemaining: null,
      expiryDate: null,
      expiryLabel: '',
    };
  }

  const msRemaining = end.getTime() - now.getTime();
  if (msRemaining <= 0) {
    return {
      expired: true,
      showWarning: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      msRemaining: 0,
      expiryDate: end,
      expiryLabel: end.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  }

  const daysRemaining = Math.floor(msRemaining / MS_PER_DAY);
  const hoursRemaining = Math.floor(msRemaining / MS_PER_HOUR);

  return {
    expired: false,
    showWarning: msRemaining <= WARNING_DAYS * MS_PER_DAY,
    daysRemaining,
    hoursRemaining,
    msRemaining,
    expiryDate: end,
    expiryLabel: end.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
};

export const getSubscriptionStatusFromUser = (user, now = new Date()) => {
  const expiryDate =
    user?.own_expiry_date ||
    user?.subscription?.expiry_date ||
    null;

  return getSubscriptionStatus(expiryDate, now);
};

export const userNeedsSubscriptionRefresh = (user) =>
  Boolean(user) && !Object.prototype.hasOwnProperty.call(user, 'own_expiry_date');

export const formatExpiryCountdownDigital = (status, now = new Date()) => {
  if (!status?.showWarning || status.expired) return '';

  const end = status.expiryDate || getExpiryEnd(status.expiryDate);
  if (!end) return '';

  const msRemaining = Math.max(0, end.getTime() - now.getTime());
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad2(days)}D:${pad2(hours)}H:${pad2(minutes)}M:${pad2(seconds)}S`;
};

export const formatExpiryCountdown = (status, now = new Date()) =>
  formatExpiryCountdownDigital(status, now);

export const formatExpiryBannerMessage = (status) => {
  if (!status?.showWarning || status.expired) return '';

  const datePart = status.expiryLabel ? ` (${status.expiryLabel})` : '';

  return `Your KhataBoss subscription expires soon${datePart}. Please renew to avoid login interruption.`;
};

export const getSubscriptionExpiryLoginNotice = (user, now = new Date()) => {
  const status = getSubscriptionStatusFromUser(user, now);
  if (!status.showWarning || status.expired) {
    return null;
  }

  return {
    message: formatExpiryBannerMessage(status),
    isUrgent: status.msRemaining !== null && status.msRemaining <= MS_PER_DAY,
  };
};

export const SUBSCRIPTION_EXPIRY_NOTICE_KEY = 'kb_subscription_expiry_notice';

export const storeSubscriptionExpiryLoginNotice = (user, now = new Date()) => {
  const notice = getSubscriptionExpiryLoginNotice(user, now);
  if (!notice?.message) {
    sessionStorage.removeItem(SUBSCRIPTION_EXPIRY_NOTICE_KEY);
    return false;
  }

  sessionStorage.setItem(SUBSCRIPTION_EXPIRY_NOTICE_KEY, JSON.stringify(notice));
  return true;
};

export const readSubscriptionExpiryLoginNotice = () => {
  try {
    const raw = sessionStorage.getItem(SUBSCRIPTION_EXPIRY_NOTICE_KEY);
    if (!raw) return null;
    const notice = JSON.parse(raw);
    return notice?.message ? notice : null;
  } catch {
    return null;
  }
};

export const clearSubscriptionExpiryLoginNotice = () => {
  sessionStorage.removeItem(SUBSCRIPTION_EXPIRY_NOTICE_KEY);
};

export { WARNING_DAYS };
