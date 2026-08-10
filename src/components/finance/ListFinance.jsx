import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFinances, deleteFinance } from "../../api/financeApi";
import { toast } from "react-toastify";
import List from "../common/List";
import { setSelectedUser } from "../../store/slices/userSlice";
import {
  formatListAmt,
  formatListDate,
  statusBadgeHtml,
  getFinanceEmiStats,
} from "../../utils/listFormatters";

const ListFinance = ({ status = "ALL", global = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTitle = () => {
    let baseTitle = "";
    if (status === "ALL") baseTitle = "All Finance List";
    else if (status === "TODAY_PENDING_EMI") baseTitle = "Today Pending EMI";
    else baseTitle = `${status.charAt(0) + status.slice(1).toLowerCase()} Finance List`;
    return global ? `Global ${baseTitle}` : baseTitle;
  };

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        firmId: selectedFirm?.firm_id,
        status: status,
      };
      if (!global && selectedUser?.user_id) {
        filters.userId = selectedUser.user_id;
      }
      const response = await getFinances(filters);
      const data = Array.isArray(response) ? response : (response.data || []);
      setFinances(data);
    } catch (error) {
      console.error("Error fetching finances:", error);
      toast.error("Failed to load finance records");
    } finally {
      setLoading(false);
    }
  }, [selectedFirm?.firm_id, selectedUser?.user_id, status, global]);

  useEffect(() => {
    if (global || selectedUser?.user_id) {
      fetchFinances();
    }
  }, [selectedUser?.user_id, fetchFinances, global]);

  const handleView = (rowData) => {
    navigate("/user/home/finance", { state: { finance: rowData } });
  };

  const handleEdit = (rowData) => {
    navigate(`/user/home/edit-finance/${rowData.fin_id}`, { state: { finance: rowData } });
  };

  const handleDelete = async (rowData) => {
    try {
      await deleteFinance(rowData.fin_id);
      toast.success("Finance record deleted successfully");
      fetchFinances();
    } catch (error) {
      toast.error(error.message || "Failed to delete record");
    }
  };

  const handleCustomerHome = (rowData) => {
    const user = rowData?.user;
    const userId = user?.user_id || rowData?.fin_user_id;
    if (!userId) {
      toast.error("Customer details not found");
      return;
    }
    dispatch(setSelectedUser({
      ...user,
      user_id: userId,
      user_uuid: user?.user_uuid,
      user_first_name: user?.user_first_name || "",
      user_last_name: user?.user_last_name || "",
      user_mobile_no: user?.user_mobile_no || "",
    }));
    navigate("/user/home");
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: "fin_unique_code",
        title: "Fin No",
        searchable: true,
        render: (data, type, row) => row?.fin_unique_code || `${row?.fin_id || data}`,
      },
    ];

    if (global) {
      cols.push(
        {
          key: "user",
          title: "Customer",
          searchable: true,
          customerHome: true,
          render: (data, type, row) => {
            const name = row.user
              ? `${row.user.user_first_name || ""} ${row.user.user_last_name || ""}`.trim()
              : "N/A";
            if (type !== "display") return name || "N/A";
            if (!row.user) return "N/A";
            return `<span class="text-brown fw-bold cursor-pointer customer-home-btn" title="Open customer home">${name}</span>`;
          },
        },
        {
          key: "user",
          title: "Mobile",
          searchable: true,
          render: (data, type, row) => row.user?.user_mobile_no || "-",
        }
      );
    }

    cols.push(
      {
        key: "firm",
        title: "Firm",
        render: (data, type, row) => row.firm?.firm_name || "N/A",
      },
      {
        key: "fin_status",
        title: "Status",
        render: (data) => statusBadgeHtml(data),
      },
      {
        key: "fin_start_date",
        title: "Start Date",
        dateFilter: true,
        render: (data) =>
          `<span class="text-brown fw-bold cursor-pointer view-btn">${formatListDate(data)}</span>`,
      },
      {
        key: "fin_prin_amt",
        title: "Principal",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_emi_amt",
        title: "EMI Amt",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_no_of_emi",
        title: "EMIs",
        render: (data, type, row) => getFinanceEmiStats(row).emiProgress,
      },
      {
        key: "fin_collec_amt",
        title: "Collected",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_id",
        title: "Pending",
        render: (data, type, row) => formatListAmt(getFinanceEmiStats(row).pendingAmt),
      },
      {
        key: "fin_roi",
        title: "ROI",
        render: (data) => (data != null && data !== "" ? `${data}%` : "-"),
      },
      {
        key: "fin_freq_type",
        title: "Freq",
        render: (data) => data || "-",
      },
      {
        key: "fin_final_amt",
        title: "Final Amt",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_cash_amt",
        title: "Cash",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_bank_amt",
        title: "Bank",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_online_amt",
        title: "Online",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "fin_card_amt",
        title: "Card",
        sum: true,
        render: (data) => formatListAmt(data),
      }
    );

    return cols;
  }, [global]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">{getTitle()}</h5>
        {!global && (
          <button
            onClick={() => navigate("/user/home/add-finance")}
            className="btn btn-primary btn-sm"
          >
            Add Finance +
          </button>
        )}
      </div>
      <div className="card-body p-0">
        <List
          data={finances}
          columns={columns}
          title={getTitle()}
          primaryKey="fin_id"
          subtitleKey="fin_start_date"
          amountKey="fin_prin_amt"
          onView={handleView}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onCustomerHome={global ? handleCustomerHome : undefined}
          hasView={true}
          hasDelete={!global}
          hasEdit={true}
          isLoading={loading}
          showFooter={true}
          deleteConfirmMessage="Are you sure you want to delete this finance record?"
        />
      </div>
    </div>
  );
};

export default ListFinance;
