import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MainRoutes from './routes/MainRoutes';
import './css/lightcolor.css';
import './css/darkcolor.css';
import './css/systemcolor.css';
import './App.css';
import './css/Layout.css';
import './css/Common.css';
import './css/branddarkcolor.css';
import './css/fintechcolor.css';
import Authentication from './pages/authentication/Authentication';
import { ToastAlert } from './components/common/ToastAlert';
import ProtectedRoute from './routes/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import AdminRoutes from './admin/routes/AdminRoutes';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminProtectedRoute from './admin/routes/AdminProtectedRoute';

// Wrapper component to access Redux state
function AppContent() {
  const { isAuthenticated } = useSelector((state) => state.auth);


  return (
    <div className=''>
      <ToastAlert/>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminRoutes />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/"
          element={!isAuthenticated ? <Authentication /> : <Navigate to="/home" replace />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
