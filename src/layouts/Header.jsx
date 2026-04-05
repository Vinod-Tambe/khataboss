import React from 'react';
import { FiSearch, FiUser, FiMenu, FiBell } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
  };

  return (
    <header className="header pb-2 pb-lg-0 sticky-top">
      <div className="admin-header py-2">
        <button
          className="btn btn-light d-lg-none me-2 border-secondary"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
        >
          <FiMenu size={25} />
        </button>

        {/* LEFT: Logo/Title */}
        <div className="logo-title">
          <h1 className='p-0 m-0'>KhataBoss</h1>
        </div>

        {/* CENTER: Search Bar */}
        <div className={`search-bar`}>
          <div className="input-group">
            <input
              type="text"
              className="form-control border-dark"
              placeholder="Search..."
              style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
            >
              <FiSearch />
            </button>
          </div>
        </div>

        {/* RIGHT: User Actions */}
        <div className="header-right">
          <select class="form-select d-none d-md-block me-2 w-50 cursor-pointer border-dark" aria-label="Default select example">
            <option value="1">Ram</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
          <button
            className="btn me-2 bg-success-subtle rounded-circle d-flex align-items-center justify-content-center mb-1"
            type="button"
            aria-expanded="false"
          >
            <FiBell size={26} />
          </button>
          <div className="dropdown">
            <button
              className="btn profile-btn dropdown-toggle btn me-3 bg-info-subtle rounded-circle d-flex align-items-center justify-content-center mb-1"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FiUser size={26} />
            </button>
            <ul className="dropdown-menu profile-dropdown pt-0" aria-labelledby="profileDropdown">
              <li><Link className="dropdown-item border rounded bg-cust-primary text-center" to="#"> {user.own_first_name} {user.own_last_name} <br />( {user.own_email} )</Link></li>
              <li><Link className="dropdown-item" to="#">Profile</Link></li>
              <li><Link className="dropdown-item" to="#">Settings</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="#" onClick={handleLogout}>Logout</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className={`mobile-search-bar d-block d-md-none ps-3 pe-3`}>
        <div className="input-group">
          <input
            type="text"
            className="form-control border-dark"
            placeholder="Search..."
            style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
          />
          <button
            className="btn btn-outline-secondary border-dark"
            type="button"
          >
            <FiSearch />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
