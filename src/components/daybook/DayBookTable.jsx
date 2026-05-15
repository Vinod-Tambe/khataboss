import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { showToast } from "../../components/common/ToastAlert";

const DayBookTable = ({ title, colorClass, amtColor, data = [] }) => {
  const tableRef = useRef(null);
  const dataTable = useRef(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCustomerClick = async (uuid) => {
    if (!uuid) return;
    try {
      const res = await getUser(uuid);
      if (res.data) {
        dispatch(setSelectedUser(res.data));
        navigate("/user/home");
      }
    } catch (err) {
      showToast("Error fetching user details", "error");
    }
  };

  const totalCash = data.reduce((sum, item) => sum + (parseFloat(item.db_cash_amt) || 0), 0);
  const totalBank = data.reduce((sum, item) => sum + (parseFloat(item.db_bank_amt) || 0), 0);
  const totalOnline = data.reduce((sum, item) => sum + (parseFloat(item.db_online_amt) || 0), 0);
  const totalCard = data.reduce((sum, item) => sum + (parseFloat(item.db_card_amt) || 0), 0);
  const totalDisc = data.reduce((sum, item) => sum + (parseFloat(item.db_disc_amt) || 0), 0);

  useEffect(() => {
    if (dataTable.current) {
      dataTable.current.destroy();
    }

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
  }, [data]);

  useEffect(() => {
    if (dataTable.current) {
      dataTable.current.search(search).draw();
    }
  }, [search]);

  return (
    <div className={`border border-secondary border-dashed mb-3`}>
      {/* Header */}
      <div className={`d-flex justify-content-between align-items-center`}>
        <h6 className="fw-bold mb-0 ms-2">{title || "DATA"}</h6>

        <input
          type="search"
          className="form-control form-control-sm border border-dark w-auto mt-2 mb-2 me-2"
          placeholder={`${title || "Table"}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Bootstrap responsive wrapper */}
      <div className="table-responsive">
        <table
          ref={tableRef}
          className="table table-hover table-bordered text-capitalize mb-1"
        >
          <thead className="table-light ">
            <tr>
              <th className="bg-pink border border-dark">DATE</th>
              <th className="bg-pink border border-dark">FIRM</th>
              <th className="bg-pink border border-dark">CUSTOMER NAME</th>
              <th className="bg-pink border border-dark">CASH</th>
              <th className="bg-pink border border-dark">BANK</th>
              <th className="bg-pink border border-dark">ONLINE</th>
              <th className="bg-pink border border-dark">CARD</th>
              <th className="bg-pink border border-dark">DISC</th>
              <th className="bg-pink border border-dark">TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => {
              const cash = parseFloat(item.db_cash_amt) || 0;
              const bank = parseFloat(item.db_bank_amt) || 0;
              const online = parseFloat(item.db_online_amt) || 0;
              const card = parseFloat(item.db_card_amt) || 0;
              const disc = parseFloat(item.db_disc_amt) || 0;
              const total = cash + bank + online + card;

              return (
                <tr key={index}>
                  <td className="border border-dark">{item.db_date}</td>
                  <td className="border border-dark">{item.db_firm}</td>
                  <td
                    className="border border-dark text-brown cursor-pointer fw-bold"
                    onClick={() => handleCustomerClick(item.db_user_uuid)}
                  >
                    {item.db_customer_name}
                  </td>
                  <td className="text-end border border-dark">{cash.toFixed(2)}</td>
                  <td className="text-end border border-dark">{bank.toFixed(2)}</td>
                  <td className="text-end border border-dark">{online.toFixed(2)}</td>
                  <td className="text-end border border-dark">{card.toFixed(2)}</td>
                  <td className={`text-end border border-dark ${amtColor || ""}`}>{disc.toFixed(2)}</td>
                  <td className={`text-end fw-bold border border-dark ${amtColor === 'text-success' ? 'text-success' : 'text-danger'}`}>
                    {total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <th className="text-end bg-cust-info border border-dark" colSpan={3}>
                TOTAL AMT :
              </th>
              <th className="text-end bg-cust-info border border-dark">{totalCash.toFixed(2)}</th>
              <th className="text-end bg-cust-info border border-dark">{totalBank.toFixed(2)}</th>
              <th className="text-end bg-cust-info border border-dark">{totalOnline.toFixed(2)}</th>
              <th className="text-end bg-cust-info border border-dark">{totalCard.toFixed(2)}</th>
              <th className="text-end bg-cust-info border border-dark">{totalDisc.toFixed(2)}</th>
              <th className="text-end fw-bold bg-cust-info border border-dark">
                {(totalCash + totalBank + totalOnline + totalCard).toFixed(2)}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DayBookTable;
