import React, { useState, useEffect } from 'react';
import DocumentUploadCard from '../common/DocumentUploadCard';

const AddFirm = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentStep, setCurrentStep] = useState(1);

  // Previews
  const [leftLogoPreview, setLeftLogoPreview] = useState(null);
  const [rightLogoPreview, setRightLogoPreview] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  // Refs
  const leftLogoInputRef = React.useRef(null);
  const rightLogoInputRef = React.useRef(null);
  const qrCodeInputRef = React.useRef(null);
  const panInputRef = React.useRef(null);

  const [formData, setFormData] = useState({
    firmId: '',
    registrationNo: '',
    shopName: '',
    firmDescription: '',
    city: '',
    pincode: '',
    phoneNo: '',
    address: '',
    emailId: '',
    websiteLink: '',
    ownershipType: 'sole_proprietorship',
    ownerName: '',
    geoLatitude: '',
    geoLongitude: '',
    bankAccNo: '',
    accountHolderName: '',
    bankName: '',
    branch: '',
    ifscCode: '',
    acType: 'current',
    branchAddress: '',
    paymentDescription: '',
    financialStartDate: '',
    openingBalance: '',
    openingBalanceType: 'DR',
    gstinNo: '',
    panNo: '',
    aadhaarNo: '',
    headerInfo: '',
    footerInfo: '',
    leftLogo: null,
    rightLogo: null,
    qrCode: null,
    panDoc: null,
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setCurrentStep(1); // reset to single view on desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e, fieldName, setPreview) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = (fieldName, setPreview) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview(null);
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Firm Data:', formData);
    alert('Firm information submitted successfully!');
    // → Send to backend using FormData
  };

  // ─── STEP 1 CONTENT ────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <h5 className="mb-3">Basic Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Firm ID</label>
          <input type="text" name="firmId" className="form-control border-dark" value={formData.firmId} onChange={handleChange} placeholder="Enter Firm ID" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Registration No</label>
          <input type="text" name="registrationNo" className="form-control border-dark" value={formData.registrationNo} onChange={handleChange} placeholder="Enter Registration Number" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Shop / Firm Name *</label>
          <input type="text" name="shopName" className="form-control border-dark" required value={formData.shopName} onChange={handleChange} placeholder="Enter Shop/Firm Name" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Phone No *</label>
          <input type="tel" name="phoneNo" className="form-control border-dark" required value={formData.phoneNo} onChange={handleChange} placeholder="Enter Phone Number" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Email ID</label>
          <input type="email" name="emailId" className="form-control border-dark" value={formData.emailId} onChange={handleChange} placeholder="Enter Email ID" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Website Link</label>
          <input type="url" name="websiteLink" className="form-control border-dark" value={formData.websiteLink} onChange={handleChange} placeholder="Enter Website URL" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">City *</label>
          <input type="text" name="city" className="form-control border-dark" required value={formData.city} onChange={handleChange} placeholder="Enter City" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Pincode *</label>
          <input type="text" name="pincode" className="form-control border-dark" required value={formData.pincode} onChange={handleChange} placeholder="Enter Pincode" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Ownership Type</label>
          <select name="ownershipType" className="form-select border-dark" value={formData.ownershipType} onChange={handleChange}>
            <option value="sole_proprietorship">Sole Proprietorship</option>
            <option value="partnership">Partnership</option>
            <option value="pvt_ltd">Private Limited</option>
            <option value="llp">LLP</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Owner / Proprietor Name</label>
          <input type="text" name="ownerName" className="form-control border-dark" value={formData.ownerName} onChange={handleChange} placeholder="Enter Owner Name" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Geo Latitude</label>
          <input type="text" name="geoLatitude" className="form-control border-dark" value={formData.geoLatitude} onChange={handleChange} placeholder="e.g. 18.5204" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Geo Longitude</label>
          <input type="text" name="geoLongitude" className="form-control border-dark" value={formData.geoLongitude} onChange={handleChange} placeholder="e.g. 73.8567" />
        </div>

        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label">Firm Description</label>
          <textarea name="firmDescription" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.firmDescription} onChange={handleChange} placeholder="Enter Firm Description" />
        </div>

        <div className="col-12 col-md-6 col-lg-6">
          <label className="form-label">Full Address *</label>
          <textarea name="address" className="form-control border-dark" rows={isMobile ? 1 : 1} required value={formData.address} onChange={handleChange} placeholder="Enter Full Address" />
        </div>
      </div>
    </>
  );

  // ─── STEP 2 CONTENT ────────────────────────────────────────────────
  const renderStep2 = () => (
    <>
      <h5 className="mb-3">Additional Details</h5>
      <div className="row g-3">

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Account Holder Name</label>
          <input type="text" name="accountHolderName" className="form-control border-dark" value={formData.accountHolderName} onChange={handleChange} placeholder="Enter Account Holder Name" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Bank A/c Number</label>
          <input type="text" name="bankAccNo" className="form-control border-dark" value={formData.bankAccNo} onChange={handleChange} placeholder="Enter Bank Account Number" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Bank Name</label>
          <input type="text" name="bankName" className="form-control border-dark" value={formData.bankName} onChange={handleChange} placeholder="Enter Bank Name" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Branch</label>
          <input type="text" name="branch" className="form-control border-dark" value={formData.branch} onChange={handleChange} placeholder="Enter Branch Name" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">IFSC Code</label>
          <input type="text" name="ifscCode" className="form-control border-dark" value={formData.ifscCode} onChange={handleChange} placeholder="Enter IFSC Code" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Account Type</label>
          <select name="acType" className="form-select border-dark" value={formData.acType} onChange={handleChange}>
            <option value="current">Current</option>
            <option value="savings">Savings</option>
            <option value="cc">Cash Credit</option>
            <option value="od">Overdraft</option>
          </select>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">GSTIN Number</label>
          <input type="text" name="gstinNo" className="form-control border-dark" value={formData.gstinNo} onChange={handleChange} placeholder="Enter GSTIN Number" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">PAN Number</label>
          <input type="text" name="panNo" className="form-control border-dark" value={formData.panNo} onChange={handleChange} placeholder="Enter PAN Number" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Aadhaar Number (Owner)</label>
          <input type="text" name="aadhaarNo" className="form-control border-dark" value={formData.aadhaarNo} onChange={handleChange} placeholder="Enter Aadhaar Number" />
        </div>
           <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Branch Address</label>
          <textarea name="branchAddress" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.branchAddress} onChange={handleChange} placeholder="Enter Branch Address" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Payment Declaration</label>
          <textarea name="paymentDescription" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.paymentDescription} onChange={handleChange} placeholder="Enter Payment Declaration" />
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-4 col-lg-3">
            <DocumentUploadCard
              title="Left Logo"
              fieldName="leftLogo"
              preview={leftLogoPreview}
              setPreview={setLeftLogoPreview}
              inputRef={leftLogoInputRef}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <DocumentUploadCard
              title="Right Logo"
              fieldName="rightLogo"
              preview={rightLogoPreview}
              setPreview={setRightLogoPreview}
              inputRef={rightLogoInputRef}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <DocumentUploadCard
              title="QR Code"
              fieldName="qrCode"
              preview={qrCodePreview}
              setPreview={setQrCodePreview}
              inputRef={qrCodeInputRef}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <DocumentUploadCard
              title="PAN Card"
              fieldName="panDoc"
              preview={panPreview}
              setPreview={setPanPreview}
              inputRef={panInputRef}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
            />
          </div>
        </div>

        {/* Header & Footer */}
        <div className="col-12 col-md-6 mt-4">
          <label className="form-label">Invoice Header Info</label>
          <textarea name="headerInfo" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.headerInfo} onChange={handleChange} placeholder="Enter Invoice Header Info" />
        </div>

        <div className="col-12 col-md-6 mt-4">
          <label className="form-label">Invoice Footer Info</label>
          <textarea name="footerInfo" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.footerInfo} onChange={handleChange} placeholder="Enter Invoice Footer Info" />
        </div>

        {/* Financial */}
        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <label className="form-label">Financial Year Start Date</label>
          <input type="date" name="financialStartDate" className="form-control border-dark" value={formData.financialStartDate} onChange={handleChange} placeholder="Select Financial Start Date" />
        </div>

        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <label className="form-label">Opening Balance</label>
          <input type="text" name="openingBalance" className="form-control border-dark" value={formData.openingBalance} onChange={handleChange} step="0.01" placeholder="Enter Opening Balance" />
        </div>

        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <label className="form-label">Balance Type</label>
          <select name="openingBalanceType" className="form-select border-dark" value={formData.openingBalanceType} onChange={handleChange}>
            <option value="DR">Debit (DR)</option>
            <option value="CR">Credit (CR)</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    // Desktop view - show both steps together
    if (!isMobile) {
      return (
        <div className="card p-4 p-md-4 shadow-sm">
          <h4 className="mb-1 card-title text-center fw-bold pb-md-0">Add New Firm</h4>
          {renderStep1()}
          <hr className="my-4" />
          {renderStep2()}
          <div className="d-grid gap-2 col-8 col-md-5 col-lg-3 mx-auto mt-5">
            <button type="submit" className="btn btn-primary btn-lg">
              SUBMIT <i className="bi bi-check-circle ms-2"></i>
            </button>
          </div>
        </div>
      );
    }

    // Mobile view - step by step
    return (
      <div className="card p-3 shadow-sm">
        <h5 className="text-center mb-4">
          Step {currentStep} of 2
        </h5>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        <div className="d-flex justify-content-between mt-4 gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-outline-secondary flex-grow-1"
              onClick={prevStep}
            >
              ← Previous
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              className="btn btn-primary flex-grow-1"
              onClick={nextStep}
            >
              Next →
            </button>
          ) : (
            <button type="submit" className="btn btn-success flex-grow-1">
              Save Firm →
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`container-fluid ${isMobile ? 'p-0 m-0' : 'py-3'}  pt-md-0 mb-4`} style={{ maxWidth: '1200px' }}>
      <form onSubmit={handleSubmit}>{renderContent()}</form>
    </div>
  );
};

export default AddFirm;