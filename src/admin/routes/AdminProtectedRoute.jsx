import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProfile } from '../../store/slices/adminAuthSlice';

const AdminProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.adminAuth);
  const location = useLocation();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || fetchedRef.current) return;
    fetchedRef.current = true;
    dispatch(fetchAdminProfile());
  }, [dispatch, isAuthenticated, token]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
        <div className="spinner-border spinner-border-sm text-primary" role="status" />
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;
