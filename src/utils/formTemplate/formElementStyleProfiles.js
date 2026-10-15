import {
  FORM8_TYPO_MAIN_TITLE,
  FORM8_TYPO_TEXT,
} from './formTypographyGroups';
import { isForm8DividerBlockId } from './formDividerBlocks';

/** Field width choices — plain language for Layout tab. */
export const FRIENDLY_FIELD_LAYOUT_OPTIONS = [
  { value: 'full', label: 'Whole row (1 field)' },
  { value: 'half', label: 'Half row (2 fields)' },
  { value: 'small', label: 'One-third (3 fields)' },
];

const TYPO_HEADING = { ...FORM8_TYPO_MAIN_TITLE, label: 'Heading' };
const TYPO_BODY = { ...FORM8_TYPO_TEXT, label: 'Body text' };

const BOX_COLORS = [
  { key: 'backgroundColor', label: 'Box background', fallback: 'sectionBackground', fallbackHex: '#ffffff' },
  { key: 'borderColor', label: 'Box border', fallback: 'borderColor', fallbackHex: '#d8e0ea' },
];

const TITLE_COLORS = [
  { key: 'titleColor', label: 'Heading text', fallback: 'sectionTitleColor', fallbackHex: '#3d4f63' },
  { key: 'titleBackgroundColor', label: 'Heading bar', fallback: 'tableHeaderBackground', fallbackHex: '#eef3f8' },
];

const SECTION_PROFILE = {
  store: 'section',
  showBox: false,
  showTitleColors: false,
  showBodyColor: false,
  showFieldBackgrounds: false,
  showSectionGroups: true,
  typography: [],
  extraColors: [],
};

const TEXT_BLOCK_PROFILE = {
  store: 'block',
  showBox: true,
  showTitleColors: true,
  showBodyColor: true,
  typography: [TYPO_HEADING, TYPO_BODY],
  extraColors: [],
};

const TEXT_GROUPS_PROFILE = {
  store: 'block',
  showBox: false,
  showTitleColors: false,
  showBodyColor: false,
  showTextBlockGroups: true,
  typography: [],
  extraColors: [],
};

const IMAGE_BORDER_PROFILE = {
  store: 'block',
  showBox: false,
  showImageBorder: true,
  showTitleColors: false,
  showBodyColor: false,
  typography: [],
  extraColors: [],
};

export const FORM8_SECTION_ADVANCE_BLOCK_IDS = new Set([
  'section:firm_details',
  'section:customer_details',
  'section:loan_details',
]);

export const usesForm8SectionAdvance = (blockId, hasSection = false) =>
  Boolean(hasSection) || FORM8_SECTION_ADVANCE_BLOCK_IDS.has(blockId);

export const FORM8_ELEMENT_STYLE_PROFILES = {
  form_header: {
    store: 'block',
    showBox: false,
    showHeaderBox: true,
    showTitleColors: false,
    showBodyColor: false,
    showCompactness: false,
    showHeaderLines: true,
    typography: [],
    extraColors: [],
  },
  'section:firm_details': SECTION_PROFILE,
  'section:customer_details': SECTION_PROFILE,
  'section:loan_details': SECTION_PROFILE,
  stock_line_items: {
    store: 'block',
    showBox: false,
    showTitleColors: false,
    showBodyColor: false,
    showStockTableGroups: true,
    typography: [],
    extraColors: [],
  },
  form_terms: TEXT_GROUPS_PROFILE,
  form_footer: TEXT_GROUPS_PROFILE,
  form_legal: TEXT_BLOCK_PROFILE,
  signature_lines: {
    store: 'block',
    showBox: false,
    showTitleColors: false,
    showBodyColor: false,
    showSignatureGroups: true,
    typography: [],
    extraColors: [],
  },
  form_divider: {
    store: 'block',
    showBox: false,
    showTitleColors: false,
    showBodyColor: false,
    showDividerGroups: true,
    typography: [],
    extraColors: [],
  },
  customer_photo: IMAGE_BORDER_PROFILE,
  layout_left_logo: IMAGE_BORDER_PROFILE,
  layout_right_logo: IMAGE_BORDER_PROFILE,
  layout_footer_image: IMAGE_BORDER_PROFILE,
};

export const getForm8ElementStyleProfile = (blockId, isSection = false) => {
  if (usesForm8SectionAdvance(blockId, isSection)) return SECTION_PROFILE;
  if (isForm8DividerBlockId(blockId)) return FORM8_ELEMENT_STYLE_PROFILES.form_divider;
  return FORM8_ELEMENT_STYLE_PROFILES[blockId] || null;
};

export const resolveStyleColorFallback = (theme, field) =>
  theme?.[field.fallback] || field.fallbackHex;

export { BOX_COLORS, TITLE_COLORS };
