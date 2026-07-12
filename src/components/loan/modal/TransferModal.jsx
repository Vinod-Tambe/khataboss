import React, { useState, useEffect } from 'react';
import { getFirmsDropdown } from '../../../api/firmApi';
import { getAccountsDropdown } from '../../../api/accountApi';
import { transferLoan } from '../../../api/girviApi';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import '../../../css/Modal.css';

const TransferModal = ({ isOpen, onClose, isTab, loanDetails, pendingPrincipal, pendingInterest, onSuccess }) => {
  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    transfer_date: moment().format('YYYY-MM-DD'),
    girv_prin_amt: '',
    girv_roi: '',
    girv_interest_method: 'simple',
    targetFirmId: '',
    girv_packet_no: '',
    girv_locker_no: '',
    girv_cash_acc_id: '',
    girv_cash_info: '',
    girv_cash_amt: '',
    girv_bank_acc_id: '',
    girv_bank_info: '',
    girv_bank_amt: '',
    girv_online_acc_id: '',
    girv_online_info: '',
    girv_online_amt: '',
    girv_card_acc_id: '',
    girv_card_info: '',
    girv_card_amt: '',
    girv_pay_info: '',
    girv_other_info: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (!isTab) document.body.style.overflow = 'hidden';
      fetchFirms();
      // fetchAccounts is now triggered by targetFirmId useEffect
      if (loanDetails) {
        const defaultCashAmt = (pendingPrincipal || 0) + (pendingInterest || 0);
        setFormData(prev => ({
          ...prev,
          girv_prin_amt: pendingPrincipal ? pendingPrincipal.toFixed(2) : (loanDetails.girv_prin_amt || ''),
          girv_roi: loanDetails.girv_roi || '',
          girv_interest_method: loanDetails.girv_interest_method || 'simple',
          girv_cash_amt: defaultCashAmt > 0 ? defaultCashAmt.toFixed(2) : '',
        }));
      }
    } else if (!isTab) {
      document.body.style.overflow = 'unset';
    }
    return () => {
      if (!isTab) document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isTab, loanDetails, pendingPrincipal, pendingInterest]);

  const fetchFirms = async () => {
    try {
      const res = await getFirmsDropdown();
      const filtered = (res.data || res).filter(f => f.firm_id !== loanDetails?.girv_firm_id);
      setFirms(filtered);
    } catch (error) {
      toast.error('Failed to load firms');
    }
  };

  const fetchAccounts = async (firmId) => {
    try {
      const idToFetch = firmId || loanDetails?.girv_firm_id || null;
      if (!idToFetch) return;
      const res = await getAccountsDropdown(idToFetch);
      setAccounts(res.data || res || []);
    } catch (error) {
      toast.error('Failed to load accounts');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts(formData.targetFirmId || loanDetails?.girv_firm_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData.targetFirmId, loanDetails?.girv_firm_id]);

  // Auto-select accounts on fetch
  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => {
        const updates = {};
        if (!prev.girv_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.girv_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.girv_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.girv_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.girv_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.girv_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.girv_card_acc_id) {
          const cardAcc = accounts.find(a =>
            a.acc_name.toLowerCase().includes("card") ||
            a.acc_name.toLowerCase().includes("pos")
          );
          if (cardAcc) updates.girv_card_acc_id = cardAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name.includes('_amt') || name === 'girv_prin_amt' || name === 'girv_roi') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: finalValue };

      if (name === 'targetFirmId') {
        updated.girv_cash_acc_id = '';
        updated.girv_bank_acc_id = '';
        updated.girv_online_acc_id = '';
        updated.girv_card_acc_id = '';
      }

      if (name === 'girv_prin_amt') {
        const prinAmt = parseFloat(finalValue) || 0;
        const intAmt = pendingInterest || 0;
        const autoTotal = Math.max(0, prinAmt + intAmt);

        const bankAmt = parseFloat(prev.girv_bank_amt) || 0;
        const onlineAmt = parseFloat(prev.girv_online_amt) || 0;
        const cardAmt = parseFloat(prev.girv_card_amt) || 0;
        const otherPayments = bankAmt + onlineAmt + cardAmt;
        const remainder = Math.max(0, autoTotal - otherPayments);

        updated.girv_cash_amt = remainder > 0 ? remainder.toString() : '';
      }

      return updated;
    });
  };

  const totalPayment = (parseFloat(formData.girv_cash_amt) || 0) +
    (parseFloat(formData.girv_bank_amt) || 0) +
    (parseFloat(formData.girv_online_amt) || 0) +
    (parseFloat(formData.girv_card_amt) || 0);

  const prinAmt = parseFloat(formData.girv_prin_amt) || 0;
  const intAmt = pendingInterest || 0;
  const requiredTotal = prinAmt + intAmt;

  let validationError = "";
  if (requiredTotal <= 0) {
    validationError = "Transfer Amount must be greater than 0";
  } else if (!formData.targetFirmId) {
    validationError = "Please select a transfer firm.";
  } else if (Math.abs(requiredTotal - totalPayment) > 0.01) {
    validationError = `Total Payment Modes (${totalPayment.toFixed(2)}) must equal the Transfer Amount (${requiredTotal.toFixed(2)})`;
  } else if (parseFloat(formData.girv_cash_amt) > 0 && !formData.girv_cash_acc_id) {
    validationError = "Please select a Cash Account.";
  } else if (parseFloat(formData.girv_bank_amt) > 0 && !formData.girv_bank_acc_id) {
    validationError = "Please select a Bank Account.";
  } else if (parseFloat(formData.girv_online_amt) > 0 && !formData.girv_online_acc_id) {
    validationError = "Please select an Online Account.";
  } else if (parseFloat(formData.girv_card_amt) > 0 && !formData.girv_card_acc_id) {
    validationError = "Please select a Card Account.";
  }

  const isSubmitDisabled = loading || !!validationError;

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      await transferLoan(loanDetails.girv_uuid, formData);
      toast.success('Loan transferred successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.error || 'Failed to transfer loan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="custom-modal-body bg-cust-info">
      {/* Top Section - Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Transfer Date</label>
          <input type="date" name="transfer_date" className="form-control border-dark text-center" value={formData.transfer_date} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Principal Amount</label>
          <input type="number" name="girv_prin_amt" className="form-control border-dark text-center" value={formData.girv_prin_amt} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Rate of Interest</label>
          <input type="number" name="girv_roi" className="form-control border-dark text-center" value={formData.girv_roi} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Interest Option</label>
          <select name="girv_interest_method" className="form-select border-dark text-center" value={formData.girv_interest_method} onChange={handleChange}>
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>
      </div>

      {/* Top Section - Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Existing Firm</label>
          <input type="text" className="form-control border-dark text-center" value={loanDetails?.firm?.firm_name || ''} readOnly disabled />
        </div>
        <div className="col-md-3">
          <label className="form-label">Transfer Firm</label>
          <select name="targetFirmId" className="form-select border-dark" value={formData.targetFirmId} onChange={handleChange}>
            <option value="">-- Select Firm --</option>
            {firms.map(f => (
              <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">New Packet No</label>
          <input type="text" name="girv_packet_no" className="form-control border-dark text-center" value={formData.girv_packet_no} onChange={handleChange} />
        </div>
        <div className="col-md-3">
          <label className="form-label">New Locker No</label>
          <input type="text" name="girv_locker_no" className="form-control border-dark text-center" value={formData.girv_locker_no} onChange={handleChange} />
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
              <select name="girv_cash_acc_id" className="form-select form-select-sm border-dark" value={formData.girv_cash_acc_id} onChange={handleChange}>
                <option value="">-- Cash Account --</option>
                {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" name="girv_cash_info" className="form-control form-control-sm border-dark" placeholder="CASH INFORMATION" value={formData.girv_cash_info} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input type="number" name="girv_cash_amt" className="form-control form-control-sm border-dark" placeholder="CASH AMOUNT" value={formData.girv_cash_amt} onChange={handleChange} />
            </div>
          </div>

          {/* Bank Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select name="girv_bank_acc_id" className="form-select form-select-sm border-dark" value={formData.girv_bank_acc_id} onChange={handleChange}>
                <option value="">-- Bank Account --</option>
                {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" name="girv_bank_info" className="form-control form-control-sm border-dark" placeholder="BANK INFORMATION" value={formData.girv_bank_info} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input type="number" name="girv_bank_amt" className="form-control form-control-sm border-dark" placeholder="BANK AMOUNT" value={formData.girv_bank_amt} onChange={handleChange} />
            </div>
          </div>

          {/* Online Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select name="girv_online_acc_id" className="form-select form-select-sm border-dark" value={formData.girv_online_acc_id} onChange={handleChange}>
                <option value="">-- Online Account --</option>
                {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" name="girv_online_info" className="form-control form-control-sm border-dark" placeholder="ONLINE INFORMATION" value={formData.girv_online_info} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input type="number" name="girv_online_amt" className="form-control form-control-sm border-dark" placeholder="ONLINE AMOUNT" value={formData.girv_online_amt} onChange={handleChange} />
            </div>
          </div>

          {/* Card Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select name="girv_card_acc_id" className="form-select form-select-sm border-dark" value={formData.girv_card_acc_id} onChange={handleChange}>
                <option value="">-- Card Account --</option>
                {accounts.map(a => <option key={a.acc_id} value={a.acc_id}>{a.acc_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" name="girv_card_info" className="form-control form-control-sm border-dark" placeholder="CARD INFORMATION" value={formData.girv_card_info} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <input type="number" name="girv_card_amt" className="form-control form-control-sm border-dark" placeholder="CARD AMOUNT" value={formData.girv_card_amt} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Right Column (Other Info) */}
        <div className="col-md-4">
          <div className="section-title">Other Information</div>
          <div className="mb-2">
            <textarea name="girv_pay_info" className="form-control border-dark" placeholder="PAYMENT OTHER INFORMATION" rows={3} value={formData.girv_pay_info} onChange={handleChange}></textarea>
          </div>
          <div>
            <textarea name="girv_other_info" className="form-control border-dark" placeholder="OTHER INFORMATION" rows={3} value={formData.girv_other_info} onChange={handleChange}></textarea>
          </div>
        </div>
      </div>

      {/* Submit Button Row */}
      {validationError && (
        <div className="row mt-2">
          <div className="col text-center">
            <div className="alert alert-danger py-2 mb-0 fw-bold">{validationError}</div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col text-center mt-3">
          <button type="submit" className="btn btn-primary px-5 py-2" onClick={handleTransfer} disabled={isSubmitDisabled}>
            {loading ? <><span className="spinner-border spinner-border-sm" aria-hidden="true"></span> Processing...</> : 'Transfer Loan'}
          </button>
        </div>
      </div>
    </div>
  );

  if (isTab) {
    return (
      <form className="w-100 h-100 d-flex flex-column m-0" onClick={(e) => e.stopPropagation()}>
        {content}
      </form>
    );
  }

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <form className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="py-1">Transfer Loan</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>
        {content}
      </form>
    </div>
  );
};

export default TransferModal;
