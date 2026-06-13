import React from 'react';
import CommonModal from '../common/CommonModal';
import DayBookSummary from './DayBookSummary';
import moment from 'moment';
import '../../css/DayBookPrint.css';

const SECTIONS = [
  { title: 'FINANCE ADDED', amtColor: 'danger' },
  { title: 'LOAN ADDED', amtColor: 'danger' },
  { title: 'FINANCE EMI DEPOSIT', amtColor: 'success' },
  { title: 'FINANCE EMI ROLLBACK', amtColor: 'danger' },
];

const getRowTotal = (item) => {
  const cash = parseFloat(item.db_cash_amt) || 0;
  const bank = parseFloat(item.db_bank_amt) || 0;
  const online = parseFloat(item.db_online_amt) || 0;
  const card = parseFloat(item.db_card_amt) || 0;
  return cash + bank + online + card;
};

const getSectionTotals = (data) => {
  return data.reduce(
    (acc, item) => ({
      cash: acc.cash + (parseFloat(item.db_cash_amt) || 0),
      bank: acc.bank + (parseFloat(item.db_bank_amt) || 0),
      online: acc.online + (parseFloat(item.db_online_amt) || 0),
      card: acc.card + (parseFloat(item.db_card_amt) || 0),
      disc: acc.disc + (parseFloat(item.db_disc_amt) || 0),
    }),
    { cash: 0, bank: 0, online: 0, card: 0, disc: 0 }
  );
};

const PrintSectionTable = ({ title, data, amtColor }) => {
  const totals = getSectionTotals(data);
  const grandTotal = totals.cash + totals.bank + totals.online + totals.card;

  return (
    <div className="db-print-section">
      <h6 className="db-print-section-title">{title}</h6>
      <table className="db-print-table">
        <thead>
          <tr>
            <th>DATE</th>
            <th>FIRM</th>
            <th>CUSTOMER NAME</th>
            <th className="text-end">CASH</th>
            <th className="text-end">BANK</th>
            <th className="text-end">ONLINE</th>
            <th className="text-end">CARD</th>
            <th className="text-end">DISC</th>
            <th className="text-end">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const cash = parseFloat(item.db_cash_amt) || 0;
            const bank = parseFloat(item.db_bank_amt) || 0;
            const online = parseFloat(item.db_online_amt) || 0;
            const card = parseFloat(item.db_card_amt) || 0;
            const disc = parseFloat(item.db_disc_amt) || 0;
            const total = getRowTotal(item);

            return (
              <tr key={index} className={index % 2 === 0 ? 'db-row-even' : 'db-row-odd'}>
                <td>{item.db_date}</td>
                <td>{item.db_firm}</td>
                <td className="db-customer-name">{item.db_customer_name}</td>
                <td className="text-end">{cash.toFixed(2)}</td>
                <td className="text-end">{bank.toFixed(2)}</td>
                <td className="text-end">{online.toFixed(2)}</td>
                <td className="text-end">{card.toFixed(2)}</td>
                <td className={`text-end ${amtColor === 'success' ? 'text-success' : 'text-danger'}`}>
                  {disc.toFixed(2)}
                </td>
                <td className={`text-end fw-bold ${amtColor === 'success' ? 'text-success' : 'text-danger'}`}>
                  {total.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="db-section-total-row">
            <th colSpan={3} className="text-end">TOTAL AMT :</th>
            <th className="text-end">{totals.cash.toFixed(2)}</th>
            <th className="text-end">{totals.bank.toFixed(2)}</th>
            <th className="text-end">{totals.online.toFixed(2)}</th>
            <th className="text-end">{totals.card.toFixed(2)}</th>
            <th className="text-end">{totals.disc.toFixed(2)}</th>
            <th className="text-end">{grandTotal.toFixed(2)}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

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
  const handlePrint = () => {
    const content = document.getElementById('daybook-print-area').outerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.write('<html><head><title>Daily Dairy</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframe.contentDocument.head.appendChild(style.cloneNode(true));
    });
    iframe.contentDocument.write('</head><body class="db-print-body">');
    iframe.contentDocument.write(content);
    iframe.contentDocument.write('</body></html>');
    iframe.contentDocument.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const formattedStart = moment(periodStart).format('DD-MM-YYYY');
  const formattedEnd = moment(periodEnd).format('DD-MM-YYYY');
  const openingBalance = summary?.total_open_amt || '0.00';

  const getSectionData = (title) =>
    daybookData.find((d) => d.title === title) || { data: [] };

  const visibleSections = SECTIONS.filter(
    (section) => getSectionData(section.title).data.length > 0
  );

  return (
    <CommonModal show={show} onHide={onHide} title="Daily Dairy — Print Preview" size="xl">
      <div className="db-preview-wrapper p-3">
        <div id="daybook-print-area" className="db-print-document">
          <div className="db-print-header">
            <div className="db-print-header-top">
              <span className="db-print-date-range">
                {formattedStart} - {formattedEnd}
              </span>
              <span className="db-print-firm">{firmName || 'All Firms'}</span>
            </div>

            <div className="db-print-title-block">
              <h2 className="db-print-title">
                <i className="bi bi-journal-text me-2"></i>
                DAILY DAIRY
              </h2>
              <p className="db-print-period">
                <strong>PERIOD:</strong> {formattedStart} To {formattedEnd}
              </p>
              <p className="db-print-generated">
                Generated on {moment().format('DD-MM-YYYY hh:mm A')}
              </p>
            </div>

            <div className="db-print-meta">
              <div className="db-print-legend">
                <span className="text-danger fw-semibold">
                  CR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
                </span>
                <span className="text-success fw-semibold">
                  DR AMOUNT <i className="bi bi-circle-fill ms-1 small"></i>
                </span>
              </div>
              <div className="db-print-opening">
                <strong>OPENING BALANCE :</strong>{' '}
                <span className="text-brown fw-bold">{openingBalance}</span>
              </div>
            </div>
          </div>

          {visibleSections.length > 0 ? (
            visibleSections.map((section) => (
              <PrintSectionTable
                key={section.title}
                title={section.title}
                data={getSectionData(section.title).data}
                amtColor={section.amtColor}
              />
            ))
          ) : (
            <p className="text-center text-muted py-4">No records found for the selected period.</p>
          )}

          <div className="db-print-summary">
            <DayBookSummary DayBookData={keyedDaybookData} opening_data={summary} />
          </div>
        </div>

        <div className="db-preview-actions d-flex justify-content-center gap-3 mt-4 mb-2">
          <button className="btn btn-outline-success px-4" onClick={handlePrint}>
            <i className="bi bi-printer-fill me-2"></i> Print
          </button>
          <button className="btn btn-secondary px-4" onClick={onHide}>
            <i className="bi bi-x-circle me-2"></i> Close
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default DayBookPrintPreview;
