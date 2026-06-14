import React from 'react';

const PrintPreviewHeader = ({
  leftValue,
  title,
  icon,
  firmName = 'All Firms',
  periodLabel = 'PERIOD',
  periodStart,
  periodEnd,
  children,
}) => (
  <>
    <div className="print-preview-header">
      <div className="print-preview-header-side">
        <div className="print-preview-field">{leftValue}</div>
      </div>
      <div className="print-preview-header-center">
        <h3 className="text-brown fw-bold mb-0 print-preview-title">
          {icon && <i className={`bi ${icon} me-2`}></i>}
          {title}
        </h3>
        {periodStart && periodEnd && (
          <p className="print-preview-period mb-0">
            <strong className="text-info-emphasis fw-bold">{periodLabel}:</strong>{' '}
            {periodStart} To {periodEnd}
          </p>
        )}
      </div>
      <div className="print-preview-header-side">
        <div className="print-preview-field">{firmName}</div>
      </div>
    </div>
    {children && <div className="print-preview-subheader text-center">{children}</div>}
  </>
);

export default PrintPreviewHeader;
