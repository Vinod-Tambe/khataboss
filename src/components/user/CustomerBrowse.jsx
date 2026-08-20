import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, deleteUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import { ConfirmAlert } from "../common/ConfirmAlert";
import { getCustomerFirmName } from "../../utils/customerFormatters";
import UserGridContent from "./UserGridContent";
import UserListContent from "./UserListContent";
import usePermissions from "../../hooks/usePermissions";
import PermissionGate from "../common/PermissionGate";
import "../../css/DataTable.css";
const baseColumns = [
  {
    key: "user_unique_code",
    title: "Unique Code",
    orderable: true,
    searchable: true,
    render: (data, type, row) => row?.user_unique_code || row?.user_id,
  },
  { key: "user_first_name", title: "First Name", orderable: true, searchable: true },
  { key: "user_last_name", title: "Last Name", orderable: true, searchable: true },
  { key: "user_father_name", title: "Father Name", orderable: true, searchable: true },
  { key: "user_mobile_no", title: "Mobile No", orderable: true, searchable: true },
  { key: "user_gender", title: "Gender", orderable: true, searchable: true },
  { key: "user_city", title: "City", orderable: true, searchable: true },
  { key: "user_add_date", title: "Date", orderable: true, searchable: true, dateFilter: true },
];

const firmColumn = {
  key: "firm_name",
  title: "Firm",
  orderable: true,
  searchable: true,
  cardCorner: true,
  render: (val, type, row) => getCustomerFirmName(row) || "—",
};

const CustomerBrowse = ({ initialView = "grid" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState(initialView);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { selectedFirmId } = useSelector((state) => state.firm);
  const { can } = usePermissions();
  const canEdit = can("user.edit");
  const canDelete = can("user.delete");
  const canView = can("user.view");

  const fetchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const firmId = selectedFirmId === "all" ? null : selectedFirmId;
      const response = await getUsers(firmId, search);
      setUserData(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [fetchUsers, debouncedSearchTerm]);

  useEffect(() => {
    setViewMode(initialView);
  }, [initialView]);

  const showFirmBadge = selectedFirmId === "all";

  const columns = useMemo(() => {
    if (!showFirmBadge) return baseColumns;
    return [baseColumns[0], firmColumn, ...baseColumns.slice(1)];
  }, [showFirmBadge]);

  const handleGridDelete = async (user) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete customers");
      return;
    }

    const isConfirmed = await ConfirmAlert(
      `Are you sure you want to delete customer: ${user.user_first_name} ${user.user_last_name}?`
    );
    if (!isConfirmed) return;

    try {
      await deleteUser(user.user_uuid);
      toast.success("Customer deleted successfully");
      fetchUsers(debouncedSearchTerm);
    } catch (error) {
      toast.error(error.message || "Failed to delete customer");
    }
  };

  const handleListDelete = async (rowData) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete customers");
      return;
    }

    try {
      await deleteUser(rowData.user_uuid);
      toast.success("Customer deleted successfully");
      fetchUsers(debouncedSearchTerm);
    } catch (error) {
      toast.error(error.message || "Failed to delete customer");
    }
  };

  const handleView = (rowData) => {
    dispatch(setSelectedUser(rowData));
    navigate("/user/home");
  };

  const handleEdit = (rowData) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit customers");
      return;
    }
    navigate(`/user/edit/${rowData.user_uuid}`);
  };

  const toggleView = () => {
    const nextView = viewMode === "grid" ? "list" : "grid";
    setViewMode(nextView);
    navigate(nextView === "list" ? "/user/list" : "/user/grid", { replace: true });
  };
  return (
    <div className="card p-3 pt-2 shadow-sm position-relative">
      <div className="row pt-2 pb-3 align-items-center g-2">
        <div className="col-12 col-md-9">
          <div className="input-group">
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text border border-secondary">
              <i className="bi bi-search" />
            </span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="d-flex justify-content-md-end gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              title={viewMode === "grid" ? "Customer List" : "Customer Grid"}
              onClick={toggleView}
            >
              <i className={`bi ${viewMode === "grid" ? "bi-list-ul" : "bi-grid-3x3-gap-fill"}`} />
              <span className="d-none d-sm-inline ms-1">
                {viewMode === "grid" ? "List" : "Grid"}
              </span>
            </button>
            <PermissionGate permission="user.create">
              <Link className="btn btn-outline-success" to="/user/add" title="Add Customer">
                <i className="bi bi-plus-square-dotted" />
              </Link>
            </PermissionGate>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <UserGridContent
          userData={userData}
          loading={loading}
          showFirmBadge={showFirmBadge}
          hasEdit={canEdit}
          hasDelete={canDelete}
          onDelete={canDelete ? handleGridDelete : undefined}
          onSelect={(user) => {
            dispatch(setSelectedUser(user));
            navigate("/user/home");
          }}
          onEdit={canEdit ? handleEdit : undefined}
        />
      ) : (
        <UserListContent
          userData={userData}
          columns={columns}
          loading={loading}
          hasEdit={canEdit}
          hasDelete={canDelete}
          hasView={canView}
          hasPrint={canView}
          onView={handleView}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleListDelete : undefined}
        />
      )}
    </div>
  );
};

export default CustomerBrowse;
