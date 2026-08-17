import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiMenu, FiBell, FiSun, FiMoon, FiMonitor, FiBriefcase, FiLock, FiLogOut } from 'react-icons/fi';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { loadFirmsDropdown, setSelectedFirmId } from "../store/slices/firmSlice";
import { useTheme } from "../context/ThemeContext";
import HeaderSearch from "../components/common/HeaderSearch";
import { resolveImageUrl } from "../utils/imageHelpers";
import FinanceCollectionModal from "../components/finance/FinanceCollectionModal";
import LoanCollectionModal from "../components/loan/LoanCollectionModal";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const nextTheme = {
  light: "dark",
  dark: "system",
  system: "light",
};

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

const HeaderProfileAvatar = ({ imageUrl, variant = "button", className = "" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const isDropdown = variant === "dropdown";
  const iconSize = isDropdown ? 28 : 22;

  useEffect(() => {
    setImgFailed(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !imgFailed;
  const avatarClass = [
    "header-profile-avatar",
    isDropdown ? "header-profile-avatar--dropdown" : "header-profile-avatar--button",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (showImage) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={avatarClass}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <span
      className={`header-profile-avatar-fallback ${isDropdown ? "header-profile-avatar-fallback--dropdown" : "header-profile-avatar-fallback--button"}`}
      aria-hidden="true"
    >
      <FiUser size={iconSize} />
    </span>
  );
};

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [showFinancePayModal, setShowFinancePayModal] = useState(false);
  const [showLoanDepositModal, setShowLoanDepositModal] = useState(false);
  const [collectionUser, setCollectionUser] = useState(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const ThemeIcon = theme === "dark" ? FiMoon : theme === "system" ? FiMonitor : FiSun;
  const themeTitle = `Theme: ${themeLabels[theme]} — click for ${themeLabels[nextTheme[theme]]}`;
  const profileImageUrl = resolveImageUrl(user?.own_profile_img);
  const displayName =
    [user?.own_first_name, user?.own_last_name].filter(Boolean).join(" ") || "Owner";
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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
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
    setIsProfileOpen(false);
    setIsNotificationOpen((prevState) => !prevState);
  };

  const toggleProfileMenu = () => {
    setIsNotificationOpen(false);
    setIsProfileOpen((prevState) => !prevState);
  };

  const closeProfileMenu = () => {
    setIsProfileOpen(false);
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

          <Link to="/home" className="logo-title text-decoration-none" aria-label="Go to home">
            <h1 className="p-0 m-0">KhataBoss</h1>
          </Link>
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
          <div className="profile-dropdown-wrapper" ref={profileRef}>
            <button
              className="btn header-icon-btn profile-btn bg-info-subtle"
              type="button"
              aria-expanded={isProfileOpen}
              aria-label="Open profile menu"
              onClick={toggleProfileMenu}
            >
              <HeaderProfileAvatar imageUrl={profileImageUrl} variant="button" />
            </button>
            {isProfileOpen && (
              <div className="dropdown-menu dropdown-menu-end profile-dropdown show">
                <div className="profile-dropdown-user px-3 py-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <span className="header-profile-avatar-wrap header-profile-avatar-wrap--dropdown">
                      <HeaderProfileAvatar imageUrl={profileImageUrl} variant="dropdown" />
                    </span>
                    <div className="min-w-0">
                      <div className="fw-bold text-truncate">{displayName}</div>
                      <div className="small text-muted text-truncate">{user?.own_email || ""}</div>
                    </div>
                  </div>
                </div>
                <Link
                  className="dropdown-item d-flex align-items-center gap-2"
                  to="/profile"
                  onClick={closeProfileMenu}
                >
                  <FiUser size={16} />
                  <span>Profile</span>
                </Link>
                <Link
                  className="dropdown-item d-flex align-items-center gap-2"
                  to="/settings/update-password"
                  onClick={closeProfileMenu}
                >
                  <FiLock size={16} />
                  <span>Update Password</span>
                </Link>
                <hr className="dropdown-divider my-1 d-md-none" />
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2 text-danger d-md-none"
                  onClick={(e) => {
                    closeProfileMenu();
                    handleLogout(e);
                  }}
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          <button
            className="btn header-icon-btn theme-toggle-btn bg-warning-subtle"
            type="button"
            aria-label={themeTitle}
            title={themeTitle}
            onClick={toggleTheme}
          >
            <ThemeIcon size={20} />
          </button>
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
