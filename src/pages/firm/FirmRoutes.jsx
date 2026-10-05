import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import AddFirm from '../../components/firm/AddFirm';
import FirmList from '../../components/firm/FirmList';
import UpdateFirm from '../../components/firm/UpdateFirm';
import PermissionRoute from '../../routes/PermissionRoute';
import { nestedRoutesProps } from '../../utils/moduleRouteUtils';

const FirmRoutes = () => {
  const location = useLocation();

  return (
    <div>
      <Routes {...nestedRoutesProps(location)}>
        <Route path="add" element={<PermissionRoute permission="firm.create"><AddFirm /></PermissionRoute>} />
        <Route path="list" element={<PermissionRoute permission="firm.view"><FirmList /></PermissionRoute>} />
        <Route path="edit/:uuid" element={<PermissionRoute permission="firm.edit"><UpdateFirm /></PermissionRoute>} />
        <Route path="*" element={<Navigate to="/firm/list" replace />} />
      </Routes>
    </div>
  );
};

export default FirmRoutes;
