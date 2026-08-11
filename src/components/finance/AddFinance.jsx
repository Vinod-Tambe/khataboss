import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';
import useAddFinanceCalculator from '../../hooks/useAddFinanceCalculator';
import { getFirmsDropdown } from '../../api/firmApi';
import { getAccountsDropdown } from '../../api/accountApi';
import { createFinance } from '../../api/financeApi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const AddFinance = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fin_prin_amt: '',
    fin_no_of_emi: '',
    fin_start_date: moment().format('YYYY-MM-DD'),
    fin_firm_id: '',
    fin_freq: '1',
    fin_freq_type: 'MONTHLY',
    fin_roi: '',
    fin_collec_amt: '',
    fin_proccess_amt: '',
    fin_fine_amt: '',
    fin_fine_emi_no: '',
    fin_staff_id: '',
    fin_user_id: '',
    fin_dr_acc_id: '',
    fin_emi_amt: '0.00',
    fin_final_amt: '0.00',

    // Payment related
    fin_cash_acc_id: '',
    fin_cash_amt: '',
    fin_cash_info: '',

    fin_bank_acc_id: '',
    fin_bank_amt: '',
    fin_bank_info: '',

    fin_online_acc_id: '',
    fin_online_amt: '',
    fin_online_info: '',

    fin_card_acc_id: '',
    fin_card_amt: '',
    fin_card_info: '',

    fin_pay_info: '',
    fin_other_info: '',
  });

  const [firms, setFirms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const { selectedUser } = useSelector((state) => state.user);
  const { selectedFirmId, firms: reduxFirms } = useSelector((state) => state.firm);

  const startDateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

  // Finance Calculator Hook
  const { fin_emi_amt, fin_final_amt, fin_receivable_amt, fin_interest_amt, isEmiInvalid, emiError } =
    useAddFinanceCalculator({
      fin_prin_amt: formData.fin_prin_amt,
      fin_no_of_emi: formData.fin_no_of_emi,
      fin_freq_type: formData.fin_freq_type,
      fin_proccess_amt: formData.fin_proccess_amt,
      fin_roi: formData.fin_roi,
    });

  const hasEmiInputs =
    (parseFloat(formData.fin_prin_amt) || 0) > 0 && (parseInt(formData.fin_no_of_emi, 10) || 0) > 0;

  // Sync calculated values to formData
  useEffect(() => {
    setFormData(prev => {
      const updates = {
        fin_emi_amt,
        fin_final_amt
      };
      // If cash amount is empty or was previously synced with final amount, update it
      if (!prev.fin_cash_amt || prev.fin_cash_amt === prev.fin_final_amt) {
        updates.fin_cash_amt = fin_final_amt;
      }
      return { ...prev, ...updates };
    });
  }, [fin_emi_amt, fin_final_amt]);

  useEffect(() => {
    if (startDateRef.current) {
      $(startDateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD-MM-YYYY'
        }
      }, (start) => {
        setFormData(prev => ({ ...prev, fin_start_date: start.format('YYYY-MM-DD') }));
      });
    }

    const fetchFirms = async () => {
      try {
        console.log("Fetching firms for dropdown...");
        const firmRes = await getFirmsDropdown();
        console.log("Firm response:", firmRes);
        const firmData = firmRes.data || firmRes || [];
        setFirms(Array.isArray(firmData) ? firmData : []);
      } catch (error) {
        console.error("Error fetching firms:", error);
      }
    };

    fetchFirms();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync firm ID with Header selection
  useEffect(() => {
    if (selectedFirmId === 'all') {
      if (reduxFirms.length > 0 && !formData.fin_firm_id) {
        setFormData(prev => ({ ...prev, fin_firm_id: reduxFirms[0].firm_id }));
      }
    } else if (selectedFirmId && selectedFirmId !== formData.fin_firm_id) {
      setFormData(prev => ({ ...prev, fin_firm_id: selectedFirmId }));
    }
  }, [selectedFirmId, reduxFirms, formData.fin_firm_id]);

  // Sync User ID with Active User selection
  useEffect(() => {
    if (selectedUser && selectedUser.user_id !== formData.fin_user_id) {
      setFormData(prev => ({ ...prev, fin_user_id: selectedUser.user_id }));
    }
  }, [selectedUser, formData.fin_user_id]);

  // Fetch accounts when firm changes
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!formData.fin_firm_id) return;
      try {
        console.log(`Fetching accounts for firm ID: ${formData.fin_firm_id}...`);
        const accRes = await getAccountsDropdown(formData.fin_firm_id);
        console.log("Account response:", accRes);
        const accData = accRes.data || accRes || [];
        setAccounts(Array.isArray(accData) ? accData : []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, [formData.fin_firm_id]);

  // Auto-select default accounts when accounts list is loaded
  useEffect(() => {
    if (accounts.length > 0) {
      setFormData(prev => {
        const updates = {};
        if (!prev.fin_cash_acc_id) {
          const cashAcc = accounts.find(a => a.acc_name === "Cash In Hand");
          if (cashAcc) updates.fin_cash_acc_id = cashAcc.acc_id;
        }
        if (!prev.fin_bank_acc_id) {
          const bankAcc = accounts.find(a => a.acc_name === "Bank Account");
          if (bankAcc) updates.fin_bank_acc_id = bankAcc.acc_id;
        }
        if (!prev.fin_online_acc_id) {
          const onlineAcc = accounts.find(a => a.acc_name === "Online Account");
          if (onlineAcc) updates.fin_online_acc_id = onlineAcc.acc_id;
        }
        if (!prev.fin_dr_acc_id) {
          const drAcc = accounts.find(
            (a) =>
              a.acc_name === "Unsecured Loans" ||
              a.acc_name === "Loans & Advances" ||
              a.acc_name === "Finance Dr Account" ||
              a.acc_name === "Loan Account"
          );
          if (drAcc) updates.fin_dr_acc_id = drAcc.acc_id;
        }
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
      });
    }
  }, [accounts]);

  const totalSteps = 2;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For numeric fields, restrict input to numbers and at most one decimal point
    const numericFields = [
      'fin_prin_amt', 'fin_no_of_emi', 'fin_collec_amt', 'fin_proccess_amt',
      'fin_roi', 'fin_fine_amt', 'fin_cash_amt', 'fin_bank_amt',
      'fin_online_amt', 'fin_card_amt', 'fin_fine_emi_no', 'fin_freq'
    ];

    if (numericFields.includes(name)) {
      const integerFields = ['fin_no_of_emi', 'fin_fine_emi_no', 'fin_freq'];
      let sanitizedValue;

      if (integerFields.includes(name)) {
        // Allow only digits
        sanitizedValue = value.replace(/[^0-9]/g, '');
      } else {
        // Allow only digits and a single decimal point
        sanitizedValue = value.replace(/[^0-9.]/g, '');
        const parts = sanitizedValue.split('.');
        sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitizedValue;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
      return;
    }

    setFormData((prev) => {
      const updates = { [name]: type === 'checkbox' ? checked : value };

      // If total finance amount is changed, update cash amount if no other payments are set
      if (name === 'fin_final_amt') {
        const hasOtherPayments = parseFloat(prev.fin_bank_amt || 0) > 0 ||
          parseFloat(prev.fin_online_amt || 0) > 0 ||
          parseFloat(prev.fin_card_amt || 0) > 0;

        if (!hasOtherPayments) {
          updates.fin_cash_amt = value; // Sync the entered value (including characters)
        }
      }

      return { ...prev, ...updates };
    });
  };



  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fin_prin_amt || !formData.fin_start_date) {
        alert('Please fill required fields: Principal Amount, Start Date');
        return;
      }
      const noOfEmi = parseInt(formData.fin_no_of_emi || 0, 10) || 0;
      if (!(noOfEmi > 0)) {
        alert('Please enter No Of EMI (must be greater than 0)');
        return;
      }
      if (isEmiInvalid) {
        alert(emiError || 'Per EMI amount must be a whole number.');
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fin_firm_id) {
      toast.error('Please select Firm');
      return;
    }
    if (!formData.fin_user_id || formData.fin_user_id === '0') {
      toast.error('Please select User / Customer');
      return;
    }
    if (!formData.fin_prin_amt || !formData.fin_start_date) {
      toast.error('Please fill required fields (Principal, Date)');
      return;
    }
    const noOfEmi = parseInt(formData.fin_no_of_emi || 0, 10) || 0;
    if (!(noOfEmi > 0)) {
      toast.error('No Of EMI must be greater than 0');
      return;
    }
    if (isEmiInvalid) {
      toast.error(emiError || 'Per EMI amount must be a whole number.');
      return;
    }
    const freq = parseInt(String(formData.fin_freq || '').trim() || '1', 10);
    if (!(freq > 0)) {
      toast.error('Frequency must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      // Validate disbursement channels = prin − process fee
      const disbursed = parseFloat(formData.fin_final_amt || 0);
      const prin = parseFloat(formData.fin_prin_amt || 0);
      const processFee = parseFloat(formData.fin_proccess_amt || 0);
      const cash = parseFloat(formData.fin_cash_amt || 0);
      const bank = parseFloat(formData.fin_bank_amt || 0);
      const online = parseFloat(formData.fin_online_amt || 0);
      const card = parseFloat(formData.fin_card_amt || 0);
      const sumPayments = cash + bank + online + card;

      if (processFee > prin) {
        toast.error("Process fee cannot exceed principal");
        setLoading(false);
        return;
      }
      if (Math.abs(disbursed - sumPayments) > 0.01) {
        toast.error(
          `Payment channels (${sumPayments.toFixed(2)}) must equal Disbursement Amount (${disbursed.toFixed(2)})`
        );
        setLoading(false);
        return;
      }

      const fineAmt = parseFloat(formData.fin_fine_amt || 0) || 0;
      const fineEmiNo = parseInt(formData.fin_fine_emi_no || 0, 10) || 0;
      if (fineAmt > 0 || fineEmiNo > 0) {
        if (!(fineAmt > 0 && fineEmiNo > 0)) {
          toast.error("Both Fine Amount and Fine EMI No are required when fine is set");
          setLoading(false);
          return;
        }
        if (fineEmiNo > noOfEmi) {
          toast.error(`Fine EMI No (${fineEmiNo}) cannot exceed total EMIs (${noOfEmi})`);
          setLoading(false);
          return;
        }
      }

      console.log('Sending Finance Data:', formData);
      await createFinance(formData);
      toast.success('Finance record saved successfully!');
      navigate('/user/home/active-finance');
    } catch (error) {
      console.error('Error saving finance:', error);
      toast.error(error.message || 'Error saving finance record');
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // FINANCE INFORMATION SECTION
  // ────────────────────────────────────────────────
  const FinanceInformation = (
    <>
      <h5 className="text-muted">Finance Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Principal Amount <span className="text-danger">*</span></label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_prin_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_prin_amt}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">No Of EMI <span className="text-danger">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            name="fin_no_of_emi"
            placeholder="12"
            className="form-control border-dark"
            value={formData.fin_no_of_emi}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Start Date <span className="text-danger">*</span></label>
          <input
            type="text"
            name="fin_start_date"
            ref={startDateRef}
            className="form-control border-dark"
            defaultValue={formData.fin_start_date ? moment(formData.fin_start_date).format('DD-MM-YYYY') : ''}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Firm Name <span className="text-danger">*</span></label>
          <select
            name="fin_firm_id"
            className="form-select border-dark"
            value={formData.fin_firm_id}
            onChange={handleChange}
          >
            <option value="">Select Firm</option>
            {firms.map(firm => (
              <option key={firm.firm_id} value={firm.firm_id}>
                {firm.firm_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Frequency Type</label>
          <select
            name="fin_freq_type"
            placeholder="1 , 2"
            className="form-select border-dark"
            value={formData.fin_freq_type}
            onChange={handleChange}
          >
            <option value="DAILY">Daily</option>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Frequency <span className="text-danger">*</span></label>
          <input
            type="text"
            name="fin_freq"
            placeholder="1"
            className="form-control border-dark"
            value={formData.fin_freq}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Collect Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_collec_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_collec_amt}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Processing Fees</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_proccess_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_proccess_amt}
            onChange={handleChange}
          />
        </div>


        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Rate Of Interest (ROI)</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_roi"
            placeholder="2.5"
            className="form-control border-dark"
            value={formData.fin_roi}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Fine Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_fine_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_fine_amt}
            onChange={handleChange}
          />
          <div className="form-text">Optional. Fee charged per Fine EMI No overdue EMIs.</div>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Fine EMI No</label>
          <input
            type="text"
            inputMode="numeric"
            name="fin_fine_emi_no"
            placeholder="e.g. 2"
            className="form-control border-dark"
            value={formData.fin_fine_emi_no}
            onChange={handleChange}
          />
          <div className="form-text">Must be ≤ total EMI count (e.g. ₹20 every 2 overdue EMIs).</div>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Per EMI Amount</label>
          <input
            type="text"
            name="fin_emi_amt"
            placeholder="0"
            className={`form-control border-dark ${isEmiInvalid ? 'is-invalid' : ''}`}
            value={fin_emi_amt}
            readOnly
          />
          {!isEmiInvalid && hasEmiInputs && (
            <div className="form-text">
              Principal (₹{formData.fin_prin_amt || 0}) ÷ {formData.fin_no_of_emi} EMIs
              {parseFloat(fin_interest_amt) > 0 && (
                <> — interest ₹{fin_interest_amt} collected separately</>
              )}
            </div>
          )}
          {isEmiInvalid && (
            <div className="invalid-feedback d-block fw-bold" style={{ fontSize: '0.8rem' }}>
              {emiError}
            </div>
          )}
        </div>


        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Interest (from ROI)</label>
          <input
            type="text"
            className="form-control border-dark"
            value={fin_interest_amt}
            readOnly
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Total Receivable</label>
          <input
            type="text"
            className="form-control border-dark"
            value={fin_receivable_amt}
            readOnly
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3 ms-auto">
          <label className="form-label fw-medium">Disbursement Amount</label>
          <input
            type="text"
            name="fin_final_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_final_amt}
            readOnly
          />
          <small className="text-muted">Principal − process fee (cash out)</small>
        </div>
      </div>
    </>
  );

  // ────────────────────────────────────────────────
  // PAYMENT INFORMATION SECTION (same as your original)
  // ────────────────────────────────────────────────
  // ────────────────────────────────────────────────
  // PAYMENT INFORMATION SECTION
  // ────────────────────────────────────────────────
  const PaymentInformation = (
    <>
      <h5 className="text-muted">Payment Information</h5>

      {/* Cash Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4 mb-3">
          <select
            name="fin_cash_acc_id"
            className="form-select border-dark"
            value={formData.fin_cash_acc_id}
            onChange={handleChange}
          >
            <option value="">Cash Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="fin_cash_info"
            placeholder="Cash Information"
            className="form-control border-dark"
            value={formData.fin_cash_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="fin_cash_amt"
            placeholder="Cash Amount"
            className="form-control border-dark"
            value={formData.fin_cash_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="fin_bank_acc_id"
            className="form-select border-dark"
            value={formData.fin_bank_acc_id}
            onChange={handleChange}
          >
            <option value="">Bank Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="fin_bank_info"
            placeholder="Bank Information"
            className="form-control border-dark"
            value={formData.fin_bank_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="fin_bank_amt"
            placeholder="Bank Amount"
            className="form-control border-dark"
            value={formData.fin_bank_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Online Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="fin_online_acc_id"
            className="form-select border-dark"
            value={formData.fin_online_acc_id}
            onChange={handleChange}
          >
            <option value="">Online Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="fin_online_info"
            placeholder="Online Information"
            className="form-control border-dark"
            value={formData.fin_online_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4 mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="fin_online_amt"
            placeholder="Online Amount"
            className="form-control border-dark"
            value={formData.fin_online_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Card Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <select
            name="fin_card_acc_id"
            className="form-select border-dark"
            value={formData.fin_card_acc_id}
            onChange={handleChange}
          >
            <option value="">Card Account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            name="fin_card_info"
            placeholder="Card Information"
            className="form-control border-dark"
            value={formData.fin_card_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4  mb-3">
          <input
            type="text"
            inputMode="decimal"
            name="fin_card_amt"
            placeholder="Card Amount"
            className="form-control border-dark"
            value={formData.fin_card_amt}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-medium">Payment Other Information</label>
          <textarea
            name="fin_pay_info"
            rows={2}
            placeholder="Additional notes..."
            className="form-control border-dark"
            value={formData.fin_pay_info}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-medium">Other Information</label>
          <textarea
            name="fin_other_info"
            rows={2}
            placeholder="Additional notes..."
            className="form-control border-dark"
            value={formData.fin_other_info}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );

  const progressBar = isMobile ? (
    <div className="progress mt-3 mb-3" style={{ height: '8px' }}>
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        aria-valuenow={currentStep}
        aria-valuemin="1"
        aria-valuemax={totalSteps}
      />
    </div>
  ) : null;

  const navigationButtons = isMobile ? (
    <div className="d-flex justify-content-between mt-4">
      {currentStep > 1 && (
        <button type="button" className="btn btn-secondary" onClick={handleBack}>
          Back
        </button>
      )}
      {currentStep < totalSteps ? (
        <button type="button" className="btn btn-primary ms-auto" onClick={handleNext}>
          Next
        </button>
      ) : (
        <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading || isEmiInvalid}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            'Save Finance'
          )}
        </button>
      )}
    </div>
  ) : (
    <div className="d-grid d-md-block text-center mt-5">
      <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading || isEmiInvalid}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Saving...
          </>
        ) : (
          'Save Finance'
        )}
      </button>
    </div>
  );

  return (
    <div className="card border-0">
      <h4 className="card-title text-center fw-bold">Add New Finance</h4>

      <form ref={formRef} noValidate onSubmit={handleSubmit}>
        {progressBar}

        {isMobile ? (
          <>
            {currentStep === 1 && FinanceInformation}
            {currentStep === 2 && PaymentInformation}
          </>
        ) : (
          <>
            {FinanceInformation}
            <hr className="" />
            {PaymentInformation}
          </>
        )}

        {navigationButtons}
      </form>
    </div>
  );
};

export default AddFinance;