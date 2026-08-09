import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { searchUsers } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";

const IMAGE_BASE_URL = "http://localhost:9000/";

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

const getProfileImgUrl = (user) => {
  const path = user?.user_profile_img?.path;
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_BASE_URL}${String(path).replace(/^\/+/, "")}`;
};

const HeaderSearch = ({
  placeholder = "Search mobile, unique code, name, city...",
  className = "",
  onOpenFinancePay,
  onOpenLoanDeposit,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedFirmId } = useSelector((state) => state.firm);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (value) => {
      const q = String(value || "").trim();
      if (q.length < 1) {
        setResults([]);
        setLoading(false);
        return;
      }

      const reqId = ++requestIdRef.current;
      setLoading(true);
      try {
        const firmId = selectedFirmId === "all" ? null : selectedFirmId;
        const res = await searchUsers(q, firmId, 12);
        if (reqId !== requestIdRef.current) return;
        setResults(Array.isArray(res.data) ? res.data : []);
        setActiveIndex(-1);
      } catch (err) {
        if (reqId !== requestIdRef.current) return;
        console.error("Header search failed:", err);
        setResults([]);
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
      setResults([]);
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
    // Re-run when firm filter changes while query is active
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

  const selectUserAndGo = (user, path) => {
    dispatch(setSelectedUser(user));
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(path);
  };

  const handleAction = (e, user, action) => {
    e.preventDefault();
    e.stopPropagation();
    switch (action) {
      case "home":
        selectUserAndGo(user, "/user/home");
        break;
      case "finance":
        selectUserAndGo(user, "/user/home/add-finance");
        break;
      case "loan":
        selectUserAndGo(user, "/user/home/add-loan");
        break;
      case "financePay":
        dispatch(setSelectedUser(user));
        setOpen(false);
        setQuery("");
        setResults([]);
        onOpenFinancePay?.(user);
        break;
      case "loanDeposit":
        dispatch(setSelectedUser(user));
        setOpen(false);
        setQuery("");
        setResults([]);
        onOpenLoanDeposit?.(user);
        break;
      default:
        break;
    }
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const user = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (user) selectUserAndGo(user, "/user/home");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && (loading || results.length > 0 || query.trim().length > 0);

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
          aria-label="Search customers"
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
          {loading && (
            <div className="header-search__empty text-muted">Searching...</div>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <div className="header-search__empty text-muted">No customers found</div>
          )}
          {!loading &&
            results.map((user, idx) => {
              const name = `${user.user_first_name || ""} ${user.user_last_name || ""}`.trim() || "Customer";
              const email = String(user.user_email_id || "").trim();
              const address = formatUserAddress(user);
              const profileImg = getProfileImgUrl(user);
              return (
                <div
                  key={user.user_uuid || user.user_id}
                  className={`header-search__item ${idx === activeIndex ? "is-active" : ""}`}
                >
                  <div className="header-search__top">
                    <button
                      type="button"
                      className="header-search__main"
                      onClick={() => selectUserAndGo(user, "/user/home")}
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
                        <i
                          className="bi bi-person-circle"
                          aria-hidden="true"
                          hidden={Boolean(profileImg)}
                        ></i>
                      </span>
                      <span className="header-search__meta">
                        <span className="header-search__title-row" title={[name, user.user_mobile_no, user.user_unique_code || (user.user_id != null ? `ID: ${user.user_id}` : "")].filter(Boolean).join(" · ")}>
                          <span className="header-search__name">{name}</span>
                          {user.user_unique_code ? (
                            <span className="header-search__sub">· Code: {user.user_unique_code}</span>
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
                      <button
                        type="button"
                        className="header-search__action is-home"
                        title="Customer Home"
                        onClick={(e) => handleAction(e, user, "home")}
                      >
                        <i className="bi bi-house-door-fill" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="header-search__action is-finance"
                        title="Add Finance"
                        onClick={(e) => handleAction(e, user, "finance")}
                      >
                        <i className="bi bi-plus-circle-fill" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="header-search__action is-loan"
                        title="Add Loan"
                        onClick={(e) => handleAction(e, user, "loan")}
                      >
                        <i className="bi bi-bank" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="header-search__action is-pay"
                        title="Finance Pay"
                        onClick={(e) => handleAction(e, user, "financePay")}
                      >
                        <i className="bi bi-currency-rupee" aria-hidden="true"></i>
                      </button>
                      <button
                        type="button"
                        className="header-search__action is-deposit"
                        title="Loan Deposit"
                        onClick={(e) => handleAction(e, user, "loanDeposit")}
                      >
                        <i className="bi bi-safe2-fill" aria-hidden="true"></i>
                      </button>
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
            })}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
