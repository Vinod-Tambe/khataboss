import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

const DayBookTable = () => {
  const tableRef = useRef(null);
  const dataTable = useRef(null);
  const [search, setSearch] = useState("");

  const data = [
    { id: 1, date: "30-10-2025", firm: "SHAM", name: "Mr. Vinod Tambe", cash: 5000, bank: 0 },
    { id: 2, date: "05-11-2025", firm: "SHAM", name: "Mr. Vinod Tambe", cash: 5000, bank: 0 },
    { id: 3, date: "14-11-2025", firm: "SHAM", name: "Mr. Vinod Tambe", cash: 5000, bank: 0 },
    { id: 4, date: "07-02-2026", firm: "SHAM", name: "Mr. Deepmind Infotech", cash: 5000, bank: 0 },
    { id: 5, date: "07-02-2026", firm: "SHAM", name: "Mr. Deepmind Infotech", cash: 5000, bank: 0 },
    { id: 6, date: "07-02-2026", firm: "SHAM", name: "Mr. Deepmind Infotech", cash: 5000, bank: 0 },
    { id: 7, date: "07-02-2026", firm: "SHAM", name: "Mr. Deepmind Infotech", cash: 5000, bank: 0 },
  ];

  const totalCash = data.reduce((sum, item) => sum + item.cash, 0);
  const totalBank = data.reduce((sum, item) => sum + item.bank, 0);

  useEffect(() => {
    dataTable.current = $(tableRef.current).DataTable({
      responsive: false,
      ordering: false,
      paging: true,
      info: false,
      dom: "l t",
      lengthMenu: [
        [5, 10, 50, 100, -1],
        [5, 10, 50, 100, "All"],
      ],
    });

    return () => {
      if (dataTable.current) {
        dataTable.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (dataTable.current) {
      dataTable.current.search(search).draw();
    }
  }, [search]);

  return (
    <div className="border border-secondary border-dashed">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 ms-2">FINANCE ADDED</h6>

        <input
          type="search"
          className="form-control form-control-sm border border-secondary w-auto mt-2 me-2"
          placeholder="Search In Finance Added"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bootstrap responsive wrapper */}
      <div className="table-responsive">
        <table
          ref={tableRef}
          className="table table-striped table-hover table-bordered text-capitalize mb-1"
        >
          <thead className="table-light">
            <tr>
              <th>DATE</th>
              <th>FIRM</th>
              <th>CUSTOMER NAME</th>
              <th>CASH</th>
              <th>BANK</th>
              <th>ONLINE</th>
              <th>CARD</th>
              <th>DISC</th>
              <th>TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const online = 0;
              const card = 0;
              const disc = 0;
              const total = item.cash + item.bank;

              return (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.firm}</td>
                  <td>{item.name}</td>
                  <td className="text-end">{item.cash.toFixed(2)}</td>
                  <td className="text-end">{item.bank.toFixed(2)}</td>
                  <td className="text-end">{online.toFixed(2)}</td>
                  <td className="text-end">{card.toFixed(2)}</td>
                  <td className="text-end text-danger">{disc.toFixed(2)}</td>
                  <td className="text-end fw-bold text-success">
                    {total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <th className="text-end">
                TOTAL AMOUNT :
              </th>
              <th colSpan={2} className="text-end">
                
              </th>
              <th className="text-end">{totalCash.toFixed(2)}</th>
              <th className="text-end">{totalBank.toFixed(2)}</th>
              <th className="text-end">{totalBank.toFixed(2)}</th>
              <th className="text-end">{totalBank.toFixed(2)}</th>
              <th ></th>
              <th className="text-end fw-bold">
                {(totalCash + totalBank).toFixed(2)}
              </th>
            </tr>
          </tfoot>

        </table>
      </div>
    </div>
  );
};

export default DayBookTable;
