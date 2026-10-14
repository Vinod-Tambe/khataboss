export const DEFAULT_IDLE_TIMEOUT_MIN = 2;
export const MIN_IDLE_TIMEOUT_MIN = 1;
export const MAX_IDLE_TIMEOUT_MIN = 60;

export const parseIdleTimeoutMinutes = (value) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return DEFAULT_IDLE_TIMEOUT_MIN;
  return Math.min(MAX_IDLE_TIMEOUT_MIN, Math.max(MIN_IDLE_TIMEOUT_MIN, n));
};
