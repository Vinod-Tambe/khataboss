import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import { getFirmsDropdown } from '../../api/firmApi';
import { getAccountsDropdown, getAccountByUuid, updateAccount } from '../../api/accountApi';
import { toast } from 'react-hot-toast';
import { validatePincode, validatePan, validateAccountNo, validateBsrCode } from '../../utils/validation';

const UpdateAccount = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    acc_name: '',
    acc_opening_date: moment().format('YYYY-MM-DD'),
    acc_cash_balance: '',
    acc_balance_type: 'CR',
    acc_firm_id: '',
    acc_pre_acc: '',
    acc_bank_no: '',
    acc_ifsc_code: '',
    acc_branch_name: '',
    acc_pan_no: '',
    acc_bsr_no: '',
    acc_address: '',
    acc_pincode: '',
    acc_country: 'IN',
    acc_state: 'Rajasthan',
    acc_city: '',
    acc_desc: '',
    acc_other_info: '',
    acc_is_system: false
  });

  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const openingDateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

  useEffect(() => {
    // Initialize date picker
    if (openingDateRef.current) {
      $(openingDateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, acc_opening_date: start.format('YYYY-MM-DD') }));
      });
    }

    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        setFetching(true);
        // Fetch firms
        const firmRes = await getFirmsDropdown();
        setFirms(firmRes.data || []);

        // Fetch current account data
        const accountRes = await getAccountByUuid(uuid);
        const accountData = accountRes.data;

        if (accountData) {
          setFormData({
            acc_name: accountData.acc_name || '',
            acc_opening_date: accountData.acc_opening_date ? moment(accountData.acc_opening_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
            acc_cash_balance: accountData.acc_cash_balance || '',
            acc_balance_type: accountData.acc_balance_type || 'CR',
            acc_firm_id: accountData.acc_firm_id || '',
            acc_pre_acc: accountData.acc_pre_acc || '',
            acc_bank_no: accountData.acc_bank_no || '',
            acc_ifsc_code: accountData.acc_ifsc_code || '',
            acc_branch_name: accountData.acc_branch_name || '',
            acc_pan_no: accountData.acc_pan_no || '',
            acc_bsr_no: accountData.acc_bsr_no || '',
            acc_address: accountData.acc_address || '',
            acc_pincode: accountData.acc_pincode || '',
            acc_country: accountData.acc_country || 'IN',
            acc_state: accountData.acc_state || 'Rajasthan',
            acc_city: accountData.acc_city || '',
            acc_desc: accountData.acc_desc || '',
            acc_other_info: accountData.acc_other_info || '',
            acc_is_system: accountData.acc_is_system || false
          });

          // Also update the date picker display
          if (openingDateRef.current) {
            $(openingDateRef.current).data('daterangepicker').setStartDate(moment(accountData.acc_opening_date).format('DD-MM-YYYY'));
            $(openingDateRef.current).data('daterangepicker').setEndDate(moment(accountData.acc_opening_date).format('DD-MM-YYYY'));
          }
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
        toast.error("Failed to load account details");
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [uuid]);

  // Fetch filtered accounts whenever firm changes
  useEffect(() => {
    const fetchFilteredAccounts = async () => {
      if (!formData.acc_firm_id) return;
      try {
        const accountRes = await getAccountsDropdown(formData.acc_firm_id);
        const fetchedAccounts = accountRes.data || [];
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Error fetching filtered accounts:", error);
      }
    };

    fetchFilteredAccounts();
  }, [formData.acc_firm_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'acc_cash_balance') {
      // Allow only numbers and a single decimal point
      const cleanedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = cleanedValue.split('.');
      const finalValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleanedValue;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.acc_name || !formData.acc_firm_id || !formData.acc_pre_acc) {
      toast.error('Please fill in all required fields.');
      return false;
    }

    if (formData.acc_pincode && !validatePincode(formData.acc_pincode)) {
      toast.error('Invalid Pincode. It should be 6 digits and not start with 0.');
      return false;
    }

    if (formData.acc_pan_no && !validatePan(formData.acc_pan_no)) {
      toast.error('Invalid PAN Number. Format: ABCDE1234F');
      return false;
    }

    if (formData.acc_bank_no && !validateAccountNo(formData.acc_bank_no)) {
      toast.error('Invalid Bank Account Number. It should be 9 to 18 digits.');
      return false;
    }

    if (formData.acc_bsr_no && !validateBsrCode(formData.acc_bsr_no)) {
      toast.error('Invalid BSR Code. It should be exactly 7 digits.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateAccount(uuid, formData);
      toast.success('Account updated successfully!');
      navigate('/account/list');
    } catch (error) {
      toast.error(error.message || 'Error updating account');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary">
      <h4 className="card-title text-center fw-bold pb-md-0">Update Account</h4>

      <form ref={formRef} noValidate onSubmit={handleSubmit}>
        <h5 className="text-muted" >Account & Bank Details</h5>
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Account Name <span className="text-danger">*</span></label>
            <input
              type="text"
              name="acc_name"
              placeholder="Enter account name"
              className="form-control border-dark"
              value={formData.acc_name}
              onChange={handleChange}
              disabled={formData.acc_is_system}
              required
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Opening Balance Date <span className="text-danger">*</span></label>
            <input
              type="text"
              name="acc_opening_date"
              ref={openingDateRef}
              className="form-control border-dark"
              defaultValue={moment(formData.acc_opening_date).format('DD-MM-YYYY')}
              disabled={formData.acc_is_system}
              required
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Account Balance <span className="text-danger">*</span></label>
            <input
              type="text"
              name="acc_cash_balance"
              placeholder="0.00"
              className="form-control border-dark text-start"
              value={formData.acc_cash_balance}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Balance Type <span className="text-danger">*</span></label>
            <select name="acc_balance_type" className="form-select border-dark" value={formData.acc_balance_type} onChange={handleChange} disabled={formData.acc_is_system} required>
              <option value="" disabled>Select type</option>
              <option value="CR">CR - Credit</option>
              <option value="DR">DR – Debit</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Firm Name <span className="text-danger">*</span></label>
            <select name="acc_firm_id" className="form-select border-dark" value={formData.acc_firm_id} onChange={handleChange} disabled={formData.acc_is_system} required>
              <option value="">Select Firm</option>
              {firms.map(firm => (
                <option key={firm.firm_id} value={firm.firm_id}>
                  {firm.firm_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Primary Account <span className="text-danger">*</span></label>
            <select name="acc_pre_acc" className="form-select border-dark" value={formData.acc_pre_acc} onChange={handleChange} disabled={formData.acc_is_system} required>
              <option value="" disabled>Select Account</option>
              {accounts.map(acc => (
                <option key={acc.acc_id} value={acc.acc_name}>
                  {acc.acc_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Bank Account Number</label>
            <input
              type="text"
              name="acc_bank_no"
              placeholder="Enter account number"
              className="form-control border-dark"
              value={formData.acc_bank_no}
              onChange={handleChange}
              pattern="[0-9]{9,18}"
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">IFSC Code</label>
            <input
              type="text"
              name="acc_ifsc_code"
              placeholder="SBIN0001234"
              className="form-control border-dark text-uppercase"
              maxLength={11}
              value={formData.acc_ifsc_code}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Branch Name</label>
            <input
              type="text"
              name="acc_branch_name"
              placeholder="Enter branch name"
              className="form-control border-dark"
              value={formData.acc_branch_name}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">PAN Number</label>
            <input
              type="text"
              name="acc_pan_no"
              placeholder="ABCDE1234F"
              className="form-control border-dark text-uppercase"
              maxLength={10}
              value={formData.acc_pan_no}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">BSR Code</label>
            <input
              type="text"
              name="acc_bsr_no"
              placeholder="Enter BSR Code"
              className="form-control border-dark"
              value={formData.acc_bsr_no}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Bank Address</label>
            <textarea
              name="acc_address"
              rows={1}
              placeholder="Full branch address"
              className="form-control border-dark"
              value={formData.acc_address}
              onChange={handleChange}
            />
          </div>
        </div>
        <h5 className=" text-muted mt-4">Additional Details</h5>
        <div className="row g-3 mb-5">
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Country</label>
            <select name="acc_country" className="form-select border-dark" value={formData.acc_country} onChange={handleChange}>
              <option value="">Select country (Optional)</option>
              <option value="IN">India</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">State</label>
            <select name="acc_state" className="form-select border-dark" value={formData.acc_state} onChange={handleChange}>
              <option value="">Select state (Optional)</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">City / Village</label>
            <input
              type="text"
              name="acc_city"
              placeholder="Enter city or village"
              className="form-control border-dark"
              value={formData.acc_city}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label fw-medium">Pincode</label>
            <input
              type="text"
              name="acc_pincode"
              placeholder="6-digit pincode"
              className="form-control border-dark"
              maxLength={6}
              value={formData.acc_pincode}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-6 col-lg-6">
            <label className="form-label fw-medium">Account Description</label>
            <textarea
              name="acc_desc"
              rows={1}
              placeholder="Purpose, nickname..."
              className="form-control border-dark"
              value={formData.acc_desc}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-6">
            <label className="form-label fw-medium">Other Information</label>
            <textarea
              name="acc_other_info"
              rows={1}
              placeholder="Extra notes..."
              className="form-control border-dark"
              value={formData.acc_other_info}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-grid d-md-block text-center mt-5">
          <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading}>
            {loading ? 'Updating...' : 'Update Account'}
          </button>
          <button type="button" className="btn btn-outline-secondary btn-lg px-5 ms-md-3 mt-3 mt-md-0" onClick={() => navigate('/account/list')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateAccount;
