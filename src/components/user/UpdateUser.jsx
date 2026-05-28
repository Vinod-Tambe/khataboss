import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentUploadCard from '../common/DocumentUploadCard';
import moment from 'moment';
import $ from 'jquery';
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';
import { toast } from 'react-hot-toast';
import { validatePincode, validatePan, validateAadhaar, validateGstin, validateIfsc, validateMobile, validatePhone } from '../../utils/validation';
import useFormNavigation from '../../hooks/useFormNavigation';
import { getFirmsDropdown } from '../../api/firmApi';
import { getUser, updateUser } from '../../api/userApi';

const UpdateUser = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentStep, setCurrentStep] = useState(1);

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

    const [firms, setFirms] = useState([]);
    const [loading, setLoading] = useState(false);


    const [formData, setFormData] = useState({
        firstName: '', lastName: '', fatherName: '', motherName: '',
        mobileNo: '', phoneNo: '', emailId: '', gender: 'Male', cast: '', maritalStatus: '',
        dateOfBirth: new Date().toISOString().split('T')[0], panNo: '', gstin: '', taxNo: '', adhaarNo: '',
        bankName: '', bankAccNo: '', ifscCode: '',
        shopName: '', officeAddress: '', permanentAddress: '', currentAddress: '',
        village: '', wardNumber: '', tehsil: '', city: '', country: '',
        pincode: '', state: '', otherInformation: '',
        photo: null, adhaarFront: null, adhaarBack: null, panCard: null,
        signature: null,
        firmId: '',
        occupation: '',
    });

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setCurrentStep(1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch firms first for the dropdown
                const firmRes = await getFirmsDropdown();
                setFirms(firmRes.data || []);

                // Fetch user data
                const response = await getUser(uuid);
                const user = response.data;

                if (user) {
                    setFormData({
                        firstName: user.user_first_name || '',
                        lastName: user.user_last_name || '',
                        fatherName: user.user_father_name || '',
                        motherName: user.user_mother_name || '',
                        mobileNo: user.user_mobile_no || '',
                        phoneNo: user.user_phone_no || '',
                        emailId: user.user_email_id || '',
                        gender: user.user_gender || 'Male',
                        cast: user.user_cast || '',
                        maritalStatus: user.user_marital_status || 'Single',
                        occupation: user.user_occupation || '',
                        dateOfBirth: user.user_birth_date ? new Date(user.user_birth_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        panNo: user.user_pan_no || '',
                        gstin: user.user_gstin || '',
                        taxNo: user.user_tax_no || '',
                        adhaarNo: user.user_adhaar_no || '',
                        bankName: user.user_bank_name || '',
                        bankAccNo: user.user_bank_acc_no || '',
                        ifscCode: user.user_ifsc_code || '',
                        permanentAddress: user.user_per_address || '',
                        currentAddress: user.user_curr_address || '',
                        village: user.user_village || '',
                        wardNumber: user.user_ward_no || '',
                        tehsil: user.user_tehsil || '',
                        city: user.user_city || '',
                        state: user.user_state || '',
                        country: user.user_country || '',
                        pincode: user.user_pincode || '',
                        otherInformation: user.user_other_info || '',
                        firmId: user.user_firm_id || '',
                        photo: null,
                        adhaarFront: null,
                        adhaarBack: null,
                        panCard: null,
                        signature: null,
                    });

                    // Set image previews
                    const baseUrl = 'http://localhost:9000/';
                    if (user.user_profile_img?.path) setPhotoPreview(`${baseUrl}${user.user_profile_img.path}`);
                    if (user.user_adhaar_front_img?.path) setAadhaarFrontPreview(`${baseUrl}${user.user_adhaar_front_img.path}`);
                    if (user.user_adhaar_back_img?.path) setAadhaarBackPreview(`${baseUrl}${user.user_adhaar_back_img.path}`);
                    if (user.user_pan_card_img?.path) setPanCardPreview(`${baseUrl}${user.user_pan_card_img.path}`);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load user details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uuid]);

    useEffect(() => {
        if (dateOfBirthRef.current) {
            $(dateOfBirthRef.current).daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                autoUpdateInput: true,
                locale: { format: 'DD-MM-YYYY' }
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
        if (videoRef.current) videoRef.current.srcObject = null;
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

            if (activeCaptureField === 'photo') setPhotoPreview(previewUrl);
            else if (activeCaptureField === 'adhaarFront') setAadhaarFrontPreview(previewUrl);
            else if (activeCaptureField === 'adhaarBack') setAadhaarBackPreview(previewUrl);
            else if (activeCaptureField === 'panCard') setPanCardPreview(previewUrl);

            setCaptureTime(new Date().toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }));

            stopWebcam();
        }, 'image/jpeg', 0.92);
    };

    const clearSignature = () => {
        const canvas = signatureRef.current;
        if (!canvas) return;
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
                toast.success("Signature saved!");
            });
    };

    const validateStep1 = () => {
        const requiredFields = ['firstName', 'lastName', 'mobileNo', 'gender', 'firmId'];
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                const readableName = field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                toast.error(`${readableName} is required.`);
                return false;
            }
        }
        if (formData.panNo && !validatePan(formData.panNo)) { toast.error('Invalid PAN Number. Format: ABCDE1234F'); return false; }
        if (formData.mobileNo && !validateMobile(formData.mobileNo)) { toast.error('Invalid Mobile Number. It should be 10 digits starting with 6-9.'); return false; }
        if (formData.phoneNo && !validatePhone(formData.phoneNo)) { toast.error('Invalid Phone Number. It should be 10-12 digits.'); return false; }
        if (formData.gstin && !validateGstin(formData.gstin)) { toast.error('Invalid GSTIN. It should be a 15-character alphanumeric code.'); return false; }
        if (formData.adhaarNo && !validateAadhaar(formData.adhaarNo)) { toast.error('Invalid Aadhaar Number. It should be 12 digits and not start with 0 or 1.'); return false; }
        if (formData.taxNo && formData.taxNo.length < 5) { toast.error('Tax No should be at least 5 characters.'); return false; }
        return true;
    };

    const nextStep = () => { if (validateStep1()) setCurrentStep(2); };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep1()) return;

        if (formData.pincode && !validatePincode(formData.pincode)) {
            toast.error('Invalid Pincode. It should be 6 digits and not start with 0.');
            return;
        }

        if (formData.ifscCode && !validateIfsc(formData.ifscCode)) {
            toast.error('Invalid IFSC Code. Format: ABCD0123456 (11 characters).');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            const mapping = {
                firmId: 'user_firm_id', firstName: 'user_first_name', lastName: 'user_last_name',
                fatherName: 'user_father_name', motherName: 'user_mother_name',
                mobileNo: 'user_mobile_no', phoneNo: 'user_phone_no', emailId: 'user_email_id',
                gender: 'user_gender', cast: 'user_cast', maritalStatus: 'user_marital_status',
                occupation: 'user_occupation', dateOfBirth: 'user_birth_date',
                gstin: 'user_gstin', taxNo: 'user_tax_no', panNo: 'user_pan_no',
                adhaarNo: 'user_adhaar_no', bankName: 'user_bank_name',
                bankAccNo: 'user_bank_acc_no', ifscCode: 'user_ifsc_code',
                permanentAddress: 'user_per_address', currentAddress: 'user_curr_address',
                village: 'user_village', wardNumber: 'user_ward_no', tehsil: 'user_tehsil',
                city: 'user_city', state: 'user_state', country: 'user_country',
                pincode: 'user_pincode', otherInformation: 'user_other_info'
            };

            Object.keys(formData).forEach(key => {
                if (mapping[key] && formData[key] !== null && !(formData[key] instanceof File)) {
                    data.append(mapping[key], formData[key]);
                }
            });

            if (formData.photo) data.append('photo', formData.photo);
            if (formData.adhaarFront) data.append('adhaarFront', formData.adhaarFront);
            if (formData.adhaarBack) data.append('adhaarBack', formData.adhaarBack);
            if (formData.panCard) data.append('panCard', formData.panCard);
            if (formData.signature) data.append('signature', formData.signature);

            const result = await updateUser(uuid, data);
            toast.success(result.message || 'User updated successfully!');
            setTimeout(() => navigate('/user/list'), 1500);
        } catch (error) {
            toast.error(error.message || 'Error updating user');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <h5 className="mb-2">Personal Details</h5>
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">First Name <span className="text-danger">*</span></label>
                    <input type="text" placeholder='Enter your good name' name="firstName" className="form-control border-dark" required value={formData.firstName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Last Name <span className="text-danger">*</span></label>
                    <input type="text" name="lastName" placeholder='Enter your last name' className="form-control border-dark" required value={formData.lastName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Father Name</label>
                    <input type="text" name="fatherName" placeholder='Enter your father name' className="form-control border-dark" value={formData.fatherName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Mother Name</label>
                    <input type="text" name="motherName" placeholder='Enter your mother name' className="form-control border-dark" value={formData.motherName} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Firm Name <span className="text-danger">*</span></label>
                    <select name="firmId" className="form-select border-dark" required value={formData.firmId} onChange={handleChange}>
                        <option value="">Select Firm</option>
                        {firms.map(firm => (
                            <option key={firm.firm_id} value={firm.firm_id}>{firm.firm_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Mobile No <span className="text-danger">*</span></label>
                    <input type="tel" name="mobileNo" placeholder='Enter mobile no' className="form-control border-dark" required value={formData.mobileNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Phone No</label>
                    <input type="tel" name="phoneNo" placeholder='Enter phone no' className="form-control border-dark" value={formData.phoneNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Email Id</label>
                    <input type="email" name="emailId" placeholder='Enter your email Id.' className="form-control border-dark" value={formData.emailId} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <select name="gender" className="form-select border-dark" required value={formData.gender} onChange={handleChange}>
                        <option value="" disabled>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Cast</label>
                    <input type="text" name="cast" placeholder='Enter your cast' className="form-control border-dark" value={formData.cast} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Marital Status</label>
                    <select name="maritalStatus" className="form-select border-dark" value={formData.maritalStatus} onChange={handleChange}>
                        <option value="" disabled>Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Occupation</label>
                    <input type="text" name="occupation" placeholder='Enter your occupation' className="form-control border-dark" value={formData.occupation} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Date Of Birth</label>
                    <input type="text" ref={dateOfBirthRef} className="form-control border-dark" defaultValue={moment(formData.dateOfBirth).format('DD-MM-YYYY')} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">GSTIN</label>
                    <input type="text" name="gstin" placeholder='GSTIN' className="form-control border-dark" value={formData.gstin} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">TAX No.</label>
                    <input type="text" name="taxNo" placeholder='Enter your TAX no.' className="form-control border-dark" value={formData.taxNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">PAN No.</label>
                    <input type="text" name="panNo" placeholder='Enter your PAN no.' className="form-control border-dark" value={formData.panNo} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="form-label">Aadhaar No.</label>
                    <input type="text" name="adhaarNo" placeholder='Enter your adhaar no.' className="form-control border-dark" value={formData.adhaarNo} onChange={handleChange} />
                </div>
            </div>

            <div className="row g-3 mt-2">
                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard title="Profile Photo" fieldName="photo" preview={photoPreview} setPreview={setPhotoPreview} inputRef={photoInputRef} showCamera={true} startWebcam={() => startWebcam('photo')} handleFileSelect={handleFileSelect} removeFile={removeFile} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard title="Aadhaar Front" fieldName="adhaarFront" preview={aadhaarFrontPreview} setPreview={setAadhaarFrontPreview} inputRef={aadhaarFrontInputRef} showCamera={true} startWebcam={() => startWebcam('adhaarFront')} handleFileSelect={handleFileSelect} removeFile={removeFile} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard title="Aadhaar Back" fieldName="adhaarBack" preview={aadhaarBackPreview} setPreview={setAadhaarBackPreview} inputRef={aadhaarBackInputRef} showCamera={true} startWebcam={() => startWebcam('adhaarBack')} handleFileSelect={handleFileSelect} removeFile={removeFile} />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <DocumentUploadCard title="PAN Card" fieldName="panCard" preview={panCardPreview} setPreview={setPanCardPreview} inputRef={panCardInputRef} showCamera={true} startWebcam={() => startWebcam('panCard')} handleFileSelect={handleFileSelect} removeFile={removeFile} />
                </div>
            </div>
        </>
    );

    const renderStep2 = () => (
        <>
            <h5 className="mb-3">Additional Details</h5>
            <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Permanent Address</label>
                    <textarea name="permanentAddress" placeholder='enter your permanent address' className="form-control border-dark" rows={2} value={formData.permanentAddress} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                    <label className="form-label">Current Address</label>
                    <textarea name="currentAddress" placeholder='Enter your present address' className="form-control border-dark" rows={2} value={formData.currentAddress} onChange={handleChange} />
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
                    <textarea name="otherInformation" placeholder='Enter other information' className="form-control border-dark" rows={isMobile ? 3 : 4} value={formData.otherInformation} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label">Signature</label><br />
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <canvas ref={signatureRef} width={isMobile ? 380 : 480} height={105} style={{ border: '2px dashed #ccc', background: '#fff', touchAction: 'none', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-sm btn-danger mb-1" onClick={clearSignature}><i className="bi bi-eraser"></i></button>
                            <button type="button" className="btn btn-sm btn-success mb-1" onClick={saveSignature}><i className="bi bi-save"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderContent = () => (
        <div className="card p-4 shadow-sm border-0">
            <h4 className="card-title text-center fw-bold pb-md-0 mb-4">Update User Records</h4>
            {!isMobile ? (
                <>
                    {renderStep1()}
                    <hr className="my-3" />
                    {renderStep2()}
                    <div className="d-grid gap-2 col-12 mx-auto mt-5">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'UPDATING...' : 'UPDATE USER RECORDS'} <i className="bi bi-check-circle ms-2"></i>
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h6 className="text-center mb-4 text-muted">Step {currentStep} of 2</h6>
                    {currentStep === 1 ? renderStep1() : renderStep2()}
                    <div className="d-flex justify-content-between mt-4 gap-2">
                        {currentStep > 1 && <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={prevStep}><i className="bi bi-arrow-left me-2"></i> Previous</button>}
                        {currentStep === 1 ? (
                            <button type="button" className="btn btn-primary flex-grow-1 ms-auto" onClick={nextStep}>Continue <i className="bi bi-arrow-right ms-2"></i></button>
                        ) : (
                            <button type="submit" className="btn btn-success flex-grow-1 ms-auto" disabled={loading}>
                                {loading ? 'UPDATING...' : 'UPDATE RECORDS'} <i className="bi bi-check-circle ms-2"></i>
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    if (loading && !formData.firstName) return <div className="text-center p-5 fw-bold">Loading User Details...</div>;

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            {renderContent()}
            {showWebcam && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Capture Image</h5>
                                <button type="button" className="btn-close" onClick={stopWebcam}></button>
                            </div>
                            <div className="modal-body text-center">
                                <video ref={videoRef} autoPlay playsInline muted width="320" height="240" className="rounded shadow-sm mb-3" style={{ border: '2px solid #dee2e6' }} />
                                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
                                {captureTime && <div className="mt-2 text-muted small">Captured: {captureTime}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={stopWebcam}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={capturePhoto}>Capture</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

export default UpdateUser;