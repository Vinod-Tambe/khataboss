/** Resolve pledged items from common loan API response shapes */
export const getLoanItems = (loan) => {
  if (!loan) return [];
  const candidates = [
    loan.items,
    loan.stocks,
    loan.stock_items,
    loan.Items,
    loan.girviItems,
  ];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length > 0) return list;
  }
  return Array.isArray(loan.items) ? loan.items : [];
};
