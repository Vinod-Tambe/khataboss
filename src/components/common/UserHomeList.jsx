 import React from "react";
 
 const UserHomeList = ({ title, data }) =>{ return (
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
              <th className="sticky-col">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="sticky-col">{row.name}</td>
                <td>{row.email}</td>
                <td>{row.phone}</td>
                <td>{row.city}</td>
                <td>{row.company}</td>
                <td>
                  <span
                    className={`badge ${
                      row.status === "Active"
                        ? "bg-success"
                        : "bg-secondary"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )};

  export default UserHomeList;