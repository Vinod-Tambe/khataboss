import React from "react";
import { formatCurrency } from "./profitLossData";

const ProfitLossCompliance = ({ scheduleIII, compliance }) => {
  if (!scheduleIII && !compliance) return null;

  const otherIncome = scheduleIII?.otherIncome || [];
  const gstLines = compliance?.gstSummary?.lines || [];

  return (
    <div className="profit-loss-compliance border border-secondary rounded mt-3 mb-2">
      {compliance && (
        <div className="bg-light border-bottom px-3 py-2 small">
          <div className="fw-semibold text-brown mb-1">
            Statutory Information (India)
          </div>
          <div>
            <span className="text-muted">Financial Year:</span>{" "}
            <strong>{compliance.financialYear || "—"}</strong>
            {" · "}
            <span className="text-muted">Period:</span>{" "}
            {compliance.periodStart || "—"} to {compliance.periodEnd || "—"}
          </div>
          {compliance.gstRegistered ? (
            <div className="mt-1">
              <span className="text-muted">GSTIN:</span>{" "}
              <strong>{compliance.gstin}</strong>
              {compliance.gstRatePercent != null && (
                <>
                  {" · "}
                  <span className="text-muted">GST Rate:</span>{" "}
                  {compliance.gstRatePercent}%
                </>
              )}
            </div>
          ) : (
            <div className="mt-1 text-muted">{compliance.gstNote}</div>
          )}
          {compliance.pan && (
            <div className="mt-1">
              <span className="text-muted">PAN:</span> <strong>{compliance.pan}</strong>
            </div>
          )}
          <div className="mt-1 text-muted">{compliance.booksMaintainedUnder}</div>
        </div>
      )}

      {otherIncome.length > 0 && (
        <div className="px-3 py-2">
          <h6 className="fw-bold text-center text-brown mb-2">
            {scheduleIII?.title || "Other Income (Schedule III — by nature)"}
          </h6>
          <div className="table-responsive">
            <table className="table table-sm table-bordered mb-2">
              <thead className="table-light">
                <tr>
                  <th>Particulars</th>
                  <th className="text-end" style={{ width: "140px" }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {otherIncome.map((row) => (
                  <tr key={row.internalKey || row.particulars}>
                    <td>{row.particulars}</td>
                    <td className="text-end">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
                <tr className="fw-bold table-secondary">
                  <td>Total Other Income</td>
                  <td className="text-end">
                    {formatCurrency(scheduleIII?.totalOtherIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gstLines.length > 0 && (
        <div className="px-3 pb-2 small">
          <div className="fw-semibold mb-1">Output GST (period)</div>
          <ul className="mb-0 ps-3">
            {gstLines.map((line) => (
              <li key={line.account}>
                {line.account}: ₹{formatCurrency(line.amount)}
              </li>
            ))}
          </ul>
          <div className="fw-semibold mt-1">
            Total Output GST: ₹{formatCurrency(compliance?.gstSummary?.totalOutputGst)}
          </div>
        </div>
      )}

      {compliance?.scheduleIIIDisclaimer && (
        <div className="border-top px-3 py-2 small text-muted">
          {compliance.scheduleIIIDisclaimer}
        </div>
      )}
    </div>
  );
};

export default ProfitLossCompliance;
