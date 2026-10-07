import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import usePermissions from "../../hooks/usePermissions";
import { toast } from "react-toastify";
import {
  GLOBAL_SEARCH_INPUT_ID,
  KEYBOARD_SHORTCUT_EVENTS,
} from "../../config/keyboardShortcuts";
import HeaderSearchCustomerTable from "./HeaderSearchCustomerTable";
import HeaderSearchLoanTable from "./HeaderSearchLoanTable";
import HeaderSearchFinanceTable from "./HeaderSearchFinanceTable";

const buildSearchItems = (payload = {}) => {
  const items = [];

  (payload.loans || []).forEach((loan) => {
    items.push({
      type: "loan",
      key: `loan-${loan.girv_id}`,
      loan,
      user: loan.user,
    });
  });

  (payload.finances || []).forEach((finance) => {
    items.push({
      type: "finance",
      key: `finance-${finance.fin_id}`,
      finance,
      user: finance.user,
    });
  });

  (payload.users || []).forEach((user) => {
    items.push({
      type: "customer",
      key: `user-${user.user_uuid || user.user_id}`,
      user,
    });
  });

  return items;
};

const HeaderSearch = ({
  placeholder = "Search loan ID, finance ID, customer name, mobile, customer ID...",
  className = "",
  onOpenFinancePay,
  onOpenLoanDeposit,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const canCreateFinance = can("finance.create");
  const canCreateLoan = can("loan.create");
  const canFinancePayment = can("finance.payment");
  const canLoanDeposit = can("loan.deposit");
  const { selectedFirmId } = useSelector((state) => state.firm);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const [panelLayout, setPanelLayout] = useState(null);

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
      setOpen(true);
    };
    window.addEventListener(KEYBOARD_SHORTCUT_EVENTS.FOCUS_GLOBAL_SEARCH, focusInput);
    return () => {
      window.removeEventListener(KEYBOARD_SHORTCUT_EVENTS.FOCUS_GLOBAL_SEARCH, focusInput);
    };
  }, []);

  const loanItems = useMemo(
    () => items.filter((item) => item.type === "loan"),
    [items]
  );

  const financeItems = useMemo(
    () => items.filter((item) => item.type === "finance"),
    [items]
  );

  const customerItems = useMemo(
    () => items.filter((item) => item.type === "customer"),
    [items]
  );

  const usesResultPanel =
    loanItems.length > 0 || financeItems.length > 0 || customerItems.length > 0;

  const updatePanelLayout = useCallback(() => {
    if (!usesResultPanel || !open || !wrapRef.current) {
      setPanelLayout(null);
      return;
    }
    const anchor = wrapRef.current.getBoundingClientRect();
    const top = Math.round(anchor.bottom + 4);
    const gutter = window.innerWidth < 768 ? 8 : 12;

    const contentEl = document.querySelector(".content-area");
    const alignToMain =
      contentEl && window.matchMedia("(min-width: 992px)").matches;

    if (alignToMain) {
      const contentRect = contentEl.getBoundingClientRect();
      setPanelLayout({
        top,
        left: Math.round(contentRect.left + gutter),
        width: Math.max(280, Math.round(contentRect.width - gutter * 2)),
      });
      return;
    }

    setPanelLayout({
      top,
      left: gutter,
      width: Math.max(280, Math.round(window.innerWidth - gutter * 2)),
    });
  }, [usesResultPanel, open]);

  useLayoutEffect(() => {
    updatePanelLayout();
  }, [updatePanelLayout, query, items.length, loading, open]);

  useEffect(() => {
    if (!open || !usesResultPanel) return undefined;
    const onReflow = () => updatePanelLayout();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [open, usesResultPanel, updatePanelLayout]);

  const runSearch = useCallback(
    async (value) => {
      const q = String(value || "").trim();
      if (q.length < 1) {
        setItems([]);
        setLoading(false);
        return;
      }

      const reqId = ++requestIdRef.current;
      setLoading(true);
      try {
        const firmId = selectedFirmId === "all" ? null : selectedFirmId;
        const res = await globalSearch(q, firmId, 20);
        if (reqId !== requestIdRef.current) return;
        setItems(buildSearchItems(res.data || {}));
        setActiveIndex(-1);
      } catch (err) {
        if (reqId !== requestIdRef.current) return;
        console.error("Header search failed:", err);
        setItems([]);
      } finally {
        if (reqId === requestIdRef.current) setLoading(false);
      }
    },
    [selectedFirmId]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(q), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    if (query.trim().length >= 1) {
      runSearch(query);
    }
  }, [selectedFirmId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const resetSearch = () => {
    setOpen(false);
    setQuery("");
    setItems([]);
    setActiveIndex(-1);
  };

  const selectUserAndGo = (user, path) => {
    if (user) dispatch(setSelectedUser(user));
    resetSearch();
    navigate(path);
  };

  const openLoan = (loan) => {
    if (loan?.user) dispatch(setSelectedUser(loan.user));
    resetSearch();
    navigate("/user/home/loan-info", { state: { loan: { girv_id: loan.girv_id } } });
  };

  const openFinance = (finance) => {
    if (finance?.user) dispatch(setSelectedUser(finance.user));
    resetSearch();
    navigate("/user/home/finance", { state: { finance } });
  };

  const handleItemSelect = (item) => {
    if (!item) return;
    if (item.type === "loan") {
      openLoan(item.loan);
      return;
    }
    if (item.type === "finance") {
      openFinance(item.finance);
      return;
    }
    selectUserAndGo(item.user, "/user/home");
  };

  const handleAction = (e, user, action) => {
    e.preventDefault();
    e.stopPropagation();
    switch (action) {
      case "home":
        selectUserAndGo(user, "/user/home");
        break;
      case "finance":
        if (!canCreateFinance) {
          toast.error("You do not have permission to add finance");
          return;
        }
        selectUserAndGo(user, "/user/home/add-finance");
        break;
      case "loan":
        if (!canCreateLoan) {
          toast.error("You do not have permission to add loan");
          return;
        }
        selectUserAndGo(user, "/user/home/add-loan");
        break;
      case "financePay":
        if (!canFinancePayment) {
          toast.error("You do not have permission for finance collection");
          return;
        }
        dispatch(setSelectedUser(user));
        resetSearch();
        onOpenFinancePay?.(user);
        break;
      case "loanDeposit":
        if (!canLoanDeposit) {
          toast.error("You do not have permission for loan deposit");
          return;
        }
        dispatch(setSelectedUser(user));
        resetSearch();
        onOpenLoanDeposit?.(user);
        break;
      default:
        break;
    }
  };

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = activeIndex >= 0 ? items[activeIndex] : items[0];
      handleItemSelect(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && (loading || items.length > 0 || query.trim().length > 0);

  return (
    <div className={`header-search ${className}`} ref={wrapRef}>
      <div className="input-group header-search__input-group">
        <input
          ref={inputRef}
          id={GLOBAL_SEARCH_INPUT_ID}
          type="text"
          className="form-control border-dark"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-label="Search customers, loans, and finance"
        />
        <button
          className="btn btn-outline-secondary border-dark"
          type="button"
          aria-label="Search"
          onClick={() => {
            if (query.trim()) {
              setOpen(true);
              runSearch(query.trim());
            }
          }}
        >
          <i className="bi bi-search" aria-hidden="true"></i>
        </button>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`header-search__dropdown${usesResultPanel ? " header-search__dropdown--panel" : ""}`}
          style={
            usesResultPanel && panelLayout
              ? {
                  position: "fixed",
                  top: panelLayout.top,
                  left: panelLayout.left,
                  width: panelLayout.width,
                  right: "auto",
                }
              : undefined
          }
        >
          {loading && <div className="header-search__empty text-muted">Searching...</div>}
          {!loading && query.trim() && items.length === 0 && (
            <div className="header-search__empty text-muted">
              No customer, loan, or finance record found
            </div>
          )}
          {!loading && loanItems.length > 0 && (
            <HeaderSearchLoanTable
              loanItems={loanItems}
              items={items}
              activeIndex={activeIndex}
              onSelect={handleItemSelect}
              onAction={handleAction}
            />
          )}
          {!loading && financeItems.length > 0 && (
            <HeaderSearchFinanceTable
              financeItems={financeItems}
              items={items}
              activeIndex={activeIndex}
              onSelect={handleItemSelect}
              onAction={handleAction}
            />
          )}
          {!loading && customerItems.length > 0 && (
            <HeaderSearchCustomerTable
              customerItems={customerItems}
              items={items}
              activeIndex={activeIndex}
              onSelect={handleItemSelect}
              onAction={handleAction}
              canCreateFinance={canCreateFinance}
              canCreateLoan={canCreateLoan}
              canFinancePayment={canFinancePayment}
              canLoanDeposit={canLoanDeposit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
