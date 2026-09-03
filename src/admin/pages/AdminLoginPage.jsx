import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../store/slices/adminAuthSlice';
import { showToast } from '../../components/common/ToastAlert';
import AppBrandLogo from '../../components/common/AppBrandLogo';
import '../css/Admin.css';

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loginLoading } = useSelector((state) => state.adminAuth);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginAdmin({ login_id: loginId, password })).unwrap();
      showToast('Admin login successful.', 'success');
    } catch (error) {
      showToast(error || 'Login failed.', 'danger');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <AppBrandLogo size={42} />
            <h1 className="admin-login-title mb-0">KhataBoss</h1>
          </div>
          <p className="admin-login-subtitle mb-0">Super Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Login ID / Email</label>
            <input
              type="text"
              className="form-control admin-input"
              placeholder="Enter admin login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 position-relative">
            <label className="form-label fw-semibold">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control admin-input pe-5"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-sm position-absolute end-0 me-2"
              style={{ top: '38px' }}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold admin-login-btn" disabled={loginLoading}>
            {loginLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in...
              </>
            ) : (
              'Sign in to Admin'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="admin-back-link">
            <i className="bi bi-arrow-left me-1" />
            Back to Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
