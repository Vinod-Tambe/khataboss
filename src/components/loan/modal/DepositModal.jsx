import React, { useEffect } from 'react';
import '../../../css/Modal.css';

const DepositModal = ({ isOpen, onClose }) => {
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
          <h5>Loan Deposit</h5>
          <button className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="custom-modal-body">
          
          {/* Top Section */}
          <div className="row g-3 mb-4">
            <div className="col-md-2">
              <label className="form-label">Deposit Date</label>
              <input type="date" className="form-control" defaultValue="2025-02-02" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Prin Amt. Rec.</label>
              <input type="text" className="form-control" defaultValue="5000" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Int Amt. Rec.</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Discount</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Extra Amount</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Total Amt. Rec.</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">No Of Month</label>
              <input type="text" className="form-control" defaultValue="2" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Prin Amt Account</label>
              <select className="form-select">
                <option></option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Interest Amt Account</label>
              <select className="form-select">
                <option></option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Discount Amt Account</label>
              <select className="form-select">
                <option></option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Extra Amt Account</label>
              <select className="form-select">
                <option></option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Staff Name</label>
              <select className="form-select">
                <option></option>
              </select>
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
          <button className="btn btn-action">Deposit</button>
        </div>

      </div>
    </div>
  );
};

export default DepositModal;
