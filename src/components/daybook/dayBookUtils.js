import {
  PERSONAL_EXPENSES_DAYBOOK_TITLE,
  getPersonalExpenseDaybookSection,
  isPersonalExpensesDaybookSection,
} from "../../constants/personalExpense";
import { getBalanceTone } from "../trial-balance/trialBalanceUtils";

export {
  PERSONAL_EXPENSES_DAYBOOK_TITLE,
  getPersonalExpenseDaybookSection,
  isPersonalExpensesDaybookSection,
};

export { getBalanceTone };

/** Opening/closing signed totals: positive = DR (green), negative = CR (red). */
export const getSignedBalanceAmountClass = (val) => {
  const tone = getBalanceTone(val);
  if (tone === "dr") return "daybook-summary-final__dr-amt";
  if (tone === "cr") return "daybook-summary-final__cr-amt";
  return "daybook-summary-final__bal-amt--zero";
};

export const getSignedBalanceTextClass = (val) => {
  const tone = getBalanceTone(val);
  if (tone === "dr") return "text-success";
  if (tone === "cr") return "text-danger";
  return "";
};

export const getSignedBalancePdfColor = (val, colors) => {
  const tone = getBalanceTone(val);
  if (tone === "dr") return colors.dr;
  if (tone === "cr") return colors.cr;
  return colors.footerText;
};

export const formatCurrency = (val) =>
  Math.abs(parseFloat(val) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formulaAmount = (val) => (parseFloat(val) || 0).toFixed(2);

/** Tooltip text: opening total = sum of modes (excludes discount in total). */
export const getOpeningTotalFormulaText = ({ cash, bank, online, card, total }) =>
  [
    "Opening Balance = Cash + Bank + Online + Card",
    `${formulaAmount(cash)} + ${formulaAmount(bank)} + ${formulaAmount(online)} + ${formulaAmount(card)} = ${formulaAmount(total)}`,
  ].join("\n");

export const getOpeningModeFormulaText = (modeLabel, amount) =>
  `Opening ${modeLabel} = ${formulaAmount(amount)}`;

/** Tooltip text: closing total = opening total + today net total. */
export const getClosingTotalFormulaText = ({ openingTotal, todayTotal, closingTotal }) =>
  [
    "Closing Balance = Opening Balance + Today Total",
    `${formulaAmount(openingTotal)} + ${formulaAmount(todayTotal)} = ${formulaAmount(closingTotal)}`,
  ].join("\n");

export const getClosingModeFormulaText = (modeLabel, opening, today, closing) =>
  [
    `Closing ${modeLabel} = Opening ${modeLabel} + Today ${modeLabel}`,
    `${formulaAmount(opening)} + ${formulaAmount(today)} = ${formulaAmount(closing)}`,
  ].join("\n");

export const getOpeningTotalFormulaFromSummary = (summary) =>
  getOpeningTotalFormulaText(summary.opening);

export const getClosingTotalFormulaFromSummary = (summary) =>
  getClosingTotalFormulaText({
    openingTotal: summary.opening.total,
    todayTotal: summary.today.total,
    closingTotal: summary.closing.total,
  });

export const isInterAccountTransferDaybookSection = isPersonalExpensesDaybookSection;

export const getRowAmounts = (item = {}) => {
  const cash = parseFloat(item.db_cash_amt) || 0;
  const bank = parseFloat(item.db_bank_amt) || 0;
  const online = parseFloat(item.db_online_amt) || 0;
  const card = parseFloat(item.db_card_amt) || 0;
  const disc = parseFloat(item.db_disc_amt) || 0;
  const total = cash + bank + online + card;
  return { cash, bank, online, card, disc, total };
};

export const getProcessingRowAmounts = (item = {}) => {
  const cash = parseFloat(item.db_cash_amt) || 0;
  const bank = parseFloat(item.db_bank_amt) || 0;
  const online = parseFloat(item.db_online_amt) || 0;
  const card = parseFloat(item.db_card_amt) || 0;
  const disc = parseFloat(item.db_disc_amt) || 0;
  const process = parseFloat(item.db_process_amt) || 0;
  const charge = parseFloat(item.db_charge_amt) || 0;
  const total = parseFloat(item.db_total_amt) || cash + bank + online + card || process + charge;
  return { cash, bank, online, card, disc, process, charge, total };
};

export const calculateProcessingSectionTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      const row = getProcessingRowAmounts(item);
      acc.cash += row.cash;
      acc.bank += row.bank;
      acc.online += row.online;
      acc.card += row.card;
      acc.disc += row.disc;
      acc.process += row.process;
      acc.charge += row.charge;
      acc.total += row.total;
      return acc;
    },
    { cash: 0, bank: 0, online: 0, card: 0, disc: 0, process: 0, charge: 0, total: 0 }
  );

export const getFirstMonthInterestRowAmounts = (item = {}) => {
  const cash = parseFloat(item.db_cash_amt) || 0;
  const bank = parseFloat(item.db_bank_amt) || 0;
  const online = parseFloat(item.db_online_amt) || 0;
  const card = parseFloat(item.db_card_amt) || 0;
  const disc = parseFloat(item.db_disc_amt) || 0;
  const interest = parseFloat(item.db_interest_amt) || cash + bank + online + card;
  const total = cash + bank + online + card;
  return { cash, bank, online, card, disc, interest, total };
};

export const calculateFirstMonthInterestSectionTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      const row = getFirstMonthInterestRowAmounts(item);
      acc.cash += row.cash;
      acc.bank += row.bank;
      acc.online += row.online;
      acc.card += row.card;
      acc.disc += row.disc;
      acc.interest += row.interest;
      acc.total += row.total;
      return acc;
    },
    { cash: 0, bank: 0, online: 0, card: 0, disc: 0, interest: 0, total: 0 }
  );

export const isProcessingDaybookSection = (title) => title === "PROCESSING AMOUNT";

export const isFirstMonthInterestDaybookSection = (title) => title === "FIRST MONTH INTEREST";

export const getPersonalExpenseRowAmount = (item = {}) =>
  parseFloat(item.db_transfer_amt) || 0;

export const getInterAccountTransferRowAmount = getPersonalExpenseRowAmount;

export const calculatePersonalExpenseSectionTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      const amt = getPersonalExpenseRowAmount(item);
      acc.transfer += amt;
      acc.total += amt;
      return acc;
    },
    { transfer: 0, total: 0 }
  );

export const calculateInterAccountTransferSectionTotals = calculatePersonalExpenseSectionTotals;

export const isInformationalDaybookSection = () => false;

export const calculateSectionTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      const row = getRowAmounts(item);
      acc.cash += row.cash;
      acc.bank += row.bank;
      acc.online += row.online;
      acc.card += row.card;
      acc.disc += row.disc;
      acc.total += row.total;
      return acc;
    },
    { cash: 0, bank: 0, online: 0, card: 0, disc: 0, total: 0 }
  );

/** Same summary math as DayBookSummary (desktop) */
export const calculateDayBookSummary = (DayBookData = {}, opening_data = {}) => {
  const total_open_cash_amt = parseFloat(opening_data.total_cash_amt || 0);
  const total_open_bank_amt = parseFloat(opening_data.total_bank_amt || 0);
  const total_open_online_amt = parseFloat(opening_data.total_online_amt || 0);
  const total_open_card_amt = parseFloat(opening_data.total_card_amt || 0);
  const total_open_disc_amt = 0;
  const total_open_amt =
    total_open_cash_amt + total_open_bank_amt + total_open_online_amt + total_open_card_amt;

  const Finance_emi_deposit_data = DayBookData?.["FINANCE EMI DEPOSIT"] || {};
  const Loan_deposit_data = DayBookData?.["LOAN DEPOSIT"] || {};
  const Release_loan_data = DayBookData?.["RELEASE LOAN"] || {};
  const Auction_loan_data = DayBookData?.["AUCTION LOAN"] || {};
  const Transfer_loan_out_data = DayBookData?.["TRANSFER LOAN OUT"] || {};
  const First_month_interest_data = DayBookData?.["FIRST MONTH INTEREST"] || {};
  const Processing_amount_data = DayBookData?.["PROCESSING AMOUNT"] || {};

  const total_today_cash_in_amt =
    parseFloat(Finance_emi_deposit_data.total_cash_amt || 0) +
    parseFloat(Loan_deposit_data.total_cash_amt || 0) +
    parseFloat(Release_loan_data.total_cash_amt || 0) +
    parseFloat(Auction_loan_data.total_cash_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_cash_amt || 0) +
    parseFloat(First_month_interest_data.total_cash_amt || 0) +
    parseFloat(Processing_amount_data.total_cash_amt || 0);

  const total_today_bank_in_amt =
    parseFloat(Finance_emi_deposit_data.total_bank_amt || 0) +
    parseFloat(Loan_deposit_data.total_bank_amt || 0) +
    parseFloat(Release_loan_data.total_bank_amt || 0) +
    parseFloat(Auction_loan_data.total_bank_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_bank_amt || 0) +
    parseFloat(First_month_interest_data.total_bank_amt || 0) +
    parseFloat(Processing_amount_data.total_bank_amt || 0);

  const total_today_online_in_amt =
    parseFloat(Finance_emi_deposit_data.total_online_amt || 0) +
    parseFloat(Loan_deposit_data.total_online_amt || 0) +
    parseFloat(Release_loan_data.total_online_amt || 0) +
    parseFloat(Auction_loan_data.total_online_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_online_amt || 0) +
    parseFloat(First_month_interest_data.total_online_amt || 0) +
    parseFloat(Processing_amount_data.total_online_amt || 0);

  const total_today_card_in_amt =
    parseFloat(Finance_emi_deposit_data.total_card_amt || 0) +
    parseFloat(Loan_deposit_data.total_card_amt || 0) +
    parseFloat(Release_loan_data.total_card_amt || 0) +
    parseFloat(Auction_loan_data.total_card_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_card_amt || 0) +
    parseFloat(First_month_interest_data.total_card_amt || 0) +
    parseFloat(Processing_amount_data.total_card_amt || 0);

  const total_today_disc_in_amt =
    parseFloat(Finance_emi_deposit_data.total_disc_amt || 0) +
    parseFloat(Loan_deposit_data.total_disc_amt || 0) +
    parseFloat(Release_loan_data.total_disc_amt || 0) +
    parseFloat(Auction_loan_data.total_disc_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_disc_amt || 0) +
    parseFloat(First_month_interest_data.total_disc_amt || 0) +
    parseFloat(Processing_amount_data.total_disc_amt || 0);

  const total_today_in_amt =
    parseFloat(Finance_emi_deposit_data.total_amt || 0) +
    parseFloat(Loan_deposit_data.total_amt || 0) +
    parseFloat(Release_loan_data.total_amt || 0) +
    parseFloat(Auction_loan_data.total_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_amt || 0) +
    parseFloat(First_month_interest_data.total_amt || 0) +
    parseFloat(Processing_amount_data.total_amt || 0);

  const Finance_added_data = DayBookData?.["FINANCE ADDED"] || {};
  const Finance_emi_rollback_data = DayBookData?.["FINANCE EMI ROLLBACK"] || {};
  const Loan_added_data = DayBookData?.["LOAN ADDED"] || {};
  const Additional_principal_data = DayBookData?.["ADDITIONAL LOAN PRINCIPAL"] || {};
  const Transfer_loan_in_data = DayBookData?.["TRANSFER LOAN IN"] || {};
  const Personal_expense_data = getPersonalExpenseDaybookSection(DayBookData);

  const total_today_cash_out_amt =
    parseFloat(Finance_added_data.total_cash_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_cash_amt || 0) +
    parseFloat(Loan_added_data.total_cash_amt || 0) +
    parseFloat(Additional_principal_data.total_cash_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_cash_amt || 0);

  const total_today_bank_out_amt =
    parseFloat(Finance_added_data.total_bank_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_bank_amt || 0) +
    parseFloat(Loan_added_data.total_bank_amt || 0) +
    parseFloat(Additional_principal_data.total_bank_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_bank_amt || 0);

  const total_today_online_out_amt =
    parseFloat(Finance_added_data.total_online_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_online_amt || 0) +
    parseFloat(Loan_added_data.total_online_amt || 0) +
    parseFloat(Additional_principal_data.total_online_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_online_amt || 0);

  const total_today_card_out_amt =
    parseFloat(Finance_added_data.total_card_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_card_amt || 0) +
    parseFloat(Loan_added_data.total_card_amt || 0) +
    parseFloat(Additional_principal_data.total_card_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_card_amt || 0);

  const total_today_disc_out_amt =
    parseFloat(Finance_added_data.total_disc_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_disc_amt || 0) +
    parseFloat(Loan_added_data.total_disc_amt || 0) +
    parseFloat(Additional_principal_data.total_disc_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_disc_amt || 0);

  const total_today_out_amt =
    parseFloat(Finance_added_data.total_amt || 0) +
    parseFloat(Finance_emi_rollback_data.total_amt || 0) +
    parseFloat(Loan_added_data.total_amt || 0) +
    parseFloat(Additional_principal_data.total_amt || 0) +
    parseFloat(Transfer_loan_in_data.total_amt || 0);

  const interAccountCash = parseFloat(Personal_expense_data.total_cash_amt || 0);
  const interAccountBank = parseFloat(Personal_expense_data.total_bank_amt || 0);
  const interAccountOnline = parseFloat(Personal_expense_data.total_online_amt || 0);
  const interAccountCard = parseFloat(Personal_expense_data.total_card_amt || 0);

  const total_today_cash_amt =
    total_today_cash_in_amt - total_today_cash_out_amt + interAccountCash;
  const total_today_bank_amt =
    total_today_bank_in_amt - total_today_bank_out_amt + interAccountBank;
  const total_today_card_amt =
    total_today_card_in_amt - total_today_card_out_amt + interAccountCard;
  const total_today_online_amt =
    total_today_online_in_amt - total_today_online_out_amt + interAccountOnline;
  const total_today_disc_amt = total_today_disc_in_amt - total_today_disc_out_amt;
  const total_today_amt =
    total_today_cash_amt +
    total_today_bank_amt +
    total_today_online_amt +
    total_today_card_amt;

  const total_close_cash_amt = total_open_cash_amt + total_today_cash_amt;
  const total_close_bank_amt = total_open_bank_amt + total_today_bank_amt;
  const total_close_online_amt = total_open_online_amt + total_today_online_amt;
  const total_close_card_amt = total_open_card_amt + total_today_card_amt;
  const total_close_disc_amt = total_open_disc_amt + total_today_disc_amt;
  const total_close_amt = total_today_amt + total_open_amt;

  const total_final_dr_amt =
    total_today_cash_in_amt +
    total_today_bank_in_amt +
    total_today_online_in_amt +
    total_today_card_in_amt +
    total_today_disc_in_amt;
  const total_final_cr_amt =
    total_today_cash_out_amt +
    total_today_bank_out_amt +
    total_today_online_out_amt +
    total_today_card_out_amt +
    total_today_disc_out_amt;
  const interTransferGross = parseFloat(Personal_expense_data.total_transfer_amt || 0);
  const finalDrWithTransfer =
    interTransferGross > 0 ? total_final_dr_amt + interTransferGross : total_final_dr_amt;
  const finalCrWithTransfer =
    interTransferGross > 0 ? total_final_cr_amt + interTransferGross : total_final_cr_amt;
  const total_close_final_amt = total_close_amt;

  return {
    in: {
      cash: total_today_cash_in_amt,
      bank: total_today_bank_in_amt,
      online: total_today_online_in_amt,
      card: total_today_card_in_amt,
      disc: total_today_disc_in_amt,
      total: total_today_in_amt,
    },
    out: {
      cash: total_today_cash_out_amt,
      bank: total_today_bank_out_amt,
      online: total_today_online_out_amt,
      card: total_today_card_out_amt,
      disc: total_today_disc_out_amt,
      total: total_today_out_amt,
    },
    today: {
      cash: total_today_cash_amt,
      bank: total_today_bank_amt,
      online: total_today_online_amt,
      card: total_today_card_amt,
      disc: total_today_disc_amt,
      total: total_today_amt,
    },
    opening: {
      cash: total_open_cash_amt,
      bank: total_open_bank_amt,
      online: total_open_online_amt,
      card: total_open_card_amt,
      disc: total_open_disc_amt,
      total: total_open_amt,
    },
    closing: {
      cash: total_close_cash_amt,
      bank: total_close_bank_amt,
      online: total_close_online_amt,
      card: total_close_card_amt,
      disc: total_close_disc_amt,
      total: total_close_amt,
    },
    finalCr: finalCrWithTransfer,
    finalDr: finalDrWithTransfer,
    finalTotal: total_close_final_amt,
  };
};

export const DAYBOOK_SECTIONS = [
  {
    title: "FINANCE ADDED",
    colorClass: "bg-green",
    amtTone: "cr",
  },
  {
    title: "LOAN ADDED",
    colorClass: "bg-purple",
    amtTone: "cr",
  },
  {
    title: "PROCESSING AMOUNT",
    colorClass: "bg-success",
    amtTone: "dr",
  },
  {
    title: "FIRST MONTH INTEREST",
    colorClass: "bg-primary",
    amtTone: "dr",
  },
  {
    title: "ADDITIONAL LOAN PRINCIPAL",
    colorClass: "bg-pink",
    amtTone: "cr",
  },
  {
    title: "TRANSFER LOAN IN",
    colorClass: "bg-info",
    amtTone: "cr",
  },
  {
    title: "TRANSFER LOAN OUT",
    colorClass: "bg-cust-info",
    amtTone: "dr",
  },
  {
    title: "LOAN DEPOSIT",
    colorClass: "bg-blue",
    amtTone: "dr",
  },
  {
    title: "RELEASE LOAN",
    colorClass: "bg-cust-info",
    amtTone: "dr",
  },
  {
    title: "AUCTION LOAN",
    colorClass: "bg-warning",
    amtTone: "dr",
  },
  {
    title: "FINANCE EMI DEPOSIT",
    colorClass: "bg-red",
    amtTone: "dr",
  },
  {
    title: "FINANCE EMI ROLLBACK",
    colorClass: "bg-secondary",
    amtTone: "cr",
  },
  {
    title: PERSONAL_EXPENSES_DAYBOOK_TITLE,
    colorClass: "bg-purple",
    amtTone: "dr",
  },
];
