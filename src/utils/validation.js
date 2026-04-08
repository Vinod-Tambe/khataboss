export const REGEX = {
  PINCODE: /^[1-9][0-9]{5}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^[2-9][0-9]{11}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  BSR_CODE: /^[0-9]{7}$/,
  ACCOUNT_NO: /^[0-9]{9,18}$/,
  MOBILE: /^[6-9][0-9]{9}$/,
  PHONE: /^[0-9]{10,12}$/,
};

export const validatePincode = (pincode) => REGEX.PINCODE.test(pincode);
export const validatePan = (pan) => REGEX.PAN.test(pan?.toUpperCase());
export const validateAadhaar = (aadhaar) => REGEX.AADHAAR.test(aadhaar);
export const validateGstin = (gstin) => REGEX.GSTIN.test(gstin?.toUpperCase());
export const validateIfsc = (ifsc) => REGEX.IFSC.test(ifsc?.toUpperCase());
export const validateBsrCode = (bsr) => REGEX.BSR_CODE.test(bsr);
export const validateAccountNo = (accNo) => REGEX.ACCOUNT_NO.test(accNo);
export const validateMobile = (mobile) => REGEX.MOBILE.test(mobile);
export const validatePhone = (phone) => REGEX.PHONE.test(phone);

export const getValidationMessage = (field, value) => {
  if (!value) return null; // If optional and empty, it's fine (unless required check is separate)
  
  switch (field) {
    case 'pincode':
      return validatePincode(value) ? null : 'Invalid Pincode. It should be 6 digits and not start with 0.';
    case 'panNo':
    case 'panCard':
      return validatePan(value) ? null : 'Invalid PAN Number. Format: ABCDE1234F';
    case 'aadhaarNo':
    case 'adhaarNo':
      return validateAadhaar(value) ? null : 'Invalid Aadhaar Number. It should be 12 digits and not start with 0 or 1.';
    case 'gstinNo':
    case 'gstin':
      return validateGstin(value) ? null : 'Invalid GSTIN. It should be a 15-character alphanumeric code.';
    case 'ifscCode':
      return validateIfsc(value) ? null : 'Invalid IFSC Code. Format: ABCD0123456 (11 characters).';
    case 'accNo':
    case 'acc_bank_no':
      return validateAccountNo(value) ? null : 'Invalid Account Number. It should be 9 to 18 digits.';
    case 'bsrCode':
    case 'acc_bsr_no':
      return validateBsrCode(value) ? null : 'Invalid BSR Code. It should be exactly 7 digits.';
    default:
      return null;
  }
};
