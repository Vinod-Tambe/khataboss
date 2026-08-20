import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getGirvis, deleteGirvi } from "../../api/girviApi";
import { toast } from "react-toastify";
import List from "../common/List";
import { setSelectedUser } from "../../store/slices/userSlice";
import usePermissions from "../../hooks/usePermissions";
import PermissionGate from "../common/PermissionGate";
import {
  formatListAmtOrDash,
  formatListDate,
  statusBadgeHtml,
  formatProfitLossHtml,
  normalizeLoanListRow,
} from "../../utils/listFormatters";

const ListLoan = ({ status = "ALL", global = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const { can } = usePermissions();
  const canViewLoan = can("loan.view");
  const canEditLoan = can("loan.edit");
  const canDeleteLoan = can("loan.delete");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        firmId: selectedFirm?.firm_id,
        status: status,
      };
      if (!global && selectedUser?.user_id) {
        filters.userId = selectedUser.user_id;
      }
      const response = await getGirvis(filters);
      const data = Array.isArray(response) ? response : (response.data || []);
      setLoans(data.map(normalizeLoanListRow));
    } catch (error) {
      console.error("Error fetching loans:", error);
      toast.error("Failed to load loan records");
    } finally {
      setLoading(false);
    }
  }, [selectedFirm?.firm_id, selectedUser?.user_id, status, global]);

  useEffect(() => {
    if (global || selectedUser?.user_id) {
      fetchLoans();
    }
  }, [selectedUser?.user_id, fetchLoans, global]);

  const handleView = (rowData) => {
    navigate("/user/home/loan-info", { state: { loan: rowData } });
  };

  const handleEdit = (rowData) => {
    if (!canEditLoan) {
      toast.error("You do not have permission to edit loans");
      return;
    }
    navigate(`/user/home/edit-loan/${rowData.girv_id}`, { state: { loan: rowData } });
  };

  const handleDelete = async (rowData) => {
    if (!canDeleteLoan) {
      toast.error("You do not have permission to delete loans");
      return;
    }
    if (!rowData?.girv_id) return;
    const loanRef = rowData.girv_unique_code || rowData.girv_loan_no || `LN-${rowData.girv_id}`;
    const confirmed = window.confirm(
      `Delete loan ${loanRef}? This is only allowed for ACTIVE loans with no deposits, releases, or additional principal.`
    );
    if (!confirmed) return;

    try {
      await deleteGirvi(rowData.girv_id);
      toast.success("Loan deleted successfully");
      fetchLoans();
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error(error?.error || error?.message || "Failed to delete loan");
    }
  };

  const handleCustomerHome = (rowData) => {
    const user = rowData?.user;
    const userId = user?.user_id || rowData?.girv_user_id;
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
        key: "girv_unique_code",
        title: "Loan No",
        searchable: true,
        render: (data, type, row) => {
          const value = data || row?.girv_loan_no || (row?.girv_id ? String(row.girv_id) : "");
          if (type !== "display") return value || "-";
          return value
            ? `<span class="text-brown fw-bold">${value}</span>`
            : "-";
        },
      },
    ];

    if (global) {
      cols.push(
        {
          key: "girv_customer_name",
          title: "Customer Name",
          searchable: true,
          customerHome: true,
          render: (data, type, row) => {
            const name = data || "-";
            if (type !== "display") return name;
            if (!row?.user) return "-";
            return `<span class="text-brown fw-bold cursor-pointer customer-home-btn" title="Open customer home">${name}</span>`;
          },
        },
        {
          key: "girv_customer_mobile",
          title: "Mobile",
          searchable: true,
          render: (data) => data || "-",
        }
      );
    }

    cols.push(
      {
        key: "girv_status",
        title: "Status",
        render: (data) => statusBadgeHtml(data),
      },
      {
        key: "girv_type",
        title: "Type",
        render: (data) => (data ? String(data).toUpperCase() : "-"),
      },
      {
        key: "girv_start_date",
        title: "Start Date",
        dateFilter: true,
        render: (data) =>
          data
            ? `<span class="text-brown fw-bold cursor-pointer view-btn">${formatListDate(data)}</span>`
            : "-",
      },
      {
        key: "girv_end_date_display",
        title: "End Date",
        render: (data) => data || "-",
      },
      {
        key: "girv_time_period",
        title: "T.Period",
        render: (data) => data || "-",
      },
      {
        key: "girv_display_principal",
        title: "Principal",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "girv_total_interest",
        title: "Interest",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "girv_total_due",
        title: "Final Pay",
        sum: true,
        render: (data) => formatListAmtOrDash(data),
      },
      {
        key: "profit_loss",
        title: "Profit/Loss",
        render: (data, type) => {
          if (type !== "display") {
            return data != null ? formatListAmtOrDash(data) : "-";
          }
          return formatProfitLossHtml(data);
        },
      }
    );

    if (status === "TRANSFERRED") {
      cols.push(
        {
          key: "girv_transfer_firm_name",
          title: "Transfer Firm",
          searchable: true,
          render: (data) => data || "-",
        },
        {
          key: "girv_transfer_ml_name",
          title: "Money Lender",
          searchable: true,
          render: (data) => data || "-",
        }
      );
    }

    return cols;
  }, [global, status]);

  const getTitle = () => {
    let baseTitle = "";
    switch (status) {
      case "ALL":
        baseTitle = "All Loan List";
        break;
      case "ACTIVE":
        baseTitle = "Active Loan List";
        break;
      case "RELEASED":
        baseTitle = "Released Loan List";
        break;
      case "CLOSED":
        baseTitle = "Closed Loan List";
        break;
      case "TRANSFERRED":
        baseTitle = "Transfer Loan List";
        break;
      case "AUCTION":
        baseTitle = "Auction Loan List";
        break;
      default:
        baseTitle = `${status} Loan List`;
        break;
    }
    return global ? `Global ${baseTitle}` : baseTitle;
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">{getTitle()}</h5>
        {!global && (
          <PermissionGate permission="loan.create">
            <button
              type="button"
              onClick={() => navigate("/user/home/add-loan")}
              className="btn btn-primary btn-sm"
            >
              Add Loan +
            </button>
          </PermissionGate>
        )}
      </div>
      <div className="card-body p-0">
        <List
          data={loans}
          columns={columns}
          title={getTitle()}
          primaryKey="girv_id"
          subtitleKey="girv_start_date"
          amountKey="girv_prin_amt"
          onView={canViewLoan ? handleView : undefined}
          onDelete={canDeleteLoan ? handleDelete : undefined}
          onEdit={canEditLoan ? handleEdit : undefined}
          onCustomerHome={global ? handleCustomerHome : undefined}
          hasView={canViewLoan}
          hasDelete={canDeleteLoan ? (row) => row.girv_status === "ACTIVE" : false}
          hasEdit={canEditLoan ? (row) => row.girv_status === "ACTIVE" : false}
          isLoading={loading}
          showFooter={true}
          deleteConfirmMessage="Are you sure you want to delete this loan? Only clean ACTIVE loans can be deleted."
        />
      </div>
    </div>
  );
};

export default ListLoan;
