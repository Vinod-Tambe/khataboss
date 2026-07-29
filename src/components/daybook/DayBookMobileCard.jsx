import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { showToast } from "../common/ToastAlert";
import { formatCurrency, getRowAmounts } from "./dayBookUtils";

const DayBookMobileCard = ({
  item,
  cardKey,
  amtTone = "cr",
  expanded,
  onToggle,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cash, bank, online, card, disc, total } = getRowAmounts(item);
  const toneClass = amtTone === "dr" ? "is-dr" : "is-cr";

  const handleCustomerClick = async () => {
    if (!item.db_user_uuid) return;
    try {
      const res = await getUser(item.db_user_uuid);
      if (res.data) {
        dispatch(setSelectedUser(res.data));
        navigate("/user/home");
      }
    } catch (err) {
      showToast("Error fetching user details", "error");
    }
  };

  return (
    <div className={`daybook-mobile-row ${expanded ? "is-open" : ""}`}>
      <div className="daybook-mobile-row__main">
        <div className="daybook-mobile-row__left">
          <button
            type="button"
            className="daybook-mobile-row__name"
            onClick={handleCustomerClick}
          >
            {item.db_customer_name || "-"}
          </button>
          <button
            type="button"
            className="daybook-mobile-row__meta-btn"
            onClick={() => onToggle(cardKey)}
          >
            {item.db_date || "-"} · {item.db_firm || "-"}
          </button>
        </div>
        <button
          type="button"
          className="daybook-mobile-row__right"
          onClick={() => onToggle(cardKey)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide payment details" : "Show payment details"}
        >
          <span className={`daybook-mobile-row__total ${toneClass}`}>
            {formatCurrency(total)}
          </span>
          <i className={`bi daybook-collapse-icon ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} aria-hidden="true"></i>
        </button>
      </div>

      {expanded && (
        <div className="daybook-mobile-row__details">
          <div className="daybook-mobile-totals-grid daybook-mobile-totals-grid--compact">
            <div>
              <span>Cash</span>
              <strong>{formatCurrency(cash)}</strong>
            </div>
            <div>
              <span>Bank</span>
              <strong>{formatCurrency(bank)}</strong>
            </div>
            <div>
              <span>Online</span>
              <strong>{formatCurrency(online)}</strong>
            </div>
            <div>
              <span>Card</span>
              <strong>{formatCurrency(card)}</strong>
            </div>
            <div>
              <span>Disc</span>
              <strong>{formatCurrency(disc)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayBookMobileCard;
