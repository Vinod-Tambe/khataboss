import React, { useState, useEffect, useRef } from 'react';
import DocumentUploadCard from '../common/DocumentUploadCard';
import { toast } from 'react-hot-toast';
import useFormNavigation from '../../hooks/useFormNavigation';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createMoneyLender } from '../../api/moneyLenderApi';
import { getFirmsDropdown } from '../../api/firmApi';

const AddMoneyLender = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    // Form Navigation
    const formRef = useRef(null);
    useFormNavigation(formRef);

    // Previews
    const [photoPreview, setPhotoPreview] = useState(null);
    const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState(null);
    const [aadhaarBackPreview, setAadhaarBackPreview] = useState(null);
    const [panCardPreview, setPanCardPreview] = useState(null);

    // Webcam
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [captureTime, setCaptureTime] = useState(null);
    const [activeCaptureField, setActiveCaptureField] = useState(null);

    // File inputs
    const photoInputRef = useRef(null);
    const aadhaarFrontInputRef = useRef(null);
    const aadhaarBackInputRef = useRef(null);
    const panCardInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [firms, setFirms] = useState([]);

    useEffect(() => {
        const fetchFirms = async () => {
            try {
                const firmRes = await getFirmsDropdown();
                const firmData = firmRes.data || firmRes || [];
                setFirms(Array.isArray(firmData) ? firmData : []);
            } catch (error) {
                console.error("Error fetching firms:", error);
            }
        };
        fetchFirms();
    }, []);

    const { selectedFirmId } = useSelector((state) => state.firm);


    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setCurrentStep(1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [formData, setFormData] = useState({
        ml_first_name: '', ml_last_name: '', ml_father_name: '', ml_gender: 'Male', ml_firm_id: '',
        ml_phone: '', ml_email: '', ml_dob: '', ml_aadhaar: '', ml_pan: '', ml_gstin: '', ml_tax_no: '',
        ml_bank_name: '', ml_account_number: '', ml_ifsc: '', ml_branch: '',
        ml_address: '', ml_village: '', ml_city: '', ml_state: '', ml_country: '', ml_pincode: '', ml_notes: '',
        photo: null, adhaarFront: null, adhaarBack: null, panCard: null
    });

    useEffect(() => {
        if (selectedFirmId === 'all') {
            if (firms.length > 0 && !formData.ml_firm_id) {
                setFormData(prev => ({ ...prev, ml_firm_id: firms[0].firm_id }));
            }
        } else if (selectedFirmId && selectedFirmId !== formData.ml_firm_id) {
            setFormData(prev => ({ ...prev, ml_firm_id: selectedFirmId }));
        }
    }, [selectedFirmId, firms, formData.ml_firm_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e, fieldName, setPreview) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, [fieldName]: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeFile = (fieldName, setPreview) => {
        setFormData(prev => ({ ...prev, [fieldName]: null }));
        setPreview(null);
    };

    // ─── Webcam Functions ────────────────────────────────────────────────
    const startWebcam = (fieldName) => {
        setActiveCaptureField(fieldName);
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
            .then(mediaStream => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(e => console.error("Video play error:", e));
                }
                setShowWebcam(true);
                setCaptureTime(null);
            })
            .catch(err => {
                alert("Cannot access webcam: " + err.message);
                setActiveCaptureField(null);
            });
    };

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowWebcam(false);
        setActiveCaptureField(null);
    };

    const capturePhoto = () => {
        if (!canvasRef.current || !videoRef.current || !activeCaptureField) return;

        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 320, 240);

        canvasRef.current.toBlob((blob) => {
            const file = new File([blob], `${activeCaptureField}_captured.jpg`, { type: "image/jpeg" });

            setFormData(prev => ({ ...prev, [activeCaptureField]: file }));

            const previewUrl = URL.createObjectURL(file);

            switch (activeCaptureField) {
                case 'photo':
                    setPhotoPreview(previewUrl);
                    break;
                case 'adhaarFront':
                    setAadhaarFrontPreview(previewUrl);
                    break;
                case 'adhaarBack':
                    setAadhaarBackPreview(previewUrl);
                    break;
                case 'panCard':
                    setPanCardPreview(previewUrl);
                    break;
                default:
                    break;
            }

            setCaptureTime(new Date().toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }));

            stopWebcam();
        }, 'image/jpeg', 0.92);
    };

    const validateStep1 = () => {
        if (!formData.ml_first_name) {
            toast.error("First Name is required");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep1()) {
            if (currentStep < 2) setCurrentStep(currentStep + 1);
        }
    };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep1()) return;

        setLoading(true);
        try {
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && !(formData[key] instanceof File)) {
                    data.append(key, formData[key]);
                }
            });

            // Append files
            if (formData.photo) data.append('ml_profile_img', formData.photo);
            if (formData.adhaarFront) data.append('ml_adhaar_front_img', formData.adhaarFront);
            if (formData.adhaarBack) data.append('ml_adhaar_back_img', formData.adhaarBack);
            if (formData.panCard) data.append('ml_pan_img', formData.panCard);

            const result = await createMoneyLender(data);
            toast.success(result.message || 'Money Lender added successfully!');
            navigate('/money-lender/list');

        } catch (error) {
            toast.error(error.message || 'Error creating money lender');
        } finally {
            setLoading(false);
        }
    };

    // ─── STEP 1 ─────────────────────────────────────────────────────────────
    const renderStep1 = () => (
        <>
            <h5 className="mb-2 text-dark border-bottom pb-2">Personal Details</h5>
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input type="text" name="ml_first_name" placeholder="Enter first name" className="form-control border-dark" required value={formData.ml_first_name} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="ml_last_name" placeholder="Enter last name" className="form-control border-dark" value={formData.ml_last_name} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Father Name</label>
                    <input type="text" name="ml_father_name" placeholder="Enter father's name" className="form-control border-dark" value={formData.ml_father_name} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Gender</label>
                    <select name="ml_gender" className="form-control border-dark" value={formData.ml_gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="ml_dob" className="form-control border-dark" value={formData.ml_dob} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Firm Name</label>
                    <select name="ml_firm_id" className="form-control border-dark" value={formData.ml_firm_id} onChange={handleChange}>
                        <option value="">Select Firm</option>
                        {firms.map((firm) => (
                            <option key={firm.firm_id} value={firm.firm_id}>
                                {firm.firm_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Phone</label>
                    <input type="text" name="ml_phone" placeholder="Enter phone number" className="form-control border-dark" value={formData.ml_phone} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="ml_email" placeholder="Enter email address" className="form-control border-dark" value={formData.ml_email} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Aadhaar Number</label>
                    <input type="text" name="ml_aadhaar" placeholder="12-digit Aadhaar" className="form-control border-dark" maxLength="12" value={formData.ml_aadhaar} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">PAN Number</label>
                    <input type="text" name="ml_pan" placeholder="10-digit PAN" className="form-control border-dark" maxLength="10" value={formData.ml_pan} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">GSTIN</label>
                    <input type="text" name="ml_gstin" placeholder="GSTIN" className="form-control border-dark" value={formData.ml_gstin} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Tax No</label>
                    <input type="text" name="ml_tax_no" placeholder="Tax Registration No" className="form-control border-dark" value={formData.ml_tax_no} onChange={handleChange} />
                </div>
                <hr className="my-3" />
                <h5 className="mb-2 mt-0">Additional Details</h5>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Bank Name</label>
                    <input type="text" name="ml_bank_name" placeholder="Bank Name" className="form-control border-dark" value={formData.ml_bank_name} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Account Number</label>
                    <input type="text" name="ml_account_number" placeholder="Account Number" className="form-control border-dark" value={formData.ml_account_number} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">IFSC Code</label>
                    <input type="text" name="ml_ifsc" placeholder="IFSC Code" className="form-control border-dark" value={formData.ml_ifsc} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Branch</label>
                    <input type="text" name="ml_branch" placeholder="Branch Name" className="form-control border-dark" value={formData.ml_branch} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Village / Locality</label>
                    <input type="text" name="ml_village" placeholder="Enter village or locality" className="form-control border-dark" value={formData.ml_village} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">City</label>
                    <input type="text" name="ml_city" placeholder="Enter city" className="form-control border-dark" value={formData.ml_city} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">State</label>
                    <input type="text" name="ml_state" placeholder="Enter state" className="form-control border-dark" value={formData.ml_state} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Pincode</label>
                    <input type="text" name="ml_pincode" placeholder="Enter pincode" className="form-control border-dark" value={formData.ml_pincode} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Full Address</label>
                    <textarea name="ml_address" placeholder="Enter complete address" className="form-control border-dark" rows={isMobile ? 2 : 2} value={formData.ml_address} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Other Information</label>
                    <textarea name="ml_notes" placeholder="Enter any additional notes" className="form-control border-dark" rows={isMobile ? 2 : 2} value={formData.ml_notes} onChange={handleChange} />
                </div>
            </div>
        </>
    );

    // ─── STEP 2 ─────────────────────────────────────────────────────────────
    const renderStep2 = () => (
        <>
            <div className="row g-3 ">
                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard
                        title="Profile Photo"
                        fieldName="photo"
                        preview={photoPreview}
                        setPreview={setPhotoPreview}
                        inputRef={photoInputRef}
                        showCamera={true}
                        startWebcam={() => startWebcam('photo')}
                        handleFileSelect={handleFileSelect}
                        removeFile={removeFile}
                    />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard
                        title="Aadhaar Front"
                        fieldName="adhaarFront"
                        preview={aadhaarFrontPreview}
                        setPreview={setAadhaarFrontPreview}
                        inputRef={aadhaarFrontInputRef}
                        showCamera={true}
                        startWebcam={() => startWebcam('adhaarFront')}
                        handleFileSelect={handleFileSelect}
                        removeFile={removeFile}
                    />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard
                        title="Aadhaar Back"
                        fieldName="adhaarBack"
                        preview={aadhaarBackPreview}
                        setPreview={setAadhaarBackPreview}
                        inputRef={aadhaarBackInputRef}
                        showCamera={true}
                        startWebcam={() => startWebcam('adhaarBack')}
                        handleFileSelect={handleFileSelect}
                        removeFile={removeFile}
                    />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard
                        title="PAN Card"
                        fieldName="panCard"
                        preview={panCardPreview}
                        setPreview={setPanCardPreview}
                        inputRef={panCardInputRef}
                        showCamera={true}
                        startWebcam={() => startWebcam('panCard')}
                        handleFileSelect={handleFileSelect}
                        removeFile={removeFile}
                    />
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        if (!isMobile) {
            return (
                <div className="card p-4 shadow-sm">
                    <h4 className="card-title text-center fw-bold pb-md-0">Add New Money Lender</h4>
                    {renderStep1()}
                    {renderStep2()}
                    <div className="d-grid gap-2 col-12 mx-auto mt-5">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'SUBMITTING...' : 'SUBMIT'} <i className="bi bi-check-circle ms-2"></i>
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="card p-3 shadow-sm">
                <h5 className="text-center mb-4">Step {currentStep} of 2</h5>

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}

                <div className="d-flex justify-content-between mt-4 gap-2">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            onClick={prevStep}
                        >
                            <i className="bi bi-arrow-left me-2"></i> Previous
                        </button>
                    )}
                    {currentStep === 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary flex-grow-1 ms-auto"
                            onClick={nextStep}
                        >
                            Continue <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-success flex-grow-1 ms-auto"
                            disabled={loading}
                        >
                            {loading ? 'SUBMITTING...' : 'SUBMIT'} <i className="bi bi-check-circle ms-2"></i>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <form ref={formRef} onSubmit={handleSubmit}>
                {renderContent()}
            </form>

            {/* Webcam Modal */}
            {showWebcam && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Capture {activeCaptureField === 'photo' ? 'Profile Photo' :
                                        activeCaptureField === 'adhaarFront' ? 'Aadhaar Front' :
                                            activeCaptureField === 'adhaarBack' ? 'Aadhaar Back' : 'PAN Card'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={stopWebcam}
                                />
                            </div>
                            <div className="modal-body text-center">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    width="320"
                                    height="240"
                                    className="rounded shadow-sm mb-3"
                                    style={{ border: '2px solid #dee2e6' }}
                                />
                                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
                                {captureTime && (
                                    <div className="mt-2 text-muted small">
                                        Captured: {captureTime}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={stopWebcam}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={capturePhoto}
                                >
                                    Capture
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default AddMoneyLender;
