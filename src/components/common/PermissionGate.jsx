import usePermissions from "../../hooks/usePermissions";

/**
 * Renders children only when the user has the required permission(s).
 * @param {string|string[]} permission - single key or list
 * @param {"any"|"all"} mode - how to evaluate list (default any)
 */
const PermissionGate = ({ permission, mode = "any", children, fallback = null }) => {
  const { can, canAny, canAll } = usePermissions();

  if (!permission) return children;

  const keys = Array.isArray(permission) ? permission : [permission];
  const allowed =
    keys.length === 1
      ? can(keys[0])
      : mode === "all"
        ? canAll(keys)
        : canAny(keys);

  return allowed ? children : fallback;
};

export default PermissionGate;
