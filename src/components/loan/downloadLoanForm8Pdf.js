import { getFormTemplate } from '../../api/formTemplateApi';
import { normalizeFormConfig } from '../../utils/formTemplate/formTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import { getFormTemplatePdfFileName } from '../../utils/formTemplate/buildFormTemplatePdf';
import { buildFormTemplatePrintHtml } from '../../utils/formTemplate/buildFormTemplatePrintHtml';
import {
  downloadFormTemplateHtmlPdf,
  getFormTemplateHtmlPdfBlob,
} from '../../utils/formTemplate/renderFormTemplateHtmlPdf';
import { buildLiveFormTemplatePdfOptions } from '../../utils/formTemplate/buildFormTemplatePdfOptions';
import resolveFirmForPdf, { mergeCustomerForPdf } from '../../utils/formTemplate/resolveFirmForPdf';
import { normalizeForm8LoanType } from '../../utils/formTemplate/form8LoanType';

export async function buildLoanForm8PdfPack(loanDetails, customer = null) {
  if (!loanDetails) {
    throw new Error('Loan details are required');
  }

  const firmId = loanDetails.girv_firm_id || loanDetails.firm?.firm_id;
  if (!firmId) {
    throw new Error('Firm not found for this loan');
  }

  const loanType = normalizeForm8LoanType(loanDetails.girv_type);
  const response = await getFormTemplate(firmId, loanType);
  const template = response?.data;
  if (!template?.config) {
    throw new Error(`Form 8 ${loanType} template not found for this firm`);
  }

  const config = normalizeFormConfig(template.config);
  const firm = await resolveFirmForPdf(firmId, loanDetails.firm || {});
  const loanUser = loanDetails.user || null;
  const loanUserId = loanUser?.user_id ?? loanDetails.girv_user_id;
  const sameCustomer =
    customer && loanUserId != null && String(customer.user_id) === String(loanUserId)
      ? customer
      : null;
  const resolvedCustomer = mergeCustomerForPdf(loanUser, sameCustomer);
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
  const html =
    template.html ||
    template.printHtml ||
    buildFormTemplatePrintHtml(config, { firmName: displayFirmName });
  const fileName = getFormTemplatePdfFileName(config, displayFirmName, pdfOptions);

  return { config, html, displayFirmName, pdfOptions, fileName, firmId };
}

/**
 * Fetch firm Form 8 template and download PDF from stored HTML.
 */
export const downloadLoanForm8Pdf = async (loanDetails, customer = null) => {
  const pack = await buildLoanForm8PdfPack(loanDetails, customer);
  await downloadFormTemplateHtmlPdf(pack.html, pack.config, {
    ...pack.pdfOptions,
    displayFirmName: pack.displayFirmName,
  });
  return pack.fileName;
};

export const getLoanForm8PdfBlob = async (loanDetails, customer = null) => {
  const pack = await buildLoanForm8PdfPack(loanDetails, customer);
  const { blob, fileName } = await getFormTemplateHtmlPdfBlob(pack.html, pack.config, {
    ...pack.pdfOptions,
    displayFirmName: pack.displayFirmName,
  });
  return { blob, fileName, firmId: pack.firmId };
};

export default downloadLoanForm8Pdf;
