import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  createOwner,
  getOwnerByUuid,
  getOwnerPermissionCatalog,
  updateOwner,
} from '../api/ownerApi';
import { getPlans } from '../api/planApi';
import OwnerModulePermissionPanel from '../components/OwnerModulePermissionPanel';
import {
  computeExpiryFromPlan,
  isValidDateInputValue,
  todayDateInputValue,
  toDateInputValue,
} from '../utils/dateHelpers';
import AdminDateInput from '../components/AdminDateInput';

const buildEmptyModuleMap = (catalog = []) => {
  const map = {};
  for (const item of catalog) {
    map[item.module_key] = false;
  }
  return map;
};

const emptyForm = {
  own_first_name: '',
  own_middle_name: '',
  own_last_name: '',
  own_email: '',
  own_mobile_no: '',
  own_phone_no: '',
  own_login_id: '',
  own_password: '',
  own_confirm_password: '',
  own_address: '',
  own_village: '',
  own_city: '',
  own_state: '',
  own_pincode: '',
};

const OwnerFormPage = () => {
  const { uuid } = useParams();
  const isEdit = Boolean(uuid);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [ownMaxFirms, setOwnMaxFirms] = useState('1');
  const [ownMaxStaff, setOwnMaxStaff] = useState('10');
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [modules, setModules] = useState({});
  const [plans, setPlans] = useState([]);
  const [selectedPlanUuid, setSelectedPlanUuid] = useState('');
  const [initialPlanUuid, setInitialPlanUuid] = useState('');
  const [ownStartDate, setOwnStartDate] = useState(todayDateInputValue());
  const [ownExpiryDate, setOwnExpiryDate] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await getOwnerPermissionCatalog();
        const catalog = res.data || [];
        setModuleCatalog(catalog);
        setModules(buildEmptyModuleMap(catalog));
      } catch (error) {
        toast.error(error.message || 'Failed to load permission catalog');
      }
    };
    const loadPlans = async () => {
      try {
        const res = await getPlans(true);
        setPlans(res.data || []);
      } catch (error) {
        toast.error(error.message || 'Failed to load plans');
      }
    };
    loadCatalog();
    loadPlans();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadOwner = async () => {
      try {
        setFetching(true);
        const res = await getOwnerByUuid(uuid);
        const owner = res.data;
        if (!owner) {
          toast.error('Owner not found');
          navigate('/admin/owners/grid');
          return;
        }
        const planUuid = owner?.plan?.plan_uuid || '';
        setSelectedPlanUuid(planUuid);
        setInitialPlanUuid(planUuid);
        setOwnStartDate(toDateInputValue(owner.own_start_date) || todayDateInputValue());
        setOwnExpiryDate(toDateInputValue(owner.own_expiry_date));
        setFormData({
          ...emptyForm,
          own_first_name: owner.own_first_name || '',
          own_middle_name: owner.own_middle_name || '',
          own_last_name: owner.own_last_name || '',
          own_email: owner.own_email || '',
          own_mobile_no: owner.own_mobile_no || '',
          own_phone_no: owner.own_phone_no || '',
          own_login_id: owner.own_login_id || '',
          own_address: owner.own_address || '',
          own_village: owner.own_village || '',
          own_city: owner.own_city || '',
          own_state: owner.own_state || '',
          own_pincode: owner.own_pincode || '',
        });
      } catch (error) {
        toast.error(error.message || 'Failed to load owner');
      } finally {
        setFetching(false);
      }
    };

    loadOwner();
  }, [isEdit, uuid, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (planUuid) => {
    setSelectedPlanUuid(planUuid);
    if (!planUuid) return;
    const plan = plans.find((p) => p.plan_uuid === planUuid);
    if (!plan) return;
    const startDate = ownStartDate || todayDateInputValue();
    if (!ownStartDate) setOwnStartDate(startDate);
    setOwnExpiryDate(computeExpiryFromPlan(startDate, plan));
    setOwnMaxFirms(String(plan.plan_max_firms ?? 1));
    setOwnMaxStaff(String(plan.plan_max_staff ?? 10));
    const base = buildEmptyModuleMap(moduleCatalog);
    const next = { ...base };
    for (const key of Object.keys(next)) {
      if (plan.modules?.[key]) next[key] = true;
    }
    setModules(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit) {
      if (!formData.own_password || !formData.own_confirm_password) {
        toast.error('Password and confirm password are required.');
        return;
      }
      if (formData.own_password !== formData.own_confirm_password) {
        toast.error('Passwords do not match.');
        return;
      }
    }

    if (!ownStartDate || !isValidDateInputValue(ownStartDate)) {
      toast.error('Enter a valid software start date (DD/MM/YYYY).');
      return;
    }
    if (ownExpiryDate && !isValidDateInputValue(ownExpiryDate)) {
      toast.error('Enter a valid software expiry date (DD/MM/YYYY).');
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        payload.append(key, value);
      }
    });

    if (!isEdit) {
      if (selectedPlanUuid) {
        payload.append('plan_uuid', selectedPlanUuid);
      } else {
        payload.append('own_max_firms', ownMaxFirms);
        payload.append('own_max_staff', ownMaxStaff);
        payload.append('modules', JSON.stringify(modules));
      }
    } else if (selectedPlanUuid && selectedPlanUuid !== initialPlanUuid) {
      payload.append('plan_uuid', selectedPlanUuid);
    }

    if (ownStartDate) payload.append('own_start_date', ownStartDate);
    if (ownExpiryDate) payload.append('own_expiry_date', ownExpiryDate);

    try {
      setLoading(true);
      if (isEdit) {
        payload.delete('own_password');
        payload.delete('own_confirm_password');
        await updateOwner(uuid, payload);
        toast.success('Owner updated successfully.');
      } else {
        await createOwner(payload);
        toast.success('Owner created successfully. Tenant database initialized.');
      }
      navigate('/admin/owners/grid');
    } catch (error) {
      toast.error(error.message || 'Failed to save owner');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="admin-page-title mb-1">{isEdit ? 'Edit Owner' : 'Add New Owner'}</h2>
          <p className="text-muted mb-0">
            {isEdit
              ? 'Update owner profile details'
              : 'Create a new owner account and dedicated tenant database'}
          </p>
        </div>
        <Link to="/admin/owners/grid" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          Back to Owners
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card border-0 mb-3 bg-white user-details-card admin-panel" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-brown mb-3 d-flex align-items-center">
              <i className="bi bi-person-badge-fill me-2" />
              Owner Profile Details
            </h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">First Name *</label>
            <input className="form-control" name="own_first_name" value={formData.own_first_name} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Middle Name</label>
            <input className="form-control" name="own_middle_name" value={formData.own_middle_name} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Last Name *</label>
            <input className="form-control" name="own_last_name" value={formData.own_last_name} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Login ID *</label>
            <input className="form-control" name="own_login_id" value={formData.own_login_id} onChange={handleChange} required disabled={isEdit} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" name="own_email" value={formData.own_email} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Mobile *</label>
            <input className="form-control" name="own_mobile_no" value={formData.own_mobile_no} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <input className="form-control" name="own_phone_no" value={formData.own_phone_no} onChange={handleChange} />
          </div>

          {!isEdit && (
            <>
              <div className="col-md-4">
                <label className="form-label">Password *</label>
                <input type="password" className="form-control" name="own_password" value={formData.own_password} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-control" name="own_confirm_password" value={formData.own_confirm_password} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="col-12">
            <label className="form-label">Address</label>
            <textarea className="form-control" rows="2" name="own_address" value={formData.own_address} onChange={handleChange} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Village</label>
            <input className="form-control" name="own_village" value={formData.own_village} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">City</label>
            <input className="form-control" name="own_city" value={formData.own_city} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">State</label>
            <input className="form-control" name="own_state" value={formData.own_state} onChange={handleChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Pincode</label>
            <input className="form-control" name="own_pincode" value={formData.own_pincode} onChange={handleChange} />
          </div>
        </div>
          </div>
        </div>

        <div className="card border-0 mb-3 bg-white user-details-card" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold text-brown mb-3">
                <i className="bi bi-layers me-2" />
                Subscription Plan
              </h5>
              <div className="row g-2 g-md-3 mb-3 align-items-end owner-subscription-date-row">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold mb-1">
                    Software Start Date
                  </label>
                  <AdminDateInput
                    value={ownStartDate}
                    onChange={(nextStart) => {
                      setOwnStartDate(nextStart);
                      if (selectedPlanUuid && nextStart) {
                        const plan = plans.find((p) => p.plan_uuid === selectedPlanUuid);
                        if (plan) setOwnExpiryDate(computeExpiryFromPlan(nextStart, plan));
                      }
                    }}
                    required
                  />
                  <div className="form-text">Format: DD/MM/YYYY</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold mb-1">
                    Software Expiry Date
                  </label>
                  <AdminDateInput
                    value={ownExpiryDate}
                    onChange={setOwnExpiryDate}
                  />
                  <div className="form-text">Format: DD/MM/YYYY</div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted small fw-bold mb-1">
                    Select Plan (optional)
                  </label>
                  <select
                    className="form-select"
                    value={selectedPlanUuid}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                  >
                    <option value="">Custom limits & modules</option>
                    {plans.map((plan) => (
                      <option key={plan.plan_uuid} value={plan.plan_uuid}>
                        {plan.plan_name} — ₹{plan.plan_offer_price ?? plan.plan_price} /{' '}
                        {plan.plan_billing_cycle}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    {isEdit
                      ? 'Change the plan to update limits and modules for this owner.'
                      : 'Choose a plan to auto-apply price limits and modules, or set custom below.'}
                  </div>
                </div>
              </div>

              {!isEdit && !selectedPlanUuid && (
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
              )}

              {!isEdit && !selectedPlanUuid && (
              <OwnerModulePermissionPanel
                catalog={moduleCatalog}
                modules={modules}
                saving={false}
                onSave={() => {}}
                onChange={setModules}
                hideSaveButton
              />
              )}

              {selectedPlanUuid && (
                <div className="alert alert-success py-2 small mb-0">
                  {isEdit
                    ? 'Selected plan will be applied when you update the owner.'
                    : 'Plan modules and limits will be applied automatically when the owner is created.'}
                </div>
              )}
            </div>
          </div>

        <div className="d-flex justify-content-end gap-2">
          <Link to="/admin/owners/grid" className="btn btn-light">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Owner' : 'Create Owner'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerFormPage;
