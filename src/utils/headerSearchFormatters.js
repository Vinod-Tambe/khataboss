import { formatListAmtOrDash, formatListDate } from "./listFormatters";
import {
  formatCustomerListName,
  formatCustomerSearchUserCode,
} from "./customerFormatters";

const dash = (value) => {
  const text = String(value ?? "").trim();
  return text || "—";
};

export const HEADER_SEARCH_LOAN_COLUMNS = [
  { key: "loanNo", title: "Loan No" },
  { key: "customerId", title: "Customer ID" },
  { key: "customerName", title: "Customer Name" },
  { key: "mobile", title: "Mobile No" },
  { key: "firm", title: "Firm Name" },
  { key: "startDate", title: "Start Date" },
  { key: "principal", title: "Principal" },
  { key: "status", title: "Status" },
];

export const HEADER_SEARCH_FINANCE_COLUMNS = [
  { key: "finNo", title: "Fin No" },
  { key: "customerId", title: "Customer ID" },
  { key: "customerName", title: "Customer Name" },
  { key: "mobile", title: "Mobile No" },
  { key: "firm", title: "Firm Name" },
  { key: "startDate", title: "Start Date" },
  { key: "principal", title: "Principal" },
  { key: "status", title: "Status" },
];

export const buildLoanSearchTableRow = (loan) => {
  const user = loan?.user;
  return {
    loanNo:
      loan?.girv_unique_code ||
      loan?.girv_loan_no ||
      (loan?.girv_id != null ? `LN-${loan.girv_id}` : "—"),
    customerId: formatCustomerSearchUserCode(user),
    customerName: formatCustomerListName(user),
    mobile: dash(user?.user_mobile_no),
    firm: dash(loan?.firm?.firm_name),
    startDate: formatListDate(loan?.girv_start_date) || "—",
    principal: formatListAmtOrDash(loan?.girv_prin_amt),
    status: dash(loan?.girv_status),
  };
};

export const buildFinanceSearchTableRow = (finance) => {
  const user = finance?.user;
  return {
    finNo:
      finance?.fin_unique_code ||
      (finance?.fin_id != null ? `FIN-${finance.fin_id}` : "—"),
    customerId: formatCustomerSearchUserCode(user),
    customerName: formatCustomerListName(user),
    mobile: dash(user?.user_mobile_no),
    firm: dash(finance?.firm?.firm_name),
    startDate: formatListDate(finance?.fin_start_date) || "—",
    principal: formatListAmtOrDash(finance?.fin_prin_amt),
    status: dash(finance?.fin_status),
  };
};
