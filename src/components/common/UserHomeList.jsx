import React from "react";
import { getStatusBadgeMeta } from "../../utils/listFormatters";
import "../../css/DataTable.css";

const UserHomeList = ({ title, icon, data, columns }) => {
  const defaultColumns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Phone", key: "phone" },
    { header: "City", key: "city" },
    { header: "Company", key: "company" },
    { header: "Status", key: "status" },
  ];

  const tableColumns = columns || defaultColumns;

  return (
    <div className="card p-3 pt-1 shadow-sm mb-4">
      <h5 className="mb-2 text-center text-brown p-0 m-0 fw-semibold mt-2 d-flex align-items-center justify-content-center gap-2">
        {icon && <i className={`bi ${icon}`}></i>}
        <span>{title}</span>
      </h5>

      <style>{`
        
        .sticky-col {
          position: sticky;
          left: 0;
          background: #fff;
          z-index: 2;
        }
        thead th {
          position: sticky;
          top: 0;
          background: #f8f9fa;
          z-index: 3;
        }
      `}</style>

      <div className="table-wrapper position-relative table-responsive-custom" style={{ overflowX: "auto" }}>
        <table className="table table-hover table-bordered border-secondary mb-2 dataTable dtr-inline text-capitalize dynamic-data-table">
          <thead className="table-secondary border-bottom border-dark-subtle">
            <tr>
              {tableColumns.map((col, idx) => (
                <th key={idx} className={idx === 0 ? "sticky-col" : ""}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {tableColumns.map((col, colIdx) => (
                    <td key={colIdx} className={colIdx === 0 ? "sticky-col" : ""}>
                      {col.render ? (
                        col.render(row)
                      ) : col.key === "status" ? (
                        (() => {
                          const { label, className } = getStatusBadgeMeta(row[col.key]);
                          return <span className={className}>{label}</span>;
                        })()
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-3">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserHomeList;
