import {
  fetchImageDataUrl,
  resolveCustomerProfileImage,
  resolveCustomerProfileImagePath,
} from '../imageHelpers';

/** Load customer profile image as data URL for pdfMake (Form 8 / agreements). */
export async function loadCustomerPhotoForPdf(customer) {
  const url = resolveCustomerProfileImage(customer);
  const path = resolveCustomerProfileImagePath(customer);
  if (!url && !path) return null;
  return fetchImageDataUrl(url, path);
}

export default loadCustomerPhotoForPdf;
