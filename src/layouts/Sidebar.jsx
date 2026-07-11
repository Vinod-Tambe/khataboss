import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiChevronDown,
  FiUsers,
  FiUserPlus,
  FiList,
  FiDollarSign,
  FiPlusCircle,
  FiClipboard,
  FiFileText,
  FiBarChart2,
  FiTrendingUp,
  FiBriefcase,
  FiMessageSquare,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";
import { FaBook, FaBookOpen, FaBalanceScale } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Sidebar = () => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dispatch = useDispatch();

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
  };

  useEffect(() => {
    const ps = new PerfectScrollbar("#sidebar-menu-scroll", {
      suppressScrollX: true,
      wheelPropagation: false,
    });

    const rail = document.querySelector("#sidebar-menu-scroll .ps__rail-y");
    if (rail) rail.style.opacity = "0";

    const container = document.getElementById("sidebar-menu-scroll");
    if (container) {
      container.addEventListener("mouseenter", () => {
        if (rail) rail.style.opacity = "0.6";
      });

      container.addEventListener("mouseleave", () => {
        if (rail) rail.style.opacity = "0";
      });

      container.addEventListener("ps-scroll-y", () => {
        if (rail) rail.style.opacity = "0.6";
        clearTimeout(container.scrollTimeout);
        container.scrollTimeout = setTimeout(() => {
          if (rail) rail.style.opacity = "0";
        }, 1500);
      });
    }

    return () => ps.destroy();
  }, []);

  const toggleSubmenu = (id) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const menuItems = [
    { id: "home", label: "Home", icon: <FiHome />, path: "/home" },
    { id: "daybook", label: "Daybook", icon: <FiBook />, path: "/daybook" },

    {
      id: "accounts",
      label: "Account",
      icon: <FiDollarSign />,
      subItems: [
        { label: "Account List", path: "/account/list", icon: <FiList /> },
        { label: "Add Account", path: "/account/add", icon: <FiPlusCircle /> },
      ],
    },

    {
      id: "users",
      label: "User",
      icon: <FiUsers />,
      subItems: [
        { label: "Add User", path: "/user/add", icon: <FiUserPlus /> },
        { label: "All User", path: "/user/grid", icon: <FiList /> },
      ],
    },

    {
      id: "staff",
      label: "Staff",
      icon: <FiBriefcase />,
      subItems: [
        { label: "Add Staff", path: "/staff/add", icon: <FiUserPlus /> },
        { label: "Staff List", path: "/staff/grid", icon: <FiList /> },
      ],
    },

    { id: "book", label: "Book", icon: <FaBook />, path: "/book" },

    {
      id: "ledger",
      label: "Ledger",
      icon: <FiClipboard />,
      subItems: [
        { label: "Loan Ledger", path: "/ledger/loan", icon: <FiFileText /> },
        { label: "Loan Item", path: "/ledger/loan-item", icon: <FiFileText /> },
      ],
    },

    { id: "trial-balance", label: "Trial B/L", icon: <FaBalanceScale />, path: "/trial-balance" },
    { id: "balance-sheet", label: "B/L Sheet", icon: <FiBarChart2 />, path: "/balance-sheet" },
    { id: "profit-loss", label: "P/L Report", icon: <FiTrendingUp />, path: "/profit-loss" },

    {
      id: "firm",
      label: "Firm",
      icon: <FiBriefcase />,
      subItems: [
        { label: "Add Firm", path: "/firm/add", icon: <FiPlusCircle /> },
        { label: "Firm List", path: "/firm/list", icon: <FiList /> },
      ],
    },

    { id: "sms", label: "SMS", icon: <FiMessageSquare />, path: "/sms" },
    { id: "logs", label: "Logs", icon: <FiFileText />, path: "/logs" },
    { id: "rate", label: "Rate", icon: <FiActivity />, path: "/rate" },

    { id: "logout", label: "Sign Out", icon: <FiLogOut />, path: "/logout" },
  ];

  return (
    <div className="offcanvas offcanvas-start sidebar" id="sidebar">
      <div className="offcanvas-body p-0 d-flex flex-column">
        {/* Fixed Logo/Header */}
        <div className="sidebar-profile sidebar-menu-border">
          <FaBookOpen size={40} />
          <div>
            <h1 className="fw-bold fs-4 mb-0">KhataBoss</h1>
          </div>
          <div className="offcanvas-header d-lg-none ms-auto">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-grow-1 overflow-hidden">
          <select class="form-select ps-5 bg-secondary-subtle p-2 cursor-pointer border-secondary d-block d-lg-none" aria-label="Default select example">
            <option value="1">Ram</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
          <div id="sidebar-menu-scroll" className="h-100">
            <ul className="sidebar-menu">
              {menuItems.map((item) => (
                <li key={item.id} className={`p-1 ${item.subItems ? "has-submenu" : ""}`}>
                  {item.subItems ? (
                    <>
                      <div
                        className={`submenu-toggle ${openSubmenus[item.id] ? "active" : ""}`}
                        onClick={() => toggleSubmenu(item.id)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        <FiChevronDown
                          className={`arrow ${openSubmenus[item.id] ? "rotated" : ""}`}
                        />
                      </div>

                      <ul className={`submenu collapse ${openSubmenus[item.id] ? "show" : ""}`}>
                        {item.subItems.map((sub, idx) => (
                          <li key={idx}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                isActive ? "active sub-active" : ""
                              }
                            >
                              {sub.icon && <span className="sub-icon me-3">{sub.icon}</span>}
                              <span>{sub.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => (isActive ? "active" : "")}
                      onClick={item.id === "logout" ? handleLogout : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
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

export default Sidebar;