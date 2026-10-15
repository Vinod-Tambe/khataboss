import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AddStaff from '../../components/staff/AddStaff';
import StaffGrid from '../../components/staff/StaffGrid';
import StaffDetails from '../../components/staff/StaffDetails';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';
import PermissionRoute from '../../routes/PermissionRoute';
import OwnerLimitRoute from '../../routes/OwnerLimitRoute';

const StaffRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Routes {...nestedRoutesProps(location)}>
        <Route
          path="add"
          element={
            <PermissionRoute permission="staff.create">
              <OwnerLimitRoute resource="staff" redirectTo="/staff/grid">
                <AddStaff />
              </OwnerLimitRoute>
            </PermissionRoute>
          }
        />
        <Route path="grid" element={<StaffGrid />} />
        <Route path="staff-details/:id" element={<StaffDetails />} />
        <Route path="*" element={<Navigate to="/staff/grid" replace />} />
      </Routes>
    </div>
  );
};

export default StaffRoutes;
