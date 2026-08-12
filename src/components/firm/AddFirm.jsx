import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { loadFirmsDropdown } from '../../store/slices/firmSlice';
import moment from 'moment';
import ImageUploadSquare from '../common/ImageUploadSquare';
import { createFirm } from '../../api/firmApi';
import { validatePincode, validatePan, validateAadhaar, validateGstin, validateIfsc } from '../../utils/validation';
import useFormNavigation from '../../hooks/useFormNavigation';
import '../../css/ProfileDocumentsSection.css';

const AddFirm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Previews
  const [leftLogoPreview, setLeftLogoPreview] = useState(null);
  const [rightLogoPreview, setRightLogoPreview] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);

  // Form Navigation
  const formRef = useRef(null);
  useFormNavigation(formRef);

  const [formData, setFormData] = useState({
    registrationNo: '',
    firmName: '',
    shopName: '',
    firmDescription: '',
    city: '',
    pincode: '',
    phoneNo: '',
    address: '',
    emailId: '',
    websiteLink: '',
    whatsappLink: '',
    facebookLink: '',
    instaLink: '',
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
    financialStartDate: (() => {
      const today = new Date();
      const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      return `${year}-04-01`;
    })(),
    openingBalance: '',
    openingBalanceType: 'DR',
    gstinNo: '',
    panNo: '',
    aadhaarNo: '',
    headerInfo: '',
    footerInfo: '',
    otherInfo: '',
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

  const handleImageFile = (fieldName, setPreview) => (file) => {
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleImageRemove = (fieldName, setPreview) => () => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
    setPreview(null);
  };

  const validateStep1 = () => {
    const requiredFields = ['firmName', 'shopName', 'registrationNo'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        const readableName = field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        toast.error(`Please enter valid ${readableName.toLowerCase()}.`);
        return false;
      }
    }

    if (formData.pincode && !validatePincode(formData.pincode)) {
      toast.error('Invalid Pincode. It should be 6 digits and not start with 0.');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep1()) {
      if (currentStep < 2) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final check for all required fields
    if (!validateStep1()) return;

    // financialStartDate is now optional

    // Additional Validation for optional fields in Step 2
    if (formData.ifscCode && !validateIfsc(formData.ifscCode)) {
      toast.error('Invalid IFSC Code. Format: ABCD0123456 (11 characters).');
      return;
    }

    if (formData.gstinNo && !validateGstin(formData.gstinNo)) {
      toast.error('Invalid GSTIN. It should be a 15-character alphanumeric code.');
      return;
    }

    if (formData.panNo && !validatePan(formData.panNo)) {
      toast.error('Invalid PAN Number. Format: ABCDE1234F');
      return;
    }

    if (formData.aadhaarNo && !validateAadhaar(formData.aadhaarNo)) {
      toast.error('Invalid Aadhaar Number. It should be 12 digits and not start with 0 or 1.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Mapping Frontend Fields to Backend Fields
      data.append('firm_name', formData.firmName);
      data.append('firm_shop_name', formData.shopName);
      data.append('firm_reg_no', formData.registrationNo);
      data.append('firm_phone_no', formData.phoneNo);
      data.append('firm_email_id', formData.emailId);
      data.append('firm_website_link', formData.websiteLink);
      data.append('firm_whatsapp_link', formData.whatsappLink);
      data.append('firm_facebook_link', formData.facebookLink);
      data.append('firm_insta_link', formData.instaLink);
      data.append('firm_desc', formData.firmDescription);
      data.append('firm_city', formData.city);
      data.append('firm_pincode', formData.pincode);
      data.append('firm_address', formData.address);
      data.append('firm_owner', formData.ownerName);
      data.append('firm_geo_latitude', formData.geoLatitude);
      data.append('firm_geo_longitude', formData.geoLongitude);
      data.append('firm_bank_name', formData.bankName);
      data.append('firm_bank_acc_no', formData.bankAccNo);
      data.append('firm_bank_branch', formData.branch);
      data.append('firm_bank_address', formData.branchAddress);
      data.append('firm_acc_holder', formData.accountHolderName);
      data.append('firm_acc_type', formData.acType);
      data.append('firm_ifsc_code', formData.ifscCode);
      data.append('firm_start_date', formData.financialStartDate);
      data.append('firm_balance', formData.openingBalance || 0);
      data.append('firm_balance_type', formData.openingBalanceType);
      data.append('firm_gstin_no', formData.gstinNo);
      data.append('firm_pan_no', formData.panNo);
      data.append('firm_adhaar_no', formData.aadhaarNo);
      data.append('firm_form_header', formData.headerInfo);
      data.append('firm_form_footer', formData.footerInfo);
      data.append('firm_other_info', formData.otherInfo);

      // Ownership Type Enum Mapping
      const typeMapping = {
        sole_proprietorship: 'Sole_Proprietorship',
        partnership: 'Partnership',
        pvt_ltd: 'Private_Ltd',
        llp: 'LLP',
        other: 'Other'
      };
      data.append('firm_type', typeMapping[formData.ownershipType] || 'Other');

      // File Uploads
      if (formData.leftLogo) data.append('firm_left_logo_img', formData.leftLogo);
      if (formData.rightLogo) data.append('firm_right_logo_img', formData.rightLogo);
      if (formData.qrCode) data.append('firm_qr_code_img', formData.qrCode);
      if (formData.panDoc) data.append('firm_own_sign_img', formData.panDoc);

      const response = await createFirm(data);
      toast.success(response.message || 'Firm created successfully!');
      dispatch(loadFirmsDropdown());

      // Navigate to dashboard or firm list after a brief delay
      setTimeout(() => {
        navigate('/firm/list'); // Adjust the route as per your application
      }, 1500);

    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Failed to create firm.');
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 1 CONTENT ────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <h5 className="mb-3">Basic Information</h5>
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label">Firm ID <span className="text-danger">*</span></label>
          <input type="text" name="firmName" className="form-control border-dark" value={formData.firmName} onChange={handleChange} placeholder="FIRM ID (PR,DR)" />
        </div>
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label">Shop Name <span className="text-danger">*</span></label>
          <input type="text" name="shopName" className="form-control border-dark" value={formData.shopName} onChange={handleChange} placeholder="Enter Shop Name" />
        </div>
        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label">Registration No <span className="text-danger">*</span></label>
          <input type="text" name="registrationNo" className="form-control border-dark" value={formData.registrationNo} onChange={handleChange} placeholder="Enter Registration Number" />
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <label className="form-label">Phone No</label>
          <input type="tel" name="phoneNo" className="form-control border-dark" value={formData.phoneNo} onChange={handleChange} placeholder="Enter Phone Number" />
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
          <label className="form-label">City</label>
          <input type="text" name="city" className="form-control border-dark" value={formData.city} onChange={handleChange} placeholder="Enter City" />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <label className="form-label">Pincode</label>
          <input type="text" name="pincode" className="form-control border-dark" value={formData.pincode} onChange={handleChange} placeholder="Enter Pincode" />
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
          <label className="form-label">Full Address</label>
          <textarea name="address" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.address} onChange={handleChange} placeholder="Enter Full Address" />
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
            <ImageUploadSquare
              preview={leftLogoPreview}
              onFile={handleImageFile('leftLogo', setLeftLogoPreview)}
              onRemove={handleImageRemove('leftLogo', setLeftLogoPreview)}
              modalTitle="Left Logo"
              label="Left Logo"
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <ImageUploadSquare
              preview={rightLogoPreview}
              onFile={handleImageFile('rightLogo', setRightLogoPreview)}
              onRemove={handleImageRemove('rightLogo', setRightLogoPreview)}
              modalTitle="Right Logo"
              label="Right Logo"
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <ImageUploadSquare
              preview={qrCodePreview}
              onFile={handleImageFile('qrCode', setQrCodePreview)}
              onRemove={handleImageRemove('qrCode', setQrCodePreview)}
              modalTitle="QR Code"
              label="QR Code"
            />
          </div>

          <div className="col-12 col-md-4 col-lg-3">
            <ImageUploadSquare
              preview={panPreview}
              onFile={handleImageFile('panDoc', setPanPreview)}
              onRemove={handleImageRemove('panDoc', setPanPreview)}
              modalTitle="PAN Card"
              label="PAN Card"
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

        {/* Social Links */}
        <div className="col-12 col-md-4 mt-3">
          <label className="form-label">WhatsApp Link</label>
          <input type="url" name="whatsappLink" className="form-control border-dark" value={formData.whatsappLink} onChange={handleChange} placeholder="Enter WhatsApp Link" />
        </div>
        <div className="col-12 col-md-4 mt-3">
          <label className="form-label">Facebook Link</label>
          <input type="url" name="facebookLink" className="form-control border-dark" value={formData.facebookLink} onChange={handleChange} placeholder="Enter Facebook Link" />
        </div>
        <div className="col-12 col-md-4 mt-3">
          <label className="form-label">Instagram Link</label>
          <input type="url" name="instaLink" className="form-control border-dark" value={formData.instaLink} onChange={handleChange} placeholder="Enter Instagram Link" />
        </div>

        <div className="col-12 mt-3">
          <label className="form-label">Other Information</label>
          <textarea name="otherInfo" className="form-control border-dark" rows={isMobile ? 1 : 1} value={formData.otherInfo} onChange={handleChange} placeholder="Enter any other information" />
        </div>

        {/* Financial */}
        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <label className="form-label">Financial Year Start Date</label>
          <div className="input-group border-dark">
            <span className="input-group-text bg-light border-dark">01 / 04 /</span>
            <select
              name="financialYear"
              className="form-select border-dark"
              value={moment(formData.financialStartDate).year()}
              onChange={(e) => {
                const year = e.target.value;
                setFormData(prev => ({ ...prev, financialStartDate: `${year}-04-01` }));
              }}
            >
              {Array.from({ length: 21 }, (_, i) => moment().year() - 10 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <small className="text-muted">Format: DD/MM/YYYY (Fixed to 01 April)</small>
        </div>

        <div className="col-12 col-md-6 col-lg-4 mt-3">
          <label className="form-label">Opening Balance</label>
          <input
            type="number"
            name="openingBalance"
            className="form-control border-dark"
            value={formData.openingBalance}
            onChange={handleChange}
            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
            step="0.01"
            placeholder="Enter Opening Balance"
          />
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
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  SAVING...
                </>
              ) : (
                <>
                  SUBMIT <i className="bi bi-check-circle ms-2"></i>
                </>
              )}
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
              disabled={loading}
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
            <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Firm →'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`container-fluid ${isMobile ? 'p-0 m-0' : 'py-3'}  pt-md-0 mb-4`}>
      <form ref={formRef} onSubmit={handleSubmit}>{renderContent()}</form>
    </div>
  );
};

export default AddFirm;