import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createUser } from '../../api/userApi';
import { setSelectedUser } from '../../store/slices/userSlice';
import ImageUploadSquare from '../common/ImageUploadSquare';
import CommonModal from '../common/CommonModal';
import { validateMobile, validateAadhaar } from '../../utils/validation';
import '../../css/ProfileDocumentsSection.css';

const QuickAddUserModal = ({ show, onClose, firms = [], selectedFirmId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

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
    const handleProfileFile = (file) => {
        setFormData(prev => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleProfileRemove = () => {
        setFormData(prev => ({ ...prev, photo: null }));
        setPhotoPreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const resetForm = () => {
        setFormData({
            ...initialFormData,
            firmId: (selectedFirmId && selectedFirmId !== 'all')
                ? selectedFirmId
                : (firms.length === 1 ? firms[0].firm_id : ''),
        });
        setPhotoPreview(null);
    };

    const handleSubmit = async (action = 'submit') => {
        if (!validateForm() || loading) return;

        setLoading(true);
        setActiveAction(action);
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
            const createdUser = res.data || res.user || res;
            toast.success(res.message || 'User created successfully');

            if (action === 'submit') {
                // Only submit — keep modal open, no redirect
                resetForm();
                return;
            }

            if (createdUser) {
                dispatch(setSelectedUser(createdUser));
            }

            onClose();
            resetForm();

            if (action === 'home') {
                navigate('/user/home');
            } else if (action === 'finance') {
                navigate('/user/home/add-finance');
            } else if (action === 'loan') {
                navigate('/user/home/add-loan');
            }
        } catch (err) {
            toast.error(err.message || 'Error creating user');
        } finally {
            setLoading(false);
            setActiveAction(null);
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
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit('submit'); }} className="p-3">
                    <div className="row g-2">
                        {/* Profile Image Field */}
                        <div className="col-md-2">
                            <label className="form-label fw-bold small text-muted mb-1">Profile Image</label>
                            <ImageUploadSquare
                                preview={photoPreview}
                                onFile={handleProfileFile}
                                onRemove={handleProfileRemove}
                                modalTitle="Profile Photo"
                                size="compact"
                                showRemove={Boolean(photoPreview)}
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

                        <div className="col-12 mt-3">
                            <div className="d-flex flex-wrap justify-content-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 py-2 fw-bold d-inline-flex align-items-center gap-1"
                                    disabled={loading}
                                    onClick={() => handleSubmit('submit')}
                                >
                                    <i className="bi bi-check2-circle"></i>
                                    {loading && activeAction === 'submit' ? 'Processing...' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success px-4 py-2 fw-bold d-inline-flex align-items-center gap-1"
                                    disabled={loading}
                                    onClick={() => handleSubmit('home')}
                                >
                                    <i className="bi bi-house-door"></i>
                                    {loading && activeAction === 'home' ? 'Processing...' : 'Home'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning px-4 py-2 fw-bold d-inline-flex align-items-center gap-1"
                                    disabled={loading}
                                    onClick={() => handleSubmit('finance')}
                                >
                                    <i className="bi bi-cash-stack"></i>
                                    {loading && activeAction === 'finance' ? 'Processing...' : 'Finance'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4 py-2 fw-bold d-inline-flex align-items-center gap-1"
                                    disabled={loading}
                                    onClick={() => handleSubmit('loan')}
                                >
                                    <i className="bi bi-bank"></i>
                                    {loading && activeAction === 'loan' ? 'Processing...' : 'Loan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </CommonModal>
        </>
    );
};

export default QuickAddUserModal;