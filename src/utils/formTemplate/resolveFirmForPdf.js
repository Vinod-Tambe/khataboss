import { getFirms } from '../../api/firmApi';
import { resolveImageStoragePath, resolveImageUrl } from '../imageHelpers';

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

const customerHasProfilePhoto = (customer) =>
  Boolean(
    resolveImageStoragePath(customer?.user_profile_img) ||
      resolveImageUrl(customer?.user_profile_img)
  );

/** Merge customer sources. The loan customer's profile photo is kept as the Form 8 photo. */
export function mergeCustomerForPdf(...customers) {
  const sources = customers.filter(Boolean);
  if (!sources.length) return null;

  const merged = Object.assign({}, ...sources);
  const withProfile = [...sources].reverse().find((customer) => customerHasProfilePhoto(customer));
  if (withProfile) {
    merged.user_profile_img = withProfile.user_profile_img;
    return merged;
  }

  const withOther = [...sources].reverse().find(
    (customer) =>
      resolveImageStoragePath(customer.ur_image) ||
      resolveImageUrl(customer.ur_image) ||
      resolveImageStoragePath(customer.user_image) ||
      resolveImageUrl(customer.user_image)
  );
  if (withOther) {
    merged.ur_image = withOther.ur_image || merged.ur_image;
    merged.user_image = withOther.user_image || merged.user_image;
  }

  return merged;
}

export default resolveFirmForPdf;
