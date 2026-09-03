import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminFooter = () => (
  <footer className="app-footer mb-5 mb-md-0">
    <div className="app-footer-desktop">
      <div className="app-footer-desktop__left">
        <i className="bi bi-c-circle" />
        <span>
          {new Date().getFullYear()}. made with <span className="app-footer-desktop__accent">❤️</span> by{' '}
          <strong>Vinod Tambe!</strong>
        </span>
      </div>

      <div className="app-footer-desktop__right">
        <a href="tel:9579082528">
          <i className="bi bi-telephone me-2" />
          Help: <span className="ms-1">9579082528</span>
        </a>
      </div>
    </div>

    <div className="mobile-footer d-md-none">
      <nav className="bottom-nav" aria-label="Admin mobile navigation">
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2 bottom-nav-icon" aria-hidden="true" />
          <span className="bottom-nav-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/owners/grid"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-people bottom-nav-icon" aria-hidden="true" />
          <span className="bottom-nav-label">Owners</span>
        </NavLink>

        <NavLink
          to="/admin/owners/new"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-person-plus bottom-nav-icon" aria-hidden="true" />
          <span className="bottom-nav-label">Add</span>
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="bi bi-box-arrow-left bottom-nav-icon" aria-hidden="true" />
          <span className="bottom-nav-label">Owner App</span>
        </NavLink>
      </nav>
    </div>
  </footer>
);

export default AdminFooter;
