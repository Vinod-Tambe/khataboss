import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { fetchAdminProfile, updateAdminProfile } from '../../store/slices/adminAuthSlice';
import { clearBrandingCache } from '../../api/brandingApi';
import { validateMobile, validatePhone } from '../../utils/validation';
import { getPasswordRuleChecks } from '../../utils/passwordValidation';
import PasswordRequirementsPanel from '../../components/common/PasswordRequirementsPanel';

const AdminProfilePage = () => {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector((state) => state.adminAuth);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    admin_first_name: '',
    admin_middle_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_login_id: '',
    admin_mobile_no: '',
    admin_phone_no: '',
    admin_company_name: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const fillForm = (profile) => {
    if (!profile) return;
    setFormData((prev) => ({
      ...prev,
      admin_first_name: profile.admin_first_name || '',
      admin_middle_name: profile.admin_middle_name || '',
      admin_last_name: profile.admin_last_name || '',
      admin_email: profile.admin_email || '',
      admin_login_id: profile.admin_login_id || '',
      admin_mobile_no: profile.admin_mobile_no || '',
      admin_phone_no: profile.admin_phone_no || '',
      admin_company_name: profile.admin_company_name || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    }));
  };

  const passwordRules = useMemo(
    () =>
      getPasswordRuleChecks(formData.new_password, {
        oldPassword: formData.current_password,
      }),
    [formData.new_password, formData.current_password]
  );

  const isChangingPassword = Boolean(
    formData.current_password || formData.new_password || formData.confirm_password
  );

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchAdminProfile()).unwrap();
      } catch (err) {
        fillForm(user);
        toast.error(err || 'Failed to load profile');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fillForm(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.admin_first_name.trim() || !formData.admin_last_name.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (!formData.admin_company_name.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!formData.admin_login_id.trim()) {
      toast.error('Login ID is required');
      return;
    }

    if (formData.admin_mobile_no && !validateMobile(formData.admin_mobile_no)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }

    if (formData.admin_phone_no && !validatePhone(formData.admin_phone_no)) {
      toast.error('Enter a valid phone number');
      return;
    }

    if (isChangingPassword) {
      if (!formData.current_password) {
        toast.error('Enter your current password to change password');
        return;
      }
      if (!formData.new_password) {
        toast.error('Enter a new password');
        return;
      }
      if (!passwordRules.isValid) {
        toast.error(passwordRules.message);
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        toast.error('New password and confirm password do not match');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        admin_first_name: formData.admin_first_name.trim(),
        admin_middle_name: formData.admin_middle_name.trim(),
        admin_last_name: formData.admin_last_name.trim(),
        admin_login_id: formData.admin_login_id.trim(),
        admin_mobile_no: formData.admin_mobile_no.trim(),
        admin_phone_no: formData.admin_phone_no.trim(),
        admin_company_name: formData.admin_company_name.trim(),
      };

      if (isChangingPassword) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
        payload.confirm_password = formData.confirm_password;
      }

      await dispatch(updateAdminProfile(payload)).unwrap();
      clearBrandingCache();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && !user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-brown mb-1">My Profile</h4>
        <p className="text-muted mb-0">
          Update your details, login ID, password, and company name. The company name appears in the app footer and announcements.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="admin_first_name"
                  className="form-control"
                  value={formData.admin_first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  name="admin_middle_name"
                  className="form-control"
                  value={formData.admin_middle_name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="admin_last_name"
                  className="form-control"
                  value={formData.admin_last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="admin_company_name"
                  className="form-control"
                  value={formData.admin_company_name}
                  onChange={handleChange}
                  placeholder="e.g. KhataBoss"
                  required
                />
                <div className="form-text">
                  Shown in the footer and as the publisher name on announcements.
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label">Login ID <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="admin_login_id"
                  className="form-control"
                  value={formData.admin_login_id}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.admin_email}
                  disabled
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Mobile</label>
                <input
                  type="text"
                  name="admin_mobile_no"
                  className="form-control"
                  value={formData.admin_mobile_no}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="admin_phone_no"
                  className="form-control"
                  value={formData.admin_phone_no}
                  onChange={handleChange}
                  maxLength={12}
                />
              </div>
            </div>

            <hr className="my-4" />

            <h6 className="fw-bold text-brown mb-3">Change Password</h6>
            <p className="text-muted small mb-3">
              Leave blank to keep your current password. To change it, enter your current password and a new one.
            </p>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Current Password</label>
                <div className="input-group">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    className="form-control"
                    value={formData.current_password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                    aria-label={showPassword.current ? 'Hide current password' : 'Show current password'}
                  >
                    <i className={`bi ${showPassword.current ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword.next ? 'text' : 'password'}
                    name="new_password"
                    className="form-control"
                    value={formData.new_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => ({ ...prev, next: !prev.next }))}
                    aria-label={showPassword.next ? 'Hide new password' : 'Show new password'}
                  >
                    <i className={`bi ${showPassword.next ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    className="form-control"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    aria-label={showPassword.confirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <i className={`bi ${showPassword.confirm ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>
              {formData.new_password ? (
                <div className="col-12">
                  <PasswordRequirementsPanel checks={passwordRules.checks} />
                </div>
              ) : null}
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
