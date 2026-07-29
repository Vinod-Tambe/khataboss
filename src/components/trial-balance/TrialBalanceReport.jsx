import React from 'react'
import { Link } from 'react-router-dom';
import TrialBalanceMobileList from './TrialBalanceMobileList';
import {
  calculateTrialBalanceTotals,
  formatBalance,
} from './trialBalanceUtils';

const TrialBalanceReport = ({ data = [], isPrint = false }) => {
  const totals = calculateTrialBalanceTotals(data);

  return (
    <>
      {/* Desktop table — also used for print (same format) */}
      <div className={isPrint ? 'trial-balance-desktop-table' : 'trial-balance-desktop-table d-none d-md-block'}>
        <div className="table-responsive table-responsive-custom">
          <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
            <thead className='table-secondary border-bottom border-dark-subtle'>
              <tr className="bg-danger text-white">
                <th className="sticky-col">ACCOUNTS DETAILS</th>
                <th className="text-end">OPENING BAL.</th>
                <th className="text-end">DEBIT AMT</th>
                <th className="text-end">CREDIT AMT</th>
                <th className="text-end">CLOSING BAL.</th>
              </tr>
            </thead>

            <tbody>
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.acc_id}>
                    <td className="sticky-col text-brown">
                      {isPrint ? (
                        <span className="text-brown fw-bold">{item.acc_name}</span>
                      ) : (
                        <Link to={`/account/details/${item.acc_uuid}`} className="text-decoration-none text-brown fw-bold">
                          {item.acc_name}
                        </Link>
                      )}
                    </td>
                    <td className="text-end">{formatBalance(item.acc_open_balance)}</td>
                    <td className="text-end">{(item.total_dr_amt || 0).toFixed(2)}</td>
                    <td className="text-end">{(item.total_cr_amt || 0).toFixed(2)}</td>
                    <td className="text-end">{formatBalance(item.acc_close_balance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-4">No records found for the selected period.</td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr className="bg-blue fw-bold text-white">
                <th className="sticky-col">TOTAL</th>
                <th className="text-end">{formatBalance(totals.open)}</th>
                <th className="text-end">{totals.dr.toFixed(2)}</th>
                <th className="text-end">{totals.cr.toFixed(2)}</th>
                <th className="text-end">{formatBalance(totals.close)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Mobile (<768px): card list — screen only */}
      {!isPrint && (
        <div className="d-md-none trial-balance-mobile-screen">
          <TrialBalanceMobileList data={data} totals={totals} />
        </div>
      )}
    </>
  )
}

export default TrialBalanceReport
