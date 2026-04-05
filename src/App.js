import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MainRoutes from './routes/MainRoutes';
import './App.css';
import './css/Layout.css';
import './css/Common.css';
import Authentication from './pages/authentication/Authentication';
import { ToastAlert } from './components/common/ToastAlert';
import ProtectedRoute from './routes/ProtectedRoute';

// Wrapper component to access Redux state
function AppContent() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);


  return (
    <div className=''>
      <ToastAlert/>
      <Routes>
        {/* Protected routes wrapped in ProtectedRoute */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <MainRoutes />
            </ProtectedRoute>
          } 
        />
        {/* Public route - Login page */}
        <Route 
          path="/" 
          element={!isAuthenticated ? <Authentication /> : <Navigate to="/home" replace />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
