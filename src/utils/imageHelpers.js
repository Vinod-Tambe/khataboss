import appConfig, {
  apiPublicUrl,
  r2PublicUrl,
  isCloudflareAccessEnabled,
} from "../config/appConfig";

/** Cloudflare R2 public URL (custom domain or R2 dev URL). */
const R2_PUBLIC_URL = (r2PublicUrl || appConfig.r2PublicUrl || "").replace(/\/$/, "");

/** Legacy backend static URL for old local uploads/ paths only */
const LEGACY_BASE_URL = `${apiPublicUrl.replace(/\/$/, "")}/`;

export const IMAGE_BASE_URL = isCloudflareAccessEnabled() && R2_PUBLIC_URL
  ? `${R2_PUBLIC_URL}/`
  : LEGACY_BASE_URL;

export const MAX_DOCUMENT_IMAGES = 10;

export function parseOtherImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function resolvePathToUrl(pathValue) {
  if (!pathValue) return null;
  const path = String(pathValue).replace(/^\/+/, "");
  if (path.startsWith("http") || path.startsWith("blob:")) return path;

  // Cloudflare R2 keys: owner/1/user/5/photo.jpg
  if (path.startsWith("owner/")) {
    if (!isCloudflareAccessEnabled()) return null;
    if (R2_PUBLIC_URL) return `${R2_PUBLIC_URL}/${path}`;
    return null;
  }

  // Legacy local paths: uploads/user/5/... or user/5/...
  return `${LEGACY_BASE_URL.replace(/\/$/, "")}/${path.startsWith("uploads/") ? path : `uploads/${path}`}`;
}

export function resolveImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") {
    if (img.startsWith("http") || img.startsWith("blob:")) return img;
    return resolvePathToUrl(img);
  }
  if (img.path) return resolvePathToUrl(img.path);
  return null;
}

/** Build editable document rows from API other_images JSON */
export function documentsFromOtherImages(imagesJson) {
  return parseOtherImages(imagesJson).map((img, index) => ({
    id: img.path || `existing-${index}`,
    path: img.path || null,
    preview: resolveImageUrl(img),
    label: img.label || "",
    note: img.note || "",
    isExisting: true,
    file: null,
  }));
}

export function appendOtherImagesToFormData(
  formData,
  newImages = [],
  removedPaths = [],
  existingUpdates = []
) {
  newImages.forEach((item) => {
    const file = item?.file || item;
    if (file instanceof File) {
      formData.append("other_images", file);
    }
  });

  const meta = newImages.map((item) => ({
    label: item.label || "",
    note: item.note || "",
  }));
  if (meta.length) {
    formData.append("other_images_meta", JSON.stringify(meta));
  }

  if (removedPaths?.length) {
    formData.append("other_images_remove", JSON.stringify(removedPaths));
  }

  if (existingUpdates?.length) {
    formData.append("other_images_update", JSON.stringify(existingUpdates));
  }
}

/** Collect label/note updates for existing server-side images */
export function collectExistingDocumentUpdates(documents = []) {
  return documents
    .filter((doc) => doc.isExisting && doc.path)
    .map((doc) => ({
      path: doc.path,
      label: doc.label || "",
      note: doc.note || "",
    }));
}

/** Split documents into new uploads vs existing for FormData */
export function getNewDocumentUploads(documents = []) {
  return documents.filter((doc) => !doc.isExisting && doc.file instanceof File);
}

/** Money lender docs from ml_other_images, with legacy column fallback */
export function documentsFromMoneyLenderImages(ml) {
  const fromJson = documentsFromOtherImages(ml?.ml_other_images);
  if (fromJson.length) return fromJson;

  const legacy = [];
  const pushLegacy = (img, label) => {
    if (!img?.path) return;
    legacy.push({
      id: img.path,
      path: img.path,
      preview: resolveImageUrl(img),
      label,
      note: img.note || "",
      isExisting: true,
      file: null,
    });
  };

  pushLegacy(ml?.ml_adhaar_front_img, "Aadhaar Front");
  pushLegacy(ml?.ml_adhaar_back_img, "Aadhaar Back");
  pushLegacy(ml?.ml_pan_img, "PAN Card");
  return legacy;
}
