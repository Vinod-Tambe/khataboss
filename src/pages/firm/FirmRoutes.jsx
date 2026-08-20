import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddFirm from '../../components/firm/AddFirm';
import FirmList from '../../components/firm/FirmList';
import UpdateFirm from '../../components/firm/UpdateFirm';
import PermissionRoute from '../../routes/PermissionRoute';

const FirmRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="add" element={<PermissionRoute permission="firm.create"><AddFirm /></PermissionRoute>} />
        <Route path="list" element={<PermissionRoute permission="firm.view"><FirmList /></PermissionRoute>} />
        <Route path="edit/:uuid" element={<PermissionRoute permission="firm.edit"><UpdateFirm /></PermissionRoute>} />
      </Routes>
    </div>
  )
}

export default FirmRoutes
