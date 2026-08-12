import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUsers, deleteUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { toast } from "react-toastify";
import { ConfirmAlert } from "../common/ConfirmAlert";
import {
  getCustomerAddress,
  getCustomerEmail,
  getCustomerPhone,
} from "../../utils/customerFormatters";
import CustomerAddressTooltip from "./CustomerAddressTooltip";

const UserGrid = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { selectedFirmId } = useSelector((state) => state.firm);

  const fetchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const firmId = selectedFirmId === 'all' ? null : selectedFirmId;
      const response = await getUsers(firmId, search);
      setUserData(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [selectedFirmId]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [fetchUsers, debouncedSearchTerm]);

  const handleDelete = async (user) => {
    const isConfirmed = await ConfirmAlert(`Are you sure you want to delete customer: ${user.user_first_name} ${user.user_last_name}?`);
    if (isConfirmed) {
      try {
        await deleteUser(user.user_uuid);
        toast.success('Customer deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  const getProfileImage = (user) => {
    if (user.user_profile_img && user.user_profile_img.path) {
      return `http://localhost:9000/${user.user_profile_img.path}`;
    }
    return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  };

  return (
    <div className="card p-3 pt-2 shadow-sm position-relative">
      <div className="row pt-2 pb-3 align-items-center">
        <div className="col-9">
          <div className="input-group">
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text border border-secondary">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
        <div className="col-3 text-end">
          <Link className="btn btn-outline-success" to="/user/add">
            <i className="bi bi-plus-square-dotted"></i>
          </Link>
        </div>
      </div>

      <div className="row g-3 position-relative" style={{ minHeight: "200px" }}>
        {loading && (
          <div 
            className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" 
            style={{ zIndex: 10, top: 0, left: 0 }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {userData.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h5 className="text-secondary">No customers found for this firm.</h5>
          </div>
        ) : (
          userData.map((user) => (
            <div key={user.user_id} className="col-12 col-md-6 col-lg-6">
              <div className="card shadow border-dark h-100 position-relative">
                <div 
                  className="text-decoration-none cursor-pointer" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    dispatch(setSelectedUser(user));
                    navigate('/user/home');
                  }}
                >
                  <div className="card-body text-dark p-2">
                    <CustomerAddressTooltip user={user} tooltipId={`user-grid-address-${user.user_id}`}>
                      <div className="row align-items-center">
                        <div className="col-3 text-center">
                          <img
                            src={getProfileImage(user)}
                            alt={user.user_first_name}
                            width="80"
                            height="80"
                            className="rounded-circle border border-danger object-fit-cover"
                            onError={(e) => {
                              e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                            }}
                          />
                        </div>

                        <div className="col-9 text-dark">
                          <h5 className="card-title text-success-emphasis mb-1 fw-bold">
                            {user.user_first_name} {user.user_last_name}
                          </h5>
                          <p className="m-0">{getCustomerPhone(user)}</p>
                          <p className="m-0 text-break">{getCustomerEmail(user)}</p>
                          <p className="m-0 text-break">{getCustomerAddress(user)}</p>
                        </div>
                      </div>
                    </CustomerAddressTooltip>
                  </div>
                </div>

                <div className="card-footer bg-transparent border-dark d-flex align-items-center p-2 m-0 mt-auto">
                  <button
                    style={{ minWidth: "75px" }}
                    className="btn me-2 p-1 m-0 bg-secondary-subtle border-secondary text-truncate fw-bold"
                    title={user.user_unique_code || user.user_id}
                    disabled
                  >
                    {user.user_unique_code || user.user_id}
                  </button>
                  <button className="btn me-2 bg-success-subtle border-secondary rounded-circle">
                    <i className="bi bi-whatsapp"></i>
                  </button>
                  <button className="btn me-2 bg-primary-subtle border-secondary rounded-circle">
                    <i className="bi bi-telephone-outbound"></i>
                  </button>
                  <button
                    className="btn me-2 bg-info-subtle border-secondary rounded-circle"
                    onClick={() => navigate(`/user/edit/${user.user_uuid}`)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    className="btn me-2 bg-danger-subtle border-secondary rounded-circle"
                    onClick={() => handleDelete(user)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                  <p className="ms-auto mb-0 text-secondary">
                    - {new Date(user.user_add_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserGrid;
