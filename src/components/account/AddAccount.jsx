import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import useFormNavigation from '../../hooks/useFormNavigation';

const AddAccount = () => {
  const [formData, setFormData] = useState({
    accountName: '',
    openingDate: moment().format('YYYY-MM-DD'),
    balance: '',
    balanceType: '',
    isPrimary: '',
    accountNumber: '',
    ifsc: '',
    branchName: '',
    pan: '',
    bsrCode: '',
    bankAddress: '',
    pincode: '',
    country: 'IN',
    state: '',
    city: '',
    description: '',
    otherInfo: ''
  });

  const openingDateRef = useRef(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

  useEffect(() => {
    if (openingDateRef.current) {
        $(openingDateRef.current).daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: true,
            locale: {
                format: 'DD/MM/YYYY'
            }
        }, (start) => {
            setFormData(prev => ({ ...prev, openingDate: start.format('YYYY-MM-DD') }));
        });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Account Data:', formData);
    alert('Account saved successfully!');
  };

  return (
      <div className="card p-4 shadow-sm border-0 border-md-1 border-secondary">
        <h4 className="card-title text-center fw-bold pb-md-0">Add New Account</h4>

        <form ref={formRef} noValidate onSubmit={handleSubmit}>
          <h5 className="text-muted" >Account & Bank Details</h5>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Account Name <span className="text-danger">*</span></label>
              <input
                type="text"
                name="accountName"
                placeholder="Enter account name / nickname"
                className="form-control border-dark"
                value={formData.accountName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Opening Balance Date <span className="text-danger">*</span></label>
              <input
                type="text"
                name="openingDate"
                ref={openingDateRef}
                className="form-control border-dark"
                defaultValue={moment(formData.openingDate).format('DD/MM/YYYY')}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Account Balance <span className="text-danger">*</span></label>
              <input
                type="number"
                name="balance"
                placeholder="0.00"
                className="form-control border-dark text-end"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Balance Type <span className="text-danger">*</span></label>
              <select name="balanceType" className="form-select border-dark" value={formData.balanceType} onChange={handleChange} required>
                <option value="" disabled>Select type</option>
                <option value="CR">CR - Credit</option>
                <option value="DR">DR – Debit</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Primary Account <span className="text-danger">*</span></label>
              <select name="isPrimary" className="form-select border-dark" value={formData.isPrimary} onChange={handleChange} required>
                <option value="" disabled>Select</option>
                <option value="yes">Yes – Main / Default Account</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Bank Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Enter account number"
                className="form-control border-dark"
                value={formData.accountNumber}
                onChange={handleChange}
                pattern="[0-9]{9,18}"
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                placeholder="SBIN0001234"
                className="form-control border-dark text-uppercase"
                maxLength={11}
                value={formData.ifsc}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Branch Name</label>
              <input
                type="text"
                name="branchName"
                placeholder="Enter branch name"
                className="form-control border-dark"
                value={formData.branchName}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">PAN Number</label>
              <input
                type="text"
                name="pan"
                placeholder="ABCDE1234F"
                className="form-control border-dark text-uppercase"
                maxLength={10}
                value={formData.pan}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">BSR Code</label>
              <input
                type="text"
                name="bsrCode"
                placeholder="Enter BSR Code"
                className="form-control border-dark"
                value={formData.bsrCode}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Bank Address</label>
              <textarea
                name="bankAddress"
                rows={1}
                placeholder="Full branch address"
                className="form-control border-dark"
                value={formData.bankAddress}
                onChange={handleChange}
              />
            </div>
               <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                className="form-control border-dark"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>
          <h5 className=" text-muted mt-4">Additional Details</h5>
          <div className="row g-3 mb-5">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">Country <span className="text-danger">*</span></label>
              <select name="country" className="form-select border-dark" value={formData.country} onChange={handleChange} required>
                <option value="" disabled>Select country</option>
                <option value="IN">India</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">State <span className="text-danger">*</span></label>
              <select name="state" className="form-select border-dark" value={formData.state} onChange={handleChange} required>
                <option value="" disabled>Select state</option>
                <option value="Rajasthan">Rajasthan</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-medium">City / Village</label>
              <input
                type="text"
                name="city"
                placeholder="Enter city or village"
                className="form-control border-dark"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <label className="form-label fw-medium">Account Description</label>
              <textarea
                name="description"
                rows={1}
                placeholder="Purpose, nickname..."
                className="form-control border-dark"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <label className="form-label fw-medium">Other Information</label>
              <textarea
                name="otherInfo"
                rows={1}
                placeholder="Extra notes..."
                className="form-control border-dark"
                value={formData.otherInfo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="d-grid d-md-block text-center mt-5">
            <button type="submit" className="btn btn-primary btn-lg px-5">
              Save Account
            </button>
          </div>
        </form>
      </div>
  );
};

export default AddAccount;