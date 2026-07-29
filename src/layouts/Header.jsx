import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiUser, FiMenu, FiBell, FiSun, FiMoon } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { getFirmsDropdown } from "../api/firmApi";
import { setFirms, setSelectedFirmId, setLoading as setFirmLoading, setError as setFirmError } from "../store/slices/firmSlice";
import { useTheme } from "../context/ThemeContext";

const dummyNotifications = [
  {
    id: 1,
    title: "New finance entry added",
    message: "A new finance record was created for today's collection.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    title: "Loan payment received",
    message: "Ravi Kumar's installment payment has been marked as received.",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    title: "Staff reminder",
    message: "Monthly staff expense summary is ready for review.",
    time: "1 hour ago",
    read: true,
  },
];
const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const notificationRef = useRef(null);
  const unreadNotifications = dummyNotifications.filter((notification) => !notification.read).length;
  const readNotifications = dummyNotifications.filter((notification) => notification.read).length;
  const filteredNotifications = dummyNotifications.filter((notification) => {
    if (notificationFilter === "read") return notification.read;
    if (notificationFilter === "unread") return !notification.read;
    return true;
  });

  useEffect(() => {
    const fetchFirms = async () => {
      dispatch(setFirmLoading(true));
      try {
        const response = await getFirmsDropdown();
        dispatch(setFirms(response.data || []));
      } catch (error) {
        dispatch(setFirmError(error.message));
      } finally {
        dispatch(setFirmLoading(false));
      }
    };

    fetchFirms();
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
  };

  const handleFirmChange = (e) => {
    dispatch(setSelectedFirmId(e.target.value));
  };

  const toggleNotifications = () => {
    setIsNotificationOpen((prevState) => !prevState);
  };

  return (
    <header className="header pb-2 pb-lg-0 sticky-top">
      <div className="admin-header">
        <div className="header-left">
          <button
            className="btn header-icon-btn header-menu-btn d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>

          <div className="logo-title">
            <h1 className="p-0 m-0">KhataBoss</h1>
          </div>
        </div>

        {/* CENTER: Search Bar (desktop only) */}
        <div className="search-bar">
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
              aria-label="Search"
            >
              <FiSearch />
            </button>
          </div>
        </div>

        {/* RIGHT: User Actions */}
        <div className="header-right">
          <select
            className="form-select d-none d-md-block cursor-pointer border-dark"
            aria-label="Firm selection"
            value={selectedFirmId}
            onChange={handleFirmChange}
          >
            <option value="all">All Firm</option>
            {firms.map((firm) => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
          <div className="notification-dropdown-wrapper" ref={notificationRef}>
            <button
              className="btn header-icon-btn notification-btn bg-success-subtle"
              type="button"
              aria-expanded={isNotificationOpen}
              aria-label="Toggle notifications"
              onClick={toggleNotifications}
            >
              <FiBell size={20} />
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="dropdown-menu notification-dropdown-menu show">
                <div className="notification-dropdown-header">
                  <div className="notification-header-top">
                    <div className="notification-title-row">
                      <FiBell size={18} />
                      <h6 className="mb-0">Notifications</h6>
                    </div>
                    <div className="notification-filter-group" role="tablist" aria-label="Notification filters">
                      <button
                        type="button"
                        className={`notification-filter-btn ${notificationFilter === "all" ? "active" : ""}`}
                        onClick={() => setNotificationFilter("all")}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`notification-filter-btn ${notificationFilter === "read" ? "active" : ""}`}
                        onClick={() => setNotificationFilter("read")}
                      >
                        Read
                      </button>
                      <button
                        type="button"
                        className={`notification-filter-btn ${notificationFilter === "unread" ? "active" : ""}`}
                        onClick={() => setNotificationFilter("unread")}
                      >
                        Unread
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <small className="text-muted">
                      {dummyNotifications.length} total, {readNotifications} read and {unreadNotifications} unread notifications
                    </small>
                  </div>
                </div>

                <div className="notification-list">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`notification-item ${notification.read ? "" : "unread"}`}
                        onClick={() => setIsNotificationOpen(false)}
                      >
                        <span className="notification-dot" />
                        <div className="notification-content">
                          <p className="notification-title mb-1">{notification.title}</p>
                          <p className="notification-message mb-1">{notification.message}</p>
                          <small className="notification-time">{notification.time}</small>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="notification-empty-state">
                      No {notificationFilter} notifications found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="dropdown">
            <button
              className="btn header-icon-btn profile-btn dropdown-toggle bg-info-subtle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Open profile menu"
            >
              <FiUser size={20} />
            </button>
            <ul className="dropdown-menu profile-dropdown pt-0" aria-labelledby="profileDropdown">
              <li><Link className="dropdown-item border rounded bg-cust-primary text-center" to="#"> {user.own_first_name} {user.own_last_name} <br />( {user.own_email} )</Link></li>
              <li><Link className="dropdown-item" to="#">Profile</Link></li>
              <li><Link className="dropdown-item" to="#">Settings</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="#" onClick={handleLogout}>Logout</Link></li>
            </ul>
          </div>
          <button
            className="btn header-icon-btn theme-toggle-btn bg-warning-subtle"
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
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
