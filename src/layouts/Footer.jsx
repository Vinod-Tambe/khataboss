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
        <div className="mobile-footer d-md-none fixed-bottom bg-light border-top shadow-sm">
          <div className="d-flex bottom-nav justify-content-around text-center py-2">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-decoration-none flex-fill ${isActive ? "text-primary-emphasis fw-bold" : "text-dark"
                }`
              }
            >
              <i className="bi bi-house-door-fill fs-5"></i>
              <div className="small">Home</div>
            </NavLink>

            <NavLink
              to="/user/grid"
              className={({ isActive }) =>
                `text-decoration-none flex-fill ${isActive ? "text-primary-emphasis fw-bold" : "text-dark"
                }`
              }
            >
              <i className="bi bi-people fs-5"></i>
              <div className="small">Users</div>
            </NavLink>

            <NavLink
              to="/loan"
              className={({ isActive }) =>
                `text-decoration-none flex-fill ${isActive ? "text-primary-emphasis fw-bold" : "text-dark"
                }`
              }
            >
              <i className="bi bi-bar-chart-line fs-5"></i>
              <div className="small">Loan</div>
            </NavLink>

            <NavLink
              to="/finance"
              className={({ isActive }) =>
                `text-decoration-none flex-fill ${isActive ? "text-primary-emphasis fw-bold" : "text-dark"
                }`
              }
            >
              <i className="bi bi-chat-dots fs-5"></i>
              <div className="small">Finance</div>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `text-decoration-none flex-fill ${isActive ? "text-primary-emphasis fw-bold" : "text-dark"
                }`
              }
            >
              <i className="bi bi-person fs-5"></i>
              <div className="small">Profile</div>
            </NavLink>

          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;
