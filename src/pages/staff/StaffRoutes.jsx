import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddStaff from '../../components/staff/AddStaff';
import StaffGrid from '../../components/staff/StaffGrid';
import StaffDetails from '../../components/staff/StaffDetails';

const StaffRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/add" element={< AddStaff />} />
        <Route path="/grid" element={< StaffGrid />} />
        <Route path="/staff-details/:id" element={< StaffDetails />} />
      </Routes>
    </div>
  )
}

export default StaffRoutes