import React from 'react';
import moment from 'moment';
import PrintPreviewModal from '../common/PrintPreviewModal';
import PrintPreviewHeader from '../common/PrintPreviewHeader';
import TrialBalanceReport from './TrialBalanceReport';

const TrialBalancePrintPreview = ({
  show,
  onHide,
  data = [],
  firmName,
  periodStart,
  periodEnd,
}) => {
  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Trial Balance — Print Preview"
      printAreaId="trial-balance-print-area"
    >
      <PrintPreviewHeader
        leftValue={`${formattedStart} - ${formattedEnd}`}
        title="Trial Balance"
        icon="bi-bar-chart-line-fill"
        firmName={firmName || 'All Firms'}
        periodStart={formattedStart}
        periodEnd={formattedEnd}
      />
      <TrialBalanceReport data={data} isPrint />
    </PrintPreviewModal>
  );
};

export default TrialBalancePrintPreview;
