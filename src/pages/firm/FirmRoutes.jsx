import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddFirm from '../../components/firm/AddFirm';
import FirmList from '../../components/firm/FirmList';
import UpdateFirm from '../../components/firm/UpdateFirm';

const FirmRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="add" element={< AddFirm />} />
        <Route path="list" element={< FirmList />} />
        <Route path="edit/:uuid" element={< UpdateFirm />} />
      </Routes>
    </div>
  )
}

export default FirmRoutes
