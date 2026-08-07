import React from "react";
import { Navigate } from "react-router-dom";
import usePermissions from "../hooks/usePermissions";

/**
 * Blocks direct URL access when the user lacks permission.
 */
const PermissionRoute = ({ permission, anyOf, children }) => {
  const { can, canAny } = usePermissions();

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
