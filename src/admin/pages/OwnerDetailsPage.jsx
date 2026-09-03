import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  deleteOwner,
  getOwnerByUuid,
  resetOwnerPassword,
  updateOwner,
  updateOwnerStatus,
} from '../api/ownerApi';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { getValidatedUploadFile } from '../../utils/fileUpload';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const formatOwnerName = (owner) =>
  [owner?.own_first_name, owner?.own_middle_name, owner?.own_last_name].filter(Boolean).join(' ');

const mapOwnerToForm = (owner) => ({
  own_first_name: owner?.own_first_name || '',
  own_middle_name: owner?.own_middle_name || '',
  own_last_name: owner?.own_last_name || '',
  own_email: owner?.own_email || '',
  own_mobile_no: owner?.own_mobile_no || '',
  own_phone_no: owner?.own_phone_no || '',
  own_login_id: owner?.own_login_id || '',
  own_address: owner?.own_address || '',
  own_village: owner?.own_village || '',
  own_city: owner?.own_city || '',
  own_state: owner?.own_state || '',
  own_pincode: owner?.own_pincode || '',
  own_db: owner?.own_db || '',
  own_product_key: owner?.own_product_key || '',
  own_status: owner?.own_status === 'Active',
  image: resolveImageUrl(owner?.own_profile_img) || DEFAULT_AVATAR,
  photoFile: null,
});

const OwnerDetailsPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState(mapOwnerToForm({}));
  const [createdAt, setCreatedAt] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ownerName = useMemo(() => formatOwnerName(formData), [formData]);

  useEffect(() => {
    let cancelled = false;

    const loadOwner = async () => {
      setLoading(true);
      try {
        const res = await getOwnerByUuid(uuid);
        if (cancelled) return;
        const owner = res.data;
        setFormData(mapOwnerToForm(owner));
        setCreatedAt(owner?.own_created_at || owner?.own_add_date || '');
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        toast.error(error.message || 'Failed to load owner');
        navigate('/admin/owners/grid');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (uuid) loadOwner();
    return () => {
      cancelled = true;
    };
  }, [uuid, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileFile = (file) => {
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      photoFile: file,
      image: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    if (saving) return;
    if (!formData.own_first_name || !formData.own_last_name) {
      toast.error('First name and last name are required.');
      return;
    }
    if (!formData.own_email || !formData.own_mobile_no) {
      toast.error('Email and mobile are required.');
      return;
    }

    const payload = new FormData();
    const fields = [
      'own_first_name',
      'own_middle_name',
      'own_last_name',
      'own_email',
      'own_mobile_no',
      'own_phone_no',
      'own_address',
      'own_village',
      'own_city',
      'own_state',
      'own_pincode',
    ];
    fields.forEach((key) => {
      if (formData[key] != null && formData[key] !== '') {
        payload.append(key, formData[key]);
      }
    });
    if (formData.photoFile) {
      payload.append('own_profile_img', formData.photoFile);
    }

    try {
      setSaving(true);
      await updateOwner(uuid, payload);

      const nextStatus = formData.own_status ? 'Active' : 'Inactive';
      await updateOwnerStatus(uuid, nextStatus);

      toast.success('Owner updated successfully.');
      const refreshed = await getOwnerByUuid(uuid);
      setFormData(mapOwnerToForm(refreshed.data));
    } catch (error) {
      toast.error(error.message || 'Failed to update owner');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (savingPassword) return;
    if (!password || !confirmPassword) {
      toast.error('Password and confirm password are required.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await resetOwnerPassword(uuid, password, confirmPassword);
      toast.success('Password reset successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete owner "${ownerName}"?`)) return;
    try {
      await deleteOwner(uuid);
      toast.success('Owner deleted successfully.');
      navigate('/admin/owners/grid');
    } catch (error) {
      toast.error(error.message || 'Failed to delete owner');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="admin-page-title mb-1">{ownerName || 'Owner Details'}</h2>
          <p className="text-muted mb-0">View and manage owner profile</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/owners/grid" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1" />
            Back to Owners
          </Link>
          <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3 mx-auto">
        <div className="col-12 col-lg-9">
          <div className="card border-0 h-100 bg-white user-details-card" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
                <i className="bi bi-person-badge-fill me-2" />
                Owner Profile Details
              </h5>

              <div className="row g-4">
                <div
                  className="col-12 col-md-auto text-center mb-3 mb-md-0 d-flex flex-column align-items-center"
                  style={{ width: '150px' }}
                >
                  <div
                    className="bg-light rounded p-2 d-inline-block position-relative"
                    style={{ width: '130px', height: '130px' }}
                  >
                    <img
                      src={formData.image}
                      alt={ownerName}
                      className="rounded object-fit-cover w-100 h-100"
                    />
                  </div>
                  <div className="mt-2 w-100">
                    <label className="btn btn-sm btn-outline-secondary w-100 fw-bold">
                      <i className="bi bi-camera me-1 d-md-none" />
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => {
                          const file = getValidatedUploadFile(e);
                          if (file) handleProfileFile(file);
                        }}
                      />
                    </label>
                  </div>
                  <div className="mt-3 w-100">
                    <label className="form-label text-muted small fw-bold mb-1">Status</label>
                    <div className="form-check form-switch d-flex justify-content-center m-0 p-0">
                      <input
                        className="form-check-input custom-switch m-0"
                        type="checkbox"
                        role="switch"
                        checked={formData.own_status}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, own_status: e.target.checked }))
                        }
                      />
                    </div>
                  </div>
                  {formData.own_login_id && (
                    <div className="mt-2 small text-muted">
                      Login: <strong className="text-success">{formData.own_login_id}</strong>
                    </div>
                  )}
                  {formData.own_db && (
                    <div className="mt-1 small text-muted">
                      DB: <code>{formData.own_db}</code>
                    </div>
                  )}
                </div>

                <div className="col">
                  <ul className="nav nav-pills gap-1 bg-light p-1 rounded mb-3 d-flex flex-wrap">
                    {[
                      { id: 'personal', label: 'Personal' },
                      { id: 'address', label: 'Address' },
                      { id: 'account', label: 'Account' },
                    ].map((tab) => (
                      <li className="nav-item" key={tab.id}>
                        <button
                          type="button"
                          className={`nav-link py-1 px-2 px-xl-3 fw-bold btn-sm rounded ${
                            activeTab === tab.id
                              ? 'active bg-success text-white'
                              : 'text-secondary bg-transparent border-0'
                          }`}
                          onClick={() => setActiveTab(tab.id)}
                        >
                          {tab.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {activeTab === 'personal' && (
                    <div className="row g-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">First Name *</label>
                        <input
                          type="text"
                          name="own_first_name"
                          className="form-control"
                          value={formData.own_first_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">Middle Name</label>
                        <input
                          type="text"
                          name="own_middle_name"
                          className="form-control"
                          value={formData.own_middle_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="own_last_name"
                          className="form-control"
                          value={formData.own_last_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">Email *</label>
                        <input
                          type="email"
                          name="own_email"
                          className="form-control"
                          value={formData.own_email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">Mobile *</label>
                        <input
                          type="text"
                          name="own_mobile_no"
                          className="form-control"
                          value={formData.own_mobile_no}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label text-muted small fw-bold mb-1">Phone</label>
                        <input
                          type="text"
                          name="own_phone_no"
                          className="form-control"
                          value={formData.own_phone_no}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'address' && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-muted small fw-bold mb-1">Address</label>
                        <textarea
                          name="own_address"
                          className="form-control"
                          rows="3"
                          value={formData.own_address}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">Village</label>
                        <input
                          type="text"
                          name="own_village"
                          className="form-control"
                          value={formData.own_village}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">City</label>
                        <input
                          type="text"
                          name="own_city"
                          className="form-control"
                          value={formData.own_city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">State</label>
                        <input
                          type="text"
                          name="own_state"
                          className="form-control"
                          value={formData.own_state}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label text-muted small fw-bold mb-1">Pincode</label>
                        <input
                          type="text"
                          name="own_pincode"
                          className="form-control"
                          value={formData.own_pincode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'account' && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-bold mb-1">Login ID</label>
                        <input type="text" className="form-control" value={formData.own_login_id} disabled />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-bold mb-1">Database</label>
                        <input type="text" className="form-control" value={formData.own_db} disabled />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-bold mb-1">Product Key</label>
                        <input type="text" className="form-control" value={formData.own_product_key} disabled />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-bold mb-1">Created Date</label>
                        <input
                          type="text"
                          className="form-control"
                          value={createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : ''}
                          disabled
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4 border-top pt-3">
                <button
                  type="button"
                  className="btn btn-success px-4 fw-bold w-100 w-md-auto"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          <div className="card border-0 h-100 bg-white user-details-card" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3 p-md-4 d-flex flex-column">
              <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
                <i className="bi bi-shield-lock-fill me-2" />
                Reset Password
              </h5>
              <form onSubmit={handleResetPassword} className="d-flex flex-column flex-grow-1">
                <div className="mb-2">
                  <label className="form-label text-muted small fw-bold mb-1">New Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Confirm Password</label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-auto" disabled={savingPassword}>
                  {savingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDetailsPage;
