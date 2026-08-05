import React, { useEffect, useState } from 'react';
import '../../../css/Modal.css';
import DepositModal from './DepositModal';
import AddPrincipalModal from './AddPrincipalModal';
import TransferModal from './TransferModal';
import ReleaseModal from './ReleaseModal';
import AuctionModal from './AuctionModal';

const TransactionModal = ({ isOpen, onClose, loanDetails, totalDueAmount, pendingPrincipal, pendingInterest, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('addPrincipal');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setActiveTab('addPrincipal'); // Reset to default on open
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container" onClick={(e) => e.stopPropagation()} style={{ height: '95vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header with Tabs */}
        <div className="custom-modal-header bg-light p-0 border-bottom">
          <div className="d-flex justify-content-between align-items-center p-3 pt-2 pb-2">
            <h5 className="py-1 m-0">Make Transaction</h5>
            <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
          </div>

          <ul className="nav nav-tabs px-3" style={{ borderBottom: 'none' }}>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'addPrincipal' ? 'active fw-bold' : 'text-dark'}`}
                onClick={() => setActiveTab('addPrincipal')}
                type="button"
              >
                <i className="bi bi-plus-circle text-primary me-1"></i> Add. Principal
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'transfer' ? 'active fw-bold' : 'text-dark'}`}
                onClick={() => setActiveTab('transfer')}
                type="button"
              >
                <i className="bi bi-arrow-left-right text-warning me-1"></i> Transfer
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'release' ? 'active fw-bold' : 'text-dark'}`}
                onClick={() => setActiveTab('release')}
                type="button"
              >
                <i className="bi bi-box-arrow-up-right text-success me-1"></i> Release
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'auction' ? 'active fw-bold' : 'text-dark'}`}
                onClick={() => setActiveTab('auction')}
                type="button"
              >
                <i className="bi bi-gear text-secondary me-1"></i> Auction
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'deposit' ? 'active fw-bold' : 'text-dark'}`}
                onClick={() => setActiveTab('deposit')}
                type="button"
              >
                <i className="bi bi-box-arrow-in-down text-success me-1"></i> Deposit
              </button>
            </li>
          </ul>
        </div>

        {/* Body based on active tab */}
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>

          {activeTab === 'addPrincipal' && (
            <AddPrincipalModal
              isOpen={true}
              isTab={true}
              loanDetails={loanDetails}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          )}
          {activeTab === 'transfer' && (
            <TransferModal 
              isOpen={true} 
              isTab={true} 
              onClose={onClose} 
              loanDetails={loanDetails}
              pendingPrincipal={pendingPrincipal}
              pendingInterest={pendingInterest}
              onSuccess={onSuccess}
            />
          )}
          {activeTab === 'release' && (
            <ReleaseModal 
              isOpen={true} 
              isTab={true} 
              onClose={onClose} 
              loanDetails={loanDetails}
              totalDueAmount={totalDueAmount}
              pendingPrincipal={pendingPrincipal}
              pendingInterest={pendingInterest}
              onSuccess={onSuccess}
            />
          )}
          {activeTab === 'auction' && (
            <AuctionModal
              isOpen={true}
              isTab={true}
              onClose={onClose}
              loanDetails={loanDetails}
              totalDueAmount={totalDueAmount}
              pendingPrincipal={pendingPrincipal}
              pendingInterest={pendingInterest}
              onSuccess={onSuccess}
            />
          )}
          {activeTab === 'deposit' && (
            <DepositModal 
              isOpen={true} 
              isTab={true} 
              onClose={onClose} 
              loanDetails={loanDetails}
              totalDueAmount={totalDueAmount}
              onSuccess={onSuccess}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default TransactionModal;
