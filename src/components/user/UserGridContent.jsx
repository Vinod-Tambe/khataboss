import React from "react";
import {
  getCustomerAddress,
  getCustomerEmail,
  getCustomerFirmName,
  getCustomerPhone,
} from "../../utils/customerFormatters";
import CustomerAddressTooltip from "./CustomerAddressTooltip";
import { resolveImageUrl } from "../../utils/imageHelpers";

const UserGridContent = ({
  userData = [],
  loading = false,
  showFirmBadge = false,
  hasEdit = false,
  hasDelete = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getProfileImage = (user) =>
    resolveImageUrl(user.user_profile_img) ||
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
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
              {showFirmBadge && getCustomerFirmName(user) && (
                <span
                  className="customer-card-firm-badge badge status-badge status-badge--primary"
                  title={getCustomerFirmName(user)}
                >
                  {getCustomerFirmName(user)}
                </span>
              )}
              <div
                className="text-decoration-none cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => onSelect?.(user)}
              >
                <div className="card-body text-dark p-2 customer-card-body">
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
                  type="button"
                  style={{ minWidth: "75px" }}
                  className="btn me-2 p-1 m-0 bg-secondary-subtle border-secondary text-truncate fw-bold"
                  title={user.user_unique_code || user.user_id}
                  disabled
                >
                  {user.user_unique_code || user.user_id}
                </button>
                <button type="button" className="btn me-2 bg-success-subtle border-secondary rounded-circle">
                  <i className="bi bi-whatsapp" />
                </button>
                <button type="button" className="btn me-2 bg-primary-subtle border-secondary rounded-circle">
                  <i className="bi bi-telephone-outbound" />
                </button>
                {hasEdit && (
                  <button
                    type="button"
                    className="btn me-2 bg-info-subtle border-secondary rounded-circle"
                    onClick={() => onEdit?.(user)}
                  >
                    <i className="bi bi-pencil-square" />
                  </button>
                )}
                {hasDelete && (
                  <button
                    type="button"
                    className="btn me-2 bg-danger-subtle border-secondary rounded-circle"
                    onClick={() => onDelete?.(user)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}

                <p className="ms-auto mb-0 text-secondary">
                  - {new Date(user.user_add_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserGridContent;
