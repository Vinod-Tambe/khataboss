import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFinances, deleteFinance } from "../../api/financeApi";
import { toast } from "react-toastify";
import List from "../common/List";
import { setSelectedUser } from "../../store/slices/userSlice";
import usePermissions from "../../hooks/usePermissions";
import PermissionGate from "../common/PermissionGate";
import {
  formatListAmtOrDash,
  formatListDate,
  statusBadgeHtml,
  normalizeFinanceListRow,
} from "../../utils/listFormatters";

const ListFinance = ({ status = "ALL", global = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const { can } = usePermissions();
  const canViewFinance = can("finance.view");
  const canEditFinance = can("finance.edit");
  const canDeleteFinance = can("finance.delete");
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
      setFinances(data.map(normalizeFinanceListRow));
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
    } else {
      setFinances([]);
      setLoading(false);
    }
  }, [selectedUser?.user_id, fetchFinances, global]);

  const handleView = (rowData) => {
    navigate("/user/home/finance", { state: { finance: rowData } });
  };

  const handleEdit = (rowData) => {
    if (!canEditFinance) {
      toast.error("You do not have permission to edit finance records");
      return;
    }
    navigate(`/user/home/edit-finance/${rowData.fin_id}`, { state: { finance: rowData } });
  };

  const handleDelete = async (rowData) => {
    if (!canDeleteFinance) {
      toast.error("You do not have permission to delete finance records");
      return;
    }
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
          key: "fin_customer_name",
          title: "Customer",
          searchable: true,
          customerHome: true,
          render: (data, type, row) => {
            const name = data || "N/A";
            if (type !== "display") return name;
            if (!row.user) return "N/A";
            return `<span class="text-brown fw-bold cursor-pointer customer-home-btn" title="Open customer home">${name}</span>`;
          },
        },
        {
          key: "fin_customer_mobile",
          title: "Mobile",
          searchable: true,
          render: (data) => data || "-",
        }
      );
    }

    cols.push({
      key: "fin_status",
      title: "Status",
      render: (data) => statusBadgeHtml(data),
    });

    if (global) {
      cols.push({
        key: "fin_firm_name",
        title: "Firm",
        render: (data) => data || "N/A",
      });
    }

    cols.push(
      {
        key: "fin_start_date",
        title: "Start Date",
        dateFilter: true,
        render: (data) =>
          data
            ? `<span class="text-brown fw-bold cursor-pointer view-btn">${formatListDate(data)}</span>`
            : "-",
      },
      {
        key: "fin_time_period",
        title: "T.Period",
        render: (data) => data || "-",
      },
      {
        key: "fin_prin_amt",
        title: "Principal",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "fin_emi_amt",
        title: "EMI Amt",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "fin_emi_progress",
        title: "EMIs",
        render: (data) => data || "-",
      },
      {
        key: "fin_collec_amt",
        title: "Collected",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "fin_pending_amt",
        title: "Pending",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
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
        render: (data) => formatListAmtOrDash(data),
      }
    );

    return cols;
  }, [global]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">{getTitle()}</h5>
        {!global && (
          <PermissionGate permission="finance.create">
            <button
              type="button"
              onClick={() => navigate("/user/home/add-finance")}
              className="btn btn-primary btn-sm"
            >
              Add Finance +
            </button>
          </PermissionGate>
        )}
      </div>
      <div className="card-body p-0">
        {!global && !selectedUser?.user_id ? (
          <div className="text-center text-muted py-5">
            Select a customer from User Home to view their finance list.
          </div>
        ) : (
          <List
            data={finances}
            columns={columns}
            title={getTitle()}
            primaryKey="fin_id"
            subtitleKey="fin_start_date"
            amountKey="fin_prin_amt"
            onView={canViewFinance ? handleView : undefined}
            onDelete={canDeleteFinance ? handleDelete : undefined}
            onEdit={canEditFinance ? handleEdit : undefined}
            onCustomerHome={global ? handleCustomerHome : undefined}
            hasView={canViewFinance}
            hasDelete={!global && canDeleteFinance}
            hasEdit={canEditFinance}
            isLoading={loading}
            showFooter={true}
            applyDefaultDateFilter={false}
            deleteConfirmMessage="Are you sure you want to delete this finance record?"
          />
        )}
      </div>
    </div>
  );
};

export default ListFinance;
