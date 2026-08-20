import moment from "moment";
import { formatTimePeriod } from "./formatTimePeriod";

export const formatListAmt = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Format amount or show dash when value is missing. */
export const formatListAmtOrDash = (value) => {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return formatListAmt(num);
};

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
  let icon = "bi-info-circle-fill";

  switch (value) {
    case "ACTIVE":
      tone = "success";
      label = "Active";
      icon = "bi-check-circle-fill";
      break;
    case "PAID":
      tone = "success";
      label = "Paid";
      icon = "bi-check2-all";
      break;
    case "COMPLETED":
      tone = "success";
      label = "Completed";
      icon = "bi-check-circle-fill";
      break;
    case "CLOSED":
      tone = "danger";
      label = "Closed";
      icon = "bi-x-circle-fill";
      break;
    case "RELEASED":
      tone = "danger";
      label = "Released";
      icon = "bi-unlock-fill";
      break;
    case "AUCTION":
      tone = "warning";
      label = "Auction";
      icon = "bi-gavel";
      break;
    case "TRANSFERRED":
      tone = "info";
      label = "Transferred";
      icon = "bi-arrow-right-left";
      break;
    case "INACTIVE":
      tone = "secondary";
      label = "Inactive";
      icon = "bi-pause-circle-fill";
      break;
    case "PARTIAL":
      tone = "warning";
      label = "Partial";
      icon = "bi-pie-chart-fill";
      break;
    case "DUE":
      tone = "warning";
      label = "Due";
      icon = "bi-exclamation-triangle-fill";
      break;
    case "ADDED":
      tone = "primary";
      label = "Added";
      icon = "bi-plus-circle-fill";
      break;
    case "RECEIVED":
      tone = "success";
      label = "Received";
      icon = "bi-box-arrow-in-down";
      break;
    default:
      break;
  }

  return {
    label,
    icon,
    className: `badge status-badge status-badge--${tone} bg-${tone}-subtle text-${tone} border border-${tone} fw-bold`,
  };
};

export const statusBadgeHtml = (status) => {
  const { label, icon, className } = getStatusBadgeMeta(status);
  return `<span class="${className}"><i class="bi ${icon} me-1"></i>${label}</span>`;
};

/** End date for active/auction loans = today; released uses last release date. */
export const getLoanEndDate = (loan) => {
  const status = String(loan?.girv_status || "").toUpperCase();
  if (status === "ACTIVE" || status === "AUCTION") {
    return moment().format("DD-MM-YYYY");
  }
  const releases = Array.isArray(loan?.releases) ? loan.releases : [];
  const lastRelease = releases.length ? releases[releases.length - 1] : null;
  if (lastRelease?.rel_trans_date) {
    return formatListDate(lastRelease.rel_trans_date);
  }
  return "-";
};

export const getLoanTimePeriod = (loan) => {
  const start = loan?.girv_start_date ? moment(loan.girv_start_date) : null;
  if (!start?.isValid()) return "-";

  const status = String(loan?.girv_status || "").toUpperCase();
  let end = moment();

  if (status !== "ACTIVE" && status !== "AUCTION") {
    const releases = Array.isArray(loan?.releases) ? loan.releases : [];
    const lastRelease = releases.length ? releases[releases.length - 1] : null;
    if (lastRelease?.rel_trans_date && moment(lastRelease.rel_trans_date).isValid()) {
      end = moment(lastRelease.rel_trans_date);
    }
  }

  return formatTimePeriod(start, end);
};

/** Finance tenure from start date to today or close/update date. */
export const getFinanceTimePeriod = (finance) => {
  const start = finance?.fin_start_date ? moment(finance.fin_start_date) : null;
  if (!start?.isValid()) return "-";

  const status = String(finance?.fin_status || "").toUpperCase();
  let end = moment();

  if ((status === "CLOSED" || status === "COMPLETED") && finance?.fin_updated_at) {
    end = moment(finance.fin_updated_at);
  }

  return formatTimePeriod(start, end);
};

export const getLoanListMetrics = (loan) => {
  const summary = loan?.interest_summary;
  if (!summary) {
    return {
      principal: loan?.girv_prin_amt ?? null,
      interest: null,
      finalPay: null,
      profitLoss: loan?.profit_loss ?? null,
    };
  }

  const finalPay = summary.totalDueAmount ?? summary.pending ?? null;
  const interest = summary.totalInterest ?? null;
  const principal =
    summary.currentTotalPrincipal ??
    summary.originalPrincipal ??
    loan?.girv_prin_amt ??
    null;
  let profitLoss = loan?.profit_loss;

  if (profitLoss == null && String(loan?.girv_type || "").toLowerCase() === "secured") {
    const valuation = Number(loan?.total_valuation) || 0;
    if (valuation > 0 && finalPay != null) {
      profitLoss = parseFloat((valuation - finalPay).toFixed(2));
    }
  }

  return { principal, interest, finalPay, profitLoss };
};

export const getLoanPrincipalAmount = (loan) => getLoanListMetrics(loan).principal;

export const formatProfitLossHtml = (value) => {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  const cls = num >= 0 ? "text-success" : "text-danger";
  const sign = num >= 0 ? "+" : "";
  return `<span class="${cls} fw-bold">${sign}${formatListAmt(num)}</span>`;
};

export const formatProfitLossText = (value) => {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${formatListAmt(num)}`;
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

/** Add computed list fields so DataTables can read every column key safely. */
export const normalizeFinanceListRow = (finance) => {
  if (!finance) return finance;
  const stats = getFinanceEmiStats(finance);
  const customerName = finance.user
    ? `${finance.user.user_first_name || ""} ${finance.user.user_last_name || ""}`.trim()
    : "";

  return {
    ...finance,
    fin_unique_code: finance.fin_unique_code || (finance.fin_id ? `Fin-${finance.fin_id}` : ""),
    fin_time_period: getFinanceTimePeriod(finance),
    fin_pending_amt: stats.pendingAmt,
    fin_emi_progress: stats.emiProgress,
    fin_customer_name: customerName || "N/A",
    fin_customer_mobile: finance.user?.user_mobile_no || "-",
    fin_firm_name: finance.firm?.firm_name || "N/A",
  };
};

/** Add computed list fields so DataTables can read every column key safely. */
export const normalizeLoanListRow = (loan) => {
  if (!loan) return loan;
  const metrics = getLoanListMetrics(loan);
  const customerName = loan.user
    ? `${loan.user.user_first_name || ""} ${loan.user.user_last_name || ""}`.trim()
    : "";

  return {
    ...loan,
    girv_unique_code:
      loan.girv_unique_code || loan.girv_loan_no || (loan.girv_id ? String(loan.girv_id) : ""),
    girv_end_date_display: getLoanEndDate(loan),
    girv_time_period: getLoanTimePeriod(loan),
    girv_display_principal: getLoanPrincipalAmount(loan) ?? loan.girv_prin_amt,
    girv_total_interest: metrics.interest,
    girv_total_due: metrics.finalPay,
    profit_loss: metrics.profitLoss,
    girv_customer_name: customerName || "-",
    girv_customer_mobile: loan.user?.user_mobile_no || "-",
    girv_transfer_firm_name:
      loan.transferFirm?.firm_name ||
      (loan.girv_transfer_firm_id ? `Firm #${loan.girv_transfer_firm_id}` : "-"),
    girv_transfer_ml_name: (() => {
      const ml = loan.transferMoneyLender;
      if (ml) {
        return (
          [ml.ml_first_name, ml.ml_last_name].filter(Boolean).join(" ").trim() ||
          `ML #${ml.ml_id}`
        );
      }
      return loan.girv_transfer_ml_id ? `ML #${loan.girv_transfer_ml_id}` : "-";
    })(),
  };
};
