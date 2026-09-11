import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  deleteOwner,
  getOwnerByUuid,
  getOwnerPermissionCatalog,
  getOwnerPermissions,
  resetOwnerPassword,
  updateOwner,
  updateOwnerPermissions,
  updateOwnerStatus,
} from '../api/ownerApi';
import { applyPlanToOwner, getPlans } from '../api/planApi';
import {
  computeExpiryFromPlan,
  formatAdminDate,
  formatAdminDateTime,
  isDateBeforeToday,
  isValidDateInputValue,
  toDateInputValue,
} from '../utils/dateHelpers';
import { resolveImageUrl } from '../../utils/imageHelpers';
import { getValidatedUploadFile } from '../../utils/fileUpload';
import OwnerModulePermissionPanel from '../components/OwnerModulePermissionPanel';
import AdminDateInput from '../components/AdminDateInput';

const buildEmptyModuleMap = (catalog = []) => {
  const map = {};
  for (const item of catalog) {
    map[item.module_key] = false;
  }
  return map;
};

const mergeModuleMap = (base = {}, incoming = {}) => {
  const next = { ...base };
  for (const key of Object.keys(next)) {
    if (incoming[key] !== undefined) next[key] = !!incoming[key];
  }
  return next;
};

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
  const [updatedAt, setUpdatedAt] = useState('');
  const [ownStartDate, setOwnStartDate] = useState('');
  const [ownExpiryDate, setOwnExpiryDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [modules, setModules] = useState({});
  const [ownMaxFirms, setOwnMaxFirms] = useState('1');
  const [ownMaxStaff, setOwnMaxStaff] = useState('10');
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanUuid, setSelectedPlanUuid] = useState('');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [applyingPlan, setApplyingPlan] = useState(false);
  const [savingSubscription, setSavingSubscription] = useState(false);

  const ownerName = useMemo(() => formatOwnerName(formData), [formData]);

  const syncOwnerFromApi = (owner) => {
    if (!owner) return;
    setFormData(mapOwnerToForm(owner));
    setCreatedAt(owner.own_created_at || owner.own_add_date || '');
    setUpdatedAt(owner.own_updated_at || '');
    setOwnStartDate(toDateInputValue(owner.own_start_date));
    setOwnExpiryDate(toDateInputValue(owner.own_expiry_date));
    setCurrentPlan(owner.plan || null);
    setSelectedPlanUuid(owner.plan?.plan_uuid || '');
  };

  useEffect(() => {
    let cancelled = false;

    const loadOwner = async () => {
      setLoading(true);
      try {
        const res = await getOwnerByUuid(uuid);
        if (cancelled) return;
        const owner = res.data;
        syncOwnerFromApi(owner);
        setPassword('');
        setConfirmPassword('');

        const [catalogRes, entRes] = await Promise.all([
          getOwnerPermissionCatalog(),
          getOwnerPermissions(uuid),
        ]);
        if (cancelled) return;
        const catalog = catalogRes.data || [];
        const entitlements = entRes.data || owner?.entitlements || {};
        const baseModules = buildEmptyModuleMap(catalog);
        setModuleCatalog(catalog);
        setModules(mergeModuleMap(baseModules, entitlements.modules || {}));
        setOwnMaxFirms(
          entitlements.own_max_firms != null ? String(entitlements.own_max_firms) : '1'
        );
        setOwnMaxStaff(
          entitlements.own_max_staff != null ? String(entitlements.own_max_staff) : '10'
        );
      } catch (error) {
        toast.error(error.message || 'Failed to load owner');
        navigate('/admin/owners/grid');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const loadPlans = async () => {
      try {
        const res = await getPlans(true);
        if (!cancelled) setPlans(res.data || []);
      } catch (error) {
        if (!cancelled) toast.error(error.message || 'Failed to load plans');
      }
    };

    if (uuid) {
      loadOwner();
      loadPlans();
    }
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
      syncOwnerFromApi(refreshed.data);
    } catch (error) {
      toast.error(error.message || 'Failed to update owner');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (savingPassword) return;

    const loginId = formData.own_login_id.trim();
    if (!loginId) {
      toast.error('Login ID is required.');
      return;
    }

    const isChangingPassword = Boolean(password || confirmPassword);
    if (isChangingPassword) {
      if (!password || !confirmPassword) {
        toast.error('Password and confirm password are required.');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
    }

    const payload = { own_login_id: loginId };
    if (isChangingPassword) {
      payload.new_password = password;
      payload.confirm_password = confirmPassword;
    }

    try {
      setSavingPassword(true);
      const res = await resetOwnerPassword(uuid, payload);
      if (res.data) {
        syncOwnerFromApi(res.data);
      } else {
        const refreshed = await getOwnerByUuid(uuid);
        syncOwnerFromApi(refreshed.data);
      }
      toast.success(res.message || 'Owner account updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update login or password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveSubscriptionDates = async () => {
    if (savingSubscription) return;
    if (!ownStartDate || !isValidDateInputValue(ownStartDate)) {
      toast.error('Enter a valid software start date (DD/MM/YYYY).');
      return;
    }
    if (ownExpiryDate && !isValidDateInputValue(ownExpiryDate)) {
      toast.error('Enter a valid software expiry date (DD/MM/YYYY).');
      return;
    }
    if (ownExpiryDate && isDateBeforeToday(ownExpiryDate) && !window.confirm('Expiry date is in the past. Save anyway?')) {
      return;
    }

    const payload = new FormData();
    payload.append('own_start_date', ownStartDate);
    if (ownExpiryDate) payload.append('own_expiry_date', ownExpiryDate);

    try {
      setSavingSubscription(true);
      await updateOwner(uuid, payload);
      const refreshed = await getOwnerByUuid(uuid);
      syncOwnerFromApi(refreshed.data);
      toast.success('Subscription dates saved.');
    } catch (error) {
      toast.error(error.message || 'Failed to save subscription dates');
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleApplyPlan = async () => {
    if (applyingPlan) return;
    if (!selectedPlanUuid) {
      toast.error('Please select a plan to apply.');
      return;
    }
    if (selectedPlanUuid === currentPlan?.plan_uuid) {
      toast.error('Owner is already on this plan.');
      return;
    }
    if (!window.confirm('Apply this plan? Limits and modules will be updated for this owner.')) {
      return;
    }

    try {
      setApplyingPlan(true);
      const res = await applyPlanToOwner(selectedPlanUuid, uuid, {
        own_start_date: ownStartDate,
        own_expiry_date: ownExpiryDate,
      });
      const entitlements = res.data?.entitlements || {};
      const baseModules = buildEmptyModuleMap(moduleCatalog);
      setModules(mergeModuleMap(baseModules, entitlements.modules || {}));
      if (entitlements.own_max_firms != null) setOwnMaxFirms(String(entitlements.own_max_firms));
      if (entitlements.own_max_staff != null) setOwnMaxStaff(String(entitlements.own_max_staff));

      const refreshed = await getOwnerByUuid(uuid);
      syncOwnerFromApi(refreshed.data);
      toast.success(res.message || 'Plan applied successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to apply plan');
    } finally {
      setApplyingPlan(false);
    }
  };

  const handleSavePermissions = async () => {
    if (savingPermissions) return;
    try {
      setSavingPermissions(true);
      const res = await updateOwnerPermissions(uuid, {
        modules,
        own_max_firms: ownMaxFirms,
        own_max_staff: ownMaxStaff,
      });
      const baseModules = buildEmptyModuleMap(moduleCatalog);
      setModules(mergeModuleMap(baseModules, res.data?.modules || {}));
      if (res.data?.own_max_firms != null) setOwnMaxFirms(String(res.data.own_max_firms));
      if (res.data?.own_max_staff != null) setOwnMaxStaff(String(res.data.own_max_staff));
      toast.success('Owner permissions and limits saved.');
    } catch (error) {
      toast.error(error.message || 'Failed to save owner permissions');
    } finally {
      setSavingPermissions(false);
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
                        <label className="form-label text-muted small fw-bold mb-1">Created At</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatAdminDateTime(createdAt)}
                          disabled
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label text-muted small fw-bold mb-1">Last Updated At</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formatAdminDateTime(updatedAt)}
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
                Login &amp; Password
              </h5>
              <form onSubmit={handleResetPassword} className="d-flex flex-column flex-grow-1">
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold mb-1">Login ID</label>
                  <input
                    type="text"
                    name="own_login_id"
                    className="form-control"
                    value={formData.own_login_id}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                  <div className="form-text">Owner uses this to sign in.</div>
                </div>
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
                  {savingPassword ? 'Saving...' : 'Save Login & Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 mb-3 bg-white mx-auto user-details-card" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3 p-md-4">
          <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
            <i className="bi bi-layers me-2" />
            Subscription Plan
          </h5>
          <div className="border rounded bg-light p-3 mb-3">
            <div className="row g-2 small">
              <div className="col-6 col-md-3">
                <span className="text-muted">Start Date</span>
                <div className="fw-semibold">{formatAdminDate(ownStartDate)}</div>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted">Expiry Date</span>
                <div className={`fw-semibold ${ownExpiryDate && isDateBeforeToday(ownExpiryDate) ? 'text-danger' : ''}`}>
                  {formatAdminDate(ownExpiryDate)}
                </div>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted">Created At</span>
                <div className="fw-semibold">{formatAdminDateTime(createdAt)}</div>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted">Last Updated</span>
                <div className="fw-semibold">{formatAdminDateTime(updatedAt)}</div>
              </div>
            </div>
          </div>

          <div className="row g-2 g-md-3 mb-3 align-items-end owner-subscription-date-row">
            <div className="col-12 col-md">
              <label className="form-label text-muted small fw-bold mb-1">Software Start Date</label>
              <AdminDateInput
                value={ownStartDate}
                onChange={setOwnStartDate}
                required
              />
              <div className="form-text">Format: DD/MM/YYYY</div>
            </div>
            <div className="col-12 col-md">
              <label className="form-label text-muted small fw-bold mb-1">Software Expiry Date</label>
              <AdminDateInput
                value={ownExpiryDate}
                onChange={setOwnExpiryDate}
              />
              <div className="form-text">Format: DD/MM/YYYY</div>
            </div>
            <div className="col-12 col-md-auto">
              <button
                type="button"
                className="btn btn-outline-success w-100 w-md-auto text-nowrap"
                onClick={handleSaveSubscriptionDates}
                disabled={savingSubscription}
              >
                {savingSubscription ? 'Saving...' : 'Save Dates'}
              </button>
            </div>
          </div>
          {ownExpiryDate && isDateBeforeToday(ownExpiryDate) && (
            <div className="small text-danger mb-3">Subscription expired on {formatAdminDate(ownExpiryDate)}</div>
          )}

          <div className="row g-3 align-items-end mb-4">
            <div className="col-12 col-md-5">
              <label className="form-label text-muted small fw-bold mb-1">Current Plan</label>
              {currentPlan ? (
                <div className="border rounded p-2 bg-light">
                  <div className="fw-bold text-success">{currentPlan.plan_name}</div>
                  <div className="small text-muted">
                    <code>{currentPlan.plan_code}</code>
                    {' · '}
                    ₹{currentPlan.plan_offer_price ?? currentPlan.plan_price} / {currentPlan.plan_billing_cycle}
                  </div>
                </div>
              ) : (
                <div className="border rounded p-2 bg-light text-muted small">
                  No plan assigned — custom limits & modules
                </div>
              )}
            </div>
            <div className="col-12 col-md-5">
              <label className="form-label text-muted small fw-bold mb-1">Change Plan</label>
              <select
                className="form-select"
                value={selectedPlanUuid}
                onChange={(e) => {
                  const planUuid = e.target.value;
                  setSelectedPlanUuid(planUuid);
                  const plan = plans.find((p) => p.plan_uuid === planUuid);
                  if (plan) {
                    const startDate = ownStartDate || toDateInputValue(new Date());
                    if (!ownStartDate) setOwnStartDate(startDate);
                    setOwnExpiryDate(computeExpiryFromPlan(startDate, plan));
                  }
                }}
              >
                <option value="">Select a plan...</option>
                {plans.map((plan) => (
                  <option key={plan.plan_uuid} value={plan.plan_uuid}>
                    {plan.plan_name} — ₹{plan.plan_offer_price ?? plan.plan_price} / {plan.plan_billing_cycle}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <button
                type="button"
                className="btn btn-success w-100"
                onClick={handleApplyPlan}
                disabled={applyingPlan || !selectedPlanUuid || selectedPlanUuid === currentPlan?.plan_uuid}
              >
                {applyingPlan ? 'Applying...' : 'Apply Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 mb-3 bg-white mx-auto user-details-card" style={{ borderRadius: '12px' }}>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label text-muted small fw-bold mb-1">Max Firms Allowed</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={ownMaxFirms}
                onChange={(e) => setOwnMaxFirms(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label text-muted small fw-bold mb-1">Max Staff Allowed</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={ownMaxStaff}
                onChange={(e) => setOwnMaxStaff(e.target.value)}
              />
            </div>
          </div>

          <OwnerModulePermissionPanel
            catalog={moduleCatalog}
            modules={modules}
            saving={savingPermissions}
            onSave={handleSavePermissions}
            onChange={setModules}
          />
        </div>
      </div>
    </div>
  );
};

export default OwnerDetailsPage;
