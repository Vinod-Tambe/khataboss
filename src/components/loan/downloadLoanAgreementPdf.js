import { getAgreementTemplate } from '../../api/agreementTemplateApi';
import { normalizeAgreementConfig } from '../../utils/formTemplate/agreementTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import { downloadFormTemplatePdf } from '../../utils/formTemplate/buildFormTemplatePdf';
import { buildLiveFormTemplatePdfOptions } from '../../utils/formTemplate/buildFormTemplatePdfOptions';
import resolveFirmForPdf, { mergeCustomerForPdf } from '../../utils/formTemplate/resolveFirmForPdf';

export const downloadLoanAgreementPdf = async (loanDetails, customer = null) => {
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
  const { formData, transactionRows, firmName, loanRef } = buildFormTemplateLoanData(
    loanDetails,
    resolvedCustomer
  );
  const pdfOptions = await buildLiveFormTemplatePdfOptions({
    firm,
    customer: resolvedCustomer,
    formData,
    transactionRows,
    loanRef,
    config,
  });

  const fileName = downloadFormTemplatePdf(config, firmName || template.firmName, pdfOptions);

  return fileName;
};

export default downloadLoanAgreementPdf;
