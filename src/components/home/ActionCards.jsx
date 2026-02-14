import React from 'react'
import { Link } from 'react-router-dom'

const actionItems = [
  {
    title: "Add User",
    icon: "bi-person-plus",
    color: "success",
    to: "/user/add"
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
    title: "Quick Finance",
    icon: "bi-currency-rupee",
    color: "warning",
    to: "#"
  },
  {
    title: "Quick Loan",
    icon: "bi-hand-thumbs-up",
    color: "danger",
    to: "#"
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

const ActionCards = () => {
  return (
    <div className="row g-4 mt-1">
      {actionItems.map((item, index) => (
        <div key={index} className="col-4 col-md-2">
          <Link to={item.to} className="action-card border">
            <div className="card-content">
              <div 
                className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1`}
              >
                <i className={`bi ${item.icon} fs-4`}></i>
              </div>
              <p className="text-muted mb-1 fw-medium small">{item.title}</p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default ActionCards