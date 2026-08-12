import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiMenu, FiBell, FiSun, FiMoon, FiMonitor, FiBriefcase, FiLock, FiLogOut } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { loadFirmsDropdown, setSelectedFirmId } from "../store/slices/firmSlice";
import { useTheme } from "../context/ThemeContext";
import HeaderSearch from "../components/common/HeaderSearch";
import FinanceCollectionModal from "../components/finance/FinanceCollectionModal";
import LoanCollectionModal from "../components/loan/LoanCollectionModal";

const themeOptions = [
  { id: "light", label: "Light", icon: FiSun },
  { id: "dark", label: "Dark", icon: FiMoon },
  { id: "system", label: "System", icon: FiMonitor },
];

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
  const { theme, setTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [showFinancePayModal, setShowFinancePayModal] = useState(false);
  const [showLoanDepositModal, setShowLoanDepositModal] = useState(false);
  const [collectionUser, setCollectionUser] = useState(null);
  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  const ThemeIcon = theme === "dark" ? FiMoon : theme === "system" ? FiMonitor : FiSun;
  const unreadNotifications = dummyNotifications.filter((notification) => !notification.read).length;
  const readNotifications = dummyNotifications.filter((notification) => notification.read).length;
  const filteredNotifications = dummyNotifications.filter((notification) => {
    if (notificationFilter === "read") return notification.read;
    if (notificationFilter === "unread") return !notification.read;
    return true;
  });

  useEffect(() => {
    dispatch(loadFirmsDropdown());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsThemeOpen(false);
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
    setIsThemeOpen(false);
    setIsNotificationOpen((prevState) => !prevState);
  };

  const toggleThemeMenu = () => {
    setIsNotificationOpen(false);
    setIsThemeOpen((prevState) => !prevState);
  };

  const handleThemeSelect = (nextTheme) => {
    setTheme(nextTheme);
    setIsThemeOpen(false);
  };

  const openFinancePay = (userRow) => {
    setCollectionUser(userRow);
    setShowFinancePayModal(true);
  };

  const openLoanDeposit = (userRow) => {
    setCollectionUser(userRow);
    setShowLoanDepositModal(true);
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
          <HeaderSearch
            onOpenFinancePay={openFinancePay}
            onOpenLoanDeposit={openLoanDeposit}
          />
        </div>

        {/* RIGHT: User Actions */}
        <div className="header-right">
          <div className="input-group header-firm-select d-none d-md-flex">
            <span className="input-group-text border-dark bg-cust-primary" title="Firm">
              <FiBriefcase size={16} />
            </span>
            <select
              className="form-select cursor-pointer border-dark"
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
          </div>
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
            <ul className="dropdown-menu dropdown-menu-end profile-dropdown" aria-labelledby="profileDropdown">
              <li className="px-3 py-2 border-bottom">
                <div className="fw-bold text-truncate">
                  {[user?.own_first_name, user?.own_last_name].filter(Boolean).join(" ") || "Owner"}
                </div>
                <div className="small text-muted text-truncate">{user?.own_email || ""}</div>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                  <FiUser size={16} />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center gap-2" to="/settings/update-password">
                  <FiLock size={16} />
                  <span>Update Password</span>
                </Link>
              </li>
              <li className="d-md-none">
                <hr className="dropdown-divider my-1" />
              </li>
              <li className="d-md-none">
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 text-danger"
                  onClick={handleLogout}
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
          <div className="theme-dropdown-wrapper" ref={themeRef}>
            <button
              className="btn header-icon-btn theme-toggle-btn bg-warning-subtle"
              type="button"
              aria-expanded={isThemeOpen}
              aria-label="Open theme menu"
              onClick={toggleThemeMenu}
            >
              <ThemeIcon size={20} />
            </button>

            {isThemeOpen && (
              <div className="theme-dropdown-menu">
                <div className="theme-dropdown-header">
                  <h6 className="mb-1">Theme</h6>
                  <p className="mb-0">Choose Light, Dark, or System</p>
                </div>
                <div className="theme-options">
                  {themeOptions.map(({ id, label, icon: OptionIcon }) => (
                    <button
                      key={id}
                      type="button"
                      className={`theme-option ${theme === id ? "active" : ""}`}
                      onClick={() => handleThemeSelect(id)}
                      aria-pressed={theme === id}
                    >
                      <OptionIcon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            className="btn header-icon-btn logout-icon-btn bg-danger-subtle d-none d-md-inline-flex"
            type="button"
            aria-label="Logout"
            title="Logout"
            onClick={handleLogout}
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
      <div className="mobile-search-bar d-block d-md-none ps-3 pe-3">
        <HeaderSearch
          onOpenFinancePay={openFinancePay}
          onOpenLoanDeposit={openLoanDeposit}
        />
      </div>

      <FinanceCollectionModal
        show={showFinancePayModal}
        onClose={() => {
          setShowFinancePayModal(false);
          setCollectionUser(null);
        }}
        firms={firms}
        selectedFirmId={selectedFirmId}
        initialUser={collectionUser}
      />
      <LoanCollectionModal
        show={showLoanDepositModal}
        onClose={() => {
          setShowLoanDepositModal(false);
          setCollectionUser(null);
        }}
        firms={firms}
        selectedFirmId={selectedFirmId}
        initialUser={collectionUser}
      />
    </header>
  );
};

export default Header;
