import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserHome from "../../components/user/UserHome";
import AddLoan from "../../components/loan/AddLoan";
import AddFinance from "../../components/finance/AddFinance";
import UpdateFinance from "../../components/finance/UpdateFinance";
import ListFinance from "../../components/finance/ListFinance";
import UpdateLoan from "../../components/loan/UpdateLoan";
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Finance from "../../components/finance/Finance";
import LoanInfo from "../../components/loan/LoanInfo";
import ListLoan from "../../components/loan/ListLoan";
import AuctionLoanList from "../../components/loan/AuctionLoanList";
import { ConfirmAlert } from "../../components/common/ConfirmAlert";
import { getCustomerPhone } from "../../utils/customerFormatters";
import CustomerAddressTooltip from "../../components/user/CustomerAddressTooltip";
import { resolveImageUrl } from "../../utils/imageHelpers";

const BLOCK_INFO_MAX_CHARS = 40;

const truncateText = (text = "", max = BLOCK_INFO_MAX_CHARS) => {
  const value = String(text).trim();
  if (value.length <= max) return { short: value, isTruncated: false };
  return { short: `${value.slice(0, max).trimEnd()}...`, isTruncated: true };
};

const BlockInfoLabel = ({ text, maxChars = BLOCK_INFO_MAX_CHARS, className = "", tooltipId = "user-block-info" }) => {
  if (!text) return null;

  const { short, isTruncated } = truncateText(text, maxChars);
  const content = (
    <span
      className={`small d-inline-flex align-items-center justify-content-center w-100 ${className}`}
      style={{ cursor: isTruncated ? "help" : "default", minWidth: 0 }}
    >
      <span className="text-muted fw-bold flex-shrink-0">Block Info :</span>
      <span className="fw-semibold text-dark ms-1 text-truncate" style={{ minWidth: 0 }}>
        {short}
      </span>
    </span>
  );

  if (!isTruncated) return content;

  return (
    <OverlayTrigger
      placement="bottom"
      delay={{ show: 150, hide: 100 }}
      overlay={
        <Tooltip id={tooltipId} style={{ maxWidth: 320 }}>
          <div className="text-start text-break">{text}</div>
        </Tooltip>
      }
    >
      {content}
    </OverlayTrigger>
  );
};

const CustomerPhoneDisplay = ({ user, className = "text-muted small text-truncate" }) => (
  <div className={className}>{getCustomerPhone(user)}</div>
);

const UserHomeRoutes = () => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.user);

  if (!selectedUser) {
    return (
      <div className="card p-5 text-center shadow-sm">
        <h3 className="text-danger">No active customer selected.</h3>
        <p className="text-muted">Please select a customer from the Customer List/Grid first.</p>
        <Link to="/user/list" className="btn btn-primary mt-3">Go to Customer List</Link>
      </div>
    );
  }

  const {
    user_id,
    user_uuid,
    user_unique_code,
    user_first_name,
    user_last_name,
    user_profile_img,
    user_other_info
  } = selectedUser;

  const profileImg =
    resolveImageUrl(user_profile_img) ||
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const handleProfileClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user_uuid) return;

    const isConfirmed = await ConfirmAlert(
      `Are you sure you want to update this customer: ${user_first_name} ${user_last_name}?`
    );
    if (isConfirmed) {
      navigate(`/user/edit/${user_uuid}`);
    }
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="card px-2 py-1 shadow-sm mb-2">
        {/* Desktop: left | centered block info | right actions */}
        <div
          className="d-none d-lg-grid align-items-center mb-1"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            columnGap: "0.75rem",
          }}
        >
          {/* USER INFO */}
          <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
          <CustomerAddressTooltip
            user={selectedUser}
            tooltipId="user-home-address-desktop"
            wrapperClassName="d-flex align-items-center"
            placement="bottom"
          >
            <img
              alt="User"
              className="rounded-circle border border-dark flex-shrink-0"
              width="40"
              height="40"
              src={profileImg}
              role="button"
              style={{ cursor: "pointer" }}
              onClick={handleProfileClick}
              onError={(e) => {
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
              }}
            />
            <Link className="text-decoration-none ms-2" to="/user/home" style={{ minWidth: 0 }}>
              <div className="fw-bold text-dark">{user_first_name} {user_last_name}</div>
              <CustomerPhoneDisplay user={selectedUser} />
            </Link>
          </CustomerAddressTooltip>
          </div>

          {/* BLOCK INFO - CENTER */}
          <div className="text-center overflow-hidden px-2" style={{ minWidth: 0 }}>
            <BlockInfoLabel text={user_other_info} maxChars={40} tooltipId="user-block-info-desktop" />
          </div>

          {/* DESKTOP MENU */}
          <ul className="nav align-items-center flex-nowrap mb-0">
            <li className="nav-item mx-1">
              <Link className="btn btn-outline-success d-inline-flex align-items-center gap-1" to="/user/home/add-loan">
                <i className="bi bi-plus-circle"></i>
                Loan
              </Link>
            </li>

            <li className="nav-item mx-1">
              <Link className="btn btn-outline-primary fw-bold d-inline-flex align-items-center gap-1" to="/user/home/add-finance">
                <i className="bi bi-plus-circle-fill"></i>
                Finance
              </Link>
            </li>

            <li className="nav-item mx-1">
              <Dropdown>
                <Dropdown.Toggle variant="outline-warning" className="d-inline-flex align-items-center gap-1">
                  <i className="bi bi-cash-stack"></i>
                  Finance
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user/home/active-finance" className="d-flex align-items-center gap-2">
                    <i className="bi bi-check2-circle text-success"></i>
                    Active Finance List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/completed-finance" className="d-flex align-items-center gap-2">
                    <i className="bi bi-check2-all text-primary"></i>
                    Completed Finance List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/close-finance" className="d-flex align-items-center gap-2">
                    <i className="bi bi-lock text-danger"></i>
                    Closed Finance List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/all-finance" className="d-flex align-items-center gap-2">
                    <i className="bi bi-list-ul text-warning"></i>
                    All Finance List
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            <li className="nav-item mx-1">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="d-inline-flex align-items-center gap-1">
                  <i className="bi bi-bank"></i>
                  Loan
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user/home/active-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-lightning-charge text-success"></i>
                    Active Loan List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/release-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-arrow-up-right text-info"></i>
                    Release Loan List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/auction-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-award text-warning"></i>
                    Auction Loan List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/transfer-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-arrow-repeat text-primary"></i>
                    Transfer Loan List
                  </Dropdown.Item>

                  <Dropdown.Item as={Link} to="/user/home/all-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-list-ul text-secondary"></i>
                    All Loan List
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            <li className="nav-item">
              <span className="input-group-text fw-bold border border-secondary d-inline-flex align-items-center gap-1">
                <i className="bi bi-credit-card-2-front"></i>
                {user_unique_code || user_id}
              </span>
            </li>
          </ul>
        </div>

        {/* Mobile: user + menu, then centered block info */}
        <div className="d-lg-none">
          <div className="d-flex align-items-center justify-content-between mb-1 gap-2">
            <div className="d-flex align-items-center min-w-0">
            <CustomerAddressTooltip
              user={selectedUser}
              tooltipId="user-home-address-mobile"
              wrapperClassName="d-flex align-items-center min-w-0"
              placement="bottom"
            >
              <img
                alt="User"
                className="rounded-circle border border-dark flex-shrink-0"
                width="40"
                height="40"
                src={profileImg}
                role="button"
                style={{ cursor: "pointer" }}
                onClick={handleProfileClick}
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                }}
              />
              <Link className="text-decoration-none ms-2 min-w-0" to="/user/home">
                <div className="fw-bold text-dark text-truncate">{user_first_name} {user_last_name}</div>
                <CustomerPhoneDisplay user={selectedUser} />
              </Link>
            </CustomerAddressTooltip>
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-inline-flex align-items-center gap-1">
                <i className="bi bi-list"></i>
                {user_unique_code || user_id}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/user/home/add-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle text-success"></i>
                  Loan
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/add-finance" className="d-flex align-items-center gap-2">
                  <i className="bi bi-plus-circle-fill text-primary"></i>
                  Finance
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>
                  <i className="bi bi-cash-stack me-1"></i>
                  Finance
                </Dropdown.Header>
                <Dropdown.Item as={Link} to="/user/home/active-finance" className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-success"></i>
                  Active Finance List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/completed-finance" className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-all text-primary"></i>
                  Completed Finance List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/close-finance" className="d-flex align-items-center gap-2">
                  <i className="bi bi-lock text-danger"></i>
                  Closed Finance List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/all-finance" className="d-flex align-items-center gap-2">
                  <i className="bi bi-list-ul text-warning"></i>
                  All Finance List
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>
                  <i className="bi bi-bank me-1"></i>
                  Loan
                </Dropdown.Header>
                <Dropdown.Item as={Link} to="/user/home/active-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge text-success"></i>
                  Active Loan List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/release-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-up-right text-info"></i>
                  Release Loan List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/auction-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-award text-warning"></i>
                  Auction Loan List
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/user/home/transfer-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-repeat text-primary"></i>
                  Transfer Loan List
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/all-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-list-ul text-secondary"></i>
                  All Loan List
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="text-center px-2 pb-1 overflow-hidden">
            <BlockInfoLabel text={user_other_info} maxChars={35} tooltipId="user-block-info-mobile" />
          </div>
        </div>
      </div>
      <div className="card p-3 pt-2 shadow-sm">
        {/* ================= ROUTES ================= */}
        <Routes>
          <Route path="/*" element={<UserHome />} />
          <Route path="/loan-info" element={<LoanInfo />} />
          <Route path="/add-loan" element={<AddLoan />} />
          <Route path="/edit-loan/:id" element={<UpdateLoan />} />
          <Route path="/add-finance" element={<AddFinance />} />
          <Route path="/edit-finance/:id" element={<UpdateFinance />} />
          <Route path="/active-finance" element={<ListFinance status="ACTIVE" />} />
          <Route path="/completed-finance" element={<ListFinance status="COMPLETED" />} />
          <Route path="/close-finance" element={<ListFinance status="CLOSED" />} />
          <Route path="/all-finance" element={<ListFinance status="ALL" />} />
          <Route path="/finance" element={<Finance />} />

          <Route path="/active-loan" element={<ListLoan status="ACTIVE" />} />
          <Route path="/release-loan" element={<ListLoan status="RELEASED" />} />
          <Route path="/auction-loan" element={<AuctionLoanList />} />
          <Route path="/transfer-loan" element={<ListLoan status="TRANSFERRED" />} />
          <Route path="/close-loan" element={<ListLoan status="CLOSED" />} />
          <Route path="/all-loan" element={<ListLoan status="ALL" />} />
        </Routes>

      </div>
    </div>
  );
};

export default UserHomeRoutes;
