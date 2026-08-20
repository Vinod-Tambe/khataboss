import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { globalSearch } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { resolveImageUrl } from "../../utils/imageHelpers";
import usePermissions from "../../hooks/usePermissions";
import { toast } from "react-toastify";

const getProfileImgUrl = (user) => resolveImageUrl(user?.user_profile_img) || "";

const formatUserAddress = (user) => {
  if (!user) return "";
  const street = String(user.user_curr_address || user.user_per_address || "").trim();
  const city = String(user.user_city || "").trim();
  const state = String(user.user_state || "").trim();
  const country = String(user.user_country || "").trim();
  const pincode = String(user.user_pincode || "").trim();
  const locality = [city, state, country].filter(Boolean).join(", ");
  const withPin = [locality, pincode].filter(Boolean).join(" - ");
  return [street, withPin].filter(Boolean).join(", ");
};

const formatCustomerName = (user) =>
  `${user?.user_first_name || ""} ${user?.user_last_name || ""}`.trim() || "Customer";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const resultCounts = useMemo(() => {
    const counts = { loan: 0, finance: 0, customer: 0 };
    items.forEach((item) => {
      counts[item.type] += 1;
    });
    return counts;
  }, [items]);

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
        const res = await globalSearch(q, firmId, 15);
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

  const renderCustomerItem = (item, idx) => {
    const user = item.user;
    const name = formatCustomerName(user);
    const email = String(user.user_email_id || "").trim();
    const address = formatUserAddress(user);
    const profileImg = getProfileImgUrl(user);

    return (
      <div
        key={item.key}
        className={`header-search__item ${idx === activeIndex ? "is-active" : ""}`}
      >
        <div className="header-search__top">
          <button
            type="button"
            className="header-search__main"
            onClick={() => handleItemSelect(item)}
            title="Open customer home"
          >
            <span className="header-search__avatar">
              {profileImg ? (
                <img
                  src={profileImg}
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const icon = e.currentTarget.nextElementSibling;
                    if (icon) icon.hidden = false;
                  }}
                />
              ) : null}
              <i className="bi bi-person-circle" aria-hidden="true" hidden={Boolean(profileImg)}></i>
            </span>
            <span className="header-search__meta">
              <span className="header-search__title-row">
                <span className="header-search__badge is-customer">Customer</span>
                <span className="header-search__name">{name}</span>
                {user.user_unique_code ? (
                  <span className="header-search__sub">· {user.user_unique_code}</span>
                ) : user.user_id != null ? (
                  <span className="header-search__sub">· ID: {user.user_id}</span>
                ) : null}
                {user.user_mobile_no ? (
                  <span className="header-search__sub">· {user.user_mobile_no}</span>
                ) : null}
              </span>
              {email ? (
                <span className="header-search__sub header-search__contact" title={email}>
                  {email}
                </span>
              ) : null}
            </span>
          </button>
          <div className="header-search__actions">
            <button type="button" className="header-search__action is-home" title="Customer Home" onClick={(e) => handleAction(e, user, "home")}>
              <i className="bi bi-house-door-fill" aria-hidden="true"></i>
            </button>
            {canCreateFinance && (
              <button type="button" className="header-search__action is-finance" title="Add Finance" onClick={(e) => handleAction(e, user, "finance")}>
                <i className="bi bi-plus-circle-fill" aria-hidden="true"></i>
              </button>
            )}
            {canCreateLoan && (
              <button type="button" className="header-search__action is-loan" title="Add Loan" onClick={(e) => handleAction(e, user, "loan")}>
                <i className="bi bi-bank" aria-hidden="true"></i>
              </button>
            )}
            {canFinancePayment && (
              <button type="button" className="header-search__action is-pay" title="Finance Pay" onClick={(e) => handleAction(e, user, "financePay")}>
                <i className="bi bi-currency-rupee" aria-hidden="true"></i>
              </button>
            )}
            {canLoanDeposit && (
              <button type="button" className="header-search__action is-deposit" title="Loan Deposit" onClick={(e) => handleAction(e, user, "loanDeposit")}>
                <i className="bi bi-safe2-fill" aria-hidden="true"></i>
              </button>
            )}
          </div>
        </div>
        {address ? (
          <div className="header-search__address" title={address}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i>
            <span>{address}</span>
          </div>
        ) : null}
      </div>
    );
  };

  const renderLoanItem = (item, idx) => {
    const loan = item.loan;
    const user = item.user;
    const loanId = loan.girv_unique_code || loan.girv_loan_no || `LN-${loan.girv_id}`;
    const customerName = formatCustomerName(user);

    return (
      <button
        key={item.key}
        type="button"
        className={`header-search__record ${idx === activeIndex ? "is-active" : ""}`}
        onClick={() => handleItemSelect(item)}
      >
        <span className="header-search__record-icon is-loan">
          <i className="bi bi-bank" aria-hidden="true"></i>
        </span>
        <span className="header-search__record-body">
          <span className="header-search__record-title">
            <span className="header-search__badge is-loan">Loan</span>
            <strong>{loanId}</strong>
            <span className="header-search__sub">· ₹{formatMoney(loan.girv_prin_amt)}</span>
          </span>
          <span className="header-search__record-sub">
            {customerName}
            {loan.girv_status ? ` · ${loan.girv_status}` : ""}
            {loan.firm?.firm_name ? ` · ${loan.firm.firm_name}` : ""}
          </span>
        </span>
        <i className="bi bi-chevron-right header-search__record-arrow" aria-hidden="true"></i>
      </button>
    );
  };

  const renderFinanceItem = (item, idx) => {
    const finance = item.finance;
    const user = item.user;
    const financeId = finance.fin_unique_code || `FIN-${finance.fin_id}`;
    const customerName = formatCustomerName(user);

    return (
      <button
        key={item.key}
        type="button"
        className={`header-search__record ${idx === activeIndex ? "is-active" : ""}`}
        onClick={() => handleItemSelect(item)}
      >
        <span className="header-search__record-icon is-finance">
          <i className="bi bi-cash-stack" aria-hidden="true"></i>
        </span>
        <span className="header-search__record-body">
          <span className="header-search__record-title">
            <span className="header-search__badge is-finance">Finance</span>
            <strong>{financeId}</strong>
            <span className="header-search__sub">· ₹{formatMoney(finance.fin_prin_amt)}</span>
          </span>
          <span className="header-search__record-sub">
            {customerName}
            {finance.fin_status ? ` · ${finance.fin_status}` : ""}
            {finance.firm?.firm_name ? ` · ${finance.firm.firm_name}` : ""}
          </span>
        </span>
        <i className="bi bi-chevron-right header-search__record-arrow" aria-hidden="true"></i>
      </button>
    );
  };

  return (
    <div className={`header-search ${className}`} ref={wrapRef}>
      <div className="input-group header-search__input-group">
        <input
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
        <div className="header-search__dropdown">
          {loading && <div className="header-search__empty text-muted">Searching...</div>}
          {!loading && query.trim() && items.length === 0 && (
            <div className="header-search__empty text-muted">
              No customer, loan, or finance record found
            </div>
          )}
          {!loading && items.length > 0 && (
            <div className="header-search__summary text-muted">
              {resultCounts.loan > 0 ? `${resultCounts.loan} loan` : null}
              {resultCounts.loan > 0 && resultCounts.finance > 0 ? " · " : null}
              {resultCounts.finance > 0 ? `${resultCounts.finance} finance` : null}
              {(resultCounts.loan > 0 || resultCounts.finance > 0) && resultCounts.customer > 0
                ? " · "
                : null}
              {resultCounts.customer > 0 ? `${resultCounts.customer} customer` : null}
            </div>
          )}
          {!loading &&
            items.map((item, idx) => {
              if (item.type === "loan") return renderLoanItem(item, idx);
              if (item.type === "finance") return renderFinanceItem(item, idx);
              return renderCustomerItem(item, idx);
            })}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
