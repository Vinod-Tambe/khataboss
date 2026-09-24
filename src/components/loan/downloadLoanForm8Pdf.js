import { getFormTemplate } from '../../api/formTemplateApi';
import { normalizeFormConfig } from '../../utils/formTemplate/formTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import {
  downloadFormTemplatePdf,
  getFormTemplatePdfBlob,
  getFormTemplatePdfFileName,
} from '../../utils/formTemplate/buildFormTemplatePdf';
import { buildLiveFormTemplatePdfOptions } from '../../utils/formTemplate/buildFormTemplatePdfOptions';
import resolveFirmForPdf, { mergeCustomerForPdf } from '../../utils/formTemplate/resolveFirmForPdf';

export async function buildLoanForm8PdfPack(loanDetails, customer = null) {
  if (!loanDetails) {
    throw new Error('Loan details are required');
  }

  const firmId = loanDetails.girv_firm_id || loanDetails.firm?.firm_id;
  if (!firmId) {
    throw new Error('Firm not found for this loan');
  }

  const response = await getFormTemplate(firmId);
  const template = response?.data;
  if (!template?.config) {
    throw new Error('Form template not found for this firm');
  }

  const config = normalizeFormConfig(template.config);
  const firm = await resolveFirmForPdf(firmId, loanDetails.firm || {});
  const resolvedCustomer = mergeCustomerForPdf(loanDetails?.user, customer);
  const { formData, transactionRows, firmName, loanRef, loanItems } = buildFormTemplateLoanData(
    loanDetails,
    resolvedCustomer
  );
  const pdfOptions = await buildLiveFormTemplatePdfOptions({
    firm,
    customer: resolvedCustomer,
    formData,
    transactionRows,
    loanRef,
    loanItems,
    config,
  });

  const displayFirmName = firmName || template.firmName;
  const fileName = getFormTemplatePdfFileName(config, displayFirmName, pdfOptions);

  return { config, displayFirmName, pdfOptions, fileName, firmId };
}

/**
 * Fetch firm Form 8 template and download PDF filled with live loan data.
 */
export const downloadLoanForm8Pdf = async (loanDetails, customer = null) => {
  const pack = await buildLoanForm8PdfPack(loanDetails, customer);
  downloadFormTemplatePdf(pack.config, pack.displayFirmName, pack.pdfOptions);
  return pack.fileName;
};

export const getLoanForm8PdfBlob = async (loanDetails, customer = null) => {
  const pack = await buildLoanForm8PdfPack(loanDetails, customer);
  const blob = await getFormTemplatePdfBlob(pack.config, pack.displayFirmName, pack.pdfOptions);
  return { blob, fileName: pack.fileName, firmId: pack.firmId };
};

export default downloadLoanForm8Pdf;
