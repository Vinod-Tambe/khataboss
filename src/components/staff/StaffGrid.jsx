import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStaffList, deleteStaff } from "../../api/staffApi";
import { showToast } from "../common/ToastAlert";
import usePermissions from "../../hooks/usePermissions";
import PermissionGate from "../common/PermissionGate";
import { resolveImageUrl } from "../../utils/imageHelpers";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const resolveStaffImageUrl = (img) => resolveImageUrl(img) || DEFAULT_AVATAR;

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-IN");
  } catch {
    return "";
  }
};

const StaffGrid = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStaff = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await getStaffList(q);
      setStaffList(res.data || []);
    } catch (err) {
      showToast(err.message || "Failed to load staff", "error");
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaff(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search, loadStaff]);

  const handleDelete = async (e, staff) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete staff "${staff.staff_first_name} ${staff.staff_last_name}"?`)) {
      return;
    }
    try {
      await deleteStaff(staff.staff_uuid);
      showToast("Staff deleted successfully");
      loadStaff(search.trim());
    } catch (err) {
      showToast(err.message || "Failed to delete staff", "error");
    }
  };

  return (
    <div className="card p-3 pt-2 shadow-sm">
      <div className="row pt-2 pb-3 align-items-center">
        <div className="col-9">
          <div className="input-group">
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search staff by name, mobile, login ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text border border-secondary">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
        <div className="col-3 text-end">
          <PermissionGate permission="staff.create">
            <Link className="btn btn-outline-success" to="/staff/add">
              <i className="bi bi-plus-square-dotted"></i>
            </Link>
          </PermissionGate>
        </div>
      </div>

      {loading && (
        <div className="text-center text-muted py-4">Loading staff...</div>
      )}

      {!loading && staffList.length === 0 && (
        <div className="text-center text-muted py-4">
          No staff found.{" "}
          <Link to="/staff/add" className="text-success fw-bold">
            Add staff
          </Link>
        </div>
      )}

      <div className="row g-3">
        {staffList.map((staff) => {
          const name = `${staff.staff_first_name || ""} ${staff.staff_last_name || ""}`.trim();
          const phone = [staff.staff_mobile_no, staff.staff_phone_no].filter(Boolean).join(", ");
          const address = [staff.staff_curr_address, staff.staff_city, staff.staff_pincode]
            .filter(Boolean)
            .join(", ");
          const image = resolveStaffImageUrl(staff.staff_profile_img);

          return (
            <div
              key={staff.staff_uuid}
              className="col-12 col-md-6 col-lg-6 text-decoration-none"
              onClick={() => navigate(`/staff/staff-details/${staff.staff_uuid}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card bg-blue shadow border-dark h-100">
                <div className="card-body text-dark p-2">
                  <div className="row align-items-center">
                    <div className="col-3 text-center">
                      <img
                        src={image}
                        alt={name}
                        width="80"
                        height="80"
                        className="rounded-circle border border-danger object-fit-cover"
                      />
                    </div>
                    <div className="col-9">
                      <h5 className="card-title text-success-emphasis mb-1 fw-bold">{name}</h5>
                      <p className="m-0">
                        <strong>Login :</strong> {staff.full_login_id || staff.staff_login_id}
                      </p>
                      <p className="m-0">
                        <strong>Phone :</strong> {phone || "-"}
                      </p>
                      <p className="m-0">
                        <strong>Address :</strong> {address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-dark d-flex align-items-center p-2 m-0">
                  <button
                    type="button"
                    style={{ width: "15%" }}
                    className="btn me-2 p-1 m-0 bg-secondary-subtle border-secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/staff/staff-details/${staff.staff_uuid}`);
                    }}
                  >
                    {staff.staff_unique_code || staff.staff_id}
                  </button>
                  <button
                    type="button"
                    className="btn me-2 bg-info-subtle border-secondary rounded-circle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/staff/staff-details/${staff.staff_uuid}`);
                    }}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  {can("staff.delete") && (
                    <button
                      type="button"
                      className="btn me-2 bg-danger-subtle border-secondary rounded-circle"
                      onClick={(e) => handleDelete(e, staff)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                  <p className="ms-auto mb-0 text-secondary">
                    - {formatDate(staff.staff_add_date || staff.staff_created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffGrid;
