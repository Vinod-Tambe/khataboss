import moment from "moment";
import { formatTimePeriod } from "./formatTimePeriod";

export const formatListAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatListDate = (value) => {
  if (!value) return "-";
  const m = moment(value);
  return m.isValid() ? m.format("DD-MM-YYYY") : "-";
};

/** Shared status badge meta for lists (light theme-aware backgrounds). */
export const getStatusBadgeMeta = (status) => {
  const value = String(status || "-").toUpperCase();
  let tone = "secondary";
  let label = status || "-";

  switch (value) {
    case "ACTIVE":
      tone = "success";
      label = "Active";
      break;
    case "PAID":
      tone = "success";
      label = "Paid";
      break;
    case "COMPLETED":
      tone = "success";
      label = "Completed";
      break;
    case "CLOSED":
      tone = "danger";
      label = "Closed";
      break;
    case "RELEASED":
      tone = "danger";
      label = "Released";
      break;
    case "AUCTION":
      tone = "warning";
      label = "Auction";
      break;
    case "TRANSFERRED":
      tone = "info";
      label = "Transferred";
      break;
    case "INACTIVE":
      tone = "secondary";
      label = "Inactive";
      break;
    case "PARTIAL":
      tone = "warning";
      label = "Partial";
      break;
    case "DUE":
      tone = "warning";
      label = "Due";
      break;
    case "ADDED":
      tone = "primary";
      label = "Added";
      break;
    case "RECEIVED":
      tone = "success";
      label = "Received";
      break;
    default:
      break;
  }

  return {
    label,
    className: `badge status-badge status-badge--${tone} bg-${tone}-subtle text-${tone}`,
  };
};

export const statusBadgeHtml = (status) => {
  const { label, className } = getStatusBadgeMeta(status);
  return `<span class="${className}">${label}</span>`;
};

/** End date for active/auction loans = today; otherwise "-". */
export const getLoanEndDate = (loan) => {
  const status = String(loan?.girv_status || "").toUpperCase();
  if (status === "ACTIVE" || status === "AUCTION") {
    return moment().format("DD-MM-YYYY");
  }
  return "-";
};

export const getLoanTimePeriod = (loan) => {
  const start = loan?.girv_start_date ? moment(loan.girv_start_date) : null;
  if (!start?.isValid()) return "-";
  const status = String(loan?.girv_status || "").toUpperCase();
  const end = status === "ACTIVE" || status === "AUCTION" ? moment() : start;
  if (status !== "ACTIVE" && status !== "AUCTION") {
    // For closed/released without release date, still show period till today as running reference
    return formatTimePeriod(start, moment());
  }
  return formatTimePeriod(start, end);
};

export const getFinanceEmiStats = (finance) => {
  const emis = Array.isArray(finance?.finance_trans) ? finance.finance_trans : [];
  const totalEmis = Number(finance?.fin_no_of_emi) || emis.length || 0;
  const paidEmis = emis.filter((t) => String(t.ft_emi_status).toUpperCase() === "PAID").length;
  const pendingAmt = emis.reduce((sum, t) => sum + (Number(t.ft_pending_amt) || 0), 0);
  return {
    totalEmis,
    paidEmis,
    pendingEmis: Math.max(0, totalEmis - paidEmis),
    pendingAmt,
    emiProgress: totalEmis ? `${paidEmis}/${totalEmis}` : "-",
  };
};
