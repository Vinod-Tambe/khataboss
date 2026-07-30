import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="bg-dark text-light  border-top border-secondary mb-5 mb-md-0">

        {/* Desktop Footer */}
        <div className="container-xxl py-1 d-none d-md-flex justify-content-between align-items-center">

          <div className="d-flex align-items-center">
            <i className="bi bi-c-circle me-2"></i>
            <span>
              2025. made with <span className="text-danger">❤️</span> by{" "}
              <strong>Vinod Tambe!</strong>
            </span>
          </div>

          <div>
            <a
              href="tel:9579082528"
              className="text-light text-decoration-none d-flex align-items-center"
            >
              <i className="bi bi-telephone me-2"></i>
              Help: <span className="ms-1">9579082528</span>
            </a>
          </div>
        </div>

        {/* Mobile Footer Navigation */}
        <div className="mobile-footer d-md-none">
          <nav className="bottom-nav" aria-label="Mobile navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-house-door-fill bottom-nav-icon" aria-hidden="true"></i>
              <span className="bottom-nav-label">Home</span>
            </NavLink>

            <NavLink
              to="/user/grid"
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-people bottom-nav-icon" aria-hidden="true"></i>
              <span className="bottom-nav-label">Users</span>
            </NavLink>

            <NavLink
              to="/loan"
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-bar-chart-line bottom-nav-icon" aria-hidden="true"></i>
              <span className="bottom-nav-label">Loan</span>
            </NavLink>

            <NavLink
              to="/finance"
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-wallet2 bottom-nav-icon" aria-hidden="true"></i>
              <span className="bottom-nav-label">Finance</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-person bottom-nav-icon" aria-hidden="true"></i>
              <span className="bottom-nav-label">Profile</span>
            </NavLink>
          </nav>
        </div>

      </footer>
    </>
  );
};

export default Footer;
