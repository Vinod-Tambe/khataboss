/** Convert API shape [{ name: amount }] → [{ name, value }] */
export const formatBalanceSheetItems = (arr = []) =>
  arr.map((item) => {
    const key = Object.keys(item)[0];
    return { name: key, value: Number(item[key]) || 0 };
  });

export const calculateBalanceSheetTotals = (balanceSheetData = {}) => {
  const assetList = formatBalanceSheetItems(balanceSheetData.assets);
  const liabilityList = formatBalanceSheetItems(balanceSheetData.liabilities);
  const totalAssets = assetList.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilityList.reduce((sum, l) => sum + l.value, 0);
  const diffBalance = totalAssets - totalLiabilities;
  const balancedTotal = Math.max(totalLiabilities, totalAssets);

  return {
    assetList,
    liabilityList,
    totalAssets,
    totalLiabilities,
    diffBalance,
    balancedTotal,
  };
};

export const formatCurrency = (val) => {
  const amount = Math.abs(parseFloat(val) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount;
};
