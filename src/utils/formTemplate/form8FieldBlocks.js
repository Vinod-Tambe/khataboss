/** Single-line field blocks (label + value) that can be placed anywhere on the Form 8 canvas. */

export const FORM8_FIELD_BLOCK_PREFIX = 'field:';

export const fieldBlockId = (fieldId) => `${FORM8_FIELD_BLOCK_PREFIX}${fieldId}`;

export const parseFieldBlockId = (blockId) => {
  if (!blockId?.startsWith(FORM8_FIELD_BLOCK_PREFIX)) return null;
  return blockId.slice(FORM8_FIELD_BLOCK_PREFIX.length) || null;
};

export const isForm8FieldBlockId = (blockId) => Boolean(parseFieldBlockId(blockId));

/** Retired — no longer offered in the Elements panel. */
export const FORM8_POSITIONABLE_FIELDS = [];

export const getForm8FieldBlockValue = (fieldId, data) => {
  if (!fieldId || !data) return '—';
  const raw = data[fieldId];
  if (raw == null || String(raw).trim() === '') return '—';
  return String(raw);
};
