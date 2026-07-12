import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import $ from 'jquery';
import moment from 'moment';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { getAccountsDropdown } from '../../../api/accountApi';
import { addDeposit } from '../../../api/depositApi';
import { toast } from 'react-hot-toast';
import '../../../css/Modal.css';
import useFormNavigation from '../../../hooks/useFormNavigation';

const DepositModal = ({ isOpen, onClose, isTab, loanDetails, totalDueAmount, onSuccess }) => {
  const { selectedFirm } = useSelector((state) => state.firm);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const dep_trans_dateRef = useRef(null);
  const formRef = useRef(null);

  useFormNavigation(formRef, false, isOpen);

  // Focus Principal Amount Rec. by default when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const prinAmtInput = document.getElementById('dep_prin_amt');
        if (prinAmtInput) {
          prinAmtInput.focus();
          prinAmtInput.select();
        }
      }, 150);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    dep_trans_date: new Date().toISOString().split('T')[0],
    dep_prin_amt: '',
    dep_int_amt: '',
    dep_disc_amt: '',
    dep_extra_amt: '',
    dep_payable_amt: '',

    dep_cash_acc_id: '',
    dep_cash_info: '',
    dep_cash_amt: '',

    dep_bank_acc_id: '',
    dep_bank_info: '',
    dep_bank_amt: '',

    dep_online_acc_id: '',
    dep_online_info: '',
    dep_online_amt: '',

    dep_card_acc_id: '',
    dep_card_info: '',
    dep_card_amt: '',

    dep_pay_info: '',
    dep_other_info: ''
  });

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

  // Sync loan details when modal opens
  useEffect(() => {
    if (loanDetails && isOpen) {
      setFormData(prev => ({
        ...prev,
        dep_prin_amt: '',
        dep_int_amt: '',
        dep_disc_amt: '',
        dep_extra_amt: '',
        dep_payable_amt: '0.00',
        dep_cash_amt: '',
        dep_bank_amt: '',
        dep_online_amt: '',
        dep_card_amt: '',
        dep_pay_info: '',
        dep_other_info: ''
      }));
    }
  }, [loanDetails, isOpen]);

  // Fetch accounts on mount / firm change
  useEffect(() => {
    const fetchAccounts = async () => {
      const firmId = loanDetails?.girv_firm_id || selectedFirm?.firm_id;
      if (!firmId || firmId === 'all') return;

      try {
        const response = await getAccountsDropdown(firmId);
        const accData = response.data || response || [];
        setAccounts(Array.isArray(accData) ? accData : []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("Failed to load accounts");
      }
    };

    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen, loanDetails?.girv_firm_id, selectedFirm?.firm_id]);

  // Auto-select accounts on fetch
  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => {
        const updates = {};
        if (!prev.dep_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.dep_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.dep_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.dep_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.dep_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.dep_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.dep_card_acc_id) {
          const cardAcc = accounts.find(a =>
            a.acc_name.toLowerCase().includes("card") ||
            a.acc_name.toLowerCase().includes("pos")
          );
          if (cardAcc) updates.dep_card_acc_id = cardAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  // Initialize JQuery Date Range Picker
  useEffect(() => {
    if (isOpen && dep_trans_dateRef.current) {
      $(dep_trans_dateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, dep_trans_date: start.format('YYYY-MM-DD') }));
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let finalValue = value;

    if (id.includes('_amt') || id === 'dep_prin_amt' || id === 'dep_int_amt' || id === 'dep_disc_amt' || id === 'dep_extra_amt' || id === 'dep_payable_amt') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => {
      const updated = { ...prev, [id]: finalValue };

      // Calculate Total Amount Rec. automatically from top fields
      const prinAmt = parseFloat(id === 'dep_prin_amt' ? finalValue : prev.dep_prin_amt) || 0;
      const intAmt = parseFloat(id === 'dep_int_amt' ? finalValue : prev.dep_int_amt) || 0;
      const discAmt = parseFloat(id === 'dep_disc_amt' ? finalValue : prev.dep_disc_amt) || 0;
      const extraAmt = parseFloat(id === 'dep_extra_amt' ? finalValue : prev.dep_extra_amt) || 0;

      const autoTotal = Math.max(0, prinAmt + intAmt + extraAmt - discAmt);
      
      // If editing top fields, update payable amount and default cash amount
      if (['dep_prin_amt', 'dep_int_amt', 'dep_disc_amt', 'dep_extra_amt'].includes(id)) {
        updated.dep_payable_amt = autoTotal.toString();

        // Auto-fill cash amount with remainder
        const bankAmt = parseFloat(prev.dep_bank_amt) || 0;
        const onlineAmt = parseFloat(prev.dep_online_amt) || 0;
        const cardAmt = parseFloat(prev.dep_card_amt) || 0;
        const otherPayments = bankAmt + onlineAmt + cardAmt;
        const remainder = Math.max(0, autoTotal - otherPayments);

        updated.dep_cash_amt = remainder > 0 ? remainder.toString() : '';
      }

      return updated;
    });
  };

  const totalPayment = (parseFloat(formData.dep_cash_amt) || 0) +
    (parseFloat(formData.dep_bank_amt) || 0) +
    (parseFloat(formData.dep_online_amt) || 0) +
    (parseFloat(formData.dep_card_amt) || 0);

  const payableAmt = parseFloat(formData.dep_payable_amt) || 0;
  
  let validationError = "";
  if (payableAmt <= 0) {
    validationError = "Total Amount Rec. must be greater than 0";
  } else if (!loanDetails?.girv_id) {
    validationError = "Loan details missing";
  } else if (totalDueAmount !== undefined && (payableAmt - totalDueAmount) > 0.01) {
    validationError = `Total Amount Rec. (${payableAmt.toFixed(2)}) cannot exceed Total Loan Amount Due (${totalDueAmount.toFixed(2)})`;
  } else if (Math.abs(payableAmt - totalPayment) > 0.01) {
    validationError = `Total Payment Modes (${totalPayment.toFixed(2)}) must equal Total Amount Rec. (${payableAmt.toFixed(2)})`;
  } else if (parseFloat(formData.dep_cash_amt) > 0 && !formData.dep_cash_acc_id) {
    validationError = "Please select a Cash Account.";
  } else if (parseFloat(formData.dep_bank_amt) > 0 && !formData.dep_bank_acc_id) {
    validationError = "Please select a Bank Account.";
  } else if (parseFloat(formData.dep_online_amt) > 0 && !formData.dep_online_acc_id) {
    validationError = "Please select an Online Account.";
  } else if (parseFloat(formData.dep_card_amt) > 0 && !formData.dep_card_acc_id) {
    validationError = "Please select a Card Account.";
  }

  const isSubmitDisabled = submitting || !!validationError;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        dep_girv_id: loanDetails.girv_id,
        dep_firm_id: loanDetails.girv_firm_id,
        dep_user_id: loanDetails.girv_user_id
      };

      await addDeposit(payload);
      toast.success("Deposit submitted successfully");
      if (onSuccess) onSuccess();
      if (onClose && !isTab) onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.error || "Failed to submit deposit");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="custom-modal-body bg-pink">
      {/* Top Section */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Deposit Date</label>
          <input type="text" ref={dep_trans_dateRef} className="form-control border-dark text-center" defaultValue={moment(formData.dep_trans_date).format('DD-MM-YYYY')} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Principal Amount Rec.</label>
          <input type="text" id="dep_prin_amt" value={formData.dep_prin_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Interest Amount Rec.</label>
          <input type="text" id="dep_int_amt" value={formData.dep_int_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Discount Amount</label>
          <input type="text" id="dep_disc_amt" value={formData.dep_disc_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Extra Amount</label>
          <input type="text" id="dep_extra_amt" value={formData.dep_extra_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Total Amount Rec.</label>
          <input type="text" id="dep_payable_amt" value={formData.dep_payable_amt} onChange={handleInputChange} className="form-control border-dark text-center bg-light" readOnly />
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
              <select id="dep_cash_acc_id" value={formData.dep_cash_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_cash_info" value={formData.dep_cash_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_cash_amt" value={formData.dep_cash_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH AMOUNT" />
            </div>
          </div>

          {/* Bank Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="dep_bank_acc_id" value={formData.dep_bank_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_bank_info" value={formData.dep_bank_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_bank_amt" value={formData.dep_bank_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK AMOUNT" />
            </div>
          </div>

          {/* Online Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="dep_online_acc_id" value={formData.dep_online_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_online_info" value={formData.dep_online_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_online_amt" value={formData.dep_online_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE AMOUNT" />
            </div>
          </div>

          {/* Card Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="dep_card_acc_id" value={formData.dep_card_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_card_info" value={formData.dep_card_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="dep_card_amt" value={formData.dep_card_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD AMOUNT" />
            </div>
          </div>
        </div>

        {/* Right Column (Other Info) */}
        <div className="col-md-4">
          <div className="section-title">Other Information</div>

          <div className="mb-2">
            <textarea
              id="dep_pay_info"
              value={formData.dep_pay_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="PAYMENT OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
          <div>
            <textarea
              id="dep_other_info"
              value={formData.dep_other_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {validationError && (
        <div className="row mt-2">
          <div className="col text-center">
            <div className="alert alert-danger py-2 mb-0 fw-bold">{validationError}</div>
          </div>
        </div>
      )}

      {/* Submit Button Row */}
      <div className="row">
        <div className="col text-center mt-3">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="btn btn-primary px-5 py-2"
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : "Deposit Loan"}
          </button>
        </div>
      </div>

    </div>
  );

  if (isTab) {
    return (
      <form ref={formRef} onSubmit={handleSubmit} className="w-100 h-100 d-flex flex-column m-0" onClick={(e) => e.stopPropagation()}>
        {content}
      </form>
    );
  }

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <form ref={formRef} onSubmit={handleSubmit} className="custom-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="py-1">Loan Deposit</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        {content}

      </form>
    </div>
  );
};

export default DepositModal;
