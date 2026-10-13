import React from 'react';
import {
  FORM_FIELD_FONT_PT_MAX,
  FORM_FIELD_FONT_PT_MIN,
} from '../../../utils/formTemplate/formTemplateConfig';
import { FORM8_FONT_WEIGHT_OPTIONS } from '../../../utils/formTemplate/form8SectionStyle';
import {
  FORM8_TYPO_GROUPS,
  FORM8_TYPO_TEXT,
  getForm8TextSizePt,
  getForm8TextWeight,
} from '../../../utils/formTemplate/form8TypographyGroups';

/**
 * Main title / Label / Text — font size & weight (shared across sections, blocks, form header theme).
 */
const Form8TypographyFields = ({
  values = {},
  placeholders = {},
  onPatch,
  useTextAliases = false,
  groups = FORM8_TYPO_GROUPS,
}) => {
  const readSize = (group) => {
    if (useTextAliases && group.sizeKey === FORM8_TYPO_TEXT.sizeKey) {
      const v = getForm8TextSizePt(values);
      return v === '' || v == null ? '' : v;
    }
    const v = values[group.sizeKey];
    return v === '' || v == null ? '' : v;
  };

  const readWeight = (group) => {
    if (useTextAliases && group.weightKey === FORM8_TYPO_TEXT.weightKey) {
      return getForm8TextWeight(values) ?? '';
    }
    return values[group.weightKey] ?? '';
  };

  const setSize = (group, raw) => {
    if (useTextAliases && group.sizeKey === FORM8_TYPO_TEXT.sizeKey) {
      if (raw === '' || raw == null) {
        onPatch({
          valueFontSizePt: '',
          bodyFontSizePt: '',
        });
        return;
      }
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      const pt = Math.min(FORM_FIELD_FONT_PT_MAX, Math.max(FORM_FIELD_FONT_PT_MIN, n));
      onPatch({ valueFontSizePt: pt, bodyFontSizePt: pt });
      return;
    }
    if (raw === '' || raw == null) {
      onPatch({ [group.sizeKey]: '' });
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onPatch({
      [group.sizeKey]: Math.min(FORM_FIELD_FONT_PT_MAX, Math.max(FORM_FIELD_FONT_PT_MIN, n)),
    });
  };

  const setWeight = (group, raw) => {
    if (useTextAliases && group.weightKey === FORM8_TYPO_TEXT.weightKey) {
      onPatch({
        valueFontWeight: raw,
        bodyFontWeight: raw,
      });
      return;
    }
    onPatch({ [group.weightKey]: raw });
  };

  return (
    <div className="f8-typography-groups">
      {(groups?.length ? groups : FORM8_TYPO_GROUPS).map((group) => (
        <div key={group.sizeKey} className="mb-3">
          <p className="small fw-semibold mb-2">{group.label}</p>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small">Font size (pt)</label>
              <input
                type="number"
                min={FORM_FIELD_FONT_PT_MIN}
                max={FORM_FIELD_FONT_PT_MAX}
                step={0.5}
                className="form-control form-control-sm"
                placeholder={
                  placeholders[group.sizeKey] != null
                    ? String(placeholders[group.sizeKey])
                    : ''
                }
                value={readSize(group)}
                onChange={(e) => setSize(group, e.target.value)}
              />
            </div>
            <div className="col-6">
              <label className="form-label small">Font weight</label>
              <select
                className="form-select form-select-sm"
                value={readWeight(group)}
                onChange={(e) => setWeight(group, e.target.value)}
              >
                {FORM8_FONT_WEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'default'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Form8TypographyFields;
