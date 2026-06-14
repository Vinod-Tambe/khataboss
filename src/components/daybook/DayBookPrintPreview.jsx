import React from 'react';
import moment from 'moment';
import PrintPreviewModal from '../common/PrintPreviewModal';
import PrintPreviewHeader from '../common/PrintPreviewHeader';
import DayBookTable from './DayBookTable';
import DayBookSummary from './DayBookSummary';

const SECTIONS = [
  { title: 'FINANCE ADDED', colorClass: 'bg-green', amtColor: 'text-danger' },
  { title: 'LOAN ADDED', colorClass: 'bg-purple', amtColor: 'text-danger' },
  { title: 'FINANCE EMI DEPOSIT', colorClass: 'bg-red', amtColor: 'text-success' },
  { title: 'FINANCE EMI ROLLBACK', colorClass: 'bg-cust-info', amtColor: 'text-danger' },
];

const DayBookPrintPreview = ({
  show,
  onHide,
  daybookData = [],
  keyedDaybookData = {},
  summary = {},
  firmName,
  periodStart,
  periodEnd,
}) => {
  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');

  const getSectionData = (title) =>
    daybookData.find((d) => d.title === title) || { data: [] };

  return (
    <PrintPreviewModal
      show={show}
      onHide={onHide}
      title="Daily Dairy — Print Preview"
      printAreaId="daybook-print-area"
    >
      <PrintPreviewHeader
        leftValue={`${formattedStart} - ${formattedEnd}`}
        title="DAILY DAIRY"
        icon="bi-journal-text"
        firmName={firmName || 'All Firms'}
      />

      <div className="print-preview-meta-row">
        <div className="print-preview-meta-left">
          <h6 className="fw-semibold text-danger mb-0">
            CR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
          </h6>
          <h6 className="fw-semibold text-success mb-0">
            DR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
          </h6>
        </div>
        <div className="print-preview-meta-right">
          <h6 className="fw-semibold text-dark mb-0">OPENING BALANCE :</h6>
          <h6 className="fw-semibold text-brown mb-0">
            {summary?.total_open_amt || '0.00'}
          </h6>
        </div>
      </div>

      {SECTIONS.map((section) => {
        const sectionData = getSectionData(section.title).data;
        if (sectionData.length === 0) return null;
        return (
          <DayBookTable
            key={section.title}
            title={section.title}
            colorClass={section.colorClass}
            amtColor={section.amtColor}
            data={sectionData}
            isPrint
          />
        );
      })}

      <DayBookSummary DayBookData={keyedDaybookData} opening_data={summary} />
    </PrintPreviewModal>
  );
};

export default DayBookPrintPreview;
