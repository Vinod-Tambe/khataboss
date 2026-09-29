export const PERSONAL_EXPENSE_MODULE_LABEL = "Personal Expenses";
export const PERSONAL_EXPENSE_FORM_TITLE = "Personal Expense Entry";
export const PERSONAL_EXPENSE_LIST_TITLE = "Personal Expense List";
export const PERSONAL_EXPENSES_DAYBOOK_TITLE = "PERSONAL EXPENSES";
/** @deprecated API may still return this title until backend is updated */
export const LEGACY_INTER_ACCOUNT_DAYBOOK_TITLE = "INTER-ACCOUNT TRANSFER";

export const getPersonalExpenseDaybookSection = (dayBookData = {}) =>
  dayBookData[PERSONAL_EXPENSES_DAYBOOK_TITLE] ||
  dayBookData[LEGACY_INTER_ACCOUNT_DAYBOOK_TITLE] ||
  {};

export const isPersonalExpensesDaybookSection = (title) =>
  title === PERSONAL_EXPENSES_DAYBOOK_TITLE || title === LEGACY_INTER_ACCOUNT_DAYBOOK_TITLE;
