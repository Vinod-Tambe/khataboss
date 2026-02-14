import React, { useEffect } from 'react';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'bootstrap/dist/css/bootstrap.min.css';

export const CapitalAccount = () => {
  const expenditure = [
    { item: 'Purchases', amount: 150000 },
    { item: 'Wages', amount: 40000 },
    { item: 'Freight', amount: 10000 },
  ];

  const revenue = [
    { item: 'Sales Gold', amount: 34344343 },
    { item: 'Sales Silver', amount: 14434343 },
    { item: 'Commission', amount: 20000 },
  ];

  const maxRows = Math.max(expenditure.length, revenue.length);

  // Calculate totals
  const totalExpenditure = expenditure.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

  useEffect(() => {
    const table = $('#capitalTable').DataTable({
      responsive: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false,
      language: {
        emptyTable: 'No data available',
      },
    });

    return () => {
      table.destroy();
    };
  }, []);

  return (
    <div className="border border-secondary ">
      <h5 className="fw-bold text-center mt-1">
        CAPITAL ACCOUNT
      </h5>

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
              <th  className="text-start border-end-0">Expenditure</th>
              <th className="text-end border-start-0">Amount</th>
              <th className="text-start border-end-0">Revenue</th>
              <th className="text-end border-start-0">Amount</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: maxRows }).map((_, index) => (
              <tr key={index}>
                {/* Expenditure */}
                <td className="text-start border-end-0">
                  {expenditure[index]?.item || ""}
                </td>
                <td className="text-end border-start-0">
                  {expenditure[index]
                    ? expenditure[index].amount.toLocaleString()
                    : ""}
                </td>

                {/* Revenue */}
                <td className="text-start border-end-0">
                  {revenue[index]?.item || ""}
                </td>
                <td className="text-end border-start-0">
                  {revenue[index]
                    ? revenue[index].amount.toLocaleString()
                    : ""}
                </td>
              </tr>
            ))}

            {/* Totals */}
            <tr className="fw-bold table-light bg-blue">
              <td className="border-end-0 bg-blue">Total</td>
              <td className="text-end border-start-0 bg-blue">
                {totalExpenditure.toLocaleString()}
              </td>
              <td className="border-end-0 bg-blue">Total</td>
              <td className="text-end border-start-0 bg-blue">
                {totalRevenue.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CapitalAccount;