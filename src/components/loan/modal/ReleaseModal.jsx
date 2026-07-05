import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import $ from 'jquery';
import moment from 'moment';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { getAccountsDropdown } from '../../../api/accountApi';
import { addRelease } from '../../../api/releaseApi';
import { toast } from 'react-hot-toast';
import '../../../css/Modal.css';
import useFormNavigation from '../../../hooks/useFormNavigation';

const ReleaseModal = ({ isOpen, onClose, isTab, loanDetails, totalDueAmount, pendingPrincipal, pendingInterest, onSuccess }) => {
  const { selectedFirm } = useSelector((state) => state.firm);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const rel_trans_dateRef = useRef(null);
  const formRef = useRef(null);

  useFormNavigation(formRef, false, isOpen);

  // Focus Principal Amount Rec. by default when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const prinAmtInput = document.getElementById('rel_prin_amt');
        if (prinAmtInput) {
          prinAmtInput.focus();
          prinAmtInput.select();
        }
      }, 150);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    rel_trans_date: new Date().toISOString().split('T')[0],
    rel_prin_amt: '',
    rel_int_amt: '',
    rel_disc_amt: '',
    rel_extra_amt: '',
    rel_payable_amt: '',

    rel_cash_acc_id: '',
    rel_cash_info: '',
    rel_cash_amt: '',

    rel_bank_acc_id: '',
    rel_bank_info: '',
    rel_bank_amt: '',

    rel_online_acc_id: '',
    rel_online_info: '',
    rel_online_amt: '',

    rel_card_acc_id: '',
    rel_card_info: '',
    rel_card_amt: '',

    rel_pay_info: '',
    rel_other_info: ''
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
        rel_prin_amt: pendingPrincipal ? pendingPrincipal.toFixed(2) : '',
        rel_int_amt: pendingInterest ? pendingInterest.toFixed(2) : '',
        rel_disc_amt: '',
        rel_extra_amt: '',
        rel_payable_amt: totalDueAmount ? totalDueAmount.toFixed(2) : '0.00',
        rel_cash_amt: totalDueAmount ? totalDueAmount.toFixed(2) : '',
        rel_bank_amt: '',
        rel_online_amt: '',
        rel_card_amt: '',
        rel_pay_info: '',
        rel_other_info: ''
      }));
    }
  }, [loanDetails, isOpen, pendingPrincipal, pendingInterest, totalDueAmount]);

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
        if (!prev.rel_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.rel_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.rel_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.rel_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.rel_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.rel_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.rel_card_acc_id) {
          const cardAcc = accounts.find(a =>
            a.acc_name.toLowerCase().includes("card") ||
            a.acc_name.toLowerCase().includes("pos")
          );
          if (cardAcc) updates.rel_card_acc_id = cardAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  // Initialize JQuery Date Range Picker
  useEffect(() => {
    if (isOpen && rel_trans_dateRef.current) {
      $(rel_trans_dateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, rel_trans_date: start.format('YYYY-MM-DD') }));
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let finalValue = value;

    if (id.includes('_amt') || id === 'rel_prin_amt' || id === 'rel_int_amt' || id === 'rel_disc_amt' || id === 'rel_extra_amt' || id === 'rel_payable_amt') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => {
      const updated = { ...prev, [id]: finalValue };

      // Calculate Total Amount Rec. automatically from top fields
      const prinAmt = parseFloat(id === 'rel_prin_amt' ? finalValue : prev.rel_prin_amt) || 0;
      const intAmt = parseFloat(id === 'rel_int_amt' ? finalValue : prev.rel_int_amt) || 0;
      const discAmt = parseFloat(id === 'rel_disc_amt' ? finalValue : prev.rel_disc_amt) || 0;
      const extraAmt = parseFloat(id === 'rel_extra_amt' ? finalValue : prev.rel_extra_amt) || 0;

      const autoTotal = Math.max(0, prinAmt + intAmt + extraAmt - discAmt);
      
      // If editing top fields, update payable amount and default cash amount
      if (['rel_prin_amt', 'rel_int_amt', 'rel_disc_amt', 'rel_extra_amt'].includes(id)) {
        updated.rel_payable_amt = autoTotal.toString();

        // Auto-fill cash amount with remainder
        const bankAmt = parseFloat(prev.rel_bank_amt) || 0;
        const onlineAmt = parseFloat(prev.rel_online_amt) || 0;
        const cardAmt = parseFloat(prev.rel_card_amt) || 0;
        const otherPayments = bankAmt + onlineAmt + cardAmt;
        const remainder = Math.max(0, autoTotal - otherPayments);

        updated.rel_cash_amt = remainder > 0 ? remainder.toString() : '';
      }

      return updated;
    });
  };

  const totalPayment = (parseFloat(formData.rel_cash_amt) || 0) +
    (parseFloat(formData.rel_bank_amt) || 0) +
    (parseFloat(formData.rel_online_amt) || 0) +
    (parseFloat(formData.rel_card_amt) || 0);

  const payableAmt = parseFloat(formData.rel_payable_amt) || 0;
  
  let validationError = "";
  const isFormEmpty = payableAmt <= 0;

  if (!isFormEmpty) {
    if (Math.abs(payableAmt - totalPayment) > 0.01) {
      validationError = `Total Payment Modes (${totalPayment.toFixed(2)}) must equal Payable Amount (${payableAmt.toFixed(2)})`;
    } else if (!loanDetails?.girv_id) {
      validationError = "Loan details missing";
    }
  }

  const isSubmitDisabled = submitting || isFormEmpty || !!validationError;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isFormEmpty || validationError) return;

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        rel_girv_id: loanDetails.girv_id,
        rel_firm_id: loanDetails.girv_firm_id,
        rel_user_id: loanDetails.girv_user_id
      };

      await addRelease(payload);
      toast.success("Loan Released successfully");
      if (onSuccess) onSuccess();
      if (onClose && !isTab) onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.error || "Failed to release loan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="custom-modal-body bg-green" ref={formRef}>
      {/* Top Section */}
      <div className="row g-3 mb-3">
        <div className="col-md-2">
          <label className="form-label">Release Date</label>
          <input type="text" ref={rel_trans_dateRef} className="form-control border-dark text-center" defaultValue={moment(formData.rel_trans_date).format('DD-MM-YYYY')} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Principal Amount</label>
          <input type="text" id="rel_prin_amt" value={formData.rel_prin_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Interest Amount</label>
          <input type="text" id="rel_int_amt" value={formData.rel_int_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Discount</label>
          <input type="text" id="rel_disc_amt" value={formData.rel_disc_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Extra Amount</label>
          <input type="text" id="rel_extra_amt" value={formData.rel_extra_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Payable Amount</label>
          <input type="text" id="rel_payable_amt" value={formData.rel_payable_amt} onChange={handleInputChange} className="form-control border-dark text-center bg-light" readOnly />
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
              <select id="rel_cash_acc_id" value={formData.rel_cash_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_cash_info" value={formData.rel_cash_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_cash_amt" value={formData.rel_cash_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH AMOUNT" />
            </div>
          </div>

          {/* Bank Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="rel_bank_acc_id" value={formData.rel_bank_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_bank_info" value={formData.rel_bank_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_bank_amt" value={formData.rel_bank_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK AMOUNT" />
            </div>
          </div>

          {/* Online Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="rel_online_acc_id" value={formData.rel_online_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_online_info" value={formData.rel_online_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_online_amt" value={formData.rel_online_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE AMOUNT" />
            </div>
          </div>

          {/* Card Row */}
          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="rel_card_acc_id" value={formData.rel_card_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_card_info" value={formData.rel_card_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="rel_card_amt" value={formData.rel_card_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD AMOUNT" />
            </div>
          </div>
        </div>

        {/* Right Column (Other Info) */}
        <div className="col-md-4">
          <div className="section-title">Other Information</div>

          <div className="mb-2">
            <textarea
              id="rel_pay_info"
              value={formData.rel_pay_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="PAYMENT OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
          <div>
            <textarea
              id="rel_other_info"
              value={formData.rel_other_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="alert alert-danger mt-3 mb-0 py-2 text-center border-dark fw-bold" role="alert">
          {validationError}
        </div>
      )}

      {/* Submit Button Row */}
      <div className="row">
        <div className="col text-center mt-2">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="btn btn-primary px-5 py-2"
          >
            {submitting ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Releasing...</>
            ) : "Release Loan"}
          </button>
        </div>
      </div>
    </div>
  );

  if (isTab) {
    return (
      <form ref={formRef} className="w-100 h-100 d-flex flex-column m-0" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        {content}
      </form>
    );
  }

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <form ref={formRef} className="custom-modal-container" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        {/* Header */}
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="py-1">Release Active Loan</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        {content}
      </form>
    </div>
  );
};

export default ReleaseModal;
