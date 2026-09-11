import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import usePermissions from '../../hooks/usePermissions';
import QuickAddUserModal from '../user/QuickAddUserModal';
import FinanceCollectionModal from '../finance/FinanceCollectionModal';
import LoanCollectionModal from '../loan/LoanCollectionModal';
import InterestCalculatorModal from './InterestCalculatorModal';
import { allQuickActionItems } from './quickActionItems';

const DashboardQuickActions = ({ firms, selectedFirmId }) => {
  const { can } = usePermissions();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);

  const visibleQuickActions = allQuickActionItems.filter(
    (item) => !item.permission || can(item.permission)
  );

  const ensurePermission = (item) => {
    if (!item.permission || can(item.permission)) return true;
    toast.error('You do not have permission for this action.');
    return false;
  };

  const handleItemClick = (item) => {
    if (!ensurePermission(item)) return;
    if (item.modalKey === 'calculator') setShowCalculatorModal(true);
    else if (item.title === 'Add User') setShowUserModal(true);
    else if (item.title === 'Finance Collection') setShowFinanceModal(true);
    else if (item.title === 'Loan Collection') setShowLoanModal(true);
  };

  const handleLinkClick = (event, item) => {
    if (!ensurePermission(item)) {
      event.preventDefault();
    }
  };

  return (
    <div className="dashboard-quick-actions">
      <h5 className="fw-bold text-brown mb-3">
        <i className="bi bi-lightning-charge-fill me-2 text-warning" />
        Quick Actions
      </h5>

      <div className="dashboard-quick-actions__grid" role="list">
          {visibleQuickActions.map((item) => (
            <div key={item.title} className="dashboard-quick-actions__item" role="listitem">
              {item.isModal ? (
                <button
                  type="button"
                  className="action-card border w-100"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="card-content text-center">
                    <div
                      className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1 mx-auto`}
                    >
                      <i className={`bi ${item.icon} fs-5`} />
                    </div>
                    <p className="text-muted small mb-0">{item.title}</p>
                  </div>
                </button>
              ) : (
                <Link
                  to={item.to}
                  className="action-card border w-100"
                  onClick={(event) => handleLinkClick(event, item)}
                >
                  <div className="card-content text-center">
                    <div
                      className={`card-icon bg-${item.color}-subtle text-${item.color} rounded-circle d-flex align-items-center justify-content-center mb-1 mx-auto`}
                    >
                      <i className={`bi ${item.icon} fs-5`} />
                    </div>
                    <p className="text-muted small mb-0">{item.title}</p>
                  </div>
                </Link>
              )}
            </div>
          ))}
      </div>

      {can('user.create') && (
        <QuickAddUserModal
          show={showUserModal}
          onClose={() => setShowUserModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}

      {can('finance.payment') && (
        <FinanceCollectionModal
          show={showFinanceModal}
          onClose={() => setShowFinanceModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}

      {can('loan.deposit') && (
        <LoanCollectionModal
          show={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          firms={firms}
          selectedFirmId={selectedFirmId}
        />
      )}

      <InterestCalculatorModal
        show={showCalculatorModal}
        onClose={() => setShowCalculatorModal(false)}
      />
    </div>
  );
};

export default DashboardQuickActions;
