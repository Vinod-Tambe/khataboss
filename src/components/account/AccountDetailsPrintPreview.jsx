import React from 'react';
import moment from 'moment';
import PrintPreviewModal from '../common/PrintPreviewModal';
import PrintPreviewHeader from '../common/PrintPreviewHeader';
import AccountDetailsReport from './AccountDetailsReport';

const AccountDetailsPrintPreview = ({
  show,
  onHide,
  ledgerData,
  openingBalance,
  firmName,
  accountName,
  primaryAccount,
  periodStart,
  periodEnd,
  assessmentYear,
}) => {
  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Account Ledger — Print Preview"
      printAreaId="account-ledger-print-area"
    >
      <PrintPreviewHeader
        leftValue={`${formattedStart} - ${formattedEnd}`}
        title="Account Ledger"
        icon="bi-bar-chart-line-fill"
        firmName={firmName || 'All Firms'}
        periodLabel="FINANCIAL YEAR"
        periodStart={formattedStart}
        periodEnd={formattedEnd}
      >
        <p className="pb-0 mb-0">
          <strong className="text-success-emphasis fw-bold">ASSESSMENT YEAR:</strong>{' '}
          {assessmentYear}
        </p>
        <p className="mb-0">
          <strong className="text-primary-emphasis fw-bold">
            ACCOUNT NAME : {accountName || '-'} | PRIMARY ACCOUNT : {primaryAccount || '-'}
          </strong>
        </p>
      </PrintPreviewHeader>

      <AccountDetailsReport
        ledgerData={ledgerData}
        openingBalanceProp={openingBalance}
        isPrint
      />
    </PrintPreviewModal>
  );
};

export default AccountDetailsPrintPreview;
