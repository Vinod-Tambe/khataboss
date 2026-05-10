 import React from "react";
 
 const UserHomeList = ({ title, data, columns }) =>{ 
   
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
    <div className="container-fluid p-0 m-0 border border-1 mb-4">
      <h5 className="fw-bolder text-center my-2">{title}</h5>

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

      <div className="table-responsive table-responsive-custom">
        <table className="table table-bordered table-striped text-nowrap pb-0 mb-0">
          <thead>
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
                        <span
                          className={`badge ${
                            row[col.key] === "Active" || row[col.key] === "ACTIVE" || row[col.key] === "PAID"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {row[col.key]}
                        </span>
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
  )};

  export default UserHomeList;