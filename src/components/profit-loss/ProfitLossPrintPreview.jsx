import React from 'react';
import moment from 'moment';
import PrintPreviewModal from '../common/PrintPreviewModal';
import PrintPreviewHeader from '../common/PrintPreviewHeader';
import TradingAccount from './TradingAccount';
import ProfitLossAccount from './ProfitLossAccount';
import CapitalAccount from './CapitalAccount';
import { getAccountById } from './profitLossData';
import '../../css/ProfitLoss.css';

const ProfitLossPrintPreview = ({
  show,
  onHide,
  firmName,
  companyName,
  periodStart,
  periodEnd,
  assessmentYear,
  accounts = [],
}) => {
  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');
  const tradingAccount = getAccountById(accounts, 'trading');
  const profitLossAccount = getAccountById(accounts, 'profit-loss');
  const capitalAccount = getAccountById(accounts, 'capital');

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Profit & Loss — Print Preview"
      printAreaId="profit-loss-print-area"
    >
      <PrintPreviewHeader
        leftValue={`${formattedStart} - ${formattedEnd}`}
        title="Profit & Loss"
        icon="bi-bar-chart-line-fill"
        firmName={firmName || 'Select Firm'}
        periodLabel="FINANCIAL YEAR"
        periodStart={formattedStart}
        periodEnd={formattedEnd}
      >
        <p className="pb-0 mb-0">
          <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
          {assessmentYear}
        </p>
        <p className="mb-0">
          <strong className="text-primary-emphasis fw-bold">{companyName}</strong>
        </p>
      </PrintPreviewHeader>

      <div className="mb-2">
        <TradingAccount account={tradingAccount} />
      </div>
      <div className="mb-2">
        <ProfitLossAccount account={profitLossAccount} />
      </div>
      <div className="mb-2">
        <CapitalAccount account={capitalAccount} />
      </div>
    </PrintPreviewModal>
  );
};

export default ProfitLossPrintPreview;
