import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';

const AddFinance = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [formData, setFormData] = useState({
    principalAmount: '',
    noOfEmi: '',
    startDate: '',
    firmName: '',
    frequency: 'monthly',
    frequencyType: '',
    monthly: true,
    interestRate: '',
    collectAmount: '',
    processingFees: '',
    fineAmount: '',
    fineEmiNo: '',
    staffName: '',
    perEmiAmount: '',
    totalFinanceAmount: '',

    // Payment related
    paymentOtherInfo: '',
  });

  const [newPayment, setNewPayment] = useState({
    accountType: 'cash',
    bankAccountId: '',
    bankAmount: '',
    bankInfo: '',
  });

  const startDateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

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
            setFormData(prev => ({ ...prev, startDate: start.format('YYYY-MM-DD') }));
        });
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSteps = 2;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({ ...prev, [name]: value }));
  };



  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.principalAmount || !formData.startDate || !formData.interestRate) {
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
          <label className="form-label fw-medium">PRINCIPAL AMOUNT <span className="text-danger">*</span></label>
          <input
            type="number"
            name="principalAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.principalAmount}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">NO OF EMI</label>
          <input
            type="number"
            name="noOfEmi"
            placeholder="e.g. 12"
            className="form-control border-dark"
            value={formData.noOfEmi}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">START DATE <span className="text-danger">*</span></label>
          <input
            type="text"
            name="startDate"
            ref={startDateRef}
            className="form-control border-dark"
            defaultValue={formData.startDate ? moment(formData.startDate).format('DD/MM/YYYY') : ''}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">FIRM NAME</label>
          <input
            type="text"
            name="firmName"
            placeholder="Firm / Customer name"
            className="form-control border-dark"
            value={formData.firmName}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">FREQUENCY</label>
          <select
            name="frequency"
            className="form-select border-dark"
            value={formData.frequency}
            onChange={handleChange}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="bullet">Bullet (One time)</option>
          </select>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">FREQUENCY TYPE</label>
          <input
            type="text"
            name="frequencyType"
            placeholder="e.g. 1st of month, Every Friday"
            className="form-control border-dark"
            value={formData.frequencyType}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">COLLECT AMOUNT</label>
          <input
            type="number"
            name="collectAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.collectAmount}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">PROCCESSING FEES</label>
          <input
            type="number"
            name="processingFees"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.processingFees}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>
        

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">RATE OF INTEREST (ROI) <span className="text-danger">*</span></label>
          <input
            type="number"
            name="interestRate"
            placeholder="e.g. 2.5 % per month"
            className="form-control border-dark"
            value={formData.interestRate}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">FINE AMOUNT</label>
          <input
            type="number"
            name="fineAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.fineAmount}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">FINE EMI NO</label>
          <input
            type="text"
            name="fineEmiNo"
            placeholder="e.g. 3,5,7"
            className="form-control border-dark"
            value={formData.fineEmiNo}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label fw-medium">PER EMI AMOUNT</label>
          <input
            type="number"
            name="perEmiAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.perEmiAmount}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>

        <div className="col-12 col-md-4 col-lg-3 ms-auto">
          <label className="form-label fw-medium">TOTAL FINANCE AMOUNT</label>
          <input
            type="number"
            name="totalFinanceAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={formData.totalFinanceAmount}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
          />
        </div>
      </div>
    </>
  );

  // ────────────────────────────────────────────────
  // PAYMENT INFORMATION SECTION (same as your original)
  // ────────────────────────────────────────────────
  const PaymentInformation = (
    <>
      <h5 className="text-muted">Payment Information</h5>

      {/* Cash Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Select Cash Account</label>
          <select
            name="bankAccountId"
            className="form-select border-dark"
            value={newPayment.bankAccountId}
            onChange={handlePaymentChange}
          >
            <option value="" disabled>Select account</option>
            <option value="cash1">Cash - Main Office</option>
            <option value="cash2">Cash - Branch 1</option>
            <option value="new">+ Add New Cash Account</option>
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            name="bankAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={newPayment.bankAmount}
            onChange={handlePaymentChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input
            type="text"
            name="bankInfo"
            placeholder="Received by, note no, etc."
            className="form-control border-dark"
            value={newPayment.bankInfo}
            onChange={handlePaymentChange}
          />
        </div>
      </div>

      {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Select Bank Account</label>
          <select
            name="bankAccountId"
            className="form-select border-dark"
            value={newPayment.bankAccountId}
            onChange={handlePaymentChange}
          >
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Bank Account</option>
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            name="bankAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={newPayment.bankAmount}
            onChange={handlePaymentChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input
            type="text"
            name="bankInfo"
            placeholder="Cheque no, UTR, Ref no..."
            className="form-control border-dark"
            value={newPayment.bankInfo}
            onChange={handlePaymentChange}
          />
        </div>
      </div>
            {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Select Bank Account</label>
          <select
            name="bankAccountId"
            className="form-select border-dark"
            value={newPayment.bankAccountId}
            onChange={handlePaymentChange}
          >
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Bank Account</option>
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            name="bankAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={newPayment.bankAmount}
            onChange={handlePaymentChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input
            type="text"
            name="bankInfo"
            placeholder="Cheque no, UTR, Ref no..."
            className="form-control border-dark"
            value={newPayment.bankInfo}
            onChange={handlePaymentChange}
          />
        </div>
      </div>
            {/* Bank Payment Row */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Select Bank Account</label>
          <select
            name="bankAccountId"
            className="form-select border-dark"
            value={newPayment.bankAccountId}
            onChange={handlePaymentChange}
          >
            <option value="" disabled>Select account</option>
            <option value="acc1">HDFC - XXXX1234 (Vinod Patil - Savings)</option>
            <option value="acc2">SBI - XXXX5678 (Main Account)</option>
            <option value="acc3">ICICI - XXXX9012 (Business A/c)</option>
            <option value="acc4">Axis - XXXX3456 (Joint A/c)</option>
            <option value="new">+ Add New Bank Account</option>
          </select>
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Amount</label>
          <input
            type="text"
            name="bankAmount"
            placeholder="0.00"
            className="form-control border-dark"
            value={newPayment.bankAmount}
            onChange={handlePaymentChange}
          />
        </div>
        <div className="col-12 col-md-4 col-lg-4">
          <label className="form-label fw-medium">Info / Transaction Details</label>
          <input
            type="text"
            name="bankInfo"
            placeholder="Cheque no, UTR, Ref no..."
            className="form-control border-dark"
            value={newPayment.bankInfo}
            onChange={handlePaymentChange}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-medium">Payment Other Info / Remarks</label>
          <textarea
            name="paymentOtherInfo"
            rows={2}
            placeholder="Combined mode notes, reference numbers, special instructions..."
            className="form-control border-dark"
            value={formData.paymentOtherInfo}
            onChange={handleChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-medium">Other Information</label>
          <textarea
            name="paymentOtherInfo"
            rows={2}
            placeholder="Combined mode notes, reference numbers, special instructions..."
            className="form-control border-dark"
            value={formData.paymentOtherInfo}
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