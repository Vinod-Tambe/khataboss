import axios from 'axios';
import appConfig, { apiPublicUrl, r2PublicUrl, isCloudflareAccessEnabled } from "../config/appConfig";
import { getImageDataUrl as fetchImageDataUrlFromApi } from "../api/mediaApi";

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

/** Raw storage path for backend media API (owner/... or uploads/...). */
export function resolveImageStoragePath(img) {
  if (!img) return null;
  if (typeof img === "string") {
    const path = String(img).replace(/^\/+/, "");
    if (path.startsWith("owner/") || path.startsWith("uploads/")) return path;
    if (path.startsWith("http") || path.startsWith("blob:")) {
      return extractStoragePathFromUrl(path);
    }
    return path.includes("/") ? path : null;
  }
  if (img.path) return resolveImageStoragePath(img.path);
  return null;
}

export function extractStoragePathFromUrl(url) {
  if (!url) return null;
  const str = String(url).replace(/^\/+/, "");

  if (str.startsWith("owner/") || str.startsWith("uploads/")) {
    return str;
  }

  if (R2_PUBLIC_URL && str.startsWith(R2_PUBLIC_URL)) {
    return str.slice(R2_PUBLIC_URL.length).replace(/^\/+/, "");
  }

  const apiOrigin = apiPublicUrl.replace(/\/$/, "");
  if (str.startsWith(apiOrigin)) {
    return str.slice(apiOrigin.length).replace(/^\/+/, "");
  }

  if (str.includes("owner/")) {
    const idx = str.indexOf("owner/");
    return str.slice(idx);
  }

  if (str.includes("/uploads/")) {
    const idx = str.indexOf("/uploads/");
    return str.slice(idx + 1);
  }

  return null;
}

/** Resolve customer profile image URL from common API shapes. */
export function resolveCustomerProfileImage(user) {
  if (!user) return null;
  return (
    resolveImageUrl(user.user_profile_img) ||
    resolveImageUrl(user.user_image) ||
    resolveImageUrl(user.ur_image) ||
    null
  );
}

export function resolveCustomerProfileImagePath(user) {
  if (!user) return null;
  return (
    resolveImageStoragePath(user.user_profile_img) ||
    resolveImageStoragePath(user.user_image) ||
    resolveImageStoragePath(user.ur_image) ||
    null
  );
}

/** Fetch remote image as data URL for pdfMake embedding. */
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImageViaCanvas = (url) => rasterizeToJpegDataUrl(url);

const PDF_JPEG_DATA_URL = /^data:image\/jpe?g;base64,/i;

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });

const rasterizeToJpegDataUrl = async (src, maxDim = 800) => {
  const img = await loadImageElement(src);
  let width = img.naturalWidth || img.width || 1;
  let height = img.naturalHeight || img.height || 1;

  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.92);
};

/**
 * pdfMake only accepts real JPEG/PNG bytes — always re-encode to JPEG via canvas.
 * Fixes webp/mislabeled files from API (e.g. data:image/png with webp bytes).
 */
export async function normalizeImageDataUrlForPdf(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (PDF_JPEG_DATA_URL.test(dataUrl)) {
    try {
      return await rasterizeToJpegDataUrl(dataUrl);
    } catch {
      return null;
    }
  }
  if (!dataUrl.startsWith("data:") && !dataUrl.startsWith("http") && !dataUrl.startsWith("blob:")) {
    return null;
  }
  try {
    return await rasterizeToJpegDataUrl(dataUrl);
  } catch {
    return null;
  }
}

const fetchBlobWithAuth = async (url) => {
  const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("token") : null;
  const response = await axios.get(url, {
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export async function fetchImageDataUrl(url, storedPath = null) {
  if (!url && !storedPath) return null;
  if (url && String(url).startsWith("data:")) {
    return normalizeImageDataUrlForPdf(url);
  }

  const path =
    storedPath ||
    (url ? extractStoragePathFromUrl(url) : null) ||
    null;

  if (path) {
    try {
      const dataUrl = await fetchImageDataUrlFromApi(path);
      if (dataUrl) return normalizeImageDataUrlForPdf(dataUrl);
    } catch {
      // fall through to direct fetch strategies
    }
  }

  if (!url) return null;

  const apiOrigin = apiPublicUrl.replace(/\/$/, "");
  const isApiHosted =
    String(url).startsWith(apiOrigin) ||
    String(url).startsWith("/uploads/") ||
    String(url).includes("/uploads/");

  const strategies = [];

  if (isApiHosted) {
    strategies.push(async () => {
      const absoluteUrl = String(url).startsWith("http")
        ? url
        : `${apiOrigin}${String(url).startsWith("/") ? url : `/${url}`}`;
      const blob = await fetchBlobWithAuth(absoluteUrl);
      if (!blob?.size) throw new Error("Empty image");
      return blobToDataUrl(blob);
    });
  }

  strategies.push(async () => {
    const response = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (!blob?.size) throw new Error("Empty image");
    return blobToDataUrl(blob);
  });

  strategies.push(async () => {
    const response = await fetch(url, { mode: "cors", credentials: "include" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (!blob?.size) throw new Error("Empty image");
    return blobToDataUrl(blob);
  });

  strategies.push(() => loadImageViaCanvas(url));

  for (const strategy of strategies) {
    try {
      const dataUrl = await strategy();
      if (dataUrl) return normalizeImageDataUrlForPdf(dataUrl);
    } catch {
      // try next strategy
    }
  }

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
