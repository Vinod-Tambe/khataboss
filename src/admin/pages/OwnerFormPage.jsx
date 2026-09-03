import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createOwner, getOwnerByUuid, updateOwner } from '../api/ownerApi';

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

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        payload.append(key, value);
      }
    });

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

      <form className="admin-panel" onSubmit={handleSubmit}>
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

        <div className="d-flex justify-content-end gap-2 mt-4">
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
