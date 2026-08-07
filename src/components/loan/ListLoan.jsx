import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getGirvis } from "../../api/girviApi";
import { toast } from "react-toastify";
import List from "../common/List";
import { setSelectedUser } from "../../store/slices/userSlice";
import {
  formatListAmt,
  formatListDate,
  statusBadgeHtml,
  getLoanEndDate,
  getLoanTimePeriod,
} from "../../utils/listFormatters";

const ListLoan = ({ status = "ALL", global = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
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
      setLoans(data);
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
    navigate("/user/home/loan-info", { state: { loan: rowData } });
  };

  const handleDelete = async () => {
    toast.error("Delete not implemented");
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
        key: "girv_id",
        title: "Loan No",
        render: (data) => `${data}.`,
      },
    ];

    if (global) {
      cols.push(
        {
          key: "girv_id",
          title: "Customer Name",
          searchable: true,
          customerHome: true,
          render: (data, type, row) => {
            if (!row?.user) return "-";
            const name = `${row.user.user_first_name || ""} ${row.user.user_last_name || ""}`.trim() || "-";
            if (type !== "display") return name;
            return `<span class="text-brown fw-bold cursor-pointer customer-home-btn" title="Open customer home">${name}</span>`;
          },
        },
        {
          key: "girv_id",
          title: "Mobile",
          searchable: true,
          render: (data, type, row) => row.user?.user_mobile_no || "-",
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
        key: "girv_start_date",
        title: "Start Date",
        dateFilter: true,
        render: (data) =>
          `<span class="text-brown fw-bold cursor-pointer view-btn">${formatListDate(data)}</span>`,
      },
      {
        key: "girv_start_date",
        title: "End Date",
        render: (data, type, row) => getLoanEndDate(row),
      },
      {
        key: "girv_start_date",
        title: "T.Period",
        render: (data, type, row) => getLoanTimePeriod(row),
      },
      {
        key: "girv_type",
        title: "Type",
        render: (data) => (data ? String(data).toUpperCase() : "-"),
      },
      {
        key: "girv_prin_amt",
        title: "Principal",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "girv_roi",
        title: "ROI",
        render: (data, type, row) => {
          if (data == null || data === "") return "-";
          const roiType = row?.girv_roi_type ? String(row.girv_roi_type).toUpperCase() : "";
          return `${data}%${roiType ? ` ${roiType}` : ""}`;
        },
      },
      {
        key: "girv_packet_no",
        title: "Packet",
        render: (data) => data || "-",
      },
      {
        key: "girv_locker_no",
        title: "Locker",
        render: (data) => data || "-",
      }
    );

    if (status === "TRANSFERRED") {
      cols.push(
        {
          key: "girv_transfer_firm_id",
          title: "Transfer Firm",
          searchable: true,
          render: (data, type, row) => {
            const name = row?.transferFirm?.firm_name;
            if (name) return name;
            return data ? `Firm #${data}` : "-";
          },
        },
        {
          key: "girv_transfer_ml_id",
          title: "Money Lender",
          searchable: true,
          render: (data, type, row) => {
            const ml = row?.transferMoneyLender;
            if (ml) {
              return (
                [ml.ml_first_name, ml.ml_last_name].filter(Boolean).join(" ").trim() ||
                `ML #${ml.ml_id}`
              );
            }
            return data ? `ML #${data}` : "-";
          },
        }
      );
    }

    cols.push(
      {
        key: "girv_final_amt",
        title: "Final Amt",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "girv_cash_amt",
        title: "Cash",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "girv_bank_amt",
        title: "Bank",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "girv_online_amt",
        title: "Online",
        sum: true,
        render: (data) => formatListAmt(data),
      },
      {
        key: "girv_card_amt",
        title: "Card",
        sum: true,
        render: (data) => formatListAmt(data),
      }
    );

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
          <button
            onClick={() => navigate("/user/home/add-loan")}
            className="btn btn-primary btn-sm"
          >
            Add Loan +
          </button>
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
          onView={handleView}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onCustomerHome={global ? handleCustomerHome : undefined}
          hasView={true}
          hasDelete={false}
          hasEdit={(row) => row.girv_status === "ACTIVE"}
          isLoading={loading}
          showFooter={true}
        />
      </div>
    </div>
  );
};

export default ListLoan;
