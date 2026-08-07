export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 24;
export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*-_+=?";

const COMMON_PASSWORDS = [
  "password",
  "password1",
  "password123",
  "1234567890",
  "123456789",
  "qwertyuiop",
  "qwerty123",
  "abcdefghij",
  "admin12345",
  "welcome123",
  "letmein123",
  "iloveyou12",
  "changeme12",
  "passw0rd12",
];

const SEQUENCES = [
  "0123456789",
  "9876543210",
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

const hasUpper = (value) => /[A-Z]/.test(value);
const hasLower = (value) => /[a-z]/.test(value);
const hasNumber = (value) => /[0-9]/.test(value);
const hasSpecial = (value) => /[!@#$%^&*\-_+=?]/.test(value);

const hasRepeatedChars = (value) => /(.)\1{2,}/.test(value);

const hasPredictableSequence = (value) => {
  const lower = String(value || "").toLowerCase();
  return SEQUENCES.some((seq) => {
    for (let i = 0; i <= seq.length - 4; i += 1) {
      if (lower.includes(seq.slice(i, i + 4))) return true;
    }
    return false;
  });
};

const normalizeToken = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const containsPersonalInfo = (password, personalInfo = {}) => {
  const lowerPwd = String(password || "").toLowerCase();
  const tokens = [
    personalInfo.firstName,
    personalInfo.lastName,
    personalInfo.middleName,
    personalInfo.loginId,
    personalInfo.email?.split("@")[0],
    personalInfo.mobile,
  ]
    .map(normalizeToken)
    .filter((t) => t && t.length >= 3);

  return tokens.some((token) => lowerPwd.includes(token));
};

const isCommonPassword = (password) => {
  const lower = String(password || "").toLowerCase();
  return COMMON_PASSWORDS.some((item) => lower.includes(item) || lower === item);
};

/**
 * Returns checklist + overall validity for a strong password.
 */
export const getPasswordRuleChecks = (password, options = {}) => {
  const value = String(password || "");
  const { oldPassword = "", personalInfo = {} } = options;

  const checks = [
    {
      key: "length",
      label: `Length ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`,
      ok: value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH,
    },
    {
      key: "upper",
      label: "Uppercase letter (A–Z)",
      ok: hasUpper(value),
    },
    {
      key: "lower",
      label: "Lowercase letter (a–z)",
      ok: hasLower(value),
    },
    {
      key: "number",
      label: "Number (0–9)",
      ok: hasNumber(value),
    },
    {
      key: "special",
      label: `Special character (${PASSWORD_SPECIAL_CHARS})`,
      ok: hasSpecial(value),
    },
    {
      key: "noRepeat",
      label: "No repeated characters (aaa, 111)",
      ok: value.length === 0 ? false : !hasRepeatedChars(value),
    },
    {
      key: "noSequence",
      label: "No predictable patterns (1234, qwerty)",
      ok: value.length === 0 ? false : !hasPredictableSequence(value),
    },
    {
      key: "noCommon",
      label: "Not a common/dictionary password",
      ok: value.length === 0 ? false : !isCommonPassword(value),
    },
    {
      key: "noPersonal",
      label: "No personal info (name, email, mobile)",
      ok: value.length === 0 ? false : !containsPersonalInfo(value, personalInfo),
    },
    {
      key: "different",
      label: "Different from old password",
      ok: value.length === 0 ? false : !oldPassword || value !== oldPassword,
    },
  ];

  const failed = checks.find((c) => !c.ok);
  return {
    checks,
    isValid: checks.every((c) => c.ok),
    message: failed ? failed.label : "Strong password",
  };
};

export const validateStrongPassword = (password, options = {}) => {
  const result = getPasswordRuleChecks(password, options);
  return result.isValid ? null : result.message;
};
