import React, { useState, useEffect, useRef, useMemo } from 'react';
import DocumentUploadCard from '../common/DocumentUploadCard';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { useNavigate } from 'react-router-dom';
import useFormNavigation from '../../hooks/useFormNavigation';
import { getValidatedUploadFile } from '../../utils/fileUpload';
import { createStaff } from '../../api/staffApi';
import { showToast } from '../common/ToastAlert';
import {
    getPasswordRuleChecks,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
} from '../../utils/passwordValidation';

const AddStaff = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState({
        password: false,
        confirmPassword: false,
    });

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

    // Signature
    const signatureRef = useRef(null);
    const dateOfBirthRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

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
        firstName: '', lastName: '', fatherName: '', motherName: '',
        mobileNo: '', emailId: '', gender: 'Male', cast: '', maritalStatus: '',
        occupation: '',
        dateOfBirth: new Date().toISOString().split('T')[0], panNo: '', gstin: '', taxNo: '', adhaarNo: '',
        loginId: '', password: '', confirmPassword: '',
        bankName: '', bankAccNo: '', ifscCode: '',
        shopName: '', officeAddress: '', permanentAddress: '', currentAddress: '',
        village: '', wardNumber: '', tehsil: '', city: '', country: '',
        pincode: '', state: '', otherInformation: '',
        photo: null, adhaarFront: null, adhaarBack: null, panCard: null,
        signature: null,
    });

    const personalInfo = useMemo(
        () => ({
            firstName: formData.firstName,
            lastName: formData.lastName,
            loginId: formData.loginId,
            email: formData.emailId,
            mobile: formData.mobileNo,
        }),
        [formData.firstName, formData.lastName, formData.loginId, formData.emailId, formData.mobileNo]
    );

    const passwordRules = useMemo(() => {
        const result = getPasswordRuleChecks(formData.password, {
            oldPassword: '',
            personalInfo,
        });
        // Hide "different from old password" on create (no old password)
        const checks = result.checks.filter((rule) => rule.key !== 'different');
        const failed = checks.find((c) => !c.ok);
        return {
            checks,
            isValid: checks.every((c) => c.ok),
            message: failed ? failed.label : 'Strong password',
        };
    }, [formData.password, personalInfo]);

    const passwordValidation = useMemo(() => {
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;
        const passwordFailed = !password || !passwordRules.isValid;
        const passwordMsg = !password
            ? 'Password is required'
            : passwordRules.message;

        let confirmMsg = '';
        let confirmFailed = false;
        if (!confirmPassword) {
            confirmMsg = 'Confirm password is required';
            confirmFailed = true;
        } else if (confirmPassword !== password) {
            confirmMsg = 'Confirm password does not match';
            confirmFailed = true;
        } else if (passwordRules.isValid) {
            confirmMsg = 'Passwords match';
        } else {
            confirmMsg = 'Fix password rules first';
            confirmFailed = true;
        }

        return {
            password: { failed: passwordFailed, message: passwordMsg },
            confirmPassword: { failed: confirmFailed, message: confirmMsg },
            isValid: !passwordFailed && !confirmFailed,
        };
    }, [formData.password, formData.confirmPassword, passwordRules]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nextValue = value;
        if (name === 'password' || name === 'confirmPassword') {
            nextValue = value.slice(0, PASSWORD_MAX_LENGTH);
        }
        setFormData(prev => ({ ...prev, [name]: nextValue }));
    };

    const handleFileSelect = (e, fieldName, setPreview) => {
        const file = getValidatedUploadFile(e);
        if (!file) return;
        setFormData(prev => ({ ...prev, [fieldName]: file }));
        setPreview(URL.createObjectURL(file));
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

    // ─── Signature Pad (unchanged) ────────────────────────────────────────
    useEffect(() => {
        if (dateOfBirthRef.current) {
            $(dateOfBirthRef.current).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: true,
                locale: {
                    format: 'DD-MM-YYYY'
                }
            }, (start) => {
                setFormData(prev => ({ ...prev, dateOfBirth: start.format('YYYY-MM-DD') }));
            });
        }

        const canvas = signatureRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const startDrawing = (e) => { setIsDrawing(true); draw(e); };
        const stopDrawing = () => { setIsDrawing(false); ctx.beginPath(); };
        const draw = (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
            const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [isDrawing]);

    const clearSignature = () => {
        const canvas = signatureRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFormData(prev => ({ ...prev, signature: null }));
    };

    const saveSignature = () => {
        const canvas = signatureRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "signature.png", { type: "image/png" });
                setFormData(prev => ({ ...prev, signature: file }));
            });
    };

    const nextStep = () => { if (currentStep < 2) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        if (!formData.firstName || !formData.lastName || !formData.mobileNo || !formData.emailId || !formData.gender) {
            showToast('Please fill required personal fields.', 'error');
            return;
        }
        if (!formData.loginId.trim()) {
            showToast('Staff login ID is required.', 'error');
            return;
        }
        if (formData.loginId.includes('+')) {
            showToast('Enter staff login ID only (without owner prefix).', 'error');
            return;
        }
        setPasswordTouched({ password: true, confirmPassword: true });
        setShowRequirements(true);
        if (!passwordValidation.isValid) {
            showToast(
                passwordValidation.password.failed
                    ? passwordValidation.password.message
                    : passwordValidation.confirmPassword.message,
                'error'
            );
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('firstName', formData.firstName);
            payload.append('lastName', formData.lastName);
            payload.append('fatherName', formData.fatherName || '');
            payload.append('motherName', formData.motherName || '');
            payload.append('mobileNo', formData.mobileNo);
            payload.append('emailId', formData.emailId);
            payload.append('gender', formData.gender);
            payload.append('cast', formData.cast || '');
            payload.append('maritalStatus', formData.maritalStatus || '');
            payload.append('occupation', formData.occupation || '');
            payload.append('dateOfBirth', formData.dateOfBirth || '');
            payload.append('gstin', formData.gstin || '');
            payload.append('taxNo', formData.taxNo || '');
            payload.append('panNo', formData.panNo || '');
            payload.append('adhaarNo', formData.adhaarNo || '');
            payload.append('loginId', formData.loginId.trim().toLowerCase());
            payload.append('password', formData.password);
            payload.append('confirm_password', formData.confirmPassword);
            payload.append('permanentAddress', formData.permanentAddress || '');
            payload.append('currentAddress', formData.currentAddress || '');
            payload.append('village', formData.village || '');
            payload.append('wardNumber', formData.wardNumber || '');
            payload.append('tehsil', formData.tehsil || '');
            payload.append('city', formData.city || '');
            payload.append('country', formData.country || '');
            payload.append('pincode', formData.pincode || '');
            payload.append('state', formData.state || '');
            payload.append('bankName', formData.bankName || '');
            payload.append('bankAccNo', formData.bankAccNo || '');
            payload.append('ifscCode', formData.ifscCode || '');
            payload.append('otherInformation', formData.otherInformation || '');
            if (formData.photo) payload.append('photo', formData.photo);
            if (formData.adhaarFront) payload.append('adhaarFront', formData.adhaarFront);
            if (formData.adhaarBack) payload.append('adhaarBack', formData.adhaarBack);
            if (formData.panCard) payload.append('panCard', formData.panCard);
            if (formData.signature) payload.append('signature', formData.signature);

            const res = await createStaff(payload);
            showToast(res.message || 'Staff created successfully.');
            navigate(`/staff/staff-details/${res.data.staff_uuid}`);
        } catch (err) {
            showToast(err.message || 'Failed to create staff.', 'error');
            setSubmitting(false);
        }
    };

    // ─── STEP 1 ─────────────────────────────────────────────────────────────
    const renderStep1 = () => (
        <>
            <h5 className="mb-2">Personal Details</h5>
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input type="text" placeholder='Enter your good name' name="firstName" className="form-control border-dark border-dark" required value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
                    <input type="text" name="lastName" placeholder='Enter your last name' className="form-control border-dark border-dark" required value={formData.lastName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Father Name</label>
                    <input type="text" name="fatherName" placeholder='Enter your father name' className="form-control border-dark" value={formData.fatherName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Mother Name</label>
                    <input type="text" name="motherName" placeholder='Enter your mother name' className="form-control border-dark" value={formData.motherName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Mobile No <span className="text-danger">*</span></label>
                    <input type="tel" name="mobileNo" placeholder='Enter your mobile no | phone no..' className="form-control border-dark" required value={formData.mobileNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Email Id <span className="text-danger">*</span></label>
                    <input type="email" name="emailId" placeholder='Enter your email Id.' className="form-control border-dark" required value={formData.emailId} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <select name="gender" className="form-select border-dark" required value={formData.gender} onChange={handleChange}>
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label">Cast</label>
                    <input type="text" name="cast" placeholder='Enter your cast' className="form-control border-dark" value={formData.cast} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label">Marital Status</label>
                    <select name="maritalStatus" className="form-select border-dark" value={formData.maritalStatus} onChange={handleChange}>
                        <option value="" disabled>Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Occupation</label>
                    <input type="text" name="occupation" className="form-control border-dark" placeholder='Enter your occupation' value={formData.occupation} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Date Of Birth</label>
                    <input 
                        type="text" 
                        name="dateOfBirth" 
                        ref={dateOfBirthRef}
                        className="form-control border-dark" 
                        defaultValue={moment(formData.dateOfBirth).format('DD-MM-YYYY')} 
                    />
                </div>

                {/* Identification */}
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">GSTIN</label>
                    <input type="text" name="gstin" placeholder='GSTIN' className="form-control border-dark" value={formData.gstin} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">TAX No.</label>
                    <input type="text" name="taxNo" placeholder='Enter your TAX no.' className="form-control border-dark" value={formData.taxNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">PAN No.</label>
                    <input type="text" name="panNo" placeholder='Enter your PAN no.' className="form-control border-dark" value={formData.panNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Aadhaar No.</label>
                    <input type="text" name="adhaarNo" placeholder='Enter your adhaar no.' className="form-control border-dark" value={formData.adhaarNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Staff Login ID <span className="text-danger">*</span></label>
                    <input type="text" name="loginId" placeholder='e.g. dev' className="form-control border-dark" required value={formData.loginId} onChange={handleChange} />
                    <div className="form-text small">Login will be <strong>owner+staff</strong> (e.g. admin+dev)</div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Password <span className="text-danger">*</span></label>
                    <div className="input-group has-validation">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Enter password"
                            className={`form-control border-dark ${
                                passwordTouched.password && formData.password
                                    ? passwordValidation.password.failed
                                        ? 'is-invalid'
                                        : 'is-valid'
                                    : ''
                            }`}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setShowRequirements(true)}
                            onBlur={() => {
                                setPasswordTouched((prev) => ({ ...prev, password: true }));
                                if (!formData.password) setShowRequirements(false);
                            }}
                            maxLength={PASSWORD_MAX_LENGTH}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary border-dark"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>
                    {passwordTouched.password ? (
                        <div className={`small mt-1 ${passwordValidation.password.failed ? 'text-danger' : 'text-success'}`}>
                            <i className={`bi ${passwordValidation.password.failed ? 'bi-x-circle' : 'bi-check-circle'} me-1`}></i>
                            {passwordValidation.password.message}
                        </div>
                    ) : (
                        <div className="form-text small">
                            {PASSWORD_MIN_LENGTH}–{PASSWORD_MAX_LENGTH} chars, upper, lower, number, special
                        </div>
                    )}
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                    <div className="input-group has-validation">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Repeat password"
                            className={`form-control border-dark ${
                                passwordTouched.confirmPassword && formData.confirmPassword
                                    ? passwordValidation.confirmPassword.failed
                                        ? 'is-invalid'
                                        : 'is-valid'
                                    : ''
                            }`}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }))}
                            maxLength={PASSWORD_MAX_LENGTH}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="btn btn-outline-secondary border-dark"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            tabIndex={-1}
                        >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                    </div>
                    {passwordTouched.confirmPassword ? (
                        <div className={`small mt-1 ${passwordValidation.confirmPassword.failed ? 'text-danger' : 'text-success'}`}>
                            <i className={`bi ${passwordValidation.confirmPassword.failed ? 'bi-x-circle' : 'bi-check-circle'} me-1`}></i>
                            {passwordValidation.confirmPassword.message}
                        </div>
                    ) : null}
                </div>

                {(showRequirements || formData.password.length > 0) && (
                    <div className="col-12">
                        <div className="border rounded p-3 bg-light">
                            <div className="fw-semibold small mb-2">Password requirements</div>
                            <ul className="list-unstyled mb-0 small row">
                                {passwordRules.checks.map((rule) => (
                                    <li
                                        key={rule.key}
                                        className={`col-12 col-md-6 d-flex align-items-start gap-2 mb-1 ${
                                            formData.password
                                                ? rule.ok
                                                    ? 'text-success'
                                                    : 'text-danger'
                                                : 'text-muted'
                                        }`}
                                    >
                                        <i
                                            className={`bi ${
                                                formData.password
                                                    ? rule.ok
                                                        ? 'bi-check-circle-fill'
                                                        : 'bi-x-circle-fill'
                                                    : 'bi-circle'
                                            } mt-1`}
                                        ></i>
                                        <span>{rule.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Document Upload Cards */}
            <div className="row g-3 mt-2">
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

    // ─── STEP 2 ─────────────────────────────────────────────────────────────
    const renderStep2 = () => (
        <>
            <h5 className="mb-3">Additional Details</h5>
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Permanent Address</label>
                    <textarea name="permanentAddress" placeholder='enter your permanent address' className="form-control border-dark" rows={isMobile ? 2 : 2} value={formData.permanentAddress} onChange={handleChange} />
                </div>

                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Current Address</label>
                    <textarea name="currentAddress" placeholder='Enter your present address' className="form-control border-dark" rows={isMobile ? 2 : 2} value={formData.currentAddress} onChange={handleChange} />
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Village</label>
                    <input type="text" name="village" placeholder='Enter your village' className="form-control border-dark" value={formData.village} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Ward No</label>
                    <input type="text" name="wardNumber" placeholder='Enter your ward no.' className="form-control border-dark" value={formData.wardNumber} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Tehsil</label>
                    <input type="text" name="tehsil" placeholder='Enter your tehsil' className="form-control border-dark" value={formData.tehsil} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">City</label>
                    <input type="text" name="city" placeholder='Enter your city' className="form-control border-dark" value={formData.city} onChange={handleChange} />
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" placeholder='Enter your country' className="form-control border-dark" value={formData.country} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Pincode</label>
                    <input type="text" name="pincode" placeholder='Enter your pincode' className="form-control border-dark" value={formData.pincode} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">State</label>
                    <input type="text" name="state" placeholder='Enter your state' className="form-control border-dark" value={formData.state} onChange={handleChange} />
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Bank Name</label>
                    <input type="text" name="bankName" placeholder='Enter your bank name' className="form-control border-dark" value={formData.bankName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">Bank A/c No</label>
                    <input type="text" name="bankAccNo" placeholder='Enter your bank account no' className="form-control border-dark" value={formData.bankAccNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                    <label className="form-label">IFSC Code</label>
                    <input type="text" name="ifscCode" placeholder='Enter IFSC code' className="form-control border-dark" value={formData.ifscCode} onChange={handleChange} />
                </div>
            </div>

            <div className="row g-3 mt-1">
                <div className="col-12 col-md-6">
                    <label className="form-label">Other Information</label>
                    <textarea
                        name="otherInformation"
                        placeholder='Enter other information'
                        className="form-control border-dark"
                        rows={isMobile ? 3 : 4}
                        value={formData.otherInformation}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label">Signature</label><br></br>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <canvas
                            ref={signatureRef}
                            width={isMobile ? 380 : 480}
                            height={105}
                            style={{
                                border: '2px dashed #ccc',
                                background: '#fff',
                                touchAction: 'none',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <button
                                type="button"
                                className="btn btn-sm btn-danger mb-1"
                                onClick={clearSignature}
                            >
                                <i className="bi bi-eraser"></i>
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-success mb-1"
                                onClick={saveSignature}
                            >
                                <i className="bi bi-save"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderContent = () => {
        if (!isMobile) {
            return (
                <div className="card p-4 shadow-sm">
                    <h4 className="mb-1 card-title text-center fw-bold pb-md-0">Add New Staff</h4>
                    {renderStep1()}
                    <hr className="my-3" />
                    {renderStep2()}
                    <div className="d-grid gap-2 col-12 mx-auto mt-5">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting || !passwordValidation.isValid}>
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Submitting...
                                </>
                            ) : (
                                <>SUBMIT <i className="bi bi-check-circle ms-2"></i></>
                            )}
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
                            disabled={submitting || !passwordValidation.isValid}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Submitting...
                                </>
                            ) : (
                                <>SUBMIT <i className="bi bi-check-circle ms-2"></i></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-3 pt-md-0 mb-4">
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

export default AddStaff;