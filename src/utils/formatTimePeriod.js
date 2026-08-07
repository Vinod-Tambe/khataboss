import moment from 'moment';

const pluralize = (value, singular, plural) =>
  `${value} ${value === 1 ? singular : plural}`;

/**
 * Format date range as: "1 day", "1 month 2 days", "1 year 1 month 2 days"
 */
export const formatTimePeriod = (start, end = moment()) => {
  const startDate = moment(start).startOf('day');
  const endDate = moment(end).startOf('day');

  if (!startDate.isValid() || !endDate.isValid()) return '-';

  if (endDate.isSameOrBefore(startDate)) {
    return '0 days';
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
