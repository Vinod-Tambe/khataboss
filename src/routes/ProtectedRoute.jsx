import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '../store/slices/authSlice';

/**
 * Authenticated routes wrapper.
 * Renders immediately from cached session, then refreshes
 * permissions in the background (no long blocking loader).
 */
const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || fetchedRef.current) return;
    fetchedRef.current = true;
    dispatch(fetchCurrentUser());
  }, [dispatch, isAuthenticated, token]);

  if (!isAuthenticated || !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Cached user may be missing on rare first paint — keep a tiny fallback only then
  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
