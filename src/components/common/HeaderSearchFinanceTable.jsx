import React from "react";
import {
  HEADER_SEARCH_FINANCE_COLUMNS,
  buildFinanceSearchTableRow,
} from "../../utils/headerSearchFormatters";
import HeaderSearchResultTable from "./HeaderSearchResultTable";

const HeaderSearchFinanceTable = ({
  financeItems = [],
  items = [],
  activeIndex = -1,
  onSelect,
  onAction,
}) => {
  const entries = financeItems.map((item) => ({
    key: item.key,
    item,
    cells: buildFinanceSearchTableRow(item.finance),
  }));

  const renderActions = (searchItem) => (
    <div className="header-search__actions header-search__actions--table">
      <button
        type="button"
        className="header-search__action is-finance"
        title="Open Finance"
        onClick={() => onSelect(searchItem)}
      >
        <i className="bi bi-cash-stack" aria-hidden="true"></i>
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
      label={`Finance (${financeItems.length})`}
      columns={HEADER_SEARCH_FINANCE_COLUMNS}
      entries={entries}
      items={items}
      activeIndex={activeIndex}
      linkKeys={["finNo", "customerName"]}
      statusKey="status"
      onSelect={onSelect}
      renderActions={renderActions}
    />
  );
};

export default HeaderSearchFinanceTable;
