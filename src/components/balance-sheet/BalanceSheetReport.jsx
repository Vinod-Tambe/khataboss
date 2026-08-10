import React from 'react';
import BalanceSheetMobileList from './BalanceSheetMobileList';
import {
  calculateBalanceSheetTotals,
  formatCurrency,
} from './balanceSheetUtils';

/** Keep cell painted so print borders never drop on empty sides */
const cellText = (value) => (value ? value : '\u00A0');

const BalanceSheetReport = ({ balanceSheetData, isPrint = false }) => {
  if (!balanceSheetData) {
    return <p>No data available</p>;
  }

  const {
    assetList,
    liabilityList,
    totalAssets,
    totalLiabilities,
    diffBalance,
    balancedTotal,
  } = calculateBalanceSheetTotals(balanceSheetData);

  const maxRows = Math.max(assetList.length, liabilityList.length);

  return (
    <>
      {/* Original desktop table — also used for print */}
      <div
        className={
          isPrint
            ? 'balance-sheet-desktop-table'
            : 'balance-sheet-desktop-table d-none d-md-block'
        }
      >
        <div className="balance-sheet-table-shell border border-danger-subtle bg-green">
          <div className="table-responsive">
            <table
              className="table table-hover table-bordered border-secondary mb-0 balance-sheet-table"
              style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}
            >
              <colgroup>
                <col className="bs-col-liab-name" style={{ width: '35%' }} />
                <col className="bs-col-liab-amt" style={{ width: '15%' }} />
                <col className="bs-col-asset-name" style={{ width: '35%' }} />
                <col className="bs-col-asset-amt" style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th colSpan="2" className="bg-cust-primary text-center text-brown fs-6 sticky-col">
                    Liabilities
                  </th>
                  <th colSpan="2" className="bg-cust-primary text-brown text-center fs-6 sticky-col">
                    Assets
                  </th>
                </tr>
              </thead>
              <tbody>
                {maxRows > 0 ? (
                  Array.from({ length: maxRows }).map((_, idx) => {
                    const liability = liabilityList[idx];
                    const asset = assetList[idx];
                    return (
                      <tr key={idx}>
                        <td className="bs-cell bs-cell-liab text-start text-break pe-2">
                          {cellText(liability ? liability.name.toUpperCase() : '')}
                        </td>
                        <td className="bs-cell bs-cell-liab text-end pe-2">
                          {cellText(liability ? formatCurrency(liability.value) : '')}
                        </td>
                        <td className="bs-cell bs-cell-asset text-start text-break pe-2">
                          {cellText(asset ? asset.name.toUpperCase() : '')}
                        </td>
                        <td className="bs-cell bs-cell-asset text-end pe-2">
                          {cellText(asset ? formatCurrency(asset.value) : '')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No records found for the selected period.
                    </td>
                  </tr>
                )}

                <tr className="balance-sheet-spacer-row">
                  <td className="bs-cell bs-cell-liab">{'\u00A0'}</td>
                  <td className="bs-cell bs-cell-liab">{'\u00A0'}</td>
                  <td className="bs-cell bs-cell-asset">{'\u00A0'}</td>
                  <td className="bs-cell bs-cell-asset">{'\u00A0'}</td>
                </tr>

                {/* Residual only — P&L is already closed into BS from backend as Profit & Loss A/c */}
                {diffBalance !== 0 && (
                  <tr>
                    {diffBalance > 0 ? (
                      <>
                        <td className="bs-cell bs-cell-liab text-start fw-bold text-warning pe-2">
                          DIFFERENCE
                        </td>
                        <td className="bs-cell bs-cell-liab text-end fw-bold text-warning pe-2">
                          {formatCurrency(diffBalance)}
                        </td>
                        <td className="bs-cell bs-cell-asset">{'\u00A0'}</td>
                        <td className="bs-cell bs-cell-asset">{'\u00A0'}</td>
                      </>
                    ) : (
                      <>
                        <td className="bs-cell bs-cell-liab">{'\u00A0'}</td>
                        <td className="bs-cell bs-cell-liab">{'\u00A0'}</td>
                        <td className="bs-cell bs-cell-asset text-start fw-bold text-warning pe-2">
                          DIFFERENCE
                        </td>
                        <td className="bs-cell bs-cell-asset text-end fw-bold text-warning pe-2">
                          {formatCurrency(Math.abs(diffBalance))}
                        </td>
                      </>
                    )}
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="fw-bold bg-red">
                  <td className="bs-cell bs-cell-liab bg-red text-start pe-2">Total</td>
                  <td className="bs-cell bs-cell-liab bg-red text-end pe-2">
                    {formatCurrency(balancedTotal)}
                  </td>
                  <td className="bs-cell bs-cell-asset bg-red text-start pe-2">Total</td>
                  <td className="bs-cell bs-cell-asset bg-red text-end pe-2">
                    {formatCurrency(balancedTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile cards — screen only */}
      {!isPrint && (
        <div className="d-md-none balance-sheet-mobile-screen">
          <BalanceSheetMobileList
            assetList={assetList}
            liabilityList={liabilityList}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            diffBalance={diffBalance}
            balancedTotal={balancedTotal}
          />
        </div>
      )}
    </>
  );
};

export default BalanceSheetReport;
