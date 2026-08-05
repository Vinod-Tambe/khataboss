import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="app-footer mb-5 mb-md-0">
      {/* Desktop Footer */}
      <div className="app-footer-desktop">
        <div className="app-footer-desktop__left">
          <i className="bi bi-c-circle"></i>
          <span>
            {new Date().getFullYear()}. made with <span className="text-danger">❤️</span> by{" "}
            <strong>Vinod Tambe!</strong>
          </span>
        </div>

        <div className="app-footer-desktop__right">
          <a href="tel:9579082528">
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
            to="/loan/active-list"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            <i className="bi bi-bank bottom-nav-icon" aria-hidden="true"></i>
            <span className="bottom-nav-label">Loan</span>
          </NavLink>

          <NavLink
            to="/finance/active-list"
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
  );
};

export default Footer;
