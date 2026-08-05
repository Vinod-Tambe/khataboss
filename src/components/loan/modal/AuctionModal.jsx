import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getAccountsDropdown } from '../../../api/accountApi';
import { addAuction } from '../../../api/auctionApi';
import { toast } from 'react-hot-toast';
import '../../../css/Modal.css';
import useFormNavigation from '../../../hooks/useFormNavigation';

const AuctionModal = ({ isOpen, onClose, isTab, loanDetails, totalDueAmount, pendingPrincipal, pendingInterest, onSuccess }) => {
  const { selectedFirm } = useSelector((state) => state.firm);
  const { selectedUser } = useSelector((state) => state.user);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  useFormNavigation(formRef, false, isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const prinAmtInput = document.getElementById('auc_prin_amt');
        if (prinAmtInput) {
          prinAmtInput.focus();
          prinAmtInput.select();
        }
      }, 150);
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    auc_prin_amt: '',
    auc_int_amt: '',
    auc_dep_amt: '',
    auc_payable_amt: '',

    auc_user_full_name: '',
    auc_user_mobile: '',
    auc_user_email: '',
    auc_user_aadhaar: '',
    auc_user_gender: '',
    auc_user_pan: '',
    auc_user_address: '',
    auc_user_state: '',
    auc_user_city: '',
    auc_user_country: '',
    auc_user_village: '',
    auc_user_pincode: '',

    auc_cash_acc_id: '',
    auc_cash_info: '',
    auc_cash_amt: '',

    auc_bank_acc_id: '',
    auc_bank_info: '',
    auc_bank_amt: '',

    auc_online_acc_id: '',
    auc_online_info: '',
    auc_online_amt: '',

    auc_card_acc_id: '',
    auc_card_info: '',
    auc_card_amt: '',

    auc_pay_info: '',
    auc_other_info: ''
  });

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

  // Prefill loan + user details when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const customer = selectedUser || loanDetails?.user || {};
    const fullName = [customer.user_first_name, customer.user_last_name].filter(Boolean).join(' ').trim();
    const prinAmt = pendingPrincipal != null
      ? Number(pendingPrincipal).toFixed(2)
      : (loanDetails?.girv_prin_amt != null ? Number(loanDetails.girv_prin_amt).toFixed(2) : '');
    const intAmt = pendingInterest != null
      ? Number(pendingInterest).toFixed(2)
      : '';
    // Prefer total due when deposit is empty; otherwise principal + interest
    const payable = totalDueAmount != null
      ? Number(totalDueAmount).toFixed(2)
      : ((parseFloat(prinAmt) || 0) + (parseFloat(intAmt) || 0)).toFixed(2);

    setFormData(prev => ({
      ...prev,
      auc_prin_amt: prinAmt,
      auc_int_amt: intAmt,
      auc_dep_amt: '',
      auc_payable_amt: payable,

      auc_user_full_name: fullName,
      auc_user_mobile: customer.user_mobile_no || '',
      auc_user_email: customer.user_email_id || '',
      auc_user_aadhaar: customer.user_adhaar_no || '',
      auc_user_gender: customer.user_gender || '',
      auc_user_pan: customer.user_pan_no || '',
      auc_user_address: customer.user_curr_address || customer.user_per_address || '',
      auc_user_state: customer.user_state || '',
      auc_user_city: customer.user_city || '',
      auc_user_country: customer.user_country || '',
      auc_user_village: customer.user_village || '',
      auc_user_pincode: customer.user_pincode || '',

      auc_cash_amt: payable,
      auc_bank_amt: '',
      auc_online_amt: '',
      auc_card_amt: '',
      auc_cash_info: '',
      auc_bank_info: '',
      auc_online_info: '',
      auc_card_info: '',
      auc_pay_info: '',
      auc_other_info: ''
    }));
  }, [isOpen, loanDetails, selectedUser, pendingPrincipal, pendingInterest, totalDueAmount]);

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

  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => {
        const updates = {};
        if (!prev.auc_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.auc_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.auc_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.auc_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.auc_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.auc_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.auc_card_acc_id) {
          const cardAcc = accounts.find(a =>
            a.acc_name.toLowerCase().includes("card") ||
            a.acc_name.toLowerCase().includes("pos")
          );
          if (cardAcc) updates.auc_card_acc_id = cardAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  const recalcPayable = (prinAmt, intAmt, depAmt) =>
    Math.max(0, (parseFloat(prinAmt) || 0) + (parseFloat(intAmt) || 0) + (parseFloat(depAmt) || 0));

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let finalValue = value;

    if (id.includes('_amt') || id === 'auc_prin_amt' || id === 'auc_int_amt' || id === 'auc_dep_amt' || id === 'auc_payable_amt') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }

    if (id === 'auc_user_aadhaar') {
      finalValue = value.replace(/\D/g, '').slice(0, 12);
    }

    if (id === 'auc_user_pan') {
      finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }

    if (id === 'auc_user_pincode') {
      finalValue = value.replace(/\D/g, '').slice(0, 6);
    }

    if (id === 'auc_user_mobile') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => {
      const updated = { ...prev, [id]: finalValue };

      if (['auc_prin_amt', 'auc_int_amt', 'auc_dep_amt'].includes(id)) {
        const prinAmt = id === 'auc_prin_amt' ? finalValue : prev.auc_prin_amt;
        const intAmt = id === 'auc_int_amt' ? finalValue : prev.auc_int_amt;
        const depAmt = id === 'auc_dep_amt' ? finalValue : prev.auc_dep_amt;
        const autoTotal = recalcPayable(prinAmt, intAmt, depAmt);

        updated.auc_payable_amt = autoTotal.toString();

        const bankAmt = parseFloat(prev.auc_bank_amt) || 0;
        const onlineAmt = parseFloat(prev.auc_online_amt) || 0;
        const cardAmt = parseFloat(prev.auc_card_amt) || 0;
        const otherPayments = bankAmt + onlineAmt + cardAmt;
        const remainder = Math.max(0, autoTotal - otherPayments);

        updated.auc_cash_amt = remainder > 0 ? remainder.toString() : '';
      }

      return updated;
    });
  };

  const totalPayment = (parseFloat(formData.auc_cash_amt) || 0) +
    (parseFloat(formData.auc_bank_amt) || 0) +
    (parseFloat(formData.auc_online_amt) || 0) +
    (parseFloat(formData.auc_card_amt) || 0);

  const payableAmt = parseFloat(formData.auc_payable_amt) || 0;

  let validationError = "";
  if (payableAmt <= 0) {
    validationError = "Total Payable Amount must be greater than 0";
  } else if (!loanDetails?.girv_id) {
    validationError = "Loan details missing";
  } else if (!formData.auc_user_full_name.trim()) {
    validationError = "Full name is required";
  } else if (!formData.auc_user_mobile || formData.auc_user_mobile.length < 10) {
    validationError = "Valid mobile number is required";
  } else if (Math.abs(payableAmt - totalPayment) > 0.01) {
    validationError = `Total Payment Modes (${totalPayment.toFixed(2)}) must equal Total Payable Amount (${payableAmt.toFixed(2)})`;
  } else if (parseFloat(formData.auc_cash_amt) > 0 && !formData.auc_cash_acc_id) {
    validationError = "Please select a Cash Account.";
  } else if (parseFloat(formData.auc_bank_amt) > 0 && !formData.auc_bank_acc_id) {
    validationError = "Please select a Bank Account.";
  } else if (parseFloat(formData.auc_online_amt) > 0 && !formData.auc_online_acc_id) {
    validationError = "Please select an Online Account.";
  } else if (parseFloat(formData.auc_card_amt) > 0 && !formData.auc_card_acc_id) {
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
        auc_girv_id: loanDetails.girv_id,
        auc_firm_id: loanDetails.girv_firm_id,
        auc_user_id: loanDetails.girv_user_id
      };

      await addAuction(payload);
      toast.success("Auction submitted successfully");
      if (onSuccess) onSuccess();
      if (onClose && !isTab) onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.error || "Failed to submit auction");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="custom-modal-body bg-red">

      {/* Loan Information */}
      <div className="section-title">Loan Information</div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Principal Amount</label>
          <input type="text" id="auc_prin_amt" value={formData.auc_prin_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Loan Interest</label>
          <input type="text" id="auc_int_amt" value={formData.auc_int_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Deposit Amount</label>
          <input type="text" id="auc_dep_amt" value={formData.auc_dep_amt} onChange={handleInputChange} className="form-control border-dark text-center" placeholder="0" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Total Payable Amount</label>
          <input type="text" id="auc_payable_amt" value={formData.auc_payable_amt} className="form-control border-dark text-center bg-light" readOnly />
        </div>
      </div>

      {/* User Information */}
      <div className="section-title">User Information</div>
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Full Name</label>
          <input type="text" id="auc_user_full_name" value={formData.auc_user_full_name} onChange={handleInputChange} className="form-control border-dark" placeholder="Enter full name" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Mobile</label>
          <input type="text" id="auc_user_mobile" value={formData.auc_user_mobile} onChange={handleInputChange} className="form-control border-dark" placeholder="Enter mobile number" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Email</label>
          <input type="email" id="auc_user_email" value={formData.auc_user_email} onChange={handleInputChange} className="form-control border-dark" placeholder="Enter email" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Gender</label>
          <select id="auc_user_gender" value={formData.auc_user_gender} onChange={handleInputChange} className="form-select border-dark">
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Aadhaar Card No</label>
          <input type="text" id="auc_user_aadhaar" value={formData.auc_user_aadhaar} onChange={handleInputChange} className="form-control border-dark" placeholder="12-digit Aadhaar" />
        </div>
        <div className="col-md-3">
          <label className="form-label">PAN Card No</label>
          <input type="text" id="auc_user_pan" value={formData.auc_user_pan} onChange={handleInputChange} className="form-control border-dark" placeholder="Enter PAN number" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Address</label>
          <input type="text" id="auc_user_address" value={formData.auc_user_address} onChange={handleInputChange} className="form-control border-dark" placeholder="Enter address" />
        </div>
        <div className="col-md-3">
          <label className="form-label">State</label>
          <input type="text" id="auc_user_state" value={formData.auc_user_state} onChange={handleInputChange} className="form-control border-dark" placeholder="State" />
        </div>
        <div className="col-md-3">
          <label className="form-label">City</label>
          <input type="text" id="auc_user_city" value={formData.auc_user_city} onChange={handleInputChange} className="form-control border-dark" placeholder="City" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Country</label>
          <input type="text" id="auc_user_country" value={formData.auc_user_country} onChange={handleInputChange} className="form-control border-dark" placeholder="Country" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Village</label>
          <input type="text" id="auc_user_village" value={formData.auc_user_village} onChange={handleInputChange} className="form-control border-dark" placeholder="Village" />
        </div>
        <div className="col-md-3">
          <label className="form-label">Pin Code</label>
          <input type="text" id="auc_user_pincode" value={formData.auc_user_pincode} onChange={handleInputChange} className="form-control border-dark" placeholder="Pin code" />
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="row g-4">
        <div className="col-md-8">
          <div className="section-title">Payment Details</div>

          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="auc_cash_acc_id" value={formData.auc_cash_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_cash_info" value={formData.auc_cash_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_cash_amt" value={formData.auc_cash_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CASH AMOUNT" />
            </div>
          </div>

          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="auc_bank_acc_id" value={formData.auc_bank_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_bank_info" value={formData.auc_bank_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_bank_amt" value={formData.auc_bank_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="BANK AMOUNT" />
            </div>
          </div>

          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="auc_online_acc_id" value={formData.auc_online_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_online_info" value={formData.auc_online_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_online_amt" value={formData.auc_online_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="ONLINE AMOUNT" />
            </div>
          </div>

          <div className="row g-2 mb-2 align-items-end">
            <div className="col-md-4">
              <select id="auc_card_acc_id" value={formData.auc_card_acc_id} onChange={handleInputChange} className="form-select form-select-sm border-dark">
                <option value="">Select Account</option>
                {accounts.map(acc => (
                  <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_card_info" value={formData.auc_card_info} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD INFORMATION" />
            </div>
            <div className="col-md-4">
              <input type="text" id="auc_card_amt" value={formData.auc_card_amt} onChange={handleInputChange} className="form-control form-control-sm border-dark" placeholder="CARD AMOUNT" />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="section-title">Other Information</div>

          <div className="mb-2">
            <textarea
              id="auc_pay_info"
              value={formData.auc_pay_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="PAYMENT OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
          <div>
            <textarea
              id="auc_other_info"
              value={formData.auc_other_info}
              onChange={handleInputChange}
              className="form-control border-dark"
              placeholder="OTHER INFORMATION"
              rows={3}
            ></textarea>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="row mt-2">
          <div className="col text-center">
            <div className="alert alert-danger py-2 mb-0 fw-bold">{validationError}</div>
          </div>
        </div>
      )}

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
            ) : "Auction Loan"}
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

        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className="py-1">Auction Loan</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {content}

      </form>
    </div>
  );
};

export default AuctionModal;
