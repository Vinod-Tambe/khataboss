import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  createPlan,
  getPlanByUuid,
  getPlanModuleCatalog,
  updatePlan,
} from '../api/planApi';
import OwnerModulePermissionPanel from '../components/OwnerModulePermissionPanel';
import PlanCoverImage from '../components/PlanCoverImage';
import { resolveImageUrl } from '../../utils/imageHelpers';

const emptyForm = {
  plan_name: '',
  plan_code: '',
  plan_description: '',
  plan_price: '',
  plan_offer_price: '',
  plan_currency: 'INR',
  plan_billing_cycle: 'Yearly',
  plan_duration_days: '',
  plan_max_firms: '1',
  plan_max_staff: '10',
  plan_is_popular: false,
  plan_sort_order: '0',
  plan_status: 'Active',
  plan_features: '',
};

const buildEmptyModuleMap = (catalog = []) => {
  const map = {};
  for (const item of catalog) map[item.module_key] = false;
  return map;
};

const mergeModuleMap = (base = {}, incoming = {}) => {
  const next = { ...base };
  for (const key of Object.keys(next)) {
    if (incoming[key] !== undefined) next[key] = !!incoming[key];
  }
  return next;
};

const PlanFormPage = () => {
  const { uuid } = useParams();
  const isEdit = Boolean(uuid);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [modules, setModules] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await getPlanModuleCatalog();
        const catalog = res.data || [];
        setModuleCatalog(catalog);
        if (!isEdit) setModules(buildEmptyModuleMap(catalog));
      } catch (error) {
        toast.error(error.message || 'Failed to load module catalog');
      }
    };
    loadCatalog();
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    const loadPlan = async () => {
      try {
        setFetching(true);
        const res = await getPlanByUuid(uuid);
        const plan = res.data;
        if (!plan) {
          toast.error('Plan not found');
          navigate('/admin/plans/grid');
          return;
        }
        setFormData({
          plan_name: plan.plan_name || '',
          plan_code: plan.plan_code || '',
          plan_description: plan.plan_description || '',
          plan_price: plan.plan_price != null ? String(plan.plan_price) : '',
          plan_offer_price:
            plan.plan_offer_price != null ? String(plan.plan_offer_price) : '',
          plan_currency: plan.plan_currency || 'INR',
          plan_billing_cycle: plan.plan_billing_cycle || 'Yearly',
          plan_duration_days:
            plan.plan_duration_days != null ? String(plan.plan_duration_days) : '',
          plan_max_firms: plan.plan_max_firms != null ? String(plan.plan_max_firms) : '1',
          plan_max_staff: plan.plan_max_staff != null ? String(plan.plan_max_staff) : '10',
          plan_is_popular: !!plan.plan_is_popular,
          plan_sort_order: plan.plan_sort_order != null ? String(plan.plan_sort_order) : '0',
          plan_status: plan.plan_status || 'Active',
          plan_features: Array.isArray(plan.plan_features)
            ? plan.plan_features.join('\n')
            : '',
        });
        const catalogRes = await getPlanModuleCatalog();
        const catalog = catalogRes.data || [];
        setModuleCatalog(catalog);
        setModules(mergeModuleMap(buildEmptyModuleMap(catalog), plan.modules || {}));
        setImagePreview(resolveImageUrl(plan.plan_image));
      } catch (error) {
        toast.error(error.message || 'Failed to load plan');
        navigate('/admin/plans/grid');
      } finally {
        setFetching(false);
      }
    };
    loadPlan();
  }, [isEdit, uuid, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plan_name.trim()) {
      toast.error('Plan name is required.');
      return;
    }
    if (!formData.plan_price) {
      toast.error('Plan price is required.');
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'plan_is_popular') {
        payload.append(key, value ? 'true' : 'false');
      } else if (value !== '' && value != null) {
        payload.append(key, value);
      }
    });
    payload.append('plan_modules', JSON.stringify(modules));
    if (imageFile) payload.append('plan_image', imageFile);

    try {
      setLoading(true);
      if (isEdit) {
        await updatePlan(uuid, payload);
        toast.success('Plan updated successfully.');
      } else {
        await createPlan(payload);
        toast.success('Plan created successfully.');
      }
      navigate('/admin/plans/grid');
    } catch (error) {
      toast.error(error.message || 'Failed to save plan');
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
          <h2 className="admin-page-title mb-1">{isEdit ? 'Edit Plan' : 'Create Plan'}</h2>
          <p className="text-muted mb-0">
            Define pricing, limits, and modules for jewelry shop owners
          </p>
        </div>
        <Link to="/admin/plans/grid" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          Back to Plans
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card border-0 mb-3 bg-white user-details-card" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3 p-md-4">
            <h5 className="fw-bold text-brown mb-3">
              <i className="bi bi-tag-fill me-2" />
              Plan Details
            </h5>
            <div className="row g-3 align-items-start">
              <div className="col-md-4 col-lg-3">
                <label className="form-label d-block">Plan Cover Image</label>
                <PlanCoverImage
                  preview={imagePreview}
                  editable
                  size="form"
                  alt={formData.plan_name || 'Plan cover'}
                  onFile={handleImageFile}
                  onRemove={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                />
              </div>
              <div className="col-md-8 col-lg-9">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Plan Name *</label>
                    <input
                      className="form-control"
                      name="plan_name"
                      value={formData.plan_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Plan Code</label>
                    <input
                      className="form-control"
                      name="plan_code"
                      value={formData.plan_code}
                      onChange={handleChange}
                      placeholder="AUTO from name if empty"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="plan_description"
                      value={formData.plan_description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      name="plan_price"
                      value={formData.plan_price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Offer Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      name="plan_offer_price"
                      value={formData.plan_offer_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Billing Cycle</label>
                    <select
                      className="form-select"
                      name="plan_billing_cycle"
                      value={formData.plan_billing_cycle}
                      onChange={handleChange}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="Lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-3 col-lg-2">
                <label className="form-label">Max Firms</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  name="plan_max_firms"
                  value={formData.plan_max_firms}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3 col-lg-2">
                <label className="form-label">Max Staff</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  name="plan_max_staff"
                  value={formData.plan_max_staff}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3 col-lg-2">
                <label className="form-label">Duration (days)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  name="plan_duration_days"
                  value={formData.plan_duration_days}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="col-md-3 col-lg-2">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-control"
                  name="plan_sort_order"
                  value={formData.plan_sort_order}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4 col-lg-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  name="plan_status"
                  value={formData.plan_status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-4 col-lg-2 d-flex align-items-end">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="plan_is_popular"
                    name="plan_is_popular"
                    checked={formData.plan_is_popular}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="plan_is_popular">
                    Mark as Popular
                  </label>
                </div>
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-12">
                <label className="form-label">Plan Features (one per line)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="plan_features"
                  value={formData.plan_features}
                  onChange={handleChange}
                  placeholder="Unlimited loan entries&#10;WhatsApp messaging&#10;Priority support"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 mb-3 bg-white user-details-card" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3 p-md-4">
            <OwnerModulePermissionPanel
              catalog={moduleCatalog}
              modules={modules}
              saving={false}
              onSave={() => {}}
              onChange={setModules}
              hideSaveButton
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <Link to="/admin/plans/grid" className="btn btn-light">Cancel</Link>
          <button type="submit" className="btn btn-success px-4" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanFormPage;
