import React from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import '../../css/ProfitLossPrint.css';

const ACCOUNT_DATA = {
  trading: {
    title: 'TRADING ACCOUNT',
    expenditure: [
      { item: 'Purchases', amount: 150000 },
      { item: 'Wages', amount: 40000 },
      { item: 'Freight', amount: 10000 },
    ],
    revenue: [
      { item: 'Sales Gold', amount: 34344343 },
      { item: 'Sales Silver', amount: 14434343 },
      { item: 'Commission', amount: 20000 },
    ],
  },
  profitLoss: {
    title: 'PROFIT & LOSS',
    expenditure: [
      { item: 'Purchases', amount: 150000 },
      { item: 'Wages', amount: 40000 },
      { item: 'Freight', amount: 10000 },
    ],
    revenue: [
      { item: 'Sales Gold', amount: 34344343 },
      { item: 'Sales Silver', amount: 14434343 },
      { item: 'Commission', amount: 20000 },
    ],
  },
  capital: {
    title: 'CAPITAL ACCOUNT',
    expenditure: [
      { item: 'Purchases', amount: 150000 },
      { item: 'Wages', amount: 40000 },
      { item: 'Freight', amount: 10000 },
    ],
    revenue: [
      { item: 'Sales Gold', amount: 34344343 },
      { item: 'Sales Silver', amount: 14434343 },
      { item: 'Commission', amount: 20000 },
    ],
  },
};

const PrintAccountSection = ({ title, expenditure, revenue }) => {
  const maxRows = Math.max(expenditure.length, revenue.length);
  const totalExpenditure = expenditure.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="pl-print-section">
      <h5 className="pl-print-section-title">{title}</h5>
      <table className="pl-print-table">
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className="text-start">Expenditure</th>
            <th className="text-end">Amount</th>
            <th className="text-start">Revenue</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxRows }).map((_, index) => (
            <tr key={index} className={index % 2 === 0 ? 'pl-row-even' : 'pl-row-odd'}>
              <td>{expenditure[index]?.item || ''}</td>
              <td className="text-end">
                {expenditure[index] ? expenditure[index].amount.toLocaleString() : ''}
              </td>
              <td>{revenue[index]?.item || ''}</td>
              <td className="text-end">
                {revenue[index] ? revenue[index].amount.toLocaleString() : ''}
              </td>
            </tr>
          ))}
          <tr className="pl-total-row">
            <td className="fw-bold">Total</td>
            <td className="text-end fw-bold">{totalExpenditure.toLocaleString()}</td>
            <td className="fw-bold">Total</td>
            <td className="text-end fw-bold">{totalRevenue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ProfitLossPrintPreview = ({
  show,
  onHide,
  firmName,
  companyName,
  periodStart,
  periodEnd,
  assessmentYear,
}) => {
  const handlePrint = () => {
    const content = document.getElementById('profit-loss-print-area').outerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.write('<html><head><title>Profit & Loss</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframe.contentDocument.head.appendChild(style.cloneNode(true));
    });
    iframe.contentDocument.write('</head><body class="pl-print-body">');
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

  return (
    <CommonModal show={show} onHide={onHide} title="Profit & Loss — Print Preview" size="xl">
      <div className="pl-preview-wrapper p-3">
        <div id="profit-loss-print-area" className="pl-print-document">
          <div className="pl-print-header">
            <div className="pl-print-header-top">
              <span className="pl-print-date-range">
                {formattedStart} - {formattedEnd}
              </span>
              <span className="pl-print-firm">{firmName || 'All Firms'}</span>
            </div>

            <div className="pl-print-title-block">
              <h2 className="pl-print-title">
                <i className="bi bi-bar-chart-line-fill me-2"></i>
                Profit & Loss
              </h2>
              <p className="pl-print-fy">
                <strong>FINANCIAL YEAR:</strong> {formattedStart} To {formattedEnd}
              </p>
              <p className="pl-print-ay">
                <strong>ASSESSMENT YEAR:</strong> {assessmentYear}
              </p>
              {companyName && (
                <p className="pl-print-company">{companyName}</p>
              )}
              <p className="pl-print-generated">
                Generated on {moment().format('DD-MM-YYYY hh:mm A')}
              </p>
            </div>
          </div>

          <PrintAccountSection {...ACCOUNT_DATA.trading} />
          <PrintAccountSection {...ACCOUNT_DATA.profitLoss} />
          <PrintAccountSection {...ACCOUNT_DATA.capital} />
        </div>

        <div className="pl-preview-actions d-flex justify-content-center gap-3 mt-4 mb-2">
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

export default ProfitLossPrintPreview;
