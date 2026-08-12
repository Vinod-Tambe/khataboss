export const IMAGE_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:9000/"
    : "https://khataboss.in/";

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

export function resolveImageUrl(img) {
  if (!img) return null;
  if (typeof img === "string") {
    if (img.startsWith("http") || img.startsWith("blob:")) return img;
    return `${IMAGE_BASE_URL}${img.replace(/^\//, "")}`;
  }
  if (img.path) return `${IMAGE_BASE_URL}${String(img.path).replace(/^\//, "")}`;
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
