import moment from 'moment';

const pluralize = (value, singular, plural) =>
  `${value} ${value === 1 ? singular : plural}`;

/** Parse stored date (YYYY-MM-DD or ISO) as local calendar day — no UTC day shift. */
export const toCalendarDay = (value) => {
  if (!value) return null;
  const datePart = String(value).trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return moment(datePart, 'YYYY-MM-DD', true).startOf('day');
  }
  const parsed = moment(value).startOf('day');
  return parsed.isValid() ? parsed : null;
};

/**
 * Format date range as: "1 day", "1 month 2 days", "1 year 1 month 2 days"
 * Loan start date is inclusive (same-day loan = "1 day").
 */
export const formatTimePeriod = (start, end = moment()) => {
  const startDate = toCalendarDay(start);
  const endDate = toCalendarDay(end) ?? moment().startOf('day');

  if (!startDate?.isValid() || !endDate?.isValid()) return '-';

  if (endDate.isBefore(startDate, 'day')) {
    return '0 days';
  }

  if (endDate.isSame(startDate, 'day')) {
    return '1 day';
  }

  const years = endDate.diff(startDate, 'years');
  const afterYears = startDate.clone().add(years, 'years');
  const months = endDate.diff(afterYears, 'months');
  const afterMonths = afterYears.clone().add(months, 'months');
  const days = endDate.diff(afterMonths, 'days');

  const parts = [];
  if (years > 0) parts.push(pluralize(years, 'year', 'years'));
  if (months > 0) parts.push(pluralize(months, 'month', 'months'));
  if (days > 0 || parts.length === 0) parts.push(pluralize(days, 'day', 'days'));

  return parts.join(' ');
};

export default formatTimePeriod;
