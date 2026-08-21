import defaultLoanAgreement from '../../data/defaultLoanAgreementTemplate.json';
import defaultFinanceAgreement from '../../data/defaultFinanceAgreementTemplate.json';
import {
  normalizeFieldLayout,
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
  getSortedSections,
  getSortedFields,
  reorderList,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
  getFieldLayoutClass,
  PAGE_DIMENSIONS_MM,
  FONT_SIZE_MAP,
} from './formTemplateConfig';

export const DEFAULT_LOAN_AGREEMENT_CONFIG = defaultLoanAgreement;
export const DEFAULT_FINANCE_AGREEMENT_CONFIG = defaultFinanceAgreement;

export const AGREEMENT_TYPES = [
  { id: 'Loan', label: 'Loan Agreement' },
  { id: 'Finance', label: 'Finance Agreement' },
];

const getDefaultConfig = (type = 'Loan') =>
  type === 'Finance' ? DEFAULT_FINANCE_AGREEMENT_CONFIG : DEFAULT_LOAN_AGREEMENT_CONFIG;

const findDefaultSection = (defaults, sectionId) =>
  (defaults.sections || []).find((s) => s.id === sectionId) || null;

const findDefaultField = (defaultSection, fieldId) =>
  (defaultSection?.fields || []).find((f) => f.id === fieldId) || null;

const mapDefaultSectionFields = (defSection) =>
  (defSection?.fields || []).map((field, fIdx) => ({
    ...field,
    order: field.order ?? fIdx + 1,
    fieldLayout: normalizeFieldLayout(field.fieldLayout),
    backgroundColor: '',
  }));

export const normalizeAgreementConfig = (config, type = 'Loan') => {
  const defaults = getDefaultConfig(type);
  if (!config) return structuredClone(defaults);

  const sourceSections =
    Array.isArray(config.sections) && config.sections.length
      ? config.sections
      : defaults.sections || [];

  const mergeSectionFields = (section, defSection) => {
    const mergedFields = (section.fields || []).map((field, fIdx) => ({
      ...findDefaultField(defSection, field.id),
      ...field,
      order: field.order ?? fIdx + 1,
      fieldLayout: normalizeFieldLayout(field.fieldLayout),
      backgroundColor: field.backgroundColor || '',
    }));

    const existingFieldIds = new Set(mergedFields.map((field) => field.id));
    (defSection?.fields || []).forEach((defField, fIdx) => {
      if (!existingFieldIds.has(defField.id)) {
        mergedFields.push({
          ...defField,
          order: defField.order ?? mergedFields.length + fIdx + 1,
          fieldLayout: normalizeFieldLayout(defField.fieldLayout),
          backgroundColor: '',
        });
      }
    });

    mergedFields.sort((a, b) => (a.order || 0) - (b.order || 0));
    return mergedFields;
  };

  const sections = sourceSections.map((section, sIdx) => {
    const defSection = findDefaultSection(defaults, section.id);
    return {
      ...defSection,
      ...section,
      order: section.order ?? sIdx + 1,
      backgroundColor: section.backgroundColor || '',
      fields: mergeSectionFields(section, defSection),
    };
  });

  const existingSectionIds = new Set(sections.map((section) => section.id));
  (defaults.sections || []).forEach((defSection) => {
    if (!existingSectionIds.has(defSection.id)) {
      sections.push({
        ...defSection,
        fields: mapDefaultSectionFields(defSection),
      });
    }
  });

  sections.sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    ...defaults,
    ...config,
    subtitle: config.subtitle || defaults.subtitle,
    complianceReference: config.complianceReference || defaults.complianceReference || '',
    headerNote: config.headerNote || defaults.headerNote || '',
    footerNote: config.footerNote || defaults.footerNote || '',
    termsAndConditions: config.termsAndConditions || defaults.termsAndConditions,
    declarationText: config.declarationText || defaults.declarationText,
    theme: { ...(defaults.theme || {}), ...(config.theme || {}) },
    layout: { ...defaults.layout, ...(config.layout || {}) },
    signatureLabels: {
      ...defaults.signatureLabels,
      ...(config.signatureLabels || {}),
    },
    variables: config.variables?.length ? config.variables : defaults.variables,
    sections,
  };
};

export {
  THEME_FIELDS,
  FIELD_LAYOUT_OPTIONS,
  getSortedSections,
  getSortedFields,
  reorderList,
  getPageStyle,
  replaceTemplateVariables,
  groupFieldsByLayout,
  getFieldLayoutClass,
  PAGE_DIMENSIONS_MM,
  FONT_SIZE_MAP,
};
