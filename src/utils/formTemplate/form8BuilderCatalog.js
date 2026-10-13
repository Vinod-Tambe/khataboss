/** Builder palette blocks (PO Builder–style) mapped to Form 8 config. */

/** Sections that can be added/removed from the canvas (PO-builder style). */
export const FORM8_OPTIONAL_SECTION_IDS = new Set([
  'transaction_history',
  'item_details',
  'interest_summary',
  'redemption_details',
]);

/** Retired blocks — hidden from Elements panel and removed on normalize. */
export const FORM8_PALETTE_HIDDEN_BLOCK_IDS = new Set([
  'page_settings',
  'macro_keywords',
  'form_legal',
  'field:today_date',
  'field:loan_date',
  'field:loan_no',
  'section:transaction_history',
  'section:item_details',
  'section:redemption_details',
  'section:interest_summary',
]);

export const FORM8_RETIRED_SECTION_IDS = new Set([
  'transaction_history',
  'item_details',
  'redemption_details',
  'interest_summary',
]);

export const isForm8PaletteBlockHidden = (blockId) =>
  FORM8_PALETTE_HIDDEN_BLOCK_IDS.has(blockId);

export const FORM8_SPECIAL_BLOCKS = [
  {
    id: 'layout_left_logo',
    label: 'Left logo',
    category: 'required',
  },
  {
    id: 'layout_right_logo',
    label: 'Right logo',
    category: 'optional',
  },
  {
    id: 'form_header',
    label: 'Form Header',
    category: 'required',
    description: 'FORM 8 title, subtitle, compliance reference',
  },
  {
    id: 'form_footer',
    label: 'Footer Note',
    category: 'optional',
    description: 'Statutory note (Rule 18 / Section 24)',
  },
  {
    id: 'form_divider',
    label: 'Divider',
    category: 'optional',
  },
];

export const sectionBlockId = (sectionId) => `section:${sectionId}`;

export const parseSectionBlockId = (blockId) => {
  if (!blockId?.startsWith('section:')) return null;
  return blockId.slice('section:'.length);
};

export const buildSectionPaletteItems = (sections = []) =>
  sections.map((section) => ({
    id: sectionBlockId(section.id),
    sectionId: section.id,
    label: section.label || section.id,
    category: FORM8_OPTIONAL_SECTION_IDS.has(section.id) ? 'optional' : 'required',
    description: section.enabled ? 'On form' : 'Hidden',
    enabled: Boolean(section.enabled),
  }));

export const isBlockOnForm = (blockId, config) => {
  if (!config) return false;
  const sectionId = parseSectionBlockId(blockId);
  if (sectionId) {
    const section = (config.sections || []).find((s) => s.id === sectionId);
    return Boolean(section?.enabled);
  }
  if (blockId === 'layout_left_logo') {
    return config.layout?.showLeftLogo !== false;
  }
  if (blockId === 'layout_right_logo') {
    return config.layout?.showRightLogo !== false;
  }
  if (blockId === 'layout_logo') {
    return Boolean(config.layout?.showLeftLogo || config.layout?.showRightLogo);
  }
  if (blockId === 'form_legal') {
    return Boolean(
      config.termsAndConditions ||
        config.declarationText ||
        Object.keys(config.signatureLabels || {}).length
    );
  }
  if (blockId === 'form_footer') {
    return Boolean(config.footerNote || config.layout?.useFirmFormFooter);
  }
  return true;
};
