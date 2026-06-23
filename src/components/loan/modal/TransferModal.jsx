import React, { useEffect } from 'react';
import '../../../css/Modal.css';

const TransferModal = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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
      <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="custom-modal-header">
          <h5>Transfer Loan</h5>
          <button className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="custom-modal-body">
          
          {/* Top Section - Row 1 */}
          <div className="row g-3 mb-3">
            <div className="col-md-2">
              <label className="form-label">Transfer Date</label>
              <input type="date" className="form-control" defaultValue="2025-02-02" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Loan Start Date</label>
              <input type="date" className="form-control" defaultValue="2025-02-02" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Principal Amount</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Rate of Interest</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Interest Option</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Staff Name</label>
              <select className="form-select">
                <option></option>
              </select>
            </div>
          </div>

          {/* Top Section - Row 2 */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label">Existing Firm</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Transfer Firm</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">New Packet No</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">New Locker No</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="row g-4">
            {/* Left Column (Payment Rows) */}
            <div className="col-md-8">
              <div className="section-title">Payment Details</div>
              
              {/* Cash Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="CASH INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="CASH AMOUNT" />
                </div>
              </div>

              {/* Bank Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="BANK INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="BANK AMOUNT" />
                </div>
              </div>

              {/* Online Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="ONLINE INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="ONLINE AMOUNT" />
                </div>
              </div>

              {/* Card Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="CARD INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="CARD AMOUNT" />
                </div>
              </div>
            </div>

            {/* Right Column (Other Info) */}
            <div className="col-md-4">
              <div className="section-title">Other Information</div>
              
              {/* Optional DR Account */}
              <div className="row mb-3 align-items-center">
                <div className="col-auto">
                  <label className="form-label mb-0" style={{ fontSize: '0.8rem', color: '#1a4f8b' }}>DR ACCOUNT :</label>
                </div>
                <div className="col">
                  <select className="form-select">
                    <option></option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <textarea 
                  className="form-control textarea-custom" 
                  placeholder="PAYMENT OTHER INFORMATION"
                ></textarea>
              </div>
              <div>
                <textarea 
                  className="form-control textarea-custom" 
                  placeholder="OTHER INFORMATION"
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="custom-modal-footer">
          <button className="btn btn-action">Transfer Loan</button>
        </div>

      </div>
    </div>
  );
};

export default TransferModal;
