import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserHome from "../../components/user/UserHome";
import AddLoan from "../../components/loan/AddLoan";
import AddFinance from "../../components/finance/AddFinance";
import ListFinance from "../../components/finance/ListFinance";
import UpdateLoan from "../../components/loan/UpdateLoan";
import Dropdown from "react-bootstrap/Dropdown";
import Finance from "../../components/finance/Finance";
import LoanInfo from "../../components/loan/LoanInfo";
import ListLoan from "../../components/loan/ListLoan";
import AuctionLoanList from "../../components/loan/AuctionLoanList";

const UserHomeRoutes = () => {
  const { selectedUser } = useSelector((state) => state.user);

  if (!selectedUser) {
    return (
      <div className="card p-5 text-center shadow-sm">
        <h3 className="text-danger">No active user selected.</h3>
        <p className="text-muted">Please select a user from the User List/Grid first.</p>
        <Link to="/user/list" className="btn btn-primary mt-3">Go to User List</Link>
      </div>
    );
  }

  const {
    user_first_name,
    user_last_name,
    user_mobile_no,
    user_profile_img
  } = selectedUser;

  const profileImg = user_profile_img?.path
    ? `http://localhost:9000/${user_profile_img.path}`
    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="card px-2 py-1 shadow-sm mb-2">
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-1">

          {/* USER INFO */}
          <Link className="text-decoration-none" to="/user/home">
            <div className="d-flex align-items-center me-3 mb-2 mb-lg-0 cursor-pointer">
              <img
                alt="User"
                className="rounded-circle border border-dark"
                width="40"
                height="40"
                src={profileImg}
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                }}
              />
              <div className="ms-2">
                <div className="fw-bold text-dark">{user_first_name} {user_last_name}</div>
                <div className="text-muted small">{user_mobile_no}</div>
              </div>
            </div>
          </Link>

          {/* ================= DESKTOP MENU ================= */}
          <ul className="nav d-none d-lg-flex align-items-center">

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

            {/* Finance Dropdown */}
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

            {/* Loan Dropdown */}
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
                    <i className="bi bi-box-arrow-up-right text-info"></i>
                    Release Loan List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/close-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-lock text-danger"></i>
                    Closed Loan List
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/auction-loan" className="d-flex align-items-center gap-2">
                    <i className="bi bi-hammer text-warning"></i>
                    Auction Loan List
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
                C-12
              </span>
            </li>

          </ul>

          {/* ================= MOBILE MENU ================= */}
          <div className="d-lg-none">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-inline-flex align-items-center gap-1">
                <i className="bi bi-list"></i>
                C-12
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
                  <i className="bi bi-box-arrow-up-right text-info"></i>
                  Release Loan List
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/close-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-lock text-danger"></i>
                  Closed Loan List
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/all-loan" className="d-flex align-items-center gap-2">
                  <i className="bi bi-list-ul text-secondary"></i>
                  All Loan List
                </Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
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
          <Route path="/active-finance" element={<ListFinance status="ACTIVE" />} />
          <Route path="/completed-finance" element={<ListFinance status="COMPLETED" />} />
          <Route path="/close-finance" element={<ListFinance status="CLOSED" />} />
          <Route path="/all-finance" element={<ListFinance status="ALL" />} />
          <Route path="/finance" element={<Finance />} />

          <Route path="/active-loan" element={<ListLoan status="ACTIVE" />} />
          <Route path="/release-loan" element={<ListLoan status="RELEASED" />} />
          <Route path="/close-loan" element={<ListLoan status="CLOSED" />} />
          <Route path="/auction-loan" element={<AuctionLoanList />} />
          <Route path="/all-loan" element={<ListLoan status="ALL" />} />
        </Routes>

      </div>
    </div>
  );
};

export default UserHomeRoutes;
