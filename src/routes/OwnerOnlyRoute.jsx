import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isOwner } from '../utils/permissions';

const OwnerOnlyRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  if (!isOwner(user)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default OwnerOnlyRoute;
