import React from "react";

/**
 * Live password policy checklist — Rule | Requirement table with pass/fail icons while typing.
 */
const PasswordRequirementsPanel = ({ checks = [], password = "", className = "" }) => {
  const hasInput = String(password || "").length > 0;

  if (!checks.length) return null;

  return (
    <div className={`password-requirements border rounded p-3 bg-light ${className}`.trim()}>
      <div className="fw-semibold small mb-2">Password requirements</div>
      <div className="table-responsive">
        <table className="table table-sm table-bordered mb-0 small password-requirements__table bg-white">
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: "30%" }}>
                Rule
              </th>
              <th scope="col">Requirement</th>
              <th scope="col" className="text-center" style={{ width: "48px" }} aria-label="Status">
                ✓
              </th>
            </tr>
          </thead>
          <tbody>
            {checks.map((item) => {
              const statusClass = hasInput
                ? item.ok
                  ? "table-success"
                  : "table-danger"
                : "";

              return (
                <tr key={item.key} className={statusClass}>
                  <td className="fw-semibold align-middle">{item.rule}</td>
                  <td className="align-middle">{item.requirement}</td>
                  <td className="align-middle text-center">
                    <i
                      className={`bi ${
                        hasInput
                          ? item.ok
                            ? "bi-check-circle-fill text-success"
                            : "bi-x-circle-fill text-danger"
                          : "bi-circle text-muted"
                      }`}
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PasswordRequirementsPanel;
