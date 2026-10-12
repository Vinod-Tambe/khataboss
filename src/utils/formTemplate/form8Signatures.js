import { replaceTemplateVariables } from './formTemplateConfig';

/** Form 8 signature columns (one row, two cells). */
export const FORM8_SIGNATURE_SLOTS = [
  {
    id: 'owner',
    nameVar: 'firm_name',
    signatureSuffix: 'owner signature',
  },
  {
    id: 'customer',
    nameVar: 'customer_name',
    signatureSuffix: 'customer signature',
  },
];

/** Keeps block enabled flags; headings are not shown on the form. */
export const normalizeForm8SignatureLabels = () => ({
  owner: 'owner',
  customer: 'customer',
});

const resolveSignatureName = (slot, testData) => {
  const rawName = testData[slot.nameVar];
  if (rawName != null && String(rawName).trim() !== '') {
    return String(rawName);
  }
  const fromTemplate = replaceTemplateVariables(`{{${slot.nameVar}}}`, testData);
  return fromTemplate && String(fromTemplate).trim() !== '' ? String(fromTemplate) : '—';
};

/** Preview / PDF: line with printed name and role under the line. */
export const getForm8SignatureEntries = (_config, testData = {}) => {
  return FORM8_SIGNATURE_SLOTS.map((slot) => {
    const name = resolveSignatureName(slot, testData);
    return {
      id: slot.id,
      name,
      signatureSuffix: slot.signatureSuffix,
      caption: `${name} (${slot.signatureSuffix})`,
    };
  });
};
