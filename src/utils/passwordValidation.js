export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_SPECIAL_CHARS = "$!@%&";

const hasNumber = (value) => /\d/.test(value);
const hasSpecial = (value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value);

const hasEdgeWhitespace = (value) => {
  if (!value) return false;
  return value !== value.trim();
};

const PASSWORD_RULE_DEFINITIONS = [
  {
    key: "length",
    rule: "Length",
    requirement: `Minimum ${PASSWORD_MIN_LENGTH} characters (max ${PASSWORD_MAX_LENGTH})`,
    test: (value) =>
      value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
  },
  {
    key: "number",
    rule: "Number",
    requirement: "At least 1 digit",
    test: (value) => hasNumber(value),
  },
  {
    key: "special",
    rule: "Special",
    requirement: `At least 1 special character (e.g. ${PASSWORD_SPECIAL_CHARS})`,
    test: (value) => hasSpecial(value),
  },
  {
    key: "noEdgeSpace",
    rule: "Whitespace",
    requirement: "No leading or trailing spaces",
    test: (value) => value.length > 0 && !hasEdgeWhitespace(value),
  },
  {
    key: "different",
    rule: "Old password",
    requirement: "Must be different from old password",
    test: (value, oldPassword) => value.length > 0 && (!oldPassword || value !== oldPassword),
  },
];

/**
 * Returns checklist + overall validity for password policy.
 */
export const getPasswordRuleChecks = (password, options = {}) => {
  const value = String(password || "");
  const { oldPassword = "" } = options;

  const definitions = oldPassword
    ? PASSWORD_RULE_DEFINITIONS
    : PASSWORD_RULE_DEFINITIONS.filter((def) => def.key !== "different");

  const checks = definitions.map((def) => ({
    key: def.key,
    rule: def.rule,
    requirement: def.requirement,
    label: def.requirement,
    ok: def.test(value, oldPassword),
  }));

  const failed = checks.find((c) => !c.ok);
  return {
    checks,
    isValid: checks.every((c) => c.ok),
    message: failed ? failed.requirement : "Password meets requirements",
  };
};

export const validateStrongPassword = (password, options = {}) => {
  const result = getPasswordRuleChecks(password, options);
  return result.isValid ? null : result.message;
};
