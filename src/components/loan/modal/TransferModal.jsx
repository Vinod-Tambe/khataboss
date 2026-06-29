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
      <form className="custom-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="py-1">Transfer Loan</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="custom-modal-body bg-cust-info">

          {/* Top Section - Row 1 */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Transfer Date</label>
              <input type="date" className="form-control border-dark text-center" defaultValue="2025-02-2" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Principal Amount</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Rate of Interest</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="2" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Interest Option</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
            </div>
          </div>

          {/* Top Section - Row 2 */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Existing Firm</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Transfer Firm</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">New Packet No</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
            </div>
            <div className="col-md-3">
              <label className="form-label">New Locker No</label>
              <input type="text" className="form-control border-dark text-center" defaultValue="5000" />
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
                  <select className="form-select form-select-sm border-dark">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="CASH INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="CASH AMOUNT" />
                </div>
              </div>

              {/* Bank Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select form-select-sm border-dark">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="BANK INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="BANK AMOUNT" />
                </div>
              </div>

              {/* Online Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select form-select-sm border-dark">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="ONLINE INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="ONLINE AMOUNT" />
                </div>
              </div>

              {/* Card Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select className="form-select form-select-sm border-dark">
                    <option></option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="CARD INFORMATION" />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control form-control-sm border-dark" placeholder="CARD AMOUNT" />
                </div>
              </div>
            </div>

            {/* Right Column (Other Info) */}
            <div className="col-md-4">
              <div className="section-title">Other Information</div>

              <div className="mb-2">
                <textarea
                  className="form-control border-dark"
                  placeholder="PAYMENT OTHER INFORMATION"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <textarea
                  className="form-control border-dark"
                  placeholder="OTHER INFORMATION"
                  rows={3}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button Row */}
          <div className="row">
            <div className="col text-center mt-2">
              <button
                type="submit"
                className="btn btn-primary px-5 py-2"
              >
                Transfer Loan
              </button>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
};

export default TransferModal;
