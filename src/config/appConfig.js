/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Khataboss Frontend — single config file (no .env required)
 * Edit values here only. Keep cloudflareAccess in sync with backend
 * CLOUDFLARE_ACCESS in Khataboss-Backend/.env
 * ═══════════════════════════════════════════════════════════════════════════
 */

const isBrowser = typeof window !== "undefined";

const isLocalHost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

/** true when app runs on localhost (npm start or local build) */
const isDevelopment = isLocalHost;

const productionApiOrigin = "https://khataboss.in";
const developmentApiOrigin = "http://localhost:9000";

const apiOrigin = isDevelopment ? developmentApiOrigin : productionApiOrigin;

const appConfig = {
  isDevelopment,
  isLocalHost,

  /** Dev server port — also set in package.json start script (PORT=3001) */
  devServerPort: 3001,

  /** Axios base URL */
  apiBaseUrl: `${apiOrigin}/api/v1`,

  /** Backend origin for legacy local upload URLs */
  apiPublicUrl: apiOrigin,

  /**
   * Master switch for Cloudflare R2 image storage.
   * true  → upload and load images from Cloudflare R2
   * false → block image upload/select with access denied message
   * Must match backend CLOUDFLARE_ACCESS=true|false
   */
  cloudflareAccess: true,

  /** Shown when cloudflareAccess is false and user tries an image operation */
  imageAccessDenied: "Access denied. Cloudflare image storage is not enabled.",

  /** Cloudflare R2 public URL (custom domain or r2.dev URL) */
  r2PublicUrl: "https://pub-ac1e0016bdc54f2997d80ca2745601ff.r2.dev",

  /** OTP resend countdown (seconds) */
  otpExpirySeconds: 60,

  /** CRA build: disable source maps (also in package.json build script) */
  generateSourceMap: false,
};

export function isCloudflareAccessEnabled() {
  return Boolean(appConfig.cloudflareAccess);
}

export const {
  isDevelopment: IS_DEV,
  apiBaseUrl,
  apiPublicUrl,
  r2PublicUrl,
  otpExpirySeconds,
  cloudflareAccess,
  imageAccessDenied,
  devServerPort,
} = appConfig;

export default appConfig;
