import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFinances, deleteFinance } from "../../api/financeApi";
import { toast } from "react-toastify";
import moment from "moment";
import List from "../common/List";

const ListFinance = ({ status = "ALL" }) => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTitle = () => {
    if (status === "ALL") return "All Finance List";
    if (status === "TODAY_PENDING_EMI") return "Today Pending EMI";
    return `${status.charAt(0) + status.slice(1).toLowerCase()} Finance List`;
  };

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        firmId: selectedFirm?.firm_id,
        userId: selectedUser?.user_id,
        status: status,
      };
      console.log("Fetching finances with filters:", filters);
      const response = await getFinances(filters);
      console.log("Finance API response:", response);
      // Check if response is the array or contains a data property
      const data = Array.isArray(response) ? response : (response.data || []);
      setFinances(data);
    } catch (error) {
      console.error("Error fetching finances:", error);
      toast.error("Failed to load finance records");
    } finally {
      setLoading(false);
    }
  }, [selectedFirm?.firm_id, selectedUser?.user_id, status]);

  useEffect(() => {
    if (selectedUser?.user_id) {
      fetchFinances();
    }
  }, [selectedUser?.user_id, fetchFinances]);

  const handleView = (rowData) => {
    navigate("/user/home/finance", { state: { finance: rowData } });
  };

  const handleEdit = (rowData) => {
    // Navigate to edit page if implemented, for now using view logic or toast
    navigate("/user/home/finance", { state: { finance: rowData } });
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

  const columns = useMemo(() => [
    {
      key: "fin_id",
      title: "Fin No",
      render: (data) => `${data}.`
    },
    {
      key: "user",
      title: "Customer",
      render: (data, type, row) => row.user ? `${row.user.user_first_name} ${row.user.user_last_name}` : "N/A"
    },
    {
      key: "firm",
      title: "Firm",
      render: (data, type, row) => row.firm ? row.firm.firm_name : "N/A"
    },
    {
      key: "fin_start_date",
      title: "Start Date",
      dateFilter: true,
      render: (data) => `<span class="text-brown fw-bold cursor-pointer view-btn">${moment(data).format("DD-MM-YYYY")}</span>`
    },
    {
      key: "fin_prin_amt",
      title: "Principal",
      sum: true,
      render: (data, type, row) => `
        ${Number(data).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      `
    },
    {
      key: "fin_emi_amt",
      title: "EMI Amt",
      sum: true,
      render: (data, type, row) => `
         ${Number(data).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      `
    },
    {
      key: "fin_cash_amt",
      title: "Cash",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "fin_bank_amt",
      title: "Bank",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "fin_online_amt",
      title: "Online",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "fin_card_amt",
      title: "Card",
      sum: true,
      render: (data) => `${Number(data || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      key: "fin_status",
      title: "Status",
      render: (data) => {
        let text = data;
        switch (data) {
          case "ACTIVE": text = "Active"; break;
          case "INACTIVE": text = "Inactive"; break;
          case "CLOSED": text = "Closed"; break;
          case "COMPLETED": text = "Completed"; break;
          default: text = data; break;
        }
        return `${text}`;
      }
    }
  ], []);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">
          {getTitle()}
        </h5>
        <button
          onClick={() => navigate("/user/home/add-finance")}
          className="btn btn-primary btn-sm"
        >
          Add Finance +

        </button>
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
          hasView={true}
          hasDelete={true}
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

