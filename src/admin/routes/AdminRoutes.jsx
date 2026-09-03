import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import OwnerListPage from '../pages/OwnerListPage';
import OwnerGridPage from '../pages/OwnerGridPage';
import OwnerDetailsPage from '../pages/OwnerDetailsPage';
import OwnerFormPage from '../pages/OwnerFormPage';

const AdminRoutes = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="owners" element={<Navigate to="grid" replace />} />
      <Route path="owners/grid" element={<OwnerGridPage />} />
      <Route path="owners/list" element={<OwnerListPage />} />
      <Route path="owners/new" element={<OwnerFormPage />} />
      <Route path="owners/details/:uuid" element={<OwnerDetailsPage />} />
      <Route path="owners/:uuid/edit" element={<OwnerFormPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);

export default AdminRoutes;
