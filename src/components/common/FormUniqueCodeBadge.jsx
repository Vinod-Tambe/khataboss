import React, { useEffect, useState } from 'react';
import { previewNextUniqueCode } from '../../api/serialNumberApi';
import '../../css/FormUniqueCodeBadge.css';

/**
 * Display-only badge for form headers.
 * Add forms: pass entityType to preview next code.
 * Update forms: pass code from loaded record.
 */
const FormUniqueCodeBadge = ({ entityType, code }) => {
  const [previewCode, setPreviewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const existingCode = String(code || '').trim();
  const isExisting = Boolean(existingCode);

  useEffect(() => {
    if (isExisting || !entityType) return undefined;

    let cancelled = false;
    setLoading(true);

    previewNextUniqueCode(entityType)
      .then((res) => {
        if (!cancelled) {
          setPreviewCode(String(res?.preview_code || '').trim());
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewCode('');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [entityType, isExisting]);

  const displayCode = isExisting ? existingCode : previewCode;

  if (!loading && !displayCode) return null;

  return (
    <div className="form-unique-code-badge" aria-live="polite">
      <div className="form-unique-code-badge__value">
        {loading && !displayCode ? '...' : displayCode}
      </div>
    </div>
  );
};

export default FormUniqueCodeBadge;
