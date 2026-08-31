import {
  fetchImageDataUrl,
  resolveImageUrl,
  resolveImageStoragePath,
} from '../imageHelpers';

export function resolveFirmLeftLogoUrl(firm) {
  return resolveImageUrl(firm?.firm_left_logo_img) || null;
}

export function resolveFirmRightLogoUrl(firm) {
  return resolveImageUrl(firm?.firm_right_logo_img) || null;
}

/** Load firm logos and form header/footer for Form 8 / agreement PDFs. */
export async function loadFirmAssetsForPdf(firm) {
  if (!firm) {
    return {
      leftLogoDataUrl: null,
      rightLogoDataUrl: null,
      formHeader: '',
      formFooter: '',
    };
  }

  const leftPath = resolveImageStoragePath(firm.firm_left_logo_img);
  const rightPath = resolveImageStoragePath(firm.firm_right_logo_img);
  const leftUrl = resolveFirmLeftLogoUrl(firm);
  const rightUrl = resolveFirmRightLogoUrl(firm);

  const [leftLogoDataUrl, rightLogoDataUrl] = await Promise.all([
    fetchImageDataUrl(leftUrl, leftPath),
    fetchImageDataUrl(rightUrl, rightPath),
  ]);

  return {
    leftLogoDataUrl,
    rightLogoDataUrl,
    formHeader: firm.firm_form_header || '',
    formFooter: firm.firm_form_footer || '',
  };
}

export default loadFirmAssetsForPdf;
