import React from "react";

const HeaderSearchResultTable = ({
  label,
  sectionClassName = "",
  columns = [],
  entries = [],
  items = [],
  activeIndex = -1,
  linkKeys = [],
  statusKey = "status",
  onSelect,
  renderActions,
}) => {
  if (!entries.length) return null;

  const linkSet = new Set(linkKeys);

  const renderStatus = (value) => {
    const text = String(value || "—");
    const normalized = text.toLowerCase();
    let tone = "neutral";
    if (normalized === "active") tone = "active";
    else if (normalized === "deleted" || normalized === "closed") tone = "deleted";
    return <span className={`header-search__status is-${tone}`}>{text}</span>;
  };

  return (
    <div className={`header-search__result-section${sectionClassName ? ` ${sectionClassName}` : ""}`}>
      {label ? <div className="header-search__table-label">{label}</div> : null}
      <div className="header-search__customer-table-wrap">
        <table className="header-search__customer-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col">{col.title}</th>
              ))}
              {renderActions ? (
                <th scope="col" className="header-search__customer-th-actions">Action</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ key, item, cells }) => {
              const rowIndex = items.indexOf(item);
              return (
                <tr
                  key={key}
                  className={rowIndex === activeIndex ? "is-active" : ""}
                >
                  {columns.map((col) => (
                    <td key={col.key} title={cells[col.key]}>
                      {linkSet.has(col.key) ? (
                        <button
                          type="button"
                          className="header-search__customer-link"
                          onClick={() => onSelect?.(item)}
                        >
                          {cells[col.key]}
                        </button>
                      ) : col.key === statusKey ? (
                        renderStatus(cells[col.key])
                      ) : (
                        cells[col.key]
                      )}
                    </td>
                  ))}
                  {renderActions ? (
                    <td className="header-search__customer-actions-cell">
                      {renderActions(item)}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeaderSearchResultTable;
