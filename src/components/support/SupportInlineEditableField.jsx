import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

const SupportInlineEditableField = ({
  value,
  onSave,
  editable = false,
  multiline = false,
  maxLength,
  className = '',
  inputClassName = '',
  placeholder = 'Click to edit',
  ariaLabel,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      setDraft(value || '');
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (multiline && inputRef.current.select) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      } else if (!multiline) {
        inputRef.current.select();
      }
    }
  }, [editing, multiline]);

  const cancel = () => {
    setDraft(value || '');
    setEditing(false);
  };

  const commit = async () => {
    const trimmed = String(draft ?? '').trim();
    const current = String(value ?? '').trim();

    if (!editable || saving) {
      setEditing(false);
      return;
    }

    if (trimmed === current) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (error) {
      setDraft(value || '');
      toast.error(error?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    if (!editable || saving) return;
    setDraft(value || '');
    setEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  if (editing) {
    const InputTag = multiline ? 'textarea' : 'input';
    return (
      <div className={`support-inline-edit support-inline-edit--active ${className}`}>
        <InputTag
          ref={inputRef}
          className={`support-inline-edit__control ${inputClassName}`}
          value={draft}
          maxLength={maxLength}
          rows={multiline ? 6 : undefined}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit()}
          onKeyDown={handleKeyDown}
        />
        {maxLength && (
          <div className="support-inline-edit__meta text-end small text-muted">
            {draft.length}/{maxLength}
            {saving ? ' · Saving…' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`support-inline-edit support-inline-edit--display ${editable ? 'is-editable' : ''} ${className}`}
      onClick={startEdit}
      disabled={!editable || saving}
      aria-label={editable ? `${ariaLabel}. Click to edit` : ariaLabel}
    >
      <span className="support-inline-edit__text">{value || placeholder}</span>
      {editable && (
        <i className="bi bi-pencil support-inline-edit__icon" aria-hidden="true" />
      )}
      {saving && <span className="support-inline-edit__saving small text-muted ms-2">Saving…</span>}
    </button>
  );
};

export default SupportInlineEditableField;
