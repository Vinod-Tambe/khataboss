import React from 'react';

const SupportListSearchField = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search tickets…',
  hint = null,
  ariaLabel = 'Search support tickets',
}) => {
  const showClear = Boolean(value);

  return (
    <div className="support-list-search">
      <div className="support-list-search__field">
        <i className="bi bi-search support-list-search__icon" aria-hidden="true" />
        <input
          type="search"
          className="support-list-search__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={ariaLabel}
        />
        {showClear ? (
          <button
            type="button"
            className="support-list-search__clear"
            onClick={onClear}
            aria-label="Clear search"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {hint ? <p className="support-list-search__hint mb-0 mt-2">{hint}</p> : null}
    </div>
  );
};

export default SupportListSearchField;
