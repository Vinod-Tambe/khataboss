import { showToast } from "../components/common/ToastAlert";

/** Max upload size for form images/documents (matches backend multer limit). */
export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
export const UPLOAD_SIZE_ERROR = "File size must be less than 5MB";

export const isUploadFileValid = (file, maxBytes = MAX_UPLOAD_FILE_SIZE) => {
  return Boolean(file) && typeof file.size === "number" && file.size <= maxBytes;
};

/**
 * Validate a selected upload file. Shows toast on failure.
 * @returns {boolean}
 */
export const validateUploadFile = (file, options = {}) => {
  const { maxBytes = MAX_UPLOAD_FILE_SIZE, silent = false } = options;
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
