import React from "react";
import { DAYBOOK_PAGE_LENGTH_OPTIONS } from "./daybookTableDisplay";

const DaybookSectionTableToolbar = ({
  search,
  onSearchChange,
  pageLength,
  onPageLengthChange,
  searchPlaceholder = "Search…",
}) => (
  <div className="daybook-section-table__controls d-flex align-items-center flex-wrap gap-2 me-2 my-2">
    <input
      type="search"
      className="form-control form-control-sm border border-dark daybook-section-table__search"
      placeholder={searchPlaceholder}
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <select
      className="form-select form-select-sm daybook-page-length-select"
      value={pageLength}
      onChange={(e) => onPageLengthChange(Number(e.target.value))}
      aria-label="Rows to show"
    >
      {DAYBOOK_PAGE_LENGTH_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default DaybookSectionTableToolbar;
