import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { deletePlan, getPlans, updatePlanStatus } from '../api/planApi';
import PlanCoverImage from '../components/PlanCoverImage';
import { resolveImageUrl } from '../../utils/imageHelpers';

const formatPrice = (plan) => {
  const currency = plan.plan_currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : currency;
  const offer = plan.plan_offer_price;
  const price = plan.plan_price;
  if (offer != null && offer < price) {
    return { display: `${symbol}${offer}`, original: `${symbol}${price}`, hasOffer: true };
  }
  return { display: `${symbol}${price}`, original: null, hasOffer: false };
};

const PlanGridPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      setPlans(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((plan) => {
      const haystack = [
        plan.plan_name,
        plan.plan_code,
        plan.plan_description,
        plan.plan_billing_cycle,
        ...(plan.module_labels || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [plans, search]);

  const handleDelete = async (e, plan) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete plan "${plan.plan_name}"?`)) return;
    try {
      await deletePlan(plan.plan_uuid);
      toast.success('Plan deleted successfully.');
      loadPlans();
    } catch (error) {
      toast.error(error.message || 'Failed to delete plan');
    }
  };

  const handleToggleStatus = async (e, plan) => {
    e.preventDefault();
    e.stopPropagation();
    const next = plan.plan_status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updatePlanStatus(plan.plan_uuid, next);
      toast.success(`Plan marked ${next}.`);
      loadPlans();
    } catch (error) {
      toast.error(error.message || 'Failed to update plan status');
    }
  };

  return (
    <div className="card p-3 pt-2 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="admin-page-title mb-1">Subscription Plans</h2>
          <p className="text-muted mb-0 small">
            Create plan-wise offers for jewelry shop owners (modules, limits & pricing)
          </p>
        </div>
        <Link to="/admin/plans/new" className="btn btn-success">
          <i className="bi bi-plus-lg me-1" />
          Add Plan
        </Link>
      </div>

      <div className="row pt-1 pb-3 align-items-center">
        <div className="col-12 col-md-8">
          <div className="input-group">
            <input
              type="text"
              className="form-control border border-secondary"
              placeholder="Search plans by name, code, modules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text border border-secondary">
              <i className="bi bi-search" />
            </span>
          </div>
        </div>
      </div>

      {loading && <div className="text-center text-muted py-4">Loading plans...</div>}

      {!loading && filteredPlans.length === 0 && (
        <div className="text-center text-muted py-4">
          No plans found.{' '}
          <Link to="/admin/plans/new" className="text-success fw-bold">
            Create your first plan
          </Link>
        </div>
      )}

      <div className="row g-3">
        {filteredPlans.map((plan) => {
          const price = formatPrice(plan);
          const image = resolveImageUrl(plan.plan_image);
          const isActive = plan.plan_status === 'Active';
          const moduleCount = (plan.module_keys || []).length;

          return (
            <div
              key={plan.plan_uuid}
              className="col-12 col-md-6 col-xl-4"
              onClick={() => navigate(`/admin/plans/edit/${plan.plan_uuid}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card h-100 user-details-card plan-grid-card position-relative">
                {plan.plan_is_popular && (
                  <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 z-1">
                    Popular
                  </span>
                )}
                <div className="card-body p-3">
                  <div className="plan-grid-card__cover">
                    <PlanCoverImage preview={image} alt={plan.plan_name} size="grid" />
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <h5 className="fw-bold text-success mb-0">{plan.plan_name}</h5>
                    <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {plan.plan_status}
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    <code>{plan.plan_code}</code> · {plan.plan_billing_cycle}
                  </p>
                  <div className="mb-2">
                    <span className="fs-4 fw-bold text-brown">{price.display}</span>
                    {price.hasOffer && (
                      <span className="text-muted text-decoration-line-through ms-2 small">
                        {price.original}
                      </span>
                    )}
                  </div>
                  <p className="small text-muted mb-2" style={{ minHeight: 40 }}>
                    {plan.plan_description || 'No description'}
                  </p>
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <span className="badge bg-light text-dark border">
                      {plan.plan_max_firms} Firm(s)
                    </span>
                    <span className="badge bg-light text-dark border">
                      {plan.plan_max_staff} Staff
                    </span>
                    <span className="badge bg-light text-dark border">
                      {moduleCount} Module(s)
                    </span>
                    {plan.owner_count != null && (
                      <span className="badge bg-info-subtle text-dark border">
                        {plan.owner_count} Owner(s)
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {(plan.module_labels || []).slice(0, 4).map((label) => (
                      <span key={label} className="badge bg-success-subtle text-success-emphasis">
                        {label}
                      </span>
                    ))}
                    {(plan.module_labels || []).length > 4 && (
                      <span className="badge bg-secondary-subtle">
                        +{(plan.module_labels || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-footer d-flex gap-2 p-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/plans/edit/${plan.plan_uuid}`);
                    }}
                  >
                    <i className="bi bi-pencil-square me-1" />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => handleToggleStatus(e, plan)}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger ms-auto"
                    onClick={(e) => handleDelete(e, plan)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanGridPage;
