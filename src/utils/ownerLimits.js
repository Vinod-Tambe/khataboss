/** Owner plan limits (firms / staff) for UI gating. */

const resolveLimit = (usageLimit, maxField) => {
  if (usageLimit != null && Number.isFinite(Number(usageLimit))) {
    return Number(usageLimit);
  }
  if (maxField != null && Number.isFinite(Number(maxField))) {
    return Number(maxField);
  }
  return null;
};

export const getFirmUsedCount = (user, firmCountFallback) => {
  const fromUsage = user?.usage?.firms?.used;
  if (fromUsage != null && firmCountFallback != null) {
    return Math.max(Number(fromUsage), Number(firmCountFallback));
  }
  if (fromUsage != null) return Number(fromUsage);
  if (firmCountFallback != null) return Number(firmCountFallback);
  return null;
};

export const getStaffUsedCount = (user, staffCountFallback) => {
  const fromUsage = user?.usage?.staff?.used;
  if (fromUsage != null && staffCountFallback != null) {
    return Math.max(Number(fromUsage), Number(staffCountFallback));
  }
  if (fromUsage != null) return Number(fromUsage);
  if (staffCountFallback != null) return Number(staffCountFallback);
  return null;
};

export const isAtFirmLimit = (user, firmCountFallback) => {
  const limit = resolveLimit(user?.usage?.firms?.limit, user?.own_max_firms);
  if (limit == null) return false;
  const used = getFirmUsedCount(user, firmCountFallback);
  if (used == null) return false;
  return used >= limit;
};

export const isAtStaffLimit = (user, staffCountFallback) => {
  const limit = resolveLimit(user?.usage?.staff?.limit, user?.own_max_staff);
  if (limit == null) return false;
  const used = getStaffUsedCount(user, staffCountFallback);
  if (used == null) return false;
  return used >= limit;
};

export const canAddFirm = (user, firmCountFallback) => !isAtFirmLimit(user, firmCountFallback);

export const canAddStaff = (user, staffCountFallback) =>
  !isAtStaffLimit(user, staffCountFallback);
