import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './components/layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Dashboard, Devices, Login } from './pages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/map" element={<div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Map view coming soon</div>} />
            <Route path="/analytics" element={<div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Analytics coming soon</div>} />
            <Route path="/settings" element={<div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Settings coming soon</div>} />
          </Route>

          {/* Fallback - redirect to dashboard (will be protected) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
