import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getGirvis } from "../../api/girviApi";
import { toast } from "react-toastify";
import moment from "moment";
import List from "../common/List";

const ListLoan = ({ status = "ALL", global = false }) => {
  const navigate = useNavigate();
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
      console.log("Fetching loans with filters:", filters);
      const response = await getGirvis(filters);
      console.log("Loan API response:", response);
      // Check if response is the array or contains a data property
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

  const handleDelete = async (rowData) => {
    // Delete API not implemented yet
    toast.error("Delete not implemented");
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: "girv_id",
        title: "Loan No",
        render: (data) => `${data}.`
      }
    ];

    if (global) {
      cols.push({
        key: "girv_id",
        title: "Customer Name",
        searchable: true,
        render: (data, type, row) => {
          if (!row || !row.user) return "-";
          return `${row.user.user_first_name || ""} ${row.user.user_last_name || ""}`.trim() || "-";
        }
      });
      cols.push({
        key: "girv_id",
        title: "Mobile",
        searchable: true,
        render: (data, type, row) => row.user?.user_mobile_no || "-"
      });
    }

    cols.push(
      {
        key: "girv_status",
        title: "Status",
        render: (data) => {
          let text = data || "ACTIVE";
          switch (text) {
            case "ACTIVE": text = "Active"; break;
            case "RELEASED": text = "Released"; break;
            case "CLOSED": text = "Closed"; break;
            case "TRANSFERRED": text = "Transferred"; break;
            case "AUCTION": text = "Auction"; break;
            default: break;
          }
          return `${text}`;
        }
      },
    {
      key: "girv_start_date",
      title: "Start Date",
      dateFilter: true,
      render: (data) => `<span class="text-brown fw-bold cursor-pointer view-btn">${moment(data).format("DD-MM-YYYY")}</span>`
    },
    {
      key: "girv_type",
      title: "Type",
      render: (data) => data ? data.toUpperCase() : "-"
    },
    {
      key: "girv_prin_amt",
      title: "Principal",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "girv_roi",
      title: "ROI",
      render: (data) => `${data}%`
    },
    {
      key: "girv_cash_amt",
      title: "Cash",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "girv_bank_amt",
      title: "Bank",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "girv_online_amt",
      title: "Online",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "girv_card_amt",
      title: "Card",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    );
    return cols;
  }, [global]);

  const getTitle = () => {
    let baseTitle = "";
    switch (status) {
      case "ALL": baseTitle = "All Loan List"; break;
      case "ACTIVE": baseTitle = "Active Loan List"; break;
      case "RELEASED": baseTitle = "Released Loan List"; break;
      case "CLOSED": baseTitle = "Closed Loan List"; break;
      default: baseTitle = `${status} Loan List`; break;
    }
    return global ? `Global ${baseTitle}` : baseTitle;
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">
          {getTitle()}
        </h5>
        <button
          onClick={() => navigate("/user/home/add-loan")}
          className="btn btn-primary btn-sm"
        >
          Add Loan +
        </button>
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
          hasView={true}
          hasDelete={false}
          hasEdit={(row) => row.girv_status === 'ACTIVE'}
          isLoading={loading}
          showFooter={true}
        />
      </div>
    </div>
  );
};

export default ListLoan;
