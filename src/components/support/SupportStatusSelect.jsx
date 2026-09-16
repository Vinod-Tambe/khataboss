import React from 'react';
import { Dropdown } from 'react-bootstrap';
import SupportStatusLabel from './SupportStatusLabel';

const SupportStatusSelect = ({
  kind = 'owner',
  value,
  options = [],
  disabled = false,
  onChange,
  id,
  size = 'sm',
  className = '',
  onClickCapture,
  onMouseDownCapture,
}) => {
  const stopBubble = (e) => {
    e.stopPropagation();
  };

  const handleSelect = (next) => {
    if (next !== value) onChange?.(next);
  };

  return (
    <div
      className={`support-status-select ${className}`.trim()}
      onClick={onClickCapture || stopBubble}
      onMouseDown={onMouseDownCapture || stopBubble}
    >
      <Dropdown className="w-100">
        <Dropdown.Toggle
          id={id}
          variant="outline-light"
          disabled={disabled}
          className={`support-status-select__toggle w-100 text-start ${
            size === 'sm' ? 'support-status-select__toggle--sm' : ''
          }`}
        >
          <SupportStatusLabel kind={kind} value={value} />
        </Dropdown.Toggle>
        <Dropdown.Menu className="support-status-select__menu w-100">
          {options.map((opt) => (
            <Dropdown.Item
              key={opt.value}
              active={opt.value === value}
              onClick={() => handleSelect(opt.value)}
            >
              <SupportStatusLabel kind={kind} value={opt.value} />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default SupportStatusSelect;
