import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import usePermissions from '../../hooks/usePermissions'

import QuickAddUserModal from '../user/QuickAddUserModal'
import FinanceCollectionModal from '../finance/FinanceCollectionModal'
import LoanCollectionModal from '../loan/LoanCollectionModal'

const allActionItems = [
  {
    title: "Finance Collection",
    icon: "bi-currency-rupee",
    color: "warning",
    isModal: true,
    permission: "finance.payment",
  },
  {
    title: "Loan Collection",
    icon: "bi-bank",
    color: "danger",
    isModal: true,
    permission: "loan.deposit",
  },
  {
    title: "Add User",
    icon: "bi-person-plus",
    color: "success",
    isModal: true,
    permission: "user.create",
  },
  {
    title: "Add Staff",
    icon: "bi-people",
    color: "primary",
    to: "/staff/add",
    permission: "staff.create",
  },
  {
    title: "Add Firm",
    icon: "bi-building",
    color: "info",
    to: "/firm/add",
    permission: "firm.create",
  },
  {
    title: "Daybook",
    icon: "bi-journal-text",
    color: "secondary",
    to: "/daybook",
    permission: "reports.daybook",
  },
  {
    title: "Balance Sheet",
    icon: "bi-clipboard-check",
    color: "success",
    to: "/balance-sheet",
    permission: "reports.balanceSheet",
  },
  {
    title: "Trial Balance",
    icon: "bi-calculator",
    color: "info",
    to: "/trial-balance",
    permission: "reports.trialBalance",
  },
  {
    title: "Profit/Loss",
    icon: "bi-graph-up-arrow",
    color: "primary",
    to: "/profit-loss",
    permission: "reports.profitLoss",
  },
  {
    title: "User List",
    icon: "bi-list-ul",
    color: "info",
    to: "/user/grid",
    permission: "user.view",
  },
  {
    title: "Staff List",
    icon: "bi-person-badge",
    color: "primary",
    to: "/staff/grid",
    permission: "staff.view",
  },
  {
    title: "Ledger",
    icon: "bi-journal-bookmark",
    color: "secondary",
    to: "/ledger/loan",
    permission: "loan.view",
  },
]

const ActionCards = ({ firms, selectedFirmId }) => {
  const { can } = usePermissions();
  const [showModal, setShowModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const actionItems = useMemo(
    () => allActionItems.filter((item) => !item.permission || can(item.permission)),
    [can]
  );

  const handleItemClick = (item) => {
    if (item.title === "Add User") {
      setShowModal(true);
    } else if (item.title === "Finance Collection") {
      setShowFinanceModal(true);
    } else if (item.title === "Loan Collection") {
      setShowLoanModal(true);
    }
  };

  if (!actionItems.length) return null;

  return (
    <>
      <div className="row g-4 mt-1">
        {actionItems.map((item, index) => (
          <div key={index} className="col-4 col-md-2">

            {item.isModal ? (
              <div
                className="action-card border cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleItemClick(item);
                }}
              >
                <div className="card-content text-center">
                  <div className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1`}>
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                  <p className="text-muted small">{item.title}</p>
                </div>
              </div>
            ) : (
              <Link
                to={item.to}
                className="action-card border"
                onClick={(e) => {
                  if (item.to === "#") e.preventDefault();
                }}
              >
                <div className="card-content text-center">
                  <div className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1`}>
                    <i className={`bi ${item.icon} fs-4`}></i>
                  </div>
                  <p className="text-muted small">{item.title}</p>
                </div>
              </Link>
            )}

          </div>
        ))}
      </div>

      {can("user.create") && (
        <QuickAddUserModal
          show={showModal}
          onClose={() => setShowModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}

      {can("finance.payment") && (
        <FinanceCollectionModal
          show={showFinanceModal}
          onClose={() => setShowFinanceModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}

      {can("loan.deposit") && (
        <LoanCollectionModal
          show={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}
    </>
  )
}

export default ActionCards;
