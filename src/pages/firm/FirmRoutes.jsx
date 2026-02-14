import React from 'react'
import { Routes, Route } from 'react-router-dom';
import AddFirm from '../../components/firm/AddFirm';
import FirmList from '../../components/firm/FirmList';

const FirmRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="add" element={< AddFirm />} />
        <Route path="list" element={< FirmList />} />
      </Routes>
    </div>
  )
}

export default FirmRoutes
