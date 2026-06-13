import React from 'react';
import CommonModal from '../common/CommonModal';
import moment from 'moment';
import '../../css/BalanceSheetPrint.css';

const formatData = (arr = []) =>
  arr.map((item) => {
    const key = Object.keys(item)[0];
    return { name: key, value: item[key] };
  });

const PrintBalanceSheetTable = ({ balanceSheetData }) => {
  const { assets = [], liabilities = [] } = balanceSheetData || {};
  const assetList = formatData(assets);
  const liabilityList = formatData(liabilities);

  const totalAssets = assetList.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilityList.reduce((sum, l) => sum + l.value, 0);
  const diffBalance = totalAssets - totalLiabilities;
  const maxRows = Math.max(assetList.length, liabilityList.length);
  const balancedTotal = Math.max(totalLiabilities, totalAssets);

  if (assetList.length === 0 && liabilityList.length === 0) {
    return (
      <p className="text-center text-muted py-4">No records found for the selected period.</p>
    );
  }

  return (
    <table className="bs-print-table">
      <colgroup>
        <col style={{ width: '35%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '35%' }} />
        <col style={{ width: '15%' }} />
      </colgroup>
      <thead>
        <tr>
          <th colSpan={2} className="text-center">Liabilities</th>
          <th colSpan={2} className="text-center">Assets</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxRows }).map((_, idx) => {
          const liability = liabilityList[idx];
          const asset = assetList[idx];
          return (
            <tr key={idx} className={idx % 2 === 0 ? 'bs-row-even' : 'bs-row-odd'}>
              <td>{liability ? liability.name.toUpperCase() : ''}</td>
              <td className="text-end">
                {liability ? liability.value.toLocaleString() : ''}
              </td>
              <td>{asset ? asset.name.toUpperCase() : ''}</td>
              <td className="text-end">
                {asset ? asset.value.toLocaleString() : ''}
              </td>
            </tr>
          );
        })}

        {diffBalance !== 0 && (
          <tr className="bs-profit-loss-row">
            {diffBalance > 0 ? (
              <>
                <td className="fw-bold text-success">NET PROFIT</td>
                <td className="text-end fw-bold text-success">
                  {diffBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td></td>
                <td></td>
              </>
            ) : (
              <>
                <td></td>
                <td></td>
                <td className="fw-bold text-danger">NET LOSS</td>
                <td className="text-end fw-bold text-danger">
                  {Math.abs(diffBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </>
            )}
          </tr>
        )}
      </tbody>
      <tfoot>
        <tr className="bs-total-row">
          <td className="fw-bold">Total</td>
          <td className="text-end fw-bold">{balancedTotal.toLocaleString()}</td>
          <td className="fw-bold">Total</td>
          <td className="text-end fw-bold">{balancedTotal.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  );
};

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
  const handlePrint = () => {
    const content = document.getElementById('balance-sheet-print-area').outerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    iframe.contentDocument.write('<html><head><title>Balance Sheet</title>');
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframe.contentDocument.head.appendChild(style.cloneNode(true));
    });
    iframe.contentDocument.write('</head><body class="bs-print-body">');
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
    <CommonModal show={show} onHide={onHide} title="Balance Sheet — Print Preview" size="xl">
      <div className="bs-preview-wrapper p-3">
        <div id="balance-sheet-print-area" className="bs-print-document">
          <div className="bs-print-header">
            <div className="bs-print-header-top">
              <span className="bs-print-date-range">
                {formattedStart} - {formattedEnd}
              </span>
              <span className="bs-print-firm">{firmName || 'All Firms'}</span>
            </div>

            <div className="bs-print-title-block">
              <h2 className="bs-print-title">
                <i className="bi bi-clipboard-data me-2"></i>
                Balance Sheet
              </h2>
              {firmName && firmName !== 'All Firms' && (
                <>
                  <p className="bs-print-firm-name">{firmName.toUpperCase()}</p>
                  {firmAddress && (
                    <p className="bs-print-firm-address">{firmAddress}</p>
                  )}
                </>
              )}
              <p className="bs-print-period">
                <strong>PERIOD:</strong> {formattedStart} To {formattedEnd}
              </p>
              {financialYear && (
                <p className="bs-print-fy">
                  <strong>FINANCIAL YEAR:</strong> {financialYear}
                </p>
              )}
              <p className="bs-print-generated">
                Generated on {moment().format('DD-MM-YYYY hh:mm A')}
              </p>
            </div>
          </div>

          <div className="bs-print-table-wrapper">
            <PrintBalanceSheetTable balanceSheetData={balanceSheetData} />
          </div>
        </div>

        <div className="bs-preview-actions d-flex justify-content-center gap-3 mt-4 mb-2">
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

export default BalanceSheetPrintPreview;
