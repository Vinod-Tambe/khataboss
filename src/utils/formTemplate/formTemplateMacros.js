/**
 * Form 8 template macros — use in header/footer/notes as {{macro_name}}.
 * Field IDs (firm_name, loan_no, …) are filled automatically on the form; macros below are for free text.
 */

export const FORM_TEMPLATE_MACRO_GROUPS = [
  {
    id: 'firm',
    label: 'Firm / Pawnbroker',
    macros: [
      { key: '{{firm_name}}', label: 'Firm name', hint: 'Pawnbroker / money-lender name' },
      { key: '{{firm_shop_name}}', label: 'Shop / branch', hint: 'Place of business' },
      { key: '{{firm_reg_no}}', label: 'Licence no.', hint: 'Registration or licence number' },
      { key: '{{firm_address}}', label: 'Firm address', hint: 'Full business address' },
      { key: '{{firm_phone_no}}', label: 'Firm phone', hint: 'Contact number' },
      { key: '{{firm_pan_no}}', label: 'Firm PAN', hint: 'PAN of money-lender' },
      { key: '{{firm_gstin_no}}', label: 'Firm GSTIN', hint: 'GST number if applicable' },
    ],
  },
  {
    id: 'customer',
    label: 'Customer / Pawner',
    macros: [
      { key: '{{customer_name}}', label: 'Customer name', hint: 'Pawner full name' },
      { key: '{{customer_address}}', label: 'Customer address', hint: 'Residential address' },
      { key: '{{customer_mobile}}', label: 'Mobile', hint: 'Customer mobile number' },
      { key: '{{customer_aadhaar}}', label: 'Aadhaar', hint: 'Identity proof number' },
      { key: '{{customer_pan}}', label: 'Customer PAN', hint: 'PAN of pawner' },
    ],
  },
  {
    id: 'loan',
    label: 'Loan / Pledge',
    macros: [
      { key: '{{loan_no}}', label: 'Loan / ticket no.', hint: 'Pledge or loan number' },
      { key: '{{loan_date}}', label: 'Loan date', hint: 'Date of loan / pledge' },
      { key: '{{loan_amount}}', label: 'Principal', hint: 'Principal amount (formatted)' },
      { key: '{{interest_rate}}', label: 'Interest rate', hint: 'Rate of interest' },
      { key: '{{loan_period}}', label: 'Loan period', hint: 'Agreed redemption period' },
      { key: '{{due_date}}', label: 'Due date', hint: 'Redemption due date' },
      { key: '{{loan_status}}', label: 'Loan status', hint: 'Active / closed status' },
      { key: '{{outstanding}}', label: 'Outstanding', hint: 'Balance outstanding' },
      { key: '{{today_date}}', label: "Today's date", hint: 'Print / issue date' },
    ],
  },
  {
    id: 'item',
    label: 'Pledged article',
    macros: [
      { key: '{{item_description}}', label: 'Item description', hint: 'Article description' },
      { key: '{{item_metal}}', label: 'Metal', hint: 'Gold / silver etc.' },
      { key: '{{item_gross_wt}}', label: 'Gross weight', hint: 'Gross weight with unit' },
      { key: '{{item_net_wt}}', label: 'Net weight', hint: 'Net weight with unit' },
      { key: '{{item_value}}', label: 'Item value', hint: 'Value at time of pledge' },
    ],
  },
];

export const flattenFormTemplateMacros = () =>
  FORM_TEMPLATE_MACRO_GROUPS.flatMap((g) => g.macros);

/** Legacy `variables` array shape for stored template JSON */
export const buildDefaultTemplateVariables = () =>
  flattenFormTemplateMacros().map((m) => ({
    key: m.key,
    label: m.label,
  }));
