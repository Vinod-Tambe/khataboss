import React, { useEffect, useMemo, useState } from "react";
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
  FiZap,
  FiArrowUpRight,
  FiRepeat,
  FiUserCheck,
} from "react-icons/fi";
import { FaBook, FaBookOpen, FaBalanceScale } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { setSelectedFirmId } from "../store/slices/firmSlice";
import { filterMenuByPermissions } from "../utils/permissions";

const Sidebar = () => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const dispatch = useDispatch();
  const { firms, selectedFirmId } = useSelector((state) => state.firm);
  const user = useSelector((state) => state.auth.user);

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

  const allMenuItems = useMemo(
    () => [
      { id: "home", label: "Home", icon: <FiHome />, path: "/home" },
      {
        id: "daybook",
        label: "Daybook",
        icon: <FiBook />,
        path: "/daybook",
        permission: "reports.daybook",
      },
      {
        id: "accounts",
        label: "Account",
        icon: <FiDollarSign />,
        anyOf: ["account.view", "account.create"],
        subItems: [
          { label: "Account List", path: "/account/list", icon: <FiList />, permission: "account.view" },
          { label: "Add Account", path: "/account/add", icon: <FiPlusCircle />, permission: "account.create" },
        ],
      },
      {
        id: "users",
        label: "Customer",
        icon: <FiUsers />,
        anyOf: ["user.view", "user.create"],
        subItems: [
          { label: "Add Customer", path: "/user/add", icon: <FiUserPlus />, permission: "user.create" },
          { label: "All Customer", path: "/user/grid", icon: <FiList />, permission: "user.view" },
          { label: "Auction Customer List", path: "/user/auction-list", icon: <FiAward />, permission: "loan.auction" },
        ],
      },
      {
        id: "finance",
        label: "Finance",
        icon: <FiTrendingUp />,
        permission: "finance.view",
        subItems: [
          { label: "Active Finance List", path: "/finance/active-list", icon: <FiCheckCircle />, permission: "finance.view" },
          { label: "Comp Finance List", path: "/finance/completed-list", icon: <FiCheckSquare />, permission: "finance.view" },
          { label: "Close Finance List", path: "/finance/close-list", icon: <FiLock />, permission: "finance.view" },
          { label: "Today Pending EMI", path: "/finance/today-pending-emi", icon: <FiClock />, permission: "finance.view" },
          { label: "All Finance List", path: "/finance/all-list", icon: <FiList />, permission: "finance.view" },
        ],
      },
      {
        id: "loan",
        label: "Loan",
        icon: <FiClipboard />,
        permission: "loan.view",
        subItems: [
          { label: "Active Loan List", path: "/loan/active-list", icon: <FiZap />, permission: "loan.view" },
          { label: "Release Loan List", path: "/loan/release-list", icon: <FiArrowUpRight />, permission: "loan.release" },
          { label: "Auction Loan List", path: "/loan/auction-list", icon: <FiAward />, permission: "loan.auction" },
          { label: "Transfer Loan List", path: "/loan/transfer-list", icon: <FiRepeat />, permission: "loan.transfer" },
          { label: "All Loan List", path: "/loan/all-list", icon: <FiList />, permission: "loan.view" },
        ],
      },
      {
        id: "money-lender",
        label: "M Lender",
        icon: <FiBriefcase />,
        anyOf: ["moneyLender.view", "moneyLender.create"],
        subItems: [
          { label: "Add Money Lender", path: "/money-lender/add", icon: <FiPlusCircle />, permission: "moneyLender.create" },
          { label: "Money Lender List", path: "/money-lender/list", icon: <FiList />, permission: "moneyLender.view" },
        ],
      },
      {
        id: "staff",
        label: "Staff",
        icon: <FiUserCheck />,
        anyOf: ["staff.view", "staff.create"],
        subItems: [
          { label: "Add Staff", path: "/staff/add", icon: <FiUserPlus />, permission: "staff.create" },
          { label: "Staff List", path: "/staff/grid", icon: <FiList />, permission: "staff.view" },
        ],
      },
      {
        id: "book",
        label: "Book",
        icon: <FaBook />,
        path: "/book",
        permission: "account.view",
      },
      {
        id: "ledger",
        label: "Ledger",
        icon: <FiClipboard />,
        permission: "account.view",
        subItems: [
          { label: "Loan Ledger", path: "/ledger/loan", icon: <FiFileText />, permission: "loan.view" },
          { label: "Loan Item", path: "/ledger/loan-item", icon: <FiFileText />, permission: "loan.view" },
        ],
      },
      {
        id: "trial-balance",
        label: "Trial B/L",
        icon: <FaBalanceScale />,
        path: "/trial-balance",
        permission: "reports.trialBalance",
      },
      {
        id: "balance-sheet",
        label: "B/L Sheet",
        icon: <FiBarChart2 />,
        path: "/balance-sheet",
        permission: "reports.balanceSheet",
      },
      {
        id: "profit-loss",
        label: "P/L Report",
        icon: <FiTrendingUp />,
        path: "/profit-loss",
        permission: "reports.profitLoss",
      },
      {
        id: "firm",
        label: "Firm",
        icon: <FiBriefcase />,
        anyOf: ["firm.view", "firm.create"],
        subItems: [
          { label: "Add Firm", path: "/firm/add", icon: <FiPlusCircle />, permission: "firm.create" },
          { label: "Firm List", path: "/firm/list", icon: <FiList />, permission: "firm.view" },
        ],
      },
      // SMS: owner-only for now (no staff permission key)
      { id: "sms", label: "SMS", icon: <FiMessageSquare />, path: "/sms", ownerOnly: true },
      {
        id: "logs",
        label: "Logs",
        icon: <FiFileText />,
        path: "/logs",
        permission: "reports.logs",
      },
      {
        id: "settings",
        label: "Settings",
        icon: <FiSettings />,
        subItems: [
          { label: "Rate", path: "/rate", icon: <FiTrendingUp />, permission: "settings.manage" },
          { label: "Purity", path: "/purity", icon: <FiAward />, permission: "settings.manage" },
          { label: "Backup", path: "/backup", icon: <FiDatabase />, permission: "settings.manage" },
          // Always allow self password update (no permission key)
          { label: "Update Password", path: "/settings/update-password", icon: <FiLock /> },
        ],
      },
      { id: "logout", label: "Sign Out", icon: <FiLogOut />, path: "/logout" },
    ],
    []
  );

  const menuItems = useMemo(() => {
    const role = user?.role;
    const isOwnerUser = !role || role === "OWNER";
    const filtered = filterMenuByPermissions(allMenuItems, user);
    if (isOwnerUser) return filtered;
    return filtered.filter((item) => !item.ownerOnly);
  }, [allMenuItems, user]);

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
