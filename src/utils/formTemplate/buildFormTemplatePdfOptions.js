import loadCustomerPhotoForPdf from './loadCustomerPhotoForPdf';
import loadFirmAssetsForPdf from './loadFirmAssetsForPdf';
import loadLoanStockImagesForPdf from './loadLoanStockImagesForPdf';
import { mergeCustomerForPdf } from './resolveFirmForPdf';
import { normalizeImageDataUrlForPdf } from '../imageHelpers';
import {
  SAMPLE_CUSTOMER_PHOTO_DATA_URL,
  SAMPLE_FIRM_LOGO_DATA_URL,
} from './formTemplatePreviewAssets';
import { STOCK_ITEM_TEST_ROWS } from './formTemplateTestData';

const shouldShowCustomerPhoto = (config) => config?.layout?.showCustomerPhoto !== false;

const shouldShowStockItemImages = (config) => config?.layout?.showStockItemImages !== false;

const preparePdfImageOptions = async (options) => {
  const [customerPhotoDataUrl, leftLogoDataUrl, rightLogoDataUrl] = await Promise.all([
    normalizeImageDataUrlForPdf(options.customerPhotoDataUrl),
    normalizeImageDataUrlForPdf(options.leftLogoDataUrl),
    normalizeImageDataUrlForPdf(options.rightLogoDataUrl),
  ]);

  return {
    ...options,
    customerPhotoDataUrl,
    leftLogoDataUrl,
    rightLogoDataUrl,
  };
};

/**
 * Build pdfMake options for live loan/finance documents.
 */
export async function buildLiveFormTemplatePdfOptions({
  firm = null,
  customer = null,
  formData = null,
  transactionRows = null,
  loanRef = null,
  loanItems = null,
  config = null,
} = {}) {
  const showCustomerPhoto = shouldShowCustomerPhoto(config);
  const showStockItemImages = shouldShowStockItemImages(config);
  const resolvedCustomer = mergeCustomerForPdf(customer);

  const [customerPhotoDataUrl, firmAssets, stockItemRows] = await Promise.all([
    showCustomerPhoto ? loadCustomerPhotoForPdf(resolvedCustomer) : Promise.resolve(null),
    loadFirmAssetsForPdf(firm),
    showStockItemImages && loanItems?.length
      ? loadLoanStockImagesForPdf(loanItems)
      : Promise.resolve(null),
  ]);

  return await preparePdfImageOptions({
    ...(formData ? { formData } : {}),
    ...(transactionRows ? { transactionRows } : {}),
    ...(loanRef ? { loanRef } : {}),
    ...(stockItemRows?.length ? { stockItemRows } : {}),
    customerPhotoDataUrl,
    ...firmAssets,
  });
}

/**
 * Build pdfMake options for customization preview (sample customer photo when none provided).
 */
export async function buildPreviewFormTemplatePdfOptions({
  firm = null,
  formData = null,
  transactionRows = null,
  config = null,
  useSampleCustomerPhoto = true,
  useSampleLogos = true,
} = {}) {
  const showCustomerPhoto = shouldShowCustomerPhoto(config);
  const showStockItemImages = shouldShowStockItemImages(config);
  const firmAssets = await loadFirmAssetsForPdf(firm);

  return await preparePdfImageOptions({
    ...(formData ? { formData } : {}),
    ...(transactionRows ? { transactionRows } : {}),
    ...(showStockItemImages ? { stockItemRows: STOCK_ITEM_TEST_ROWS } : {}),
    customerPhotoDataUrl:
      showCustomerPhoto && useSampleCustomerPhoto ? SAMPLE_CUSTOMER_PHOTO_DATA_URL : null,
    leftLogoDataUrl:
      firmAssets.leftLogoDataUrl || (useSampleLogos ? SAMPLE_FIRM_LOGO_DATA_URL : null),
    rightLogoDataUrl:
      firmAssets.rightLogoDataUrl || (useSampleLogos ? SAMPLE_FIRM_LOGO_DATA_URL : null),
    formHeader: firmAssets.formHeader,
    formFooter: firmAssets.formFooter,
  });
}
