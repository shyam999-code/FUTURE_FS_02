import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <i className="ph ph-spinner-gap animate-spin text-3xl text-indigo-600"></i>
    </div>
  );

  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public homepage with lead capture form + admin login modal */}
          <Route path="/" element={<HomePage />} />

          {/* Protected CRM routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
