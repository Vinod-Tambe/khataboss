import { getAgreementTemplate } from '../../api/agreementTemplateApi';
import { normalizeAgreementConfig } from '../../utils/formTemplate/agreementTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import {
  downloadFormTemplatePdf,
  getFormTemplatePdfBlob,
  getFormTemplatePdfFileName,
} from '../../utils/formTemplate/buildFormTemplatePdf';
import { buildLiveFormTemplatePdfOptions } from '../../utils/formTemplate/buildFormTemplatePdfOptions';
import resolveFirmForPdf, { mergeCustomerForPdf } from '../../utils/formTemplate/resolveFirmForPdf';

export async function buildLoanAgreementPdfPack(loanDetails, customer = null) {
  if (!loanDetails) {
    throw new Error('Loan details are required');
  }

  const firmId = loanDetails.girv_firm_id || loanDetails.firm?.firm_id;
  if (!firmId) {
    throw new Error('Firm not found for this loan');
  }

  const response = await getAgreementTemplate(firmId, 'Loan');
  const template = response?.data;
  if (!template?.config) {
    throw new Error('Loan agreement template not found for this firm');
  }

  const config = normalizeAgreementConfig(template.config, 'Loan');
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

export const downloadLoanAgreementPdf = async (loanDetails, customer = null) => {
  const pack = await buildLoanAgreementPdfPack(loanDetails, customer);
  downloadFormTemplatePdf(pack.config, pack.displayFirmName, pack.pdfOptions);
  return pack.fileName;
};

export const getLoanAgreementPdfBlob = async (loanDetails, customer = null) => {
  const pack = await buildLoanAgreementPdfPack(loanDetails, customer);
  const blob = await getFormTemplatePdfBlob(pack.config, pack.displayFirmName, pack.pdfOptions);
  return { blob, fileName: pack.fileName, firmId: pack.firmId };
};

export default downloadLoanAgreementPdf;
