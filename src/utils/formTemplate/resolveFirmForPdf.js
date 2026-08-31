import { getFirms } from '../../api/firmApi';
import { resolveImageStoragePath } from '../imageHelpers';

let firmsCache = null;
let firmsCacheAt = 0;
const CACHE_MS = 60_000;

const firmHasAssets = (firm) =>
  Boolean(
    firm?.firm_left_logo_img?.path ||
      firm?.firm_right_logo_img?.path ||
      firm?.firm_form_header ||
      firm?.firm_form_footer
  );

/** Ensure firm record includes logos/header/footer for PDF generation. */
export async function resolveFirmForPdf(firmId, partialFirm = {}) {
  if (firmHasAssets(partialFirm)) {
    return partialFirm;
  }

  const id = firmId ?? partialFirm?.firm_id;
  if (!id) return partialFirm || {};

  if (!firmsCache || Date.now() - firmsCacheAt > CACHE_MS) {
    try {
      const res = await getFirms();
      firmsCache = Array.isArray(res?.data) ? res.data : [];
      firmsCacheAt = Date.now();
    } catch {
      firmsCache = [];
    }
  }

  const match = firmsCache.find(
    (firm) => firm.firm_id === id || firm.firm_id === parseInt(id, 10)
  );

  return match ? { ...partialFirm, ...match } : partialFirm || {};
}

/** Merge customer sources so profile image fields are available for PDF. */
export function mergeCustomerForPdf(...customers) {
  const sources = customers.filter(Boolean);
  if (!sources.length) return null;

  const merged = Object.assign({}, ...sources);
  const withPhoto = sources.find(
    (customer) =>
      resolveImageStoragePath(customer.user_profile_img) ||
      resolveImageStoragePath(customer.user_image) ||
      resolveImageStoragePath(customer.ur_image)
  );

  if (withPhoto) {
    ['user_profile_img', 'user_image', 'ur_image'].forEach((key) => {
      if (withPhoto[key]) merged[key] = withPhoto[key];
    });
  }

  return merged;
}

export default resolveFirmForPdf;
