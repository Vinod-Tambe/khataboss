import React from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import '../../css/TrialBalancePrint.css';

const formatBalance = (val) => {
  if (val === 0) return '0.00';
  const absVal = Math.abs(val).toFixed(2);
  return val > 0 ? `${absVal} DR` : `${absVal} CR`;
};

const TrialBalancePrintPreview = ({ show, onHide, data = [], firmName, periodStart, periodEnd }) => {
  const totals = data.reduce(
    (acc, item) => {
      acc.open += item.acc_open_balance || 0;
      acc.dr += item.total_dr_amt || 0;
      acc.cr += item.total_cr_amt || 0;
      acc.close += item.acc_close_balance || 0;
      return acc;
    },
    { open: 0, dr: 0, cr: 0, close: 0 }
  );

  const handlePrint = () => {
    const content = document.getElementById('trial-balance-print-area').outerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.write('<html><head><title>Trial Balance</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframe.contentDocument.head.appendChild(style.cloneNode(true));
    });
    iframe.contentDocument.write('</head><body class="tb-print-body">');
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
    <CommonModal show={show} onHide={onHide} title="Trial Balance — Print Preview" size="xl">
      <div className="tb-preview-wrapper p-3">
        <div id="trial-balance-print-area" className="tb-print-document">
          <div className="tb-print-header">
            <div className="tb-print-header-top">
              <span className="tb-print-date-range">
                {formattedStart} - {formattedEnd}
              </span>
              <span className="tb-print-firm">{firmName || 'All Firms'}</span>
            </div>

            <div className="tb-print-title-block">
              <h2 className="tb-print-title">
                <i className="bi bi-bar-chart-line-fill me-2"></i>
                Trial Balance
              </h2>
              <p className="tb-print-period">
                <strong>PERIOD:</strong> {formattedStart} To {formattedEnd}
              </p>
              <p className="tb-print-generated">
                Generated on {moment().format('DD-MM-YYYY hh:mm A')}
              </p>
            </div>
          </div>

          <table className="tb-print-table">
            <thead>
              <tr>
                <th>ACCOUNTS DETAILS</th>
                <th className="text-end">OPENING BAL.</th>
                <th className="text-end">DEBIT AMT</th>
                <th className="text-end">CREDIT AMT</th>
                <th className="text-end">CLOSING BAL.</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.acc_id} className={index % 2 === 0 ? 'tb-row-even' : 'tb-row-odd'}>
                    <td className="tb-account-name">{item.acc_name}</td>
                    <td className="text-end">{formatBalance(item.acc_open_balance)}</td>
                    <td className="text-end">{(item.total_dr_amt || 0).toFixed(2)}</td>
                    <td className="text-end">{(item.total_cr_amt || 0).toFixed(2)}</td>
                    <td className="text-end">{formatBalance(item.acc_close_balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No records found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot>
                <tr className="tb-total-row">
                  <th>TOTAL</th>
                  <th className="text-end">{formatBalance(totals.open)}</th>
                  <th className="text-end">{totals.dr.toFixed(2)}</th>
                  <th className="text-end">{totals.cr.toFixed(2)}</th>
                  <th className="text-end">{formatBalance(totals.close)}</th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="tb-preview-actions d-flex justify-content-center gap-3 mt-4 mb-2">
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

export default TrialBalancePrintPreview;
