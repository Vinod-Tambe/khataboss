import React from 'react'
import { Routes, Route } from 'react-router-dom';
import BookList from '../../components/book/BookList';

const BookRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/*" element={< BookList />} />
      </Routes>
    </div>
  )
}

export default BookRoutes
