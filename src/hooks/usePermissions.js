import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isOwner,
} from "../utils/permissions";

const usePermissions = () => {
  const user = useSelector((state) => state.auth.user);

  return useMemo(
    () => ({
      user,
      isOwner: isOwner(user),
      can: (key) => hasPermission(user, key),
      canAny: (keys) => hasAnyPermission(user, keys),
      canAll: (keys) => hasAllPermissions(user, keys),
      permissions: Array.isArray(user?.permissions) ? user.permissions : [],
    }),
    [user]
  );
};

export default usePermissions;
