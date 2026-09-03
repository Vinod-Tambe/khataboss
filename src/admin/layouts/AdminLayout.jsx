import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const AdminLayout = () => (
  <div className="layout-wrapper">
    <AdminHeader />
    <div className="main-content">
      <AdminSidebar />
      <main
        className="content-area mt-0 mt-md-3 d-flex flex-column"
        style={{ minHeight: 'calc(100vh - 56px)' }}
      >
        <div className="container-fluid flex-grow-1 pb-3 pb-md-4">
          <Outlet />
        </div>
        <AdminFooter />
      </main>
    </div>
  </div>
);

export default AdminLayout;
