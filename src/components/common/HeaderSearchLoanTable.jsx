import React from "react";
import {
  HEADER_SEARCH_LOAN_COLUMNS,
  buildLoanSearchTableRow,
} from "../../utils/headerSearchFormatters";
import HeaderSearchResultTable from "./HeaderSearchResultTable";

const HeaderSearchLoanTable = ({
  loanItems = [],
  items = [],
  activeIndex = -1,
  onSelect,
  onAction,
}) => {
  const entries = loanItems.map((item) => ({
    key: item.key,
    item,
    cells: buildLoanSearchTableRow(item.loan),
  }));

  const renderActions = (searchItem) => (
    <div className="header-search__actions header-search__actions--table">
      <button
        type="button"
        className="header-search__action is-loan"
        title="Open Loan"
        onClick={() => onSelect(searchItem)}
      >
        <i className="bi bi-bank" aria-hidden="true"></i>
      </button>
      {searchItem.user ? (
        <button
          type="button"
          className="header-search__action is-home"
          title="Customer Home"
          onClick={(e) => onAction(e, searchItem.user, "home")}
        >
          <i className="bi bi-house-door-fill" aria-hidden="true"></i>
        </button>
      ) : null}
    </div>
  );

  return (
    <HeaderSearchResultTable
      label={`Loan (${loanItems.length})`}
      columns={HEADER_SEARCH_LOAN_COLUMNS}
      entries={entries}
      items={items}
      activeIndex={activeIndex}
      linkKeys={["loanNo", "customerName"]}
      statusKey="status"
      onSelect={onSelect}
      renderActions={renderActions}
    />
  );
};

export default HeaderSearchLoanTable;
