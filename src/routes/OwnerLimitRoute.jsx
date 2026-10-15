import React from "react";
import { Navigate } from "react-router-dom";
import useOwnerLimits from "../hooks/useOwnerLimits";

/**
 * Blocks add flows when the owner plan firm/staff quota is full.
 * @param {"firm"|"staff"} resource
 */
const OwnerLimitRoute = ({ resource, redirectTo, children }) => {
  const { canAddFirm, canAddStaff } = useOwnerLimits();

  const allowed = resource === "staff" ? canAddStaff : canAddFirm;
  if (!allowed) {
    return <Navigate to={redirectTo || "/home"} replace />;
  }

  return children;
};

export default OwnerLimitRoute;
