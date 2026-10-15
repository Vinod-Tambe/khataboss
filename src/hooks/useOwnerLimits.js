import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  canAddFirm,
  canAddStaff,
  isAtFirmLimit,
  isAtStaffLimit,
} from "../utils/ownerLimits";

/** Firm/staff quota from auth profile usage + optional live counts. */
const useOwnerLimits = (options = {}) => {
  const user = useSelector((state) => state.auth.user);
  const firms = useSelector((state) => state.firm.firms);
  const firmCountFallback =
    options.firmCount ?? (Array.isArray(firms) ? firms.length : undefined);
  const staffCountFallback = options.staffCount;

  return useMemo(
    () => ({
      user,
      firmUsage: user?.usage?.firms ?? null,
      staffUsage: user?.usage?.staff ?? null,
      atFirmLimit: isAtFirmLimit(user, firmCountFallback),
      atStaffLimit: isAtStaffLimit(user, staffCountFallback),
      canAddFirm: canAddFirm(user, firmCountFallback),
      canAddStaff: canAddStaff(user, staffCountFallback),
    }),
    [user, firmCountFallback, staffCountFallback]
  );
};

export default useOwnerLimits;
