export const formatCurrency = (val) =>
  Math.abs(parseFloat(val) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
  const process = parseFloat(item.db_process_amt) || 0;
  const charge = parseFloat(item.db_charge_amt) || 0;
  const total = parseFloat(item.db_total_amt) || process + charge;
  return { process, charge, total };
};

export const calculateProcessingSectionTotals = (data = []) =>
  data.reduce(
    (acc, item) => {
      const row = getProcessingRowAmounts(item);
      acc.process += row.process;
      acc.charge += row.charge;
      acc.total += row.total;
      return acc;
    },
    { process: 0, charge: 0, total: 0 }
  );

export const isProcessingDaybookSection = (title) => title === "PROCESSING AMOUNT";

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

  const total_today_cash_in_amt =
    parseFloat(Finance_emi_deposit_data.total_cash_amt || 0) +
    parseFloat(Loan_deposit_data.total_cash_amt || 0) +
    parseFloat(Release_loan_data.total_cash_amt || 0) +
    parseFloat(Auction_loan_data.total_cash_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_cash_amt || 0);

  const total_today_bank_in_amt =
    parseFloat(Finance_emi_deposit_data.total_bank_amt || 0) +
    parseFloat(Loan_deposit_data.total_bank_amt || 0) +
    parseFloat(Release_loan_data.total_bank_amt || 0) +
    parseFloat(Auction_loan_data.total_bank_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_bank_amt || 0);

  const total_today_online_in_amt =
    parseFloat(Finance_emi_deposit_data.total_online_amt || 0) +
    parseFloat(Loan_deposit_data.total_online_amt || 0) +
    parseFloat(Release_loan_data.total_online_amt || 0) +
    parseFloat(Auction_loan_data.total_online_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_online_amt || 0);

  const total_today_card_in_amt =
    parseFloat(Finance_emi_deposit_data.total_card_amt || 0) +
    parseFloat(Loan_deposit_data.total_card_amt || 0) +
    parseFloat(Release_loan_data.total_card_amt || 0) +
    parseFloat(Auction_loan_data.total_card_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_card_amt || 0);

  const total_today_disc_in_amt =
    parseFloat(Finance_emi_deposit_data.total_disc_amt || 0) +
    parseFloat(Loan_deposit_data.total_disc_amt || 0) +
    parseFloat(Release_loan_data.total_disc_amt || 0) +
    parseFloat(Auction_loan_data.total_disc_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_disc_amt || 0);

  const total_today_in_amt =
    parseFloat(Finance_emi_deposit_data.total_amt || 0) +
    parseFloat(Loan_deposit_data.total_amt || 0) +
    parseFloat(Release_loan_data.total_amt || 0) +
    parseFloat(Auction_loan_data.total_amt || 0) +
    parseFloat(Transfer_loan_out_data.total_amt || 0);

  const Finance_added_data = DayBookData?.["FINANCE ADDED"] || {};
  const Finance_emi_rollback_data = DayBookData?.["FINANCE EMI ROLLBACK"] || {};
  const Loan_added_data = DayBookData?.["LOAN ADDED"] || {};
  const Additional_principal_data = DayBookData?.["ADDITIONAL LOAN PRINCIPAL"] || {};
  const Transfer_loan_in_data = DayBookData?.["TRANSFER LOAN IN"] || {};

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

  const total_today_cash_amt = total_today_cash_in_amt - total_today_cash_out_amt;
  const total_today_bank_amt = total_today_bank_in_amt - total_today_bank_out_amt;
  const total_today_card_amt = total_today_card_in_amt - total_today_card_out_amt;
  const total_today_online_amt = total_today_online_in_amt - total_today_online_out_amt;
  const total_today_disc_amt = total_today_disc_in_amt - total_today_disc_out_amt;
  const total_today_amt = total_today_in_amt - total_today_out_amt;

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
  const total_close_final_amt =
    total_open_amt + (total_final_dr_amt - total_final_cr_amt);

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
    finalCr: total_final_cr_amt,
    finalDr: total_final_dr_amt,
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
];
