import React, { useState, useEffect } from 'react';
import { getFirmsDropdown } from '../../../api/firmApi';
import { transferLoan } from '../../../api/girviApi';
import { toast } from 'react-toastify';

const TransferLoanModal = ({ isOpen, onClose, loanDetails, onSuccess }) => {
  const [firms, setFirms] = useState([]);
  const [selectedFirmId, setSelectedFirmId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFirms();
    }
  }, [isOpen]);

  const fetchFirms = async () => {
    try {
      const res = await getFirmsDropdown();
      // Filter out the current firm
      const filtered = (res.data || res).filter(f => f.firm_id !== loanDetails.girv_firm_id);
      setFirms(filtered);
    } catch (error) {
      console.error('Error fetching firms:', error);
      toast.error('Failed to load firms');
    }
  };

  const handleTransfer = async () => {
    if (!selectedFirmId) {
      toast.error('Please select a firm to transfer the loan to.');
      return;
    }
    
    try {
      setLoading(true);
      await transferLoan(loanDetails.girv_uuid, selectedFirmId);
      toast.success('Loan transferred successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error transferring loan:', error);
      toast.error(error.error || 'Failed to transfer loan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white border-bottom-0 py-2">
              <h5 className="modal-title fs-5 fw-bold"><i className="bi bi-arrow-left-right me-2"></i>Transfer Loan</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            
            <div className="modal-body p-4">
              <div className="alert alert-warning border-warning border-start border-4 bg-warning bg-opacity-10 text-dark p-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill text-warning fs-4 me-3"></i>
                  <div>
                    <strong>Warning:</strong> You are about to transfer Loan <strong>#{loanDetails?.girv_id}</strong> to another firm. This will mark the loan as TRANSFERRED in the current firm and create a new one in the target firm.
                  </div>
                </div>
              </div>

              <div className="mb-4 mt-4">
                <label className="form-label fw-bold text-secondary mb-2">Select Target Firm</label>
                <select 
                  className="form-select form-select-lg border-2"
                  value={selectedFirmId}
                  onChange={(e) => setSelectedFirmId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Choose Firm --</option>
                  {firms.map(f => (
                    <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer bg-light border-top-0 py-3">
              <button type="button" className="btn btn-light border fw-bold px-4" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary fw-bold px-4 d-flex align-items-center gap-2" 
                onClick={handleTransfer} 
                disabled={loading || !selectedFirmId}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Processing...</>
                ) : (
                  <><i className="bi bi-send-fill"></i> Transfer Loan</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferLoanModal;
