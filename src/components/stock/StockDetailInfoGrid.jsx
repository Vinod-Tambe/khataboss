import React from 'react';

/**
 * Two-column grid: each cell = label + value (two specs per row).
 */
const StockDetailInfoGrid = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <div className="stock-detail-info-grid">
      {items.map((item) => (
        <div
          key={item.key || item.label}
          className={`stock-detail-info-cell${
            item.key ? ` stock-detail-info-cell--${item.key}` : ''
          }`}
        >
          <span className="stock-detail-info-label">{item.label}</span>
          {item.html ? (
            <span
              className="stock-detail-info-value"
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          ) : (
            <span className="stock-detail-info-value">{item.value ?? '—'}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default StockDetailInfoGrid;
