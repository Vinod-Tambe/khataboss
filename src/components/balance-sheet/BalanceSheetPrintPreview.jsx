import React from 'react';
import moment from 'moment';
import PrintPreviewModal from '../common/PrintPreviewModal';
import PrintPreviewHeader from '../common/PrintPreviewHeader';
import BalanceSheetReport from './BalanceSheetReport';

const BalanceSheetPrintPreview = ({
  show,
  onHide,
  balanceSheetData,
  firmName,
  firmAddress,
  periodStart,
  periodEnd,
  financialYear,
}) => {
  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');
  const showFirmDetails = firmName && firmName !== 'All Firms';

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Balance Sheet — Print Preview"
      printAreaId="balance-sheet-print-area"
    >
      <PrintPreviewHeader
        leftValue={financialYear}
        title="Balance Sheet"
        icon="bi-clipboard-data"
        firmName={firmName || 'All Firms'}
        periodStart={formattedStart}
        periodEnd={formattedEnd}
      >
        {showFirmDetails && (
          <>
            <h4 className="text-primary-emphasis fw-bold mb-1">
              {firmName.toUpperCase()}
            </h4>
            {firmAddress && (
              <p className="mb-1 fw-bold text-secondary">{firmAddress}</p>
            )}
          </>
        )}
      </PrintPreviewHeader>
      <BalanceSheetReport balanceSheetData={balanceSheetData} />
    </PrintPreviewModal>
  );
};

export default BalanceSheetPrintPreview;
