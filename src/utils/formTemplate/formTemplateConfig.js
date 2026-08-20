import defaultConfig from '../../data/defaultFormTemplate.json';

export const DEFAULT_FORM_CONFIG = defaultConfig;

export const PAGE_DIMENSIONS_MM = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 216, height: 279 },
};

export const FONT_SIZE_MAP = {
  small: 10,
  medium: 11,
  large: 12,
};

/** Field width on form row: full = 1 per row, half = 2 per row, small = 3 per row */
export const FIELD_LAYOUT_OPTIONS = [
  { value: 'full', label: 'Full (1 per row)' },
  { value: 'half', label: 'Half (2 per row)' },
  { value: 'small', label: 'Small (3 per row)' },
];

export const normalizeFieldLayout = (layout) => {
  if (layout === 'full' || layout === 'small') return layout;
  return 'half';
};

export const getFieldLayoutClass = (layout) => {
  const key = normalizeFieldLayout(layout);
  return `layout-${key}`;
};

export const THEME_FIELDS = [
  { key: 'primaryColor', label: 'Primary / Title' },
  { key: 'secondaryColor', label: 'Secondary' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'textColor', label: 'Body text' },
  { key: 'mutedTextColor', label: 'Muted text' },
  { key: 'borderColor', label: 'Borders' },
  { key: 'headerBackground', label: 'Header background' },
  { key: 'sectionBackground', label: 'Section background' },
  { key: 'sectionTitleColor', label: 'Section titles' },
  { key: 'tableHeaderBackground', label: 'Table header' },
  { key: 'pageBackground', label: 'Page background' },
];

const findDefaultSection = (sectionId) =>
  (DEFAULT_FORM_CONFIG.sections || []).find((s) => s.id === sectionId);

const findDefaultField = (sectionId, fieldId) => {
  const section = findDefaultSection(sectionId);
  return (section?.fields || []).find((f) => f.id === fieldId);
};

const LEGACY_TXN_FIELD_IDS = new Set([
  'txn_date',
  'txn_type',
  'txn_amount',
  'txn_narration',
]);

const isLegacyTransactionSection = (section) =>
  section?.id === 'transaction_history' &&
  (section.fields || []).length > 0 &&
  (section.fields || []).every((field) => LEGACY_TXN_FIELD_IDS.has(field.id));

const mapDefaultSectionFields = (defSection) =>
  (defSection?.fields || []).map((field, fIdx) => ({
    ...field,
    order: field.order ?? fIdx + 1,
    fieldLayout: normalizeFieldLayout(field.fieldLayout),
    backgroundColor: '',
  }));

export const normalizeFormConfig = (config) => {
  if (!config) return structuredClone(DEFAULT_FORM_CONFIG);

  const sourceSections =
    Array.isArray(config.sections) && config.sections.length
      ? config.sections
      : DEFAULT_FORM_CONFIG.sections;

  const mergeSectionFields = (section, defSection) => {
    if (isLegacyTransactionSection(section) && defSection) {
      return mapDefaultSectionFields(defSection);
    }

    const mergedFields = (section.fields || []).map((field, fIdx) => ({
      ...findDefaultField(section.id, field.id),
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
    const defSection = findDefaultSection(section.id);
    return {
      ...defSection,
      ...section,
      order: section.order ?? sIdx + 1,
      backgroundColor: section.backgroundColor || '',
      fields: mergeSectionFields(section, defSection),
    };
  });

  const existingSectionIds = new Set(sections.map((section) => section.id));
  DEFAULT_FORM_CONFIG.sections.forEach((defSection) => {
    if (!existingSectionIds.has(defSection.id)) {
      sections.push({
        ...defSection,
        fields: (defSection.fields || []).map((field, fIdx) => ({
          ...field,
          order: field.order ?? fIdx + 1,
          fieldLayout: normalizeFieldLayout(field.fieldLayout),
          backgroundColor: '',
        })),
      });
    }
  });

  sections.sort((a, b) => (a.order || 0) - (b.order || 0));

  return {
    ...DEFAULT_FORM_CONFIG,
    ...config,
    subtitle: config.subtitle || DEFAULT_FORM_CONFIG.subtitle,
    complianceReference:
      config.complianceReference || DEFAULT_FORM_CONFIG.complianceReference || '',
    headerNote: config.headerNote || DEFAULT_FORM_CONFIG.headerNote || '',
    footerNote: config.footerNote || DEFAULT_FORM_CONFIG.footerNote || '',
    termsAndConditions:
      config.termsAndConditions || DEFAULT_FORM_CONFIG.termsAndConditions,
    declarationText:
      config.declarationText || DEFAULT_FORM_CONFIG.declarationText,
    theme: { ...DEFAULT_FORM_CONFIG.theme, ...(config.theme || {}) },
    layout: { ...DEFAULT_FORM_CONFIG.layout, ...(config.layout || {}) },
    signatureLabels: {
      ...DEFAULT_FORM_CONFIG.signatureLabels,
      ...(config.signatureLabels || {}),
    },
    variables: config.variables?.length ? config.variables : DEFAULT_FORM_CONFIG.variables,
    sections,
  };
};

export const getSortedSections = (config) =>
  [...(config?.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

export const getSortedFields = (section) =>
  [...(section?.fields || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

export const reorderList = (list, fromIndex, toIndex) => {
  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, idx) => ({ ...item, order: idx + 1 }));
};

export const getPageStyle = (config) => {
  const size = config?.pageSize || 'A4';
  const orientation = config?.orientation || 'portrait';
  const dims = PAGE_DIMENSIONS_MM[size] || PAGE_DIMENSIONS_MM.A4;
  const width = orientation === 'landscape' ? dims.height : dims.width;
  const height = orientation === 'landscape' ? dims.width : dims.height;
  const theme = config?.theme || DEFAULT_FORM_CONFIG.theme;
  const fontPt = FONT_SIZE_MAP[config?.fontSize] || FONT_SIZE_MAP.medium;

  return {
    widthMm: width,
    heightMm: height,
    fontPt,
    theme,
    cssVars: {
      '--ft-primary': theme.primaryColor,
      '--ft-secondary': theme.secondaryColor,
      '--ft-accent': theme.accentColor,
      '--ft-text': theme.textColor,
      '--ft-muted': theme.mutedTextColor,
      '--ft-border': theme.borderColor,
      '--ft-header-bg': theme.headerBackground,
      '--ft-section-bg': theme.sectionBackground,
      '--ft-section-title': theme.sectionTitleColor,
      '--ft-table-header': theme.tableHeaderBackground,
      '--ft-page-bg': theme.pageBackground,
      '--ft-font-pt': `${fontPt}pt`,
    },
  };
};

export const replaceTemplateVariables = (text, data = {}) => {
  if (!text) return '';
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
};

/** Group fields into PDF/preview rows by fieldLayout */
export const groupFieldsByLayout = (fields) => {
  const enabled = [...(fields || [])]
    .filter((f) => f.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const groups = [];
  let i = 0;

  while (i < enabled.length) {
    const layout = normalizeFieldLayout(enabled[i].fieldLayout);

    if (layout === 'full') {
      groups.push({ layout: 'full', fields: [enabled[i]] });
      i += 1;
      continue;
    }

    if (layout === 'small') {
      const chunk = [];
      while (
        i < enabled.length &&
        normalizeFieldLayout(enabled[i].fieldLayout) === 'small' &&
        chunk.length < 3
      ) {
        chunk.push(enabled[i]);
        i += 1;
      }
      groups.push({ layout: 'small', fields: chunk });
      continue;
    }

    const chunk = [enabled[i]];
    i += 1;
    if (
      i < enabled.length &&
      normalizeFieldLayout(enabled[i].fieldLayout) === 'half'
    ) {
      chunk.push(enabled[i]);
      i += 1;
    }
    groups.push({ layout: 'half', fields: chunk });
  }

  return groups;
};
