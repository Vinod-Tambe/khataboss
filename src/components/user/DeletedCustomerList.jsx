import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import List from "../common/List";
import { ConfirmAlert } from "../common/ConfirmAlert";
import { getDeletedUsers, restoreUser } from "../../api/userApi";
import { buildCustomerListColumns } from "./customerListColumns";
import usePermissions from "../../hooks/usePermissions";
import { formatListDate } from "../../utils/listFormatters";
import "../../css/DataTable.css";
import "../../css/CustomerList.css";

const deletedOnColumn = {
  key: "user_deleted_at",
  title: "Deleted On",
  orderable: true,
  searchable: false,
  render: (data, type, row) => {
    const raw = data ?? row?.user_deleted_at;
    const formatted = formatListDate(raw);
    if (type !== "display" && type !== "export") return raw || "";
    return formatted;
  },
};

const DeletedCustomerList = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { selectedFirmId } = useSelector((state) => state.firm);
  const { can } = usePermissions();
  const canRestore = can("user.delete");

  const fetchDeleted = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const firmId = selectedFirmId === "all" ? null : selectedFirmId;
      const response = await getDeletedUsers(firmId, search);
      setUserData(response.data || []);
    } catch (error) {
      console.error("Error fetching deleted customers:", error);
      toast.error(error.message || "Failed to load deleted customers");
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchDeleted(debouncedSearchTerm);
  }, [fetchDeleted, debouncedSearchTerm]);

  const showFirmBadge = selectedFirmId === "all";
  const columns = useMemo(() => {
    const base = buildCustomerListColumns({ includeFirm: showFirmBadge });
    return [...base, deletedOnColumn];
  }, [showFirmBadge]);

  const handleRestore = async (row) => {
    if (!canRestore) {
      toast.error("You do not have permission to restore customers");
      return;
    }

    const name = `${row?.user_first_name || ""} ${row?.user_last_name || ""}`.trim();
    const confirmed = await ConfirmAlert(
      `Restore customer "${name || row?.user_unique_code}"?\n\nThis will restore the customer and all loans, finance, EMI/collection rows, journal entries, stock, deposits, releases, and auction records that were deleted together with this customer.`
    );
    if (!confirmed) return;

    try {
      const res = await restoreUser(row.user_uuid);
      toast.success(res.message || "Customer restored successfully");
      fetchDeleted(debouncedSearchTerm);
    } catch (error) {
      toast.error(error.message || "Failed to restore customer");
    }
  };

  return (
    <div className="customer-browse-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="fw-bold text-brown mb-1">Deleted Customer List</h4>
          <p className="text-muted small mb-0">
            Soft-deleted customers. Restore brings back the customer, loans, finance, journals, stock, and related entries deleted with the customer.
          </p>
        </div>
        <Link to="/user/grid" className="btn btn-outline-secondary btn-sm">
          <FiArrowLeft className="me-1" /> Back to customers
        </Link>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-secondary">
              <i className="bi bi-search" />
            </span>
            <input
              type="text"
              className="form-control border-secondary"
              placeholder="Search deleted customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <List
        data={userData}
        columns={columns}
        title="Deleted Customer List"
        primaryKey="user_unique_code"
        subtitleKey="user_mobile_no"
        onRestore={canRestore ? handleRestore : undefined}
        hasRestore={canRestore}
        isLoading={loading}
        showFooter={false}
        applyDefaultDateFilter={false}
      />
    </div>
  );
};

export default DeletedCustomerList;
