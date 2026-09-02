import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUser } from "../../api/userApi";
import { setSelectedUser } from "../../store/slices/userSlice";
import { showToast } from "../common/ToastAlert";
import { formatCurrency, getProcessingRowAmounts } from "./dayBookUtils";

const DayBookProcessingMobileCard = ({ item, cardKey, expanded, onToggle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cash, bank, online, card, disc, process, charge, total } = getProcessingRowAmounts(item);

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

  const handleRefClick = () => {
    if (item.db_ref_type === "LOAN" && item.db_girv_uuid) {
      navigate("/user/home/loan-info", {
        state: { loan: { girv_uuid: item.db_girv_uuid } },
      });
      return;
    }
    if (item.db_ref_type === "FINANCE" && item.db_fin_id) {
      navigate("/user/home/finance", {
        state: { finance: { fin_id: item.db_fin_id } },
      });
    }
  };

  return (
    <div className={`daybook-mobile-row ${expanded ? "is-open" : ""}`}>
      <div className="daybook-mobile-row__main">
        <div className="daybook-mobile-row__left">
          <button type="button" className="daybook-mobile-row__name" onClick={handleCustomerClick}>
            {item.db_customer_name || "-"}
          </button>
          <button type="button" className="daybook-mobile-row__meta-btn" onClick={() => onToggle(cardKey)}>
            {item.db_date || "-"} · {item.db_firm || "-"}
          </button>
        </div>
        <button
          type="button"
          className="daybook-mobile-row__right"
          onClick={() => onToggle(cardKey)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide processing details" : "Show processing details"}
        >
          <span className="daybook-mobile-row__total is-dr">{formatCurrency(total)}</span>
          <i
            className={`bi daybook-collapse-icon ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded && (
        <div className="daybook-mobile-row__details">
          <div className="daybook-mobile-totals-grid daybook-mobile-totals-grid--compact">
            <div className="is-full">
              <span>Ref No</span>
              <button
                type="button"
                className="btn btn-link p-0 text-primary fw-bold text-decoration-none"
                onClick={handleRefClick}
              >
                {item.db_ref_no || "-"}
              </button>
            </div>
            <div>
              <span>Type</span>
              <strong>{item.db_ref_type || "-"}</strong>
            </div>
            <div>
              <span>Process</span>
              <strong className="is-dr">{formatCurrency(process)}</strong>
            </div>
            <div>
              <span>Charge</span>
              <strong className="is-dr">{formatCurrency(charge)}</strong>
            </div>
            <div>
              <span>Cash</span>
              <strong className="is-dr">{formatCurrency(cash)}</strong>
            </div>
            <div>
              <span>Bank</span>
              <strong className="is-dr">{formatCurrency(bank)}</strong>
            </div>
            <div>
              <span>Online</span>
              <strong className="is-dr">{formatCurrency(online)}</strong>
            </div>
            <div>
              <span>Card</span>
              <strong className="is-dr">{formatCurrency(card)}</strong>
            </div>
            <div>
              <span>Disc</span>
              <strong className="is-dr">{formatCurrency(disc)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayBookProcessingMobileCard;
