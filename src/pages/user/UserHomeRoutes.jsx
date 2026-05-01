import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserHome from "../../components/user/UserHome";
import AddLoan from "../../components/loan/AddLoan";
import AddFinance from "../../components/finance/AddFinance";
import ListFinance from "../../components/finance/ListFinance";
import Dropdown from "react-bootstrap/Dropdown";
import Finance from "../../components/finance/Finance";
import ActiveLoanPanel from "../../components/loan/ActiveLoanPanel";

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
          <Link className="text-decoration-none" to="/trans">
            <div className="d-flex align-items-center me-3 mb-2 mb-lg-0">
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
              <Link className="btn btn-outline-success" to="/user/home/add-loan">
                Loan +
              </Link>
            </li>

            <li className="nav-item mx-1">
              <Link className="btn btn-outline-primary fw-bold" to="/user/home/add-finance">
                Finance +
              </Link>
            </li>

            {/* Finance Dropdown */}
            <li className="nav-item mx-1">
              <Dropdown>
                <Dropdown.Toggle variant="outline-warning">
                  Finance
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user/home/active-finance">
                    Active Finance
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/inactive-finance">
                    Inactive Finance
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/all-finance">
                    All Finance
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            {/* Loan Dropdown */}
            <li className="nav-item mx-1">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Loan
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/user/home/active-loan">
                    Active Loan
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/release-loan">
                    Release Loan
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/close-loan">
                    Closed Loan
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/user/home/all-loan">
                    All Loan
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>

            <li className="nav-item">
              <span className="input-group-text fw-bold border border-secondary">
                C-12
              </span>
            </li>

          </ul>

          {/* ================= MOBILE MENU ================= */}
          <div className="d-lg-none">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                C-12
              </Dropdown.Toggle>

              <Dropdown.Menu>

                <Dropdown.Item as={Link} to="/user/home/add-loan">
                  Loan +
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/add-finance">
                  Finance +
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>Finance</Dropdown.Header>

                <Dropdown.Item as={Link} to="/user/home/active-finance">
                  Active Finance
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/inactive-finance">
                  Inactive Finance
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/all-finance">
                  All Finance
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Header>Loan</Dropdown.Header>

                <Dropdown.Item as={Link} to="/user/home/active-loan">
                  Active Loan
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/release-loan">
                  Release Loan
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/close-loan">
                  Closed Loan
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/user/home/all-loan">
                  All Loan
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
          <Route path="/active-loan" element={<ActiveLoanPanel />} />
          <Route path="/add-loan" element={<AddLoan />} />
          <Route path="/add-finance" element={<AddFinance />} />
          <Route path="/active-finance" element={<ListFinance status="ACTIVE" />} />
          <Route path="/inactive-finance" element={<ListFinance status="INACTIVE" />} />
          <Route path="/all-finance" element={<ListFinance status="ALL" />} />
          <Route path="/finance" element={<Finance />} />
        </Routes>

      </div>
    </div>
  );
};

export default UserHomeRoutes;
