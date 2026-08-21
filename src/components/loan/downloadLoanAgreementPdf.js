import { getAgreementTemplate } from '../../api/agreementTemplateApi';
import { normalizeAgreementConfig } from '../../utils/formTemplate/agreementTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import { downloadFormTemplatePdf } from '../../utils/formTemplate/buildFormTemplatePdf';

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
  const { formData, transactionRows, firmName, loanRef } = buildFormTemplateLoanData(
    loanDetails,
    customer
  );

  const fileName = downloadFormTemplatePdf(config, firmName || template.firmName, {
    formData,
    transactionRows,
    loanRef,
  });

  return fileName;
};

export default downloadLoanAgreementPdf;
