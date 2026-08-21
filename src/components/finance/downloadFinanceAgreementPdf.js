import { getAgreementTemplate } from '../../api/agreementTemplateApi';
import { normalizeAgreementConfig } from '../../utils/formTemplate/agreementTemplateConfig';
import { buildFormTemplateFinanceData } from '../../utils/formTemplate/buildFormTemplateFinanceData';
import { downloadFormTemplatePdf } from '../../utils/formTemplate/buildFormTemplatePdf';

export const downloadFinanceAgreementPdf = async ({
  financeData,
  initialFinance,
  customer = null,
  emiRows = [],
}) => {
  const finance = financeData || initialFinance;
  if (!finance) {
    throw new Error('Finance details are required');
  }

  const firmId = finance.fin_firm_id || finance.firm?.firm_id || initialFinance?.fin_firm_id;
  if (!firmId) {
    throw new Error('Firm not found for this finance');
  }

  const response = await getAgreementTemplate(firmId, 'Finance');
  const template = response?.data;
  if (!template?.config) {
    throw new Error('Finance agreement template not found for this firm');
  }

  const config = normalizeAgreementConfig(template.config, 'Finance');
  const { formData, transactionRows, firmName, financeRef } = buildFormTemplateFinanceData(
    financeData,
    initialFinance,
    customer,
    emiRows
  );

  const fileName = downloadFormTemplatePdf(config, firmName || template.firmName, {
    formData,
    transactionRows,
    loanRef: financeRef,
  });

  return fileName;
};

export default downloadFinanceAgreementPdf;
