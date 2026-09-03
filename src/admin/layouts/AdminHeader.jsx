import React, { useEffect, useRef, useState } from 'react';
import {
  FiUser,
  FiMenu,
  FiSun,
  FiMoon,
  FiMonitor,
  FiDroplet,
  FiBriefcase,
  FiLogOut,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';
import { useTheme } from '../../context/ThemeContext';
import AppBrandLogo from '../../components/common/AppBrandLogo';

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'Brand',
  'brand-dark': 'Brand Dark',
  fintech: 'Fintech Blue',
};

const nextTheme = {
  light: 'dark',
  dark: 'system',
  system: 'brand-dark',
  'brand-dark': 'fintech',
  fintech: 'light',
};

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.adminAuth);
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName =
    [user?.admin_first_name, user?.admin_last_name].filter(Boolean).join(' ') || 'Super Admin';

  const ThemeIcon =
    theme === 'dark'
      ? FiMoon
      : theme === 'system'
        ? FiMonitor
        : theme === 'brand-dark'
          ? FiDroplet
          : theme === 'fintech'
            ? FiBriefcase
            : FiSun;

  const themeTitle = `Theme: ${themeLabels[theme]} — click for ${themeLabels[nextTheme[theme]]}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = (e) => {
    e?.preventDefault?.();
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const closeProfileMenu = () => {
    setIsProfileOpen(false);
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

          <Link to="/admin/dashboard" className="logo-title text-decoration-none" aria-label="Go to admin dashboard">
            <AppBrandLogo size={32} />
            <h1 className="p-0 m-0">KhataBoss</h1>
          </Link>
        </div>

        <div className="search-bar d-none d-lg-flex align-items-center justify-content-center">
          <span className="text-muted small fw-semibold">Super Admin Portal</span>
        </div>

        <div className="header-right">
          <div className="profile-dropdown-wrapper" ref={profileRef}>
            <button
              className="btn header-icon-btn profile-btn bg-info-subtle"
              type="button"
              aria-expanded={isProfileOpen}
              aria-label="Open profile menu"
              onClick={toggleProfileMenu}
            >
              <span className="header-profile-avatar-fallback header-profile-avatar-fallback--button" aria-hidden="true">
                <FiUser size={22} />
              </span>
            </button>
            {isProfileOpen && (
              <div className="dropdown-menu dropdown-menu-end profile-dropdown show">
                <div className="profile-dropdown-user px-3 py-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <span className="header-profile-avatar-wrap header-profile-avatar-wrap--dropdown">
                      <span className="header-profile-avatar-fallback header-profile-avatar-fallback--dropdown" aria-hidden="true">
                        <FiUser size={28} />
                      </span>
                    </span>
                    <div className="min-w-0">
                      <div className="fw-bold text-truncate">{displayName}</div>
                      <div className="small text-muted text-truncate">{user?.admin_email || user?.admin_login_id}</div>
                    </div>
                  </div>
                </div>
                <Link
                  className="dropdown-item d-flex align-items-center gap-2"
                  to="/"
                  onClick={closeProfileMenu}
                >
                  <FiBriefcase size={16} />
                  <span>Owner Login</span>
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
    </header>
  );
};

export default AdminHeader;
