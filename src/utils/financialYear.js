import moment from 'moment';

export function getFinancialYearMoments(reference = moment()) {
  const m = moment(reference);
  const currentYear = m.year();
  const isAfterMarch = m.month() >= 3;
  const fyStart = isAfterMarch
    ? moment(`${currentYear}-04-01`)
    : moment(`${currentYear - 1}-04-01`);
  const fyEnd = isAfterMarch
    ? moment(`${currentYear + 1}-03-31`)
    : moment(`${currentYear}-03-31`);
  return { fyStart, fyEnd };
}

export function getDefaultFinancialYearStrings() {
  const { fyStart, fyEnd } = getFinancialYearMoments();
  return {
    startDate: fyStart.format('YYYY-MM-DD'),
    endDate: fyEnd.format('YYYY-MM-DD'),
  };
}

export function getAssessmentYearLabel(endDate) {
  const end = moment(endDate);
  if (!end.isValid()) return '-';
  return end.month() >= 3
    ? `${end.year()} - ${end.year() + 1}`
    : `${end.year() - 1} - ${end.year()}`;
}
