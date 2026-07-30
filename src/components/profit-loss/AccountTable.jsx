import React from "react";
import { formatCurrency, sumAmounts } from "./profitLossData";

const rowTone = (item = "") => {
  if (/loss/i.test(item)) return "is-loss";
  if (/profit/i.test(item)) return "is-profit";
  return "";
};

const PairCells = ({ row, alignStartClass, alignEndClass }) => {
  if (!row) {
    return (
      <>
        <td className={`text-start ${alignStartClass}`} />
        <td className={`text-end ${alignEndClass}`} />
      </>
    );
  }

  const tone = rowTone(row.item);
  const toneClass = tone ? `pl-desktop-cell ${tone}` : "";

  return (
    <>
      <td className={`text-start ${alignStartClass} ${toneClass}`.trim()}>
        {row.item}
      </td>
      <td className={`text-end ${alignEndClass} ${toneClass}`.trim()}>
        {formatCurrency(row.amount)}
      </td>
    </>
  );
};

/**
 * Desktop / print T-account table (Expenditure | Amount | Revenue | Amount)
 */
const AccountTable = ({ title, expenditure = [], revenue = [] }) => {
  const maxRows = Math.max(expenditure.length, revenue.length);
  const totalExpenditure = sumAmounts(expenditure);
  const totalRevenue = sumAmounts(revenue);

  return (
    <div className="border border-secondary profit-loss-account-table">
      <h5 className="fw-bold text-center mt-1">{title}</h5>

      <div className="table-responsive">
        <table
          className="table table-bordered table-sm mb-0"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>

          <thead className="table-light">
            <tr>
              <th className="text-start border-end-0 pl-desktop-head is-expense">
                Expenditure
              </th>
              <th className="text-end border-start-0 pl-desktop-head is-expense">
                Amount
              </th>
              <th className="text-start border-end-0 pl-desktop-head is-income">
                Revenue
              </th>
              <th className="text-end border-start-0 pl-desktop-head is-income">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: maxRows }).map((_, index) => (
              <tr key={index}>
                <PairCells
                  row={expenditure[index]}
                  alignStartClass="border-end-0"
                  alignEndClass="border-start-0"
                />
                <PairCells
                  row={revenue[index]}
                  alignStartClass="border-end-0"
                  alignEndClass="border-start-0"
                />
              </tr>
            ))}

            <tr className="fw-bold pl-desktop-total-row">
              <td className="border-end-0 pl-desktop-total is-expense">Total</td>
              <td className="text-end border-start-0 pl-desktop-total is-expense">
                {formatCurrency(totalExpenditure)}
              </td>
              <td className="border-end-0 pl-desktop-total is-income">Total</td>
              <td className="text-end border-start-0 pl-desktop-total is-income">
                {formatCurrency(totalRevenue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountTable;
