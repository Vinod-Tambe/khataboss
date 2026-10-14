/**
 * Form 8 template macros — use in header/footer/notes as {{macro_name}}.
 * Field IDs (firm_name, loan_no, …) are filled automatically on the form; macros below are for free text.
 */

export const FORM_TEMPLATE_MACRO_GROUPS = [
  {
    id: 'firm',
    label: 'Firm / Pawnbroker',
    macros: [
      { key: '{{firm_name}}', label: 'Firm ID', hint: 'Firm ID / name' },
      { key: '{{firm_shop_name}}', label: 'Shop name', hint: 'Place of business' },
      { key: '{{firm_reg_no}}', label: 'Registration no.', hint: 'Registration number' },
      { key: '{{firm_address}}', label: 'Full address', hint: 'Firm address' },
      { key: '{{firm_phone_no}}', label: 'Phone no.', hint: 'Firm phone' },
      { key: '{{firm_email_id}}', label: 'Email ID', hint: 'Firm email' },
      { key: '{{firm_owner}}', label: 'Owner / proprietor', hint: 'Owner name' },
      { key: '{{firm_pan_no}}', label: 'PAN no.', hint: 'Firm PAN' },
      { key: '{{firm_gstin_no}}', label: 'GSTIN', hint: 'Firm GSTIN' },
    ],
  },
  {
    id: 'customer',
    label: 'Customer / Pawner',
    macros: [
      { key: '{{customer_id}}', label: 'Customer ID', hint: 'Unique customer code' },
      { key: '{{customer_name}}', label: 'Customer name', hint: 'Customer full name' },
      { key: '{{customer_address}}', label: 'Permanent address', hint: 'Residential address' },
      { key: '{{customer_mobile}}', label: 'Mobile', hint: 'Customer mobile number' },
      { key: '{{customer_aadhaar}}', label: 'Aadhaar', hint: 'Aadhaar number' },
      { key: '{{customer_pan}}', label: 'PAN no.', hint: 'Customer PAN' },
    ],
  },
  {
    id: 'loan',
    label: 'Loan / Pledge',
    macros: [
      { key: '{{loan_no}}', label: 'Loan no.', hint: 'Loan unique number' },
      { key: '{{loan_date}}', label: 'Loan start date', hint: 'Date of loan' },
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
