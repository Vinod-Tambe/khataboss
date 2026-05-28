import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import QuickAddUserModal from '../user/QuickAddUserModal'
import FinanceCollectionModal from '../finance/FinanceCollectionModal'

const actionItems = [
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
    title: "Finance Collection",
    icon: "bi-currency-rupee",
    color: "warning",
    isModal: true
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

const ActionCards = ({ firms, selectedFirmId }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  const handleItemClick = (item) => {
    if (item.title === "Add User") {
      setShowModal(true);
    } else if (item.title === "Finance Collection") {
      setShowFinanceModal(true);
    }
  };

  return (
    <>
      <div className="row g-4 mt-1">
        {actionItems.map((item, index) => (
          <div key={index} className="col-4 col-md-2">

            {/* ✅ MODAL ITEM */}
            {item.isModal ? (
              <div
                className="action-card border cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();     // 🔥 stop any navigation
                  e.stopPropagation();    // 🔥 stop bubbling
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
              /* ✅ NORMAL NAVIGATION */
              <Link
                to={item.to}
                className="action-card border"
                onClick={(e) => {
                  if (item.to === "#") e.preventDefault(); // avoid page jump
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

      {/* ✅ MODAL */}
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
    </>
  )
}

export default ActionCards;





// const ActionCards = () => {
//   return (
//     <div className="row g-4 mt-1">
//       {actionItems.map((item, index) => (
//         <div key={index} className="col-4 col-md-2">
//           <Link to={item.to} className="action-card border">
//             <div className="card-content">
//               <div 
//                 className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1`}
//               >
//                 <i className={`bi ${item.icon} fs-4`}></i>
//               </div>
//               <p className="text-muted mb-1 fw-medium small">{item.title}</p>
//             </div>
//           </Link>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default ActionCards