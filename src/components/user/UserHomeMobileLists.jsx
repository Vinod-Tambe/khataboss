import React, { useState } from "react";
import { getStatusBadgeMeta } from "../../utils/listFormatters";
import "../../css/DataTable.css";

const StatusBadge = ({ status }) => {
  const { label, className } = getStatusBadgeMeta(status);
  return <span className={className}>{label}</span>;
};

const SectionPanel = ({ title, icon, count, children }) => (
  <div className="user-home-mobile-panel is-open">
    <div className="user-home-mobile-panel__header is-static">
      <span className="user-home-mobile-panel__title d-inline-flex align-items-center gap-2">
        {icon && <i className={`bi ${icon}`}></i>}
        {title}
      </span>
      <span className="user-home-mobile-panel__header-right">
        <span className="user-home-mobile-panel__count">{count}</span>
      </span>
    </div>
    <div className="user-home-mobile-list">{children}</div>
  </div>
);

const DetailGrid = ({ items = [] }) => (
  <div className="user-home-mobile-row__grid">
    {items.map((item) => (
      <div key={item.label} className={item.full ? "is-full" : undefined}>
        <span>{item.label}</span>
        {item.node || <strong>{item.value}</strong>}
      </div>
    ))}
  </div>
);

const RecordRow = ({
  rowKey,
  expanded,
  onToggle,
  title,
  subtitle,
  amount,
  status,
  onTitleClick,
  children,
}) => (
  <div className={`user-home-mobile-row ${expanded ? "is-open" : ""}`}>
    <div className="user-home-mobile-row__main">
      <div className="user-home-mobile-row__left">
        {onTitleClick ? (
          <button
            type="button"
            className="user-home-mobile-row__id"
            onClick={onTitleClick}
          >
            {title}
          </button>
        ) : (
          <span className="user-home-mobile-row__id is-static">{title}</span>
        )}
        {subtitle && (
          <button
            type="button"
            className="user-home-mobile-row__meta"
            onClick={() => onToggle(rowKey)}
          >
            {subtitle}
          </button>
        )}
      </div>

      <button
        type="button"
        className="user-home-mobile-row__center"
        onClick={() => onToggle(rowKey)}
      >
        <strong className="user-home-mobile-row__amount">{amount}</strong>
      </button>

      <button
        type="button"
        className="user-home-mobile-row__right"
        onClick={() => onToggle(rowKey)}
        aria-expanded={expanded}
        aria-label={expanded ? "Hide details" : "Show details"}
      >
        {status ? <StatusBadge status={status} /> : null}
        <i
          className={`bi user-home-collapse-icon ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
          aria-hidden="true"
        />
      </button>
    </div>
    {expanded && (
      <div className="user-home-mobile-row__details">{children}</div>
    )}
  </div>
);

const UserHomeMobileLists = ({
  financeList = [],
  loanList = [],
  transactionList = [],
  onViewFinance,
  onViewLoan,
  getTransactionLink,
}) => {
  const [expandedKey, setExpandedKey] = useState(null);

  const toggleRecord = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  if (!financeList.length && !loanList.length && !transactionList.length) {
    return null;
  }

  return (
    <div className="user-home-mobile d-md-none">
      {financeList.length > 0 && (
        <SectionPanel title="Active Finance List" icon="bi-cash-stack" count={financeList.length}>
          {financeList.map((row) => {
            const key = `finance-${row.id}`;
            return (
              <RecordRow
                key={key}
                rowKey={key}
                expanded={expandedKey === key}
                onToggle={toggleRecord}
                title={row.finNo}
                subtitle={row.startDate}
                amount={row.principal}
                status={row.status}
                onTitleClick={() => onViewFinance?.(row.id)}
              >
                <DetailGrid
                  items={[
                    { label: "Status", node: <StatusBadge status={row.status} /> },
                    { label: "Start Date", value: row.startDate },
                    { label: "T.Period", value: row.timePeriod },
                    { label: "Principal", value: row.principal },
                    { label: "EMI Amt", value: row.emi },
                    { label: "EMIs Paid", value: row.emiProgress },
                    { label: "Collected", value: row.collectedAmt },
                    { label: "Pending Amt", value: row.pendingAmt },
                    { label: "ROI", value: row.roi },
                    { label: "Frequency", value: row.freq },
                    { label: "Final Amt", value: row.finalAmt },
                    { label: "Firm", value: row.firmName, full: true },
                    {
                      label: "Action",
                      full: true,
                      node: (
                        <button
                          type="button"
                          className="user-home-mobile-row__link"
                          onClick={() => onViewFinance?.(row.id)}
                        >
                          View Finance Details
                        </button>
                      ),
                    },
                  ]}
                />
              </RecordRow>
            );
          })}
        </SectionPanel>
      )}

      {loanList.length > 0 && (
        <SectionPanel title="Active Loan List" icon="bi-bank" count={loanList.length}>
          {loanList.map((row) => {
            const key = `loan-${row.id}`;
            return (
              <RecordRow
                key={key}
                rowKey={key}
                expanded={expandedKey === key}
                onToggle={toggleRecord}
                title={row.loanNo}
                subtitle={row.startDate}
                amount={row.principal}
                status={row.status}
                onTitleClick={() => onViewLoan?.(row.id)}
              >
                <DetailGrid
                  items={[
                    { label: "Status", node: <StatusBadge status={row.status} /> },
                    { label: "Type", value: row.type },
                    { label: "Start Date", value: row.startDate },
                    { label: "End Date", value: row.endDate },
                    { label: "T.Period", value: row.timePeriod },
                    { label: "Principal", value: row.principal },
                    { label: "Interest", value: row.interest },
                    { label: "Processing", value: row.processing },
                    { label: "Final Pay", value: row.finalPay },
                    { label: "Profit/Loss", value: row.profitLoss },
                    {
                      label: "Action",
                      full: true,
                      node: (
                        <button
                          type="button"
                          className="user-home-mobile-row__link"
                          onClick={() => onViewLoan?.(row.id)}
                        >
                          View Loan Details
                        </button>
                      ),
                    },
                  ]}
                />
              </RecordRow>
            );
          })}
        </SectionPanel>
      )}

      {transactionList.length > 0 && (
        <SectionPanel title="Last Transaction" icon="bi-arrow-left-right" count={transactionList.length}>
          {transactionList.map((row) => {
            const key = `transaction-${row.id}`;
            const link = getTransactionLink?.(row) || {
              label: row.category,
              onClick: undefined,
            };
            return (
              <RecordRow
                key={key}
                rowKey={key}
                expanded={expandedKey === key}
                onToggle={toggleRecord}
                title={row.transNo}
                subtitle={row.date}
                amount={row.amount}
                status={row.status || "Active"}
              >
                <DetailGrid
                  items={[
                    {
                      label: "Category",
                      full: true,
                      node: (
                        <button
                          type="button"
                          className="user-home-mobile-row__link"
                          onClick={link.onClick}
                          disabled={!link.onClick}
                        >
                          {link.label}
                        </button>
                      ),
                    },
                  ]}
                />
              </RecordRow>
            );
          })}
        </SectionPanel>
      )}
    </div>
  );
};

export default UserHomeMobileLists;
