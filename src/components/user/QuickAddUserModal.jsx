import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { validateMobile } from '../../utils/validation';
import { createUser } from '../../api/userApi';
import DocumentUploadCard from '../common/DocumentUploadCard';

const QuickAddUserModal = ({ show, onClose, firms = [], selectedFirmId }) => {
    // 1. ALL Hooks go inside the component function
    const [loading, setLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInputRef = useRef(null);
    const videoRef = useRef(null); // Added the missing videoRef

    // Webcam specific states (Moved inside)
    const [activeCaptureField, setActiveCaptureField] = useState(null);
    const [stream, setStream] = useState(null);
    const [showWebcam, setShowWebcam] = useState(false);
    const [captureTime, setCaptureTime] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNo: '',
        gender: 'Male',
        firmId: '',
        currentAddress: '',
        photo: null
    });

    // ✅ Auto set firm when selectedFirmId changes
    useEffect(() => {
        if (selectedFirmId) {
            setFormData(prev => ({ ...prev, firmId: selectedFirmId }));
        }
    }, [selectedFirmId]);

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
                toast.error("Cannot access webcam: " + err.message);
                setActiveCaptureField(null);
            });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'firstName' || name === 'lastName') {
            if (!/^[A-Za-z\s]*$/.test(value)) return;
        }
        if (name === 'mobileNo') {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return toast.error('First Name is required');
        if (!formData.lastName.trim()) return toast.error('Last Name is required');
        if (formData.mobileNo.length !== 10) return toast.error('Mobile must be 10 digits');
        if (!formData.firmId) return toast.error('Firm is required');
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = new FormData();
            data.append('user_first_name', formData.firstName);
            data.append('user_last_name', formData.lastName);
            data.append('user_mobile_no', formData.mobileNo);
            data.append('user_gender', formData.gender);
            data.append('user_firm_id', formData.firmId);
            data.append('user_curr_address', formData.currentAddress);

            if (formData.photo) {
                data.append('photo', formData.photo);
            }

            const res = await createUser(data);
            toast.success(res.message || 'User created successfully');
            
            // Close and reset
            onClose();
        } catch (err) {
            toast.error(err.message || 'Error creating user');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Quick Add User</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="row g-3">
                            <div className="col-6">
                                <label>First Name *</label>
                                <input name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label>Last Name *</label>
                                <input name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label>Mobile *</label>
                                <input name="mobileNo" className="form-control" value={formData.mobileNo} onChange={handleChange} />
                            </div>
                            <div className="col-6">
                                <label>Gender *</label>
                                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label>Firm *</label>
                                <select name="firmId" className="form-select" value={formData.firmId} onChange={handleChange}>
                                    <option value="">Select Firm</option>
                                    {firms.map(f => (
                                        <option key={f.firm_id} value={f.firm_id}>{f.firm_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
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
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickAddUserModal;