import React, { useEffect, useMemo, useState } from 'react';
import { Offcanvas } from 'bootstrap';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiUserPlus, FiList, FiLogOut, FiChevronDown, FiGrid, FiLayers, FiPlusCircle, FiBell, FiUser } from 'react-icons/fi';
import AppBrandLogo from '../../components/common/AppBrandLogo';
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../store/slices/adminAuthSlice';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openSubmenus, setOpenSubmenus] = useState({ owners: true });

  const menuItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
      {
        id: 'owners',
        label: 'Owners',
        icon: <FiUsers />,
        subItems: [
          { label: 'Add Owner', path: '/admin/owners/new', icon: <FiUserPlus /> },
          { label: 'Owner List', path: '/admin/owners/grid', icon: <FiList /> },
          { label: 'Owner Table', path: '/admin/owners/list', icon: <FiGrid /> },
        ],
      },
      {
        id: 'plans',
        label: 'Plans',
        icon: <FiLayers />,
        subItems: [
          { label: 'Add Plan', path: '/admin/plans/new', icon: <FiPlusCircle /> },
          { label: 'Plan Grid', path: '/admin/plans/grid', icon: <FiGrid /> },
        ],
      },
      { id: 'news', label: 'Owner News', icon: <FiBell />, path: '/admin/news' },
      { id: 'profile', label: 'My Profile', icon: <FiUser />, path: '/admin/profile' },
      { id: 'logout', label: 'Sign Out', icon: <FiLogOut /> },
    ],
    []
  );

  const toggleSubmenu = (id) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const ps = new PerfectScrollbar('#sidebar-menu-scroll', {
      suppressScrollX: true,
      wheelPropagation: false,
    });

    const rail = document.querySelector('#sidebar-menu-scroll .ps__rail-y');
    if (rail) rail.style.opacity = '0';

    const container = document.getElementById('sidebar-menu-scroll');
    if (container) {
      container.addEventListener('mouseenter', () => {
        if (rail) rail.style.opacity = '0.6';
      });

      container.addEventListener('mouseleave', () => {
        if (rail) rail.style.opacity = '0';
      });

      container.addEventListener('ps-scroll-y', () => {
        if (rail) rail.style.opacity = '0.6';
        clearTimeout(container.scrollTimeout);
        container.scrollTimeout = setTimeout(() => {
          if (rail) rail.style.opacity = '0';
        }, 1500);
      });
    }

    return () => ps.destroy();
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth >= 992) return;
    const el = document.getElementById('sidebar');
    if (!el) return;
    const instance = Offcanvas.getInstance(el);
    if (instance) instance.hide();
  };

  return (
    <div className="offcanvas offcanvas-start sidebar" id="sidebar" tabIndex={-1}>
      <div className="offcanvas-body p-0 d-flex flex-column">
        <div className="sidebar-profile sidebar-menu-border">
          <Link
            to="/admin/dashboard"
            className="sidebar-brand text-decoration-none"
            onClick={closeSidebarOnMobile}
            aria-label="Go to admin dashboard"
          >
            <AppBrandLogo size={36} />
            <div>
              <h1 className="fw-bold fs-4 mb-0">KhataBoss</h1>
              <small className="text-muted">Super Admin</small>
            </div>
          </Link>
          <button
            type="button"
            className="btn-close sidebar-close-btn d-lg-none"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="flex-grow-1 overflow-hidden d-flex flex-column">
          <div id="sidebar-menu-scroll" className="h-100">
            <ul className="sidebar-menu">
              {menuItems.map((item) => (
                <li key={item.id} className={`p-1 ${item.subItems ? 'has-submenu' : ''}`}>
                  {item.subItems ? (
                    <>
                      <div
                        className={`submenu-toggle ${openSubmenus[item.id] ? 'active' : ''}`}
                        onClick={() => toggleSubmenu(item.id)}
                      >
                        <span className="submenu-toggle__main">
                          <span className="menu-icon">{item.icon}</span>
                          <span className="menu-label">{item.label}</span>
                        </span>
                        <FiChevronDown
                          className={`arrow ${openSubmenus[item.id] ? 'rotated' : ''}`}
                        />
                      </div>

                      <ul className={`submenu collapse ${openSubmenus[item.id] ? 'show' : ''}`}>
                        {item.subItems.map((sub, idx) => (
                          <li key={sub.path || `${item.id}-${idx}`}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) => (isActive ? 'active sub-active' : '')}
                              onClick={closeSidebarOnMobile}
                            >
                              {sub.icon ? (
                                <span className="sub-icon" aria-hidden="true">
                                  {sub.icon}
                                </span>
                              ) : null}
                              <span className="sub-label">{sub.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : item.id === 'logout' ? (
                    <button
                      type="button"
                      className="sidebar-menu-logout-btn"
                      onClick={(e) => {
                        handleLogout(e);
                        closeSidebarOnMobile();
                      }}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-label">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? 'active' : '')}
                      onClick={closeSidebarOnMobile}
                      end={item.path === '/admin/dashboard'}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-label">{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
