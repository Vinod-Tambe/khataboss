/** Helpers for staff permission matrix UI (mirrors backend permissions catalog). */

export const MODULE_META = {
  firm: { label: "Firm access", icon: "bi-building" },
  account: { label: "Account access", icon: "bi-wallet2" },
  staff: { label: "Staff access", icon: "bi-person-badge" },
  user: { label: "User access", icon: "bi-people-fill" },
  moneyLender: { label: "Money Lender access", icon: "bi-cash-stack" },
  loan: { label: "Loan access", icon: "bi-journal-text" },
  finance: { label: "Finance access", icon: "bi-currency-rupee" },
  reports: { label: "Reports access", icon: "bi-bar-chart-line" },
  settings: { label: "Settings access", icon: "bi-gear-fill" },
  sms: { label: "SMS / Messaging access", icon: "bi-chat-dots-fill" },
};

export const emptyMatrixFromCatalog = (catalog = []) => {
  const matrix = {};
  for (const item of catalog) {
    const module = item.perm_module;
    const action = item.perm_action;
    if (!module || !action) continue;
    if (!matrix[module]) matrix[module] = {};
    matrix[module][action] = false;
  }
  return matrix;
};

export const mergePermissionMatrix = (base = {}, incoming = {}) => {
  const next = JSON.parse(JSON.stringify(base));
  for (const section of Object.keys(next)) {
    if (!incoming[section]) continue;
    for (const key of Object.keys(next[section])) {
      if (incoming[section][key] !== undefined) {
        next[section][key] = !!incoming[section][key];
      }
    }
  }
  return next;
};

export const groupCatalogByModule = (catalog = []) => {
  const groups = new Map();
  for (const item of catalog) {
    if (!item?.perm_module) continue;
    if (!groups.has(item.perm_module)) groups.set(item.perm_module, []);
    groups.get(item.perm_module).push(item);
  }

  return [...groups.entries()]
    .map(([module, items]) => ({
      module,
      items: [...items].sort(
        (a, b) => (a.perm_sort_order || 0) - (b.perm_sort_order || 0)
      ),
    }))
    .sort((a, b) => {
      const aOrder = a.items[0]?.perm_sort_order || 0;
      const bOrder = b.items[0]?.perm_sort_order || 0;
      return aOrder - bOrder;
    });
};

export const isMatrixFullySelected = (matrix = {}) =>
  Object.values(matrix).every((section) =>
    Object.values(section).every((val) => val === true)
  );

export const isSectionFullySelected = (matrix, section) => {
  const actions = matrix?.[section];
  if (!actions) return false;
  return Object.values(actions).every((val) => val === true);
};
