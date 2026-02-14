import { Routes, Route, Navigate } from 'react-router-dom';
import MainRoutes from './routes/MainRoutes';
import './App.css';
import './css/Layout.css';
import './css/Common.css';
import Authentication from './pages/authentication/Authentication';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastAlert } from './components/common/ToastAlert';

// Wrapper component to access AuthContext
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      <ToastAlert/>
      <Routes>
        <Route 
          path="/*" 
          element={user ? <MainRoutes /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={!user ? <Authentication /> : <Navigate to="/home" replace />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
