import { showToast } from "../components/common/ToastAlert";
import appConfig, { isCloudflareAccessEnabled, imageAccessDenied } from "../config/appConfig";

/** Max upload size for form images/documents (matches backend multer limit). */
export const MAX_UPLOAD_FILE_SIZE = 2 * 1024 * 1024;
export const UPLOAD_SIZE_ERROR = "File size must be less than 2MB";

export { isCloudflareAccessEnabled, imageAccessDenied };

export const isUploadFileValid = (file, maxBytes = MAX_UPLOAD_FILE_SIZE) => {
  return Boolean(file) && typeof file.size === "number" && file.size <= maxBytes;
};

/**
 * Validate a selected upload file. Shows toast on failure.
 * @returns {boolean}
 */
export const validateUploadFile = (file, options = {}) => {
  const { maxBytes = MAX_UPLOAD_FILE_SIZE, silent = false } = options;

  if (!isCloudflareAccessEnabled()) {
    if (!silent) {
      showToast(imageAccessDenied || appConfig.imageAccessDenied, "error");
    }
    return false;
  }

  if (!file) return false;
  if (!isUploadFileValid(file, maxBytes)) {
    if (!silent) showToast(UPLOAD_SIZE_ERROR, "error");
    return false;
  }
  return true;
};

/**
 * Read first file from an input change event, validate size, clear input on reject.
 * @returns {File|null}
 */
export const getValidatedUploadFile = (e, options = {}) => {
  const input = e?.target;
  const file = input?.files?.[0];
  if (!file) return null;
  if (!validateUploadFile(file, options)) {
    if (input) input.value = "";
    return null;
  }
  return file;
};
