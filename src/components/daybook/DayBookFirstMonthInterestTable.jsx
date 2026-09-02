import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "../../css/DataTable.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { showToast } from "../../components/common/ToastAlert";
import { calculateFirstMonthInterestSectionTotals } from "./dayBookUtils";

const DayBookFirstMonthInterestTable = ({ title, data = [], isPrint = false }) => {
  const tableRef = useRef(null);
  const dataTable = useRef(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const totals = calculateFirstMonthInterestSectionTotals(data);

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

  const handleRefClick = (item) => {
    if (item.db_ref_type === "LOAN" && item.db_girv_uuid) {
      navigate("/user/home/loan-info", {
        state: { loan: { girv_uuid: item.db_girv_uuid } },
      });
    }
  };

  useEffect(() => {
    if (isPrint || !tableRef.current) return;

    if (dataTable.current) {
      dataTable.current.destroy();
    }

    dataTable.current = $(tableRef.current).DataTable({
      responsive: false,
      ordering: false,
      paging: true,
      info: false,
      dom: "l t",
      pageLength: 10,
      lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100, "All"],
      ],
    });

    return () => {
      if (dataTable.current) {
        dataTable.current.destroy();
      }
    };
  }, [data, isPrint]);

  useEffect(() => {
    if (isPrint || !dataTable.current) return;
    dataTable.current.search(search).draw();
  }, [search, isPrint]);

  return (
    <div className="border border-secondary border-dashed mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 ms-2">{title || "FIRST MONTH INTEREST"}</h6>
        {!isPrint && (
          <input
            type="search"
            className="form-control form-control-sm border border-dark w-auto mt-2 mb-2 me-2"
            placeholder={title || "FIRST MONTH INTEREST"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      <div className="table-responsive">
        <table
          ref={tableRef}
          className="table table-hover table-bordered text-capitalize mb-1 dynamic-data-table"
        >
          <thead className="table-light">
            <tr>
              <th className="bg-pink border border-dark">DATE</th>
              <th className="bg-pink border border-dark">FIRM</th>
              <th className="bg-pink border border-dark">CUSTOMER NAME</th>
              <th className="bg-pink border border-dark">REF NO</th>
              <th className="bg-pink border border-dark">TYPE</th>
              <th className="bg-pink border border-dark">INTEREST</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const interestAmt = parseFloat(item.db_interest_amt) || 0;

              return (
                <tr key={index}>
                  <td className="border border-dark">{item.db_date}</td>
                  <td className="border border-dark">{item.db_firm}</td>
                  <td
                    className={`border border-dark text-brown fw-bold ${isPrint ? "" : "cursor-pointer"}`}
                    onClick={isPrint ? undefined : () => handleCustomerClick(item.db_user_uuid)}
                  >
                    {item.db_customer_name}
                  </td>
                  <td
                    className={`border border-dark text-primary fw-bold ${isPrint ? "" : "cursor-pointer"}`}
                    onClick={isPrint ? undefined : () => handleRefClick(item)}
                  >
                    {item.db_ref_no || "-"}
                  </td>
                  <td className="border border-dark">{item.db_ref_type || "-"}</td>
                  <td className="text-end border border-dark text-success">{interestAmt.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th className="text-end bg-cust-info border border-dark" colSpan={5}>
                TOTAL AMT :
              </th>
              <th className="text-end fw-bold bg-cust-info border border-dark text-success">
                {totals.total.toFixed(2)}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DayBookFirstMonthInterestTable;
