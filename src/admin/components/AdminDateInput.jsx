import React, { useEffect, useState } from 'react';
import {
  parseDateDisplayToInput,
  toDateInputDisplay,
} from '../utils/dateHelpers';

const AdminDateInput = ({
  value,
  onChange,
  className = 'form-control',
  placeholder = 'DD/MM/YYYY',
  required = false,
  id,
  name,
  disabled = false,
}) => {
  const [display, setDisplay] = useState(() => toDateInputDisplay(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDisplay(toDateInputDisplay(value));
    setInvalid(false);
  }, [value]);

  const commitDisplay = (nextDisplay) => {
    const trimmed = String(nextDisplay || '').trim();
    if (!trimmed) {
      setInvalid(false);
      onChange('');
      return true;
    }

    const parsed = parseDateDisplayToInput(trimmed);
    if (!parsed) {
      setInvalid(true);
      return false;
    }

    setDisplay(toDateInputDisplay(parsed));
    setInvalid(false);
    onChange(parsed);
    return true;
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setDisplay(next);

    if (!next.trim()) {
      setInvalid(false);
      onChange('');
      return;
    }

    const parsed = parseDateDisplayToInput(next);
    if (parsed) {
      setInvalid(false);
      onChange(parsed);
    } else {
      setInvalid(true);
    }
  };

  const handleBlur = () => {
    if (!display.trim()) {
      setInvalid(required);
      return;
    }
    commitDisplay(display);
  };

  return (
    <input
      type="text"
      id={id}
      name={name}
      inputMode="numeric"
      className={`${className}${invalid ? ' is-invalid' : ''}`}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={10}
      autoComplete="off"
      disabled={disabled}
      aria-invalid={invalid}
    />
  );
};

export default AdminDateInput;
