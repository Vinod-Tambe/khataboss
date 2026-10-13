import { resolveFirmLeftLogoUrl, resolveFirmRightLogoUrl } from './loadFirmAssetsForPdf';
import { SAMPLE_FIRM_LOGO_DATA_URL } from './formTemplatePreviewAssets';

export const FORM_TEMPLATE_ASSET_KEYS = {
  leftLogo: 'leftLogoDataUrl',
  rightLogo: 'rightLogoDataUrl',
  footerImage: 'footerImageDataUrl',
};

const MAX_FILE_BYTES = 1_200_000;
const MAX_CANVAS_WIDTH = 480;

export const readImageFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose a JPEG, PNG, or WebP image'));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('Image is too large (max about 1.2 MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Could not read image'));
        return;
      }
      compressDataUrlIfNeeded(dataUrl).then(resolve).catch(() => resolve(dataUrl));
    };
    reader.onerror = () => reject(new Error('Could not read image'));
    reader.readAsDataURL(file);
  });

export const compressDataUrlIfNeeded = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > MAX_CANVAS_WIDTH ? MAX_CANVAS_WIDTH / img.width : 1;
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Invalid image'));
    img.src = dataUrl;
  });

export const getFormTemplateAssets = (config) => ({
  leftLogoDataUrl: config?.assets?.leftLogoDataUrl || '',
  rightLogoDataUrl: config?.assets?.rightLogoDataUrl || '',
  footerImageDataUrl: config?.assets?.footerImageDataUrl || '',
});

/** True only when this firm's template has its own uploaded footer image. */
export const hasFormTemplateFooterImage = (config) => {
  const value = String(config?.assets?.footerImageDataUrl || '').trim();
  if (!value.startsWith('data:image')) return false;
  if (value === SAMPLE_FIRM_LOGO_DATA_URL) return false;
  return true;
};

/** Preview URLs: template upload → firm logo → optional sample. */
export const resolveForm8BuilderImageUrls = (config, firm, { useSampleAssets = true } = {}) => {
  const layout = config?.layout || {};
  const assets = getFormTemplateAssets(config);
  const firmLeft = resolveFirmLeftLogoUrl(firm);
  const firmRight = resolveFirmRightLogoUrl(firm);

  const leftLogoUrl =
    assets.leftLogoDataUrl ||
    firmLeft ||
    (useSampleAssets && layout.showLeftLogo ? SAMPLE_FIRM_LOGO_DATA_URL : null);

  const rightLogoUrl =
    assets.rightLogoDataUrl ||
    firmRight ||
    (useSampleAssets && layout.showRightLogo ? SAMPLE_FIRM_LOGO_DATA_URL : null);

  const footerImageUrl = assets.footerImageDataUrl || null;

  return {
    leftLogoUrl,
    rightLogoUrl,
    footerImageUrl,
    assets,
  };
};

/** Data URLs for PDF (template overrides firm). */
export const resolveForm8PdfImageDataUrls = (config, firmAssets = {}) => {
  const assets = getFormTemplateAssets(config);
  return {
    leftLogoDataUrl:
      assets.leftLogoDataUrl || firmAssets.leftLogoDataUrl || null,
    rightLogoDataUrl:
      assets.rightLogoDataUrl || firmAssets.rightLogoDataUrl || null,
    footerImageDataUrl: hasFormTemplateFooterImage(config) ? assets.footerImageDataUrl : null,
  };
};
