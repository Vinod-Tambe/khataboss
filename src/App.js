import { Routes, Route } from 'react-router-dom';
import MainRoutes from './routes/MainRoutes';
import AdminRoutes from './routes/AdminRoutes';
import './App.css';
import './css/Layout.css';
import './css/Common.css';

function App() {
   const isLoggedIn = useSelector((state) => state.auth.isAuthenticated); 
  return (
    <div className=''>
      <Routes>
        <Route path="/*" element={isLoggedIn ? <MainRoutes /> : <Authentication />} />
      </Routes>
    </div>
  );
}

export default App;
