/**
 * Unified Form 8 typography: main title | label | text (stored as title* / label* / value*).
 * Blocks may also use legacy body* for text — readers fall back to value* then body*.
 */

export const FORM8_TYPO_MAIN_TITLE = {
  sizeKey: 'titleFontSizePt',
  weightKey: 'titleFontWeight',
  label: 'Main title',
};

export const FORM8_TYPO_LABEL = {
  sizeKey: 'labelFontSizePt',
  weightKey: 'labelFontWeight',
  label: 'Label',
};

export const FORM8_TYPO_TEXT = {
  sizeKey: 'valueFontSizePt',
  weightKey: 'valueFontWeight',
  label: 'Text',
};

/** Legacy block body keys (kept in sync when editing Text on blocks). */
export const FORM8_TYPO_TEXT_BLOCK_ALIASES = {
  sizeKey: 'bodyFontSizePt',
  weightKey: 'bodyFontWeight',
};

export const FORM8_TYPO_GROUPS = [FORM8_TYPO_MAIN_TITLE, FORM8_TYPO_LABEL, FORM8_TYPO_TEXT];

export const getForm8TextSizePt = (style = {}) =>
  style.valueFontSizePt ?? style.bodyFontSizePt ?? '';

export const getForm8TextWeight = (style = {}) =>
  style.valueFontWeight ?? style.bodyFontWeight ?? '';

/** Patch for Text size/weight on block layouts (value + body aliases). */
export const form8TextTypographyPatch = (sizePt, weight) => {
  const patch = {};
  if (sizePt === '' || sizePt == null) {
    patch.valueFontSizePt = '';
    patch.bodyFontSizePt = '';
  } else {
    patch.valueFontSizePt = sizePt;
    patch.bodyFontSizePt = sizePt;
  }
  if (weight === '' || weight == null) {
    patch.valueFontWeight = '';
    patch.bodyFontWeight = '';
  } else {
    patch.valueFontWeight = weight;
    patch.bodyFontWeight = weight;
  }
  return patch;
};
