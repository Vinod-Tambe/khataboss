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


const AddFinance = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    fin_prin_amt: '',
    fin_no_of_emi: '',
    fin_start_date: moment().format('YYYY-MM-DD'),
    fin_firm_id: '',
    fin_freq: 'MONTHLY',
    fin_freq_type: '',
    fin_roi: '',
    fin_collec_amt: '',
    fin_proccess_amt: '',
    fin_fine_amt: '',
    fin_fine_emi_no: '',
    fin_staff_id: '',
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
  const { selectedFirmId, firms: reduxFirms } = useSelector((state) => state.firm);

  const startDateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

  // Finance Calculator Hook
  const { fin_emi_amt, fin_final_amt } = useAddFinanceCalculator({
    fin_prin_amt: formData.fin_prin_amt,
    fin_no_of_emi: formData.fin_no_of_emi,
    fin_freq_type: formData.fin_freq,
    fin_proccess_amt: formData.fin_proccess_amt,
  });

  // Sync calculated values to formData
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fin_emi_amt,
      fin_final_amt
    }));
  }, [fin_emi_amt, fin_final_amt]);

  useEffect(() => {
    if (startDateRef.current) {
      $(startDateRef.current).daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoUpdateInput: true,
        locale: {
          format: 'DD/MM/YYYY'
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
        if (!prev.fin_card_acc_id) {
          const cardAcc = accounts.find(a => a.acc_name === "Card Account");
          if (cardAcc) updates.fin_card_acc_id = cardAcc.acc_id;
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
      'fin_online_amt', 'fin_card_amt'
    ];

    if (numericFields.includes(name)) {
      // Allow only digits and a single decimal point
      const sanitizedValue = value.replace(/[^0-9.]/g, '');
      const parts = sanitizedValue.split('.');
      const finalValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitizedValue;

      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };



  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fin_prin_amt || !formData.fin_start_date || !formData.fin_roi) {
        alert('Please fill required fields: Principal Amount, Start Date, Rate of Interest');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Finance Data:', formData);
    // You can also log the last payment here if needed
    alert('Finance record saved successfully! (check console)');
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
          <label className="form-label fw-medium">No Of EMI</label>
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
            defaultValue={formData.fin_start_date ? moment(formData.fin_start_date).format('DD/MM/YYYY') : ''}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Firm Name</label>
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
            name="fin_freq"
            className="form-select border-dark"
            value={formData.fin_freq}
            onChange={handleChange}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Frequency</label>
          <input
            type="text"
            name="fin_freq_type"
            placeholder="1 , 2 ,3"
            className="form-control border-dark"
            value={formData.fin_freq_type}
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
          <label className="form-label fw-medium">Rate Of Interest (ROI) <span className="text-danger">*</span></label>
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
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Fine EMI No</label>
          <input
            type="text"
            name="fin_fine_emi_no"
            placeholder="3, 5, 7"
            className="form-control border-dark"
            value={formData.fin_fine_emi_no}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">Per EMI Amount</label>
          <input
            type="text"
            name="fin_emi_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_emi_amt}
            readOnly
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3 ms-auto">
          <label className="form-label fw-medium">Total Finance Amount</label>
          <input
            type="text"
            name="fin_final_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_final_amt}
            readOnly
          />
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
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Cash Account</label>
          <select
            name="fin_cash_acc_id"
            className="form-select border-dark"
            value={formData.fin_cash_acc_id}
            onChange={handleChange}
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_cash_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_cash_amt}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Information</label>
          <input
            type="text"
            name="fin_cash_info"
            placeholder="Notes"
            className="form-control border-dark"
            value={formData.fin_cash_info}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Bank Account</label>
          <select
            name="fin_bank_acc_id"
            className="form-select border-dark"
            value={formData.fin_bank_acc_id}
            onChange={handleChange}
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_bank_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_bank_amt}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Information</label>
          <input
            type="text"
            name="fin_bank_info"
            placeholder="UTR / Ref No"
            className="form-control border-dark"
            value={formData.fin_bank_info}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Online Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Online Account</label>
          <select
            name="fin_online_acc_id"
            className="form-select border-dark"
            value={formData.fin_online_acc_id}
            onChange={handleChange}
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_online_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_online_amt}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Information</label>
          <input
            type="text"
            name="fin_online_info"
            placeholder="UPI / Ref No"
            className="form-control border-dark"
            value={formData.fin_online_info}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Card Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Card Account</label>
          <select
            name="fin_card_acc_id"
            className="form-select border-dark"
            value={formData.fin_card_acc_id}
            onChange={handleChange}
          >
            <option value="">Select account</option>
            {accounts.map(acc => (
              <option key={acc.acc_id} value={acc.acc_id}>{acc.acc_name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="fin_card_amt"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fin_card_amt}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Information</label>
          <input
            type="text"
            name="fin_card_info"
            placeholder="Auth Code"
            className="form-control border-dark"
            value={formData.fin_card_info}
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
        <button type="submit" className="btn btn-primary btn-lg px-5">
          Save Finance
        </button>
      )}
    </div>
  ) : (
    <div className="d-grid d-md-block text-center mt-5">
      <button type="submit" className="btn btn-primary btn-lg px-5">
        Save Finance
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