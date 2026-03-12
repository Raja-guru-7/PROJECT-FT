import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Explore from './pages/Explore';
import ItemDetail from './pages/ItemDetail';
import Handover from './pages/Handover';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import ProofOfCondition from './pages/ProofOfCondition';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SavedAssets from './pages/SavedAssets';
import ActivityLog from './pages/ActivityLog';
import AiAssistant from './components/AiAssistant';
import UserProfile from './pages/UserProfile';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const toggleRole = () => {
    setUserRole(prev => prev === 'RENTER' ? 'OWNER' : 'RENTER');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-[#F6F6F6]">
      {isAuthenticated && <Navbar userRole={userRole} onToggleRole={toggleRole} onLogout={handleLogout} />}
      <main className="flex-1 relative pb-28">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/explore" replace /> : <Landing onLogin={() => navigate('/login')} />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/explore" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/explore" replace /> : <Signup />}
          />
          <Route
            path="/verify-otp"
            element={isAuthenticated ? <Navigate to="/explore" replace /> : <VerifyOTP />}
          />

          {/* Protected Routes */}
          <Route
            path="/explore"
            element={isAuthenticated ? <Explore /> : <Navigate to="/" replace />}
          />
          <Route
            path="/item/:id"
            element={isAuthenticated ? <ItemDetail /> : <Navigate to="/" replace />}
          />
          <Route
            path="/handover/:txId"
            element={isAuthenticated ? <Handover /> : <Navigate to="/" replace />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard role={userRole} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/add"
            element={isAuthenticated ? <AddItem /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />}
          />
          <Route
            path="/saved"
            element={isAuthenticated ? <SavedAssets /> : <Navigate to="/" replace />}
          />
          <Route
            path="/activity"
            element={isAuthenticated ? <ActivityLog /> : <Navigate to="/" replace />}
          />
          <Route
            path="/proof"
            element={isAuthenticated ? <ProofOfCondition /> : <Navigate to="/" replace />}
          />
          <Route
            path="/user/:userId"
            element={isAuthenticated ? <UserProfile /> : <Navigate to="/" replace />}
          />

          {/* Catch-all — ALWAYS LAST */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isAuthenticated && <AiAssistant />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
