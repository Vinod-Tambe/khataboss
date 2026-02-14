import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddStaff from '../../components/staff/AddStaff';
import StaffGrid from '../../components/staff/StaffGrid';

const StaffRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/add" element={< AddStaff />} />
        <Route path="/grid" element={< StaffGrid />} />
      </Routes>
    </div>
  )
}

export default StaffRoutes
