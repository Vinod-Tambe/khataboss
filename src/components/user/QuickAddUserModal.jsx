import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createUser } from '../../api/userApi';
import DocumentUploadCard from '../common/DocumentUploadCard';
import CommonModal from '../common/CommonModal';
import { validateMobile, validateAadhaar } from '../../utils/validation';

const QuickAddUserModal = ({ show, onClose, firms = [], selectedFirmId }) => {
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInputRef = useRef(null);

    // Webcam Refs & State
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [activeCaptureField, setActiveCaptureField] = useState(null);

    const initialFormData = {
        firstName: '',
        lastName: '',
        fatherName: '',
        motherName: '',
        mobileNo: '',
        gender: 'Male',
        adhaarNo: '',
        emailId: '',
        firmId: '',
        currentAddress: '',
        photo: null
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (show) {
            if (selectedFirmId && selectedFirmId !== 'all') {
                setFormData(prev => ({ ...prev, firmId: selectedFirmId }));
            } else if (firms.length === 1) {
                setFormData(prev => ({ ...prev, firmId: firms[0].firm_id }));
            }
        }
    }, [show, selectedFirmId, firms]);

    // ─── Handlers ────────────────────────────────────────────────────────
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ─── Webcam Logic ───────────────────────────────────────────────────
    const startWebcam = (fieldName) => {
        setActiveCaptureField(fieldName);
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
            .then(mediaStream => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setShowWebcam(true);
            })
            .catch(err => {
                toast.error("Cannot access webcam: " + err.message);
                setActiveCaptureField(null);
            });
    };

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
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
            setPhotoPreview(previewUrl);
            stopWebcam();
        }, 'image/jpeg', 0.95);
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) { toast.error('First Name is required'); return false; }
        if (!formData.lastName.trim()) { toast.error('Last Name is required'); return false; }
        if (!formData.mobileNo.trim()) { toast.error('Mobile number is required'); return false; }

        if (!validateMobile(formData.mobileNo)) {
            toast.error('Invalid Mobile Number. It should be 10 digits starting with 6-9.');
            return false;
        }

        if (formData.adhaarNo && !validateAadhaar(formData.adhaarNo)) {
            toast.error('Invalid Aadhaar Number. It should be 12 digits and not start with 0 or 1.');
            return false;
        }

        if (!formData.firmId) { toast.error('Firm is required'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = new FormData();

            // Map frontend fields to backend column names
            const mapping = {
                firstName: 'user_first_name',
                lastName: 'user_last_name',
                fatherName: 'user_father_name',
                motherName: 'user_mother_name',
                mobileNo: 'user_mobile_no',
                gender: 'user_gender',
                adhaarNo: 'user_adhaar_no',
                emailId: 'user_email_id',
                firmId: 'user_firm_id',
                currentAddress: 'user_curr_address'
            };

            Object.keys(formData).forEach(key => {
                if (mapping[key] && formData[key] !== null && formData[key] !== '') {
                    data.append(mapping[key], formData[key]);
                }
            });

            if (formData.photo) {
                data.append('photo', formData.photo);
            }

            const res = await createUser(data);
            toast.success(res.message || 'User created successfully');

            // Reset form
            setFormData({
                firstName: '', lastName: '', fatherName: '',
                mobileNo: '', gender: 'Male', adhaarNo: '',
                firmId: (selectedFirmId && selectedFirmId !== 'all') ? selectedFirmId : (firms.length === 1 ? firms[0].firm_id : ''),
                currentAddress: '', photo: null
            });
            setPhotoPreview(null);
            onClose();
        } catch (err) {
            toast.error(err.message || 'Error creating user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <CommonModal
                show={show}
                onHide={onClose}
                title="Quick Add User"
                size="lg"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-3">
                    <div className="row g-2">
                        {/* Profile Image Field */}
                        <div className="col-md-2">
                            <label className="form-label fw-bold small text-muted mb-1">Profile Image</label>
                            <DocumentUploadCard
                                title=""
                                fieldName="photo"
                                preview={photoPreview}
                                setPreview={setPhotoPreview}
                                inputRef={photoInputRef}
                                showCamera={true}
                                startWebcam={() => startWebcam('photo')}
                                handleFileSelect={handleFileSelect}
                                removeFile={removeFile}
                                small={true}
                                noBorder={true}
                                iconBorder={true}
                            />
                        </div>

                        <div className="col-md-5">
                            <label className="form-label fw-bold small text-muted mb-1">First Name <span className="text-danger">*</span></label>
                            <input
                                name="firstName"
                                className="form-control border-dark"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label fw-bold small text-muted mb-1">Last Name <span className="text-danger">*</span></label>
                            <input
                                name="lastName"
                                className="form-control border-dark"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Father Name</label>
                            <input
                                name="fatherName"
                                className="form-control border-dark"
                                placeholder="Father Name"
                                value={formData.fatherName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Mother Name</label>
                            <input
                                name="motherName"
                                className="form-control border-dark"
                                placeholder="Mother Name"
                                value={formData.motherName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Mobile No <span className="text-danger">*</span></label>
                            <input
                                name="mobileNo"
                                maxLength="10"
                                className="form-control border-dark"
                                placeholder="Mobile"
                                value={formData.mobileNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, mobileNo: val }));
                                }}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Gender <span className="text-danger">*</span></label>
                            <select name="gender" className="form-select border-dark" value={formData.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Email ID</label>
                            <input
                                name="emailId"
                                type="email"
                                className="form-control border-dark"
                                placeholder="Email Address"
                                value={formData.emailId}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Firm <span className="text-danger">*</span></label>
                            <select name="firmId" className="form-select border-dark" value={formData.firmId} onChange={handleChange}>
                                <option value="">Select Firm</option>
                                {firms.map(f => (
                                    <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted mb-1">Aadhaar No</label>
                            <input
                                name="adhaarNo"
                                maxLength="12"
                                className="form-control border-dark"
                                placeholder="Aadhaar No"
                                value={formData.adhaarNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, adhaarNo: val }));
                                }}
                            />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label fw-bold small text-muted mb-1">Current Address</label>
                            <textarea
                                name="currentAddress"
                                className="form-control border-dark"
                                rows="1"
                                placeholder="Enter full address..."
                                value={formData.currentAddress}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12 text-center mt-3">
                            <button type="submit" className="btn btn-primary px-5 py-2 fw-bold" disabled={loading}>
                                {loading ? 'Processing...' : 'Submit User Details'}
                            </button>
                        </div>
                    </div>
                </form>
            </CommonModal>

            {/* Webcam Layer */}
            {showWebcam && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header py-2">
                                <h6 className="modal-title fw-bold">Capture Photo</h6>
                                <button className="btn-close" onClick={stopWebcam}></button>
                            </div>
                            <div className="modal-body text-center bg-dark p-0">
                                <video ref={videoRef} autoPlay playsInline className="w-100" style={{ transform: 'scaleX(-1)' }}></video>
                                <canvas ref={canvasRef} width="320" height="240" className="d-none"></canvas>
                            </div>
                            <div className="modal-footer py-2 justify-content-center border-0">
                                <button className="btn btn-light rounded-circle border p-2" onClick={stopWebcam}>
                                    <i className="bi bi-x fs-4"></i>
                                </button>
                                <button className="btn btn-primary rounded-circle p-3 ms-4" onClick={capturePhoto}>
                                    <i className="bi bi-camera-fill fs-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuickAddUserModal;