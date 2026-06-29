import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import $ from 'jquery';
import moment from 'moment';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { getAccountsDropdown } from '../../../api/accountApi';
import { addAdditionalPrincipal } from '../../../api/addPrincipalApi';
import { toast } from 'react-hot-toast';
import '../../../css/Modal.css';

const AddPrincipalModal = ({ isOpen, onClose, loanDetails, onSuccess }) => {
  const { selectedFirm } = useSelector((state) => state.firm);
  const [accounts, setAccounts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const ap_trans_dateRef = useRef(null);

  const [formData, setFormData] = useState({
    ap_trans_date: new Date().toISOString().split('T')[0],
    ap_prin_amt: '0',
    ap_roi: '',
    ap_payable_amt: '0',

    ap_cash_acc_id: '',
    ap_cash_info: '',
    ap_cash_amt: '',

    ap_bank_acc_id: '',
    ap_bank_info: '',
    ap_bank_amt: '',

    ap_online_acc_id: '',
    ap_online_info: '',
    ap_online_amt: '',

    ap_card_acc_id: '',
    ap_card_info: '',
    ap_card_amt: '',

    ap_pay_info: '',
    ap_other_info: ''
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

  // Sync loan details when modal opens or loan changes
  useEffect(() => {
    if (loanDetails) {
      setFormData(prev => ({
        ...prev,
        ap_prin_amt: '',
        ap_roi: loanDetails.girv_roi || '',
        ap_payable_amt: '0.00',
        ap_cash_amt: '',
        ap_bank_amt: '',
        ap_online_amt: '',
        ap_card_amt: '',
        ap_pay_info: '',
        ap_other_info: ''
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
        if (!prev.ap_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.ap_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.ap_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.ap_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.ap_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.ap_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.ap_card_acc_id) {
          const cardAcc = accounts.find(a =>
            a.acc_name.toLowerCase().includes("card") ||
            a.acc_name.toLowerCase().includes("pos")
          );
          if (cardAcc) updates.ap_card_acc_id = cardAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  // Initialize JQuery Date Range Picker
  useEffect(() => {
    if (isOpen && ap_trans_dateRef.current) {
      $(ap_trans_dateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, ap_trans_date: start.format('YYYY-MM-DD') }));
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let finalValue = value;

    if (id.includes('_amt') || id === 'ap_roi' || id === 'ap_prin_amt' || id === 'ap_payable_amt') {
      finalValue = value.replace(/[^0-9.]/g, '');
    }

    setFormData(prev => {
      const updated = { ...prev, [id]: finalValue };

      // User enters Principal Amount directly
      if (id === 'ap_prin_amt') {
        const prinAmt = parseFloat(finalValue) || 0;
        updated.ap_payable_amt = finalValue;

        // Auto-fill cash amount with remainder
        const bankAmt = parseFloat(prev.ap_bank_amt) || 0;
        const onlineAmt = parseFloat(prev.ap_online_amt) || 0;
        const cardAmt = parseFloat(prev.ap_card_amt) || 0;
        const otherPayments = bankAmt + onlineAmt + cardAmt;
        const remainder = Math.max(0, prinAmt - otherPayments);

        updated.ap_cash_amt = remainder > 0 ? remainder.toString() : '';
      }

      // User enters one of the Payment Amounts directly
      else if (id.includes('_amt')) {
        const cashAmt = parseFloat(id === 'ap_cash_amt' ? finalValue : prev.ap_cash_amt) || 0;
        const bankAmt = parseFloat(id === 'ap_bank_amt' ? finalValue : prev.ap_bank_amt) || 0;
        const onlineAmt = parseFloat(id === 'ap_online_amt' ? finalValue : prev.ap_online_amt) || 0;
        const cardAmt = parseFloat(id === 'ap_card_amt' ? finalValue : prev.ap_card_amt) || 0;

        const total = cashAmt + bankAmt + onlineAmt + cardAmt;
        updated.ap_prin_amt = total > 0 ? total.toString() : '';
        updated.ap_payable_amt = total > 0 ? total.toString() : '';
      }

      return updated;
    });
  };

  const totalPayment = (parseFloat(formData.ap_cash_amt) || 0) +
    (parseFloat(formData.ap_bank_amt) || 0) +
    (parseFloat(formData.ap_online_amt) || 0) +
    (parseFloat(formData.ap_card_amt) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prinAmt = parseFloat(formData.ap_prin_amt) || 0;
    if (prinAmt <= 0) {
      toast.error("Principal Amount must be greater than 0");
      return;
    }

    const roi = parseFloat(formData.ap_roi) || 0;
    if (roi <= 0) {
      toast.error("Rate of Interest must be greater than 0");
      return;
    }

    if (Math.abs(totalPayment - prinAmt) > 0.01) {
      toast.error(`Payment sum (${totalPayment.toFixed(2)}) must exactly equal the Principal Amount (${prinAmt.toFixed(2)})`);
      return;
    }

    // Selected Account validations
    if (parseFloat(formData.ap_cash_amt) > 0 && !formData.ap_cash_acc_id) {
      toast.error("Please select a Cash Account.");
      return;
    }
    if (parseFloat(formData.ap_bank_amt) > 0 && !formData.ap_bank_acc_id) {
      toast.error("Please select a Bank Account.");
      return;
    }
    if (parseFloat(formData.ap_online_amt) > 0 && !formData.ap_online_acc_id) {
      toast.error("Please select an Online Account.");
      return;
    }
    if (parseFloat(formData.ap_card_amt) > 0 && !formData.ap_card_acc_id) {
      toast.error("Please select a Card Account.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ap_girv_id: loanDetails.girv_id,
        ap_firm_id: loanDetails.girv_firm_id,
        ap_user_id: loanDetails.girv_user_id,
        ap_staff_id: loanDetails.girv_staff_id || 0,

        ap_trans_date: formData.ap_trans_date,
        ap_prin_amt: prinAmt,
        ap_roi: roi,
        ap_payable_amt: parseFloat(formData.ap_payable_amt) || prinAmt,

        ap_cash_amt: parseFloat(formData.ap_cash_amt) || 0,
        ap_cash_acc_id: formData.ap_cash_acc_id ? parseInt(formData.ap_cash_acc_id) : null,
        ap_cash_info: formData.ap_cash_info,

        ap_bank_amt: parseFloat(formData.ap_bank_amt) || 0,
        ap_bank_acc_id: formData.ap_bank_acc_id ? parseInt(formData.ap_bank_acc_id) : null,
        ap_bank_info: formData.ap_bank_info,

        ap_online_amt: parseFloat(formData.ap_online_amt) || 0,
        ap_online_acc_id: formData.ap_online_acc_id ? parseInt(formData.ap_online_acc_id) : null,
        ap_online_info: formData.ap_online_info,

        ap_card_amt: parseFloat(formData.ap_card_amt) || 0,
        ap_card_acc_id: formData.ap_card_acc_id ? parseInt(formData.ap_card_acc_id) : null,
        ap_card_info: formData.ap_card_info,

        ap_pay_info: formData.ap_pay_info,
        ap_other_info: formData.ap_other_info,
      };

      await addAdditionalPrincipal(payload);
      toast.success("Additional Principal added successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding principal:", error);
      toast.error(error.error || error.message || "Failed to add additional principal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <form className="custom-modal-container" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>

        {/* Header */}
        <div className="custom-modal-header bg-light d-flex justify-content-between p-3 pt-2 pb-2">
          <h5 className='py-1'>Additional Principal Information</h5>
          <button type="button" className="custom-modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Body */}
        <div className="custom-modal-body bg-blue">

          {/* Top Section */}
          <div className="row g-3 mb-3">
            <div className="col">
              <label className="form-label">Transaction Date</label>
              <input
                type="text"
                className="form-control border-dark text-center"
                ref={ap_trans_dateRef}
                id="ap_trans_date"
                defaultValue={formData.ap_trans_date ? moment(formData.ap_trans_date).format('DD-MM-YYYY') : moment().format('DD-MM-YYYY')}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Principal Amount</label>
              <input
                type="text"
                className="form-control border-dark text-center"
                id="ap_prin_amt"
                value={formData.ap_prin_amt}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Rate of Interest</label>
              <input
                type="text"
                className="form-control border-dark text-center"
                id="ap_roi"
                value={formData.ap_roi}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Payable Amount</label>
              <input
                type="text"
                className="form-control border-dark text-center"
                id="ap_payable_amt"
                value={formData.ap_payable_amt}
                disabled
                required
              />
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
                  <select
                    className="form-select form-select-sm border-dark"
                    id="ap_cash_acc_id"
                    value={formData.ap_cash_acc_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Cash Account</option>
                    {accounts.map(acc => (
                      <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Cash Information"
                    id="ap_cash_info"
                    value={formData.ap_cash_info}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Cash Amount"
                    id="ap_cash_amt"
                    value={formData.ap_cash_amt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Bank Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm border-dark"
                    id="ap_bank_acc_id"
                    value={formData.ap_bank_acc_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Bank Account</option>
                    {accounts.map(acc => (
                      <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Bank Information"
                    id="ap_bank_info"
                    value={formData.ap_bank_info}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Bank Amount"
                    id="ap_bank_amt"
                    value={formData.ap_bank_amt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Online Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm border-dark"
                    id="ap_online_acc_id"
                    value={formData.ap_online_acc_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Online Account</option>
                    {accounts.map(acc => (
                      <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Online Information"
                    id="ap_online_info"
                    value={formData.ap_online_info}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Online Amount"
                    id="ap_online_amt"
                    value={formData.ap_online_amt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Card Row */}
              <div className="row g-2 mb-2 align-items-end">
                <div className="col-md-4">
                  <select
                    className="form-select form-select-sm border-dark"
                    id="ap_card_acc_id"
                    value={formData.ap_card_acc_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Card Account</option>
                    {accounts.map(acc => (
                      <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Card Information"
                    id="ap_card_info"
                    value={formData.ap_card_info}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm border-dark"
                    placeholder="Card Amount"
                    id="ap_card_amt"
                    value={formData.ap_card_amt}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Other Info) */}
            <div className="col-md-4">
              <div className="section-title">Other Information</div>
              <div className="mb-2">
                <textarea
                  className="form-control border-dark"
                  placeholder="Payment Other Information"
                  rows={3}
                  id="ap_pay_info"
                  value={formData.ap_pay_info}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div>
                <textarea
                  className="form-control border-dark"
                  placeholder="Other Information"
                  rows={3}
                  id="ap_other_info"
                  value={formData.ap_other_info}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col text-center mt-2">
              <button
                type="submit"
                className="btn btn-primary px-5 py-2"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Add Principal'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AddPrincipalModal;
