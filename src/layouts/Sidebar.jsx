import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Offcanvas } from "bootstrap";
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
  FiLogOut,
  FiSettings,
  FiAward,
  FiDatabase,
  FiCheckCircle,
  FiCheckSquare,
  FiLock,
  FiClock,
} from "react-icons/fi";
import { FaBook, FaBookOpen, FaBalanceScale } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { setSelectedFirmId } from "../store/slices/firmSlice";

const Sidebar = () => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dispatch = useDispatch();
  const { firms, selectedFirmId } = useSelector((state) => state.firm);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
  };

  const handleFirmChange = (e) => {
    dispatch(setSelectedFirmId(e.target.value));
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
        { label: "Auction User List", path: "/user/auction-list", icon: <FiAward /> },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      icon: <FiTrendingUp />,
      subItems: [
        { label: "Active Finance List", path: "/finance/active-list", icon: <FiCheckCircle /> },
        { label: "Comp Finance List", path: "/finance/completed-list", icon: <FiCheckSquare /> },
        { label: "Close Finance List", path: "/finance/close-list", icon: <FiLock /> },
        { label: "Today Pending EMI", path: "/finance/today-pending-emi", icon: <FiClock /> },
        { label: "All Finance List", path: "/finance/all-list", icon: <FiList /> },
      ],
    },
    {
      id: "loan",
      label: "Loan",
      icon: <FiClipboard />,
      subItems: [
        { label: "All Loan List", path: "/loan/all-list", icon: <FiList /> },
        { label: "Active Loan List", path: "/loan/active-list", icon: <FiList /> },
        { label: "Release Loan List", path: "/loan/release-list", icon: <FiList /> },
        { label: "Auction Loan List", path: "/loan/auction-list", icon: <FiAward /> },
        { label: "Transfer Loan List", path: "/loan/transfer-list", icon: <FiFileText /> },
      ],
    },
    {
      id: "money-lender",
      label: "M Lender",
      icon: <FiBriefcase />,
      subItems: [
        { label: "Add Money Lender", path: "/money-lender/add", icon: <FiPlusCircle /> },
        { label: "Money Lender List", path: "/money-lender/list", icon: <FiList /> },
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
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings />,
      subItems: [
        { label: "Rate", path: "/rate", icon: <FiTrendingUp /> },
        { label: "Purity", path: "/purity", icon: <FiAward /> },
        { label: "Backup", path: "/backup", icon: <FiDatabase /> },
      ],
    },

    { id: "logout", label: "Sign Out", icon: <FiLogOut />, path: "/logout" },
  ];

  const closeSidebarOnMobile = () => {
    if (window.innerWidth >= 992) return;
    const el = document.getElementById("sidebar");
    if (!el) return;
    const instance = Offcanvas.getInstance(el);
    if (instance) instance.hide();
  };

  return (
    <div className="offcanvas offcanvas-start sidebar" id="sidebar" tabIndex={-1}>
      <div className="offcanvas-body p-0 d-flex flex-column">
        {/* Fixed Logo/Header */}
        <div className="sidebar-profile sidebar-menu-border">
          <div className="sidebar-brand">
            <FaBookOpen size={36} />
            <div>
              <h1 className="fw-bold fs-4 mb-0">KhataBoss</h1>
            </div>
          </div>
          <button
            type="button"
            className="btn-close sidebar-close-btn d-lg-none"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-grow-1 overflow-hidden d-flex flex-column">
          <select
            className="form-select sidebar-firm-select bg-secondary-subtle p-2 cursor-pointer border-secondary d-block d-lg-none"
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
                              onClick={closeSidebarOnMobile}
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
                      onClick={(e) => {
                        if (item.id === "logout") handleLogout(e);
                        closeSidebarOnMobile();
                      }}
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