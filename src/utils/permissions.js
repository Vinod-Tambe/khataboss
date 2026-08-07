/** Owner always has full access. Staff uses granted permission keys. */

export const isOwner = (user) => {
  if (!user) return false;
  // Explicit staff markers must never be treated as owner
  if (user.role === "STAFF" || user.staff_uuid || user.staff_login_id) return false;
  return user.role === "OWNER" || !user.role;
};

export const hasPermission = (user, permissionKey) => {
  if (!permissionKey) return true;
  if (isOwner(user)) return true;
  const perms = user?.permissions;
  return Array.isArray(perms) && perms.includes(permissionKey);
};

export const hasAnyPermission = (user, keys = []) => {
  if (isOwner(user)) return true;
  if (!keys.length) return true;
  return keys.some((key) => hasPermission(user, key));
};

export const hasAllPermissions = (user, keys = []) => {
  if (isOwner(user)) return true;
  if (!keys.length) return true;
  return keys.every((key) => hasPermission(user, key));
};

/**
 * Filter sidebar/menu tree by permission keys.
 * Item shape: { permission?: string, anyOf?: string[], subItems?: [...] }
 */
export const filterMenuByPermissions = (items, user) => {
  if (isOwner(user)) return items;

  return items
    .map((item) => {
      if (item.id === "logout" || item.id === "home") return item;

      if (item.subItems?.length) {
        const subItems = item.subItems.filter((sub) => {
          if (sub.permission) return hasPermission(user, sub.permission);
          if (sub.anyOf) return hasAnyPermission(user, sub.anyOf);
          return true;
        });
        if (!subItems.length) return null;

        const parentOk =
          !item.permission && !item.anyOf
            ? true
            : item.permission
              ? hasPermission(user, item.permission)
              : hasAnyPermission(user, item.anyOf);

        if (!parentOk) return null;
        return { ...item, subItems };
      }

      if (item.permission && !hasPermission(user, item.permission)) return null;
      if (item.anyOf && !hasAnyPermission(user, item.anyOf)) return null;
      return item;
    })
    .filter(Boolean);
};
