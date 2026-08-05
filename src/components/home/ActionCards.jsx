import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import QuickAddUserModal from '../user/QuickAddUserModal'
import FinanceCollectionModal from '../finance/FinanceCollectionModal'
import LoanCollectionModal from '../loan/LoanCollectionModal'

const actionItems = [
  {
    title: "Finance Collection",
    icon: "bi-currency-rupee",
    color: "warning",
    isModal: true
  },
  {
    title: "Loan Collection",
    icon: "bi-bank",
    color: "danger",
    isModal: true
  },
  {
    title: "Add User",
    icon: "bi-person-plus",
    color: "success",
    isModal: true
  },
  {
    title: "Add Staff",
    icon: "bi-people",
    color: "primary",
    to: "/staff/add"
  },
  {
    title: "Add Firm",
    icon: "bi-building",
    color: "info",
    to: "/firm/add"
  },
  {
    title: "Daybook",
    icon: "bi-journal-text",
    color: "secondary",
    to: "/daybook"
  },
  {
    title: "Balance Sheet",
    icon: "bi-clipboard-check",
    color: "success",
    to: "/balance-sheet"
  },
  {
    title: "Trial Balance",
    icon: "bi-calculator",
    color: "info",
    to: "/trial-balance"
  },
  {
    title: "Profit/Loss",
    icon: "bi-graph-up-arrow",
    color: "primary",
    to: "/profit-loss"
  },
  {
    title: "User List",
    icon: "bi-list-ul",
    color: "info",
    to: "/user/grid"
  },
  {
    title: "Staff List",
    icon: "bi-person-badge",
    color: "primary",
    to: "/staff/grid"
  },
  {
    title: "Ledger",
    icon: "bi-journal-bookmark",
    color: "secondary",
    to: "#"
  },
]

const ActionCards = ({ firms, selectedFirmId }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const handleItemClick = (item) => {
    if (item.title === "Add User") {
      setShowModal(true);
    } else if (item.title === "Finance Collection") {
      setShowFinanceModal(true);
    } else if (item.title === "Loan Collection") {
      setShowLoanModal(true);
    }
  };

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

      <QuickAddUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        firms={firms}
        selectedFirmId={selectedFirmId}
      />

      <FinanceCollectionModal
        show={showFinanceModal}
        onClose={() => setShowFinanceModal(false)}
        firms={firms}
        selectedFirmId={selectedFirmId}
      />

      <LoanCollectionModal
        show={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        firms={firms}
        selectedFirmId={selectedFirmId}
      />
    </>
  )
}

export default ActionCards;
