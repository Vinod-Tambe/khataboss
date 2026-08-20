import { getFormTemplate } from '../../api/formTemplateApi';
import { normalizeFormConfig } from '../../utils/formTemplate/formTemplateConfig';
import { buildFormTemplateLoanData } from '../../utils/formTemplate/buildFormTemplateLoanData';
import { downloadFormTemplatePdf } from '../../utils/formTemplate/buildFormTemplatePdf';

/**
 * Fetch firm Form 8 template and download PDF filled with live loan data.
 */
export const downloadLoanForm8Pdf = async (loanDetails, customer = null) => {
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

export default downloadLoanForm8Pdf;
