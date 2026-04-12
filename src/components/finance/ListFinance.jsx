import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getFinances, deleteFinance } from "../../api/financeApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import moment from "moment";

const ListFinance = ({ status = "ALL" }) => {
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirm } = useSelector((state) => state.firm);
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        firmId: selectedFirm?.firm_id,
        userId: selectedUser?.user_id,
        status: status,
      };
      const response = await getFinances(filters);
      setFinances(response.data || []);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this finance record?")) {
      try {
        await deleteFinance(id);
        toast.success("Finance record deleted successfully");
        fetchFinances();
      } catch (error) {
        toast.error(error.message || "Failed to delete record");
      }
    }
  };

  const getStatusBadge = (financeStatus) => {
    switch (financeStatus) {
      case "ACTIVE":
        return <span className="badge bg-success">Active</span>;
      case "INACTIVE":
        return <span className="badge bg-secondary">Inactive</span>;
      case "CLOSED":
        return <span className="badge bg-danger">Closed</span>;
      case "COMPLETED":
        return <span className="badge bg-primary">Completed</span>;
      default:
        return <span className="badge bg-info">{financeStatus}</span>;
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading finances...</div>;
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">
          {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()} Finance List
        </h5>
        <Link to="/user/home/add-finance" className="btn btn-primary btn-sm">
          Add Finance +
        </Link>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="ps-4">Fin No</th>
                <th>User / Customer</th>
                <th>Principal</th>
                <th>EMI Details</th>
                <th>Start Date</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {finances.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No finance records found.
                  </td>
                </tr>
              ) : (
                finances.map((fin) => (
                  <tr key={fin.fin_id}>
                    <td className="ps-4 fw-bold">
                      <Link to="/user/home/finance" className="text-decoration-none">
                        {fin.fin_id}.
                      </Link>
                    </td>
                    <td>
                      <div className="fw-bold">{fin.user?.user_first_name} {fin.user?.user_last_name}</div>
                      <div className="small text-muted">{fin.user?.user_mobile_no}</div>
                    </td>
                    <td>
                      <div className="fw-bold">₹{fin.fin_prin_amt?.toLocaleString()}</div>
                      <div className="small text-success">ROI: {fin.fin_roi}%</div>
                    </td>
                    <td>
                      <div>EMI: ₹{fin.fin_emi_amt?.toLocaleString()}</div>
                      <div className="small text-muted">{fin.fin_no_of_emi} Installments</div>
                    </td>
                    <td>{moment(fin.fin_start_date).format("DD-MM-YYYY")}</td>
                    <td>{getStatusBadge(fin.fin_status)}</td>
                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-info" title="View Details">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete"
                          onClick={() => handleDelete(fin.fin_id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListFinance;
