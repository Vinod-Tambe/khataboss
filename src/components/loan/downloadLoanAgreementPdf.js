import { getAgreementTemplate } from '../../api/agreementTemplateApi';
import { normalizeAgreementConfig } from '../../utils/agreementBuilder/templateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import { getFormTemplatePdfFileName } from '../../utils/formTemplate/buildFormTemplatePdf';
import { buildFormTemplatePrintHtml } from '../../utils/formTemplate/buildFormTemplatePrintHtml';
import {
  downloadFormTemplateHtmlPdf,
  getFormTemplateHtmlPdfBlob,
} from '../../utils/formTemplate/renderFormTemplateHtmlPdf';
import { buildLiveFormTemplatePdfOptions } from '../../utils/formTemplate/buildFormTemplatePdfOptions';
import resolveFirmForPdf, { mergeCustomerForPdf } from '../../utils/formTemplate/resolveFirmForPdf';
import { normalizeForm8LoanType } from '../../utils/formTemplate/formLoanType';

export async function buildLoanAgreementPdfPack(loanDetails, customer = null) {
  if (!loanDetails) {
    throw new Error('Loan details are required');
  }

  const firmId = loanDetails.girv_firm_id || loanDetails.firm?.firm_id;
  if (!firmId) {
    throw new Error('Firm not found for this loan');
  }

  const loanType = normalizeForm8LoanType(loanDetails.girv_type);
  const response = await getAgreementTemplate(firmId, 'Loan', loanType);
  const template = response?.data;
  if (!template?.config) {
    throw new Error(`Loan agreement ${loanType} template not found for this firm`);
  }

  const config = normalizeAgreementConfig(template.config, 'Loan', loanType);
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
  const html =
    template.html ||
    template.printHtml ||
    buildFormTemplatePrintHtml(config, { firmName: displayFirmName });
  const fileName = getFormTemplatePdfFileName(config, displayFirmName, pdfOptions);

  return { config, html, displayFirmName, pdfOptions, fileName, firmId };
}

export const downloadLoanAgreementPdf = async (loanDetails, customer = null) => {
  const pack = await buildLoanAgreementPdfPack(loanDetails, customer);
  await downloadFormTemplateHtmlPdf(pack.html, pack.config, {
    ...pack.pdfOptions,
    displayFirmName: pack.displayFirmName,
  });
  return pack.fileName;
};

export const getLoanAgreementPdfBlob = async (loanDetails, customer = null) => {
  const pack = await buildLoanAgreementPdfPack(loanDetails, customer);
  const { blob, fileName } = await getFormTemplateHtmlPdfBlob(pack.html, pack.config, {
    ...pack.pdfOptions,
    displayFirmName: pack.displayFirmName,
  });
  return { blob, fileName, firmId: pack.firmId };
};

export default downloadLoanAgreementPdf;
