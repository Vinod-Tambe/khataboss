import React from "react";
import {
  HEADER_SEARCH_CUSTOMER_COLUMNS,
  buildCustomerSearchTableRow,
} from "../../utils/customerFormatters";
import HeaderSearchResultTable from "./HeaderSearchResultTable";

const HeaderSearchCustomerTable = ({
  customerItems = [],
  items = [],
  activeIndex = -1,
  onSelect,
  onAction,
  canCreateFinance,
  canCreateLoan,
  canFinancePayment,
  canLoanDeposit,
}) => {
  const entries = customerItems.map((item) => ({
    key: item.key,
    item,
    cells: buildCustomerSearchTableRow(item.user),
  }));

  const renderActions = (searchItem) => {
    const user = searchItem.user;
    return (
      <div className="header-search__actions header-search__actions--table">
        <button
          type="button"
          className="header-search__action is-home"
          title="Customer Home"
          onClick={(e) => onAction(e, user, "home")}
        >
          <i className="bi bi-house-door-fill" aria-hidden="true"></i>
        </button>
        {canCreateFinance && (
          <button
            type="button"
            className="header-search__action is-finance"
            title="Add Finance"
            onClick={(e) => onAction(e, user, "finance")}
          >
            <i className="bi bi-plus-circle-fill" aria-hidden="true"></i>
          </button>
        )}
        {canCreateLoan && (
          <button
            type="button"
            className="header-search__action is-loan"
            title="Add Loan"
            onClick={(e) => onAction(e, user, "loan")}
          >
            <i className="bi bi-bank" aria-hidden="true"></i>
          </button>
        )}
        {canFinancePayment && (
          <button
            type="button"
            className="header-search__action is-pay"
            title="Finance Pay"
            onClick={(e) => onAction(e, user, "financePay")}
          >
            <i className="bi bi-currency-rupee" aria-hidden="true"></i>
          </button>
        )}
        {canLoanDeposit && (
          <button
            type="button"
            className="header-search__action is-deposit"
            title="Loan Deposit"
            onClick={(e) => onAction(e, user, "loanDeposit")}
          >
            <i className="bi bi-safe2-fill" aria-hidden="true"></i>
          </button>
        )}
      </div>
    );
  };

  return (
    <HeaderSearchResultTable
      label={`Customer (${customerItems.length})`}
      sectionClassName="header-search__result-section--customer"
      columns={HEADER_SEARCH_CUSTOMER_COLUMNS}
      entries={entries}
      items={items}
      activeIndex={activeIndex}
      linkKeys={["userCode", "customerName"]}
      statusKey="status"
      onSelect={onSelect}
      renderActions={(searchItem) => renderActions(searchItem)}
    />
  );
};

export default HeaderSearchCustomerTable;
