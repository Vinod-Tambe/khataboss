import React from 'react'

const actionItems = [
  {
    title: "Add User",
    icon: "bi-person-plus",
    color: "success",
    href: "/user/add"
  },
  {
    title: "Add Staff",
    icon: "bi-people",
    color: "primary",
    href: "staff/add"
  },
  {
    title: "Add Firm",
    icon: "bi-building",
    color: "info",
    href: "firm/add"
  },
  {
    title: "Quick Finance",
    icon: "bi-currency-rupee",
    color: "warning",
    href: "#"
  },
  {
    title: "Quick Loan",
    icon: "bi-hand-thumbs-up",
    color: "danger",
    href: "#"
  },
  {
    title: "Daybook",
    icon: "bi-journal-text",
    color: "secondary",
    href: "#"
  },
  {
    title: "Balance Sheet",
    icon: "bi-clipboard-check",
    color: "success",
    href: "#"
  },
  {
    title: "Trial Balance",
    icon: "bi-calculator",
    color: "info",
    href: "#"
  },
  {
    title: "Profit/Loss",
    icon: "bi-graph-up-arrow",
    color: "primary",
    href: "#"
  },
  {
    title: "User List",
    icon: "bi-list-ul",
    color: "info",
    href: "user/list"
  },
  {
    title: "Staff List",
    icon: "bi-person-badge",
    color: "primary",
    href: "staff/add"
  },
  {
    title: "Ledger",
    icon: "bi-journal-bookmark",
    color: "secondary",
    href: "#"
  },
]

const ActionCards = () => {
  return (
    <div className="row g-4 mt-1">
      {actionItems.map((item, index) => (
        <div key={index} className="col-4 col-md-2">
          <a href={item.href} className="action-card border">
            <div className="card-content">
              <div 
                className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1`}
              >
                <i className={`bi ${item.icon} fs-4`}></i>
              </div>
              <p className="text-muted mb-1 fw-medium small">{item.title}</p>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}

export default ActionCards