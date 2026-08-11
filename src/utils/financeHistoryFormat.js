/** Human-readable finance money-transaction labels for history. */
export function formatFinanceTransTypeLabel(item = {}) {
  const type = String(item.fm_trans_type || '').toUpperCase();
  const info = item.fm_pay_info || '';

  if (type === 'ROLLBACK') {
    if (/ROLLBACK_INT:/i.test(info)) return 'Rollback — Interest';
    if (/ROLLBACK_FINE:/i.test(info)) return 'Rollback — Fine / Collect';
    return 'Rollback — EMI';
  }
  if (type === 'INTEREST') return 'Interest Payment';
  if (type === 'FINE') return 'Fine / Collect Payment';
  if (type === 'CLOSE') return 'Close Payment';
  if (type === 'PAID') return 'EMI Payment';
  return item.fm_trans_type || '-';
}

export function formatFinanceTransDetail(item = {}) {
  const info = item.fm_pay_info || '';
  if (/^FINE:/i.test(info)) {
    const m = /FINE:([\d.]+)\|COLLECT:([\d.]+)/i.exec(info);
    if (m) return `Fine ₹${m[1]} · Collect ₹${m[2]}`;
  }
  if (/^ROLLBACK_FINE:/i.test(info)) {
    const m = /ROLLBACK_FINE:([\d.]+)\|COLLECT:([\d.]+)/i.exec(info);
    if (m) return `Fine ₹${m[1]} · Collect ₹${m[2]}`;
  }
  if (/^INT:/i.test(info)) {
    const m = /INT:([\d.]+)/i.exec(info);
    if (m) return `Interest ₹${m[1]}`;
  }
  if (/^ROLLBACK_INT:/i.test(info)) {
    const m = /ROLLBACK_INT:([\d.]+)/i.exec(info);
    if (m) return `Interest ₹${m[1]}`;
  }
  if (/^ROLLBACK_EMI:/i.test(info)) {
    const m = /ROLLBACK_EMI:([\d.]+)/i.exec(info);
    if (m) return `EMI ₹${m[1]}`;
  }
  return item.fm_other_info || item.fm_pay_info || '';
}
