import moment from "moment";
import { parseOtherImages } from "./imageHelpers";

export function buildReleaseUserRows(releases = []) {
  const byUserId = new Map();

  releases.forEach((rel) => {
    if (!rel?.rel_is_other_user || !rel?.pickupUser) return;

    const user = rel.pickupUser;
    const userId = user.ru_id;
    const releaseDate = rel.rel_trans_date
      ? moment(rel.rel_trans_date).format("DD-MM-YYYY")
      : "";

    if (!byUserId.has(userId)) {
      byUserId.set(userId, {
        ru_id: user.ru_id,
        ru_unique_code: user.ru_unique_code || "",
        ru_full_name: user.ru_full_name || "",
        ru_mobile: user.ru_mobile || "",
        ru_email: user.ru_email || "",
        ru_aadhaar: user.ru_aadhaar || "",
        ru_pan: user.ru_pan || "",
        ru_gender: user.ru_gender || "",
        ru_address: user.ru_address || "",
        ru_city: user.ru_city || "",
        ru_state: user.ru_state || "",
        ru_pincode: user.ru_pincode || "",
        ru_other_images: parseOtherImages(user.ru_other_images),
        releaseDates: releaseDate ? [releaseDate] : [],
      });
      return;
    }

    const existing = byUserId.get(userId);
    if (releaseDate && !existing.releaseDates.includes(releaseDate)) {
      existing.releaseDates.push(releaseDate);
    }
  });

  return Array.from(byUserId.values());
}

export function formatReleaseDates(dates = []) {
  if (!dates.length) return "-";
  return dates.join(", ");
}
