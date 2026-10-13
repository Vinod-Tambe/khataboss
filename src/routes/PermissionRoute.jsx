import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import usePermissions from "../hooks/usePermissions";

/**
 * Blocks direct URL access when the user lacks permission.
 * Waits for profile refresh so stale localStorage permissions do not redirect incorrectly.
 */
const PermissionRoute = ({ permission, anyOf, children }) => {
  const profileLoading = useSelector((state) => state.auth.profileLoading);
  const user = useSelector((state) => state.auth.user);
  const { can, canAny } = usePermissions();

  // Only block the first paint when we have no cached session.
  // Background profile refresh (every 2 min / tab focus) must NOT unmount
  // the page — that wiped Form 8 / agreement editors back to the list.
  if (profileLoading && !user) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
      </div>
    );
  }

  const allowed = permission
    ? can(permission)
    : anyOf
      ? canAny(anyOf)
      : true;

  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PermissionRoute;
