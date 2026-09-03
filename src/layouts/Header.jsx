import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiUser, FiMenu, FiBell, FiSun, FiMoon, FiMonitor, FiDroplet, FiBriefcase, FiLock, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { loadFirmsDropdown, setSelectedFirmId } from "../store/slices/firmSlice";
import { useTheme } from "../context/ThemeContext";
import HeaderSearch from "../components/common/HeaderSearch";
import { resolveImageUrl } from "../utils/imageHelpers";
import { getHeaderAlerts } from "../api/logsApi";
import { hasPermission, isOwner } from "../utils/permissions";
import FinanceCollectionModal from "../components/finance/FinanceCollectionModal";
import LoanCollectionModal from "../components/loan/LoanCollectionModal";
import AppBrandLogo from "../components/common/AppBrandLogo";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "Brand",
  "brand-dark": "Brand Dark",
  fintech: "Fintech Blue",
};

const nextTheme = {
  light: "dark",
  dark: "system",
  system: "brand-dark",
  "brand-dark": "fintech",
  fintech: "light",
};

const ALERT_POLL_MS = 60000;
const ALERT_LIMIT = 30;

const getAlertReadKey = (user) => {
  const id = user?.staff_uuid || user?.own_uuid || "guest";
  return `kb_header_alerts_read_${id}`;
};

const loadReadAlertIds = (user) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(getAlertReadKey(user)) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const saveReadAlertIds = (user, ids) => {
  const list = [...ids].map(String).slice(-200);
  localStorage.setItem(getAlertReadKey(user), JSON.stringify(list));
};

const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const sec = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const cleanAlertMessage = (description) =>
  String(description || "").replace(/\s*Logged At:.*$/i, "").trim();

const extractNotificationEntityName = (log) => {
  const description = String(log.description || "");
  const quoted = description.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1].trim();
  if (log.ref_no) return log.ref_no;
  return "";
};

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
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [alertLogs, setAlertLogs] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState(() => loadReadAlertIds(user));
  const [showFinancePayModal, setShowFinancePayModal] = useState(false);
  const [showLoanDepositModal, setShowLoanDepositModal] = useState(false);
  const [collectionUser, setCollectionUser] = useState(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const isOwnerUser = isOwner(user);
  const canViewLogs = hasPermission(user, "reports.logs");
  const ThemeIcon =
    theme === "dark"
      ? FiMoon
      : theme === "system"
        ? FiMonitor
        : theme === "brand-dark"
          ? FiDroplet
          : theme === "fintech"
            ? FiBriefcase
            : FiSun;
  const themeTitle = `Theme: ${themeLabels[theme]} — click for ${themeLabels[nextTheme[theme]]}`;
  const profileImageUrl = resolveImageUrl(user?.own_profile_img);
  const displayName =
    [user?.own_first_name, user?.own_last_name].filter(Boolean).join(" ") ||
    (isOwnerUser ? "Owner" : "Staff");

  const notifications = useMemo(() => {
    return alertLogs.map((log) => {
      const id = String(log.id);
      const message = cleanAlertMessage(log.description);
      return {
        id,
        title: log.subject || "Activity",
        entityName: extractNotificationEntityName(log),
        message,
        actor: log.login_user || "",
        firmName: log.firm_name || "",
        time: formatRelativeTime(log.created_at) || log.date || "",
        read: readAlertIds.has(id),
      };
    });
  }, [alertLogs, readAlertIds]);

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const readNotifications = notifications.filter((notification) => notification.read).length;
  const filteredNotifications = notifications.filter((notification) => {
    if (notificationFilter === "read") return notification.read;
    if (notificationFilter === "unread") return !notification.read;
    return true;
  });

  const fetchAlerts = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setAlertsLoading(true);
    try {
      const response = await getHeaderAlerts({
        firmId: selectedFirmId || "all",
        limit: ALERT_LIMIT,
      });
      setAlertLogs(response?.data || []);
    } catch {
      setAlertLogs([]);
    } finally {
      if (!silent) setAlertsLoading(false);
    }
  }, [selectedFirmId]);

  useEffect(() => {
    dispatch(loadFirmsDropdown());
  }, [dispatch]);

  useEffect(() => {
    setReadAlertIds(loadReadAlertIds(user));
  }, [user]);

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(() => fetchAlerts({ silent: true }), ALERT_POLL_MS);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

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

  const persistReadIds = (nextIds) => {
    setReadAlertIds(nextIds);
    saveReadAlertIds(user, nextIds);
  };

  const markAlertRead = (alertId) => {
    const nextIds = new Set(readAlertIds);
    nextIds.add(String(alertId));
    persistReadIds(nextIds);
  };

  const markAllAlertsRead = (e) => {
    e.stopPropagation();
    const nextIds = new Set(readAlertIds);
    notifications.forEach((notification) => nextIds.add(String(notification.id)));
    persistReadIds(nextIds);
  };

  const toggleAlertRead = (e, notification) => {
    e.stopPropagation();
    const nextIds = new Set(readAlertIds);
    const id = String(notification.id);
    if (notification.read) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }
    persistReadIds(nextIds);
  };

  const handleNotificationClick = (notification) => {
    markAlertRead(notification.id);
    setIsNotificationOpen(false);
    if (canViewLogs) {
      navigate("/logs");
    }
  };

  const toggleNotifications = () => {
    setIsProfileOpen(false);
    setIsNotificationOpen((prevState) => {
      const next = !prevState;
      if (next) fetchAlerts();
      return next;
    });
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
            <AppBrandLogo size={32} />
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

                  <div className="mt-2 d-flex align-items-center justify-content-between gap-2">
                    <small className="text-muted">
                      {notifications.length} total, {readNotifications} read and {unreadNotifications} unread
                      {isOwnerUser ? " (all activity)" : " (my activity)"}
                    </small>
                    {unreadNotifications > 0 && (
                      <button
                        type="button"
                        className="notification-mark-all-btn"
                        onClick={markAllAlertsRead}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                <div className="notification-list">
                  {alertsLoading && notifications.length === 0 ? (
                    <div className="notification-empty-state">Loading notifications...</div>
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`notification-item ${notification.read ? "" : "unread"}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span
                          className={`notification-dot ${notification.read ? "is-read" : "is-unread"}`}
                          role="status"
                          aria-label={notification.read ? "Read — click to mark unread" : "Unread — click to mark read"}
                          title={notification.read ? "Mark as unread" : "Mark as read"}
                          onClick={(e) => toggleAlertRead(e, notification)}
                        />
                        <div className="notification-content">
                          <div className="notification-summary-row">
                            <span className="notification-entity-name" title={notification.entityName}>
                              {notification.entityName || "—"}
                            </span>
                            <span className="notification-action">{notification.title}</span>
                          </div>
                          {notification.message ? (
                            <p className="notification-message mb-1">{notification.message}</p>
                          ) : null}
                          <small className="notification-time">
                            {notification.time}
                            {selectedFirmId === "all" && notification.firmName
                              ? ` · ${notification.firmName}`
                              : ""}
                          </small>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="notification-empty-state">
                      No {notificationFilter === "all" ? "" : `${notificationFilter} `}notifications found.
                    </div>
                  )}
                </div>
                {canViewLogs && (
                  <div className="notification-footer">
                    <Link
                      to="/logs"
                      className="notification-footer-link"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      View all logs
                    </Link>
                  </div>
                )}
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
