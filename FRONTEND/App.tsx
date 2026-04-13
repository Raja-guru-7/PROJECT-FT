import React, { useState, useEffect } from 'react';
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
import ReturnHandover from './pages/ReturnHandover';
import KYC from './src/pages/KYC';
import TrustScore from './src/pages/TrustScore';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'RENTER' | 'OWNER'>(() => {
    const savedMode = localStorage.getItem('userMode');
    return (savedMode as 'RENTER' | 'OWNER') || 'RENTER';
  });

  useEffect(() => {
    localStorage.setItem('userMode', userRole);
  }, [userRole]);

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          if (userData) {
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Invalid token:', err);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);
  const toggleRole = () => setUserRole(prev => prev === 'RENTER' ? 'OWNER' : 'RENTER');

  const isLandingPage = location.pathname === '/';

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-300 ${isLandingPage ? 'bg-black text-white' : 'bg-[#F5F5F7]'}`}>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-sm">Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {isAuthenticated && (
            <Navbar userRole={userRole} onToggleRole={toggleRole} onLogout={handleLogout} />
          )}

          {/* 
            MOBILE FIX: pb-20 on mobile (bottom nav height) + pb-28 on md+ screens
            Safe area inset handles iPhone home bar notch
          */}
          <main className={`flex-1 w-full max-w-full overflow-x-hidden ${isLandingPage ? '' : 'pb-20 md:pb-28 safe-bottom'}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/explore" replace /> : <Landing onLogin={() => navigate('/login')} />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/explore" replace /> : <Login onLogin={handleLogin} />} />
              <Route path="/kyc" element={<KYC />} />
              <Route path="/signup" element={isAuthenticated ? <Navigate to="/explore" replace /> : <Signup />} />
              <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/explore" replace /> : <VerifyOTP />} />

              {/* Protected Routes */}
              <Route path="/explore" element={isAuthenticated ? <Explore /> : <Navigate to="/" replace />} />
              <Route path="/item/:id" element={isAuthenticated ? <ItemDetail /> : <Navigate to="/" replace />} />
              <Route path="/handover/:txId" element={isAuthenticated ? <Handover /> : <Navigate to="/" replace />} />
              <Route path="/handover/scan/:txId" element={isAuthenticated ? <Handover /> : <Navigate to="/" replace />} />
              <Route path="/handover/verify/:txId" element={isAuthenticated ? <Handover /> : <Navigate to="/" replace />} />
              <Route path="/dashboard" element={isAuthenticated ? <Dashboard role={userRole} /> : <Navigate to="/" replace />} />
              <Route path="/add" element={isAuthenticated ? <AddItem /> : <Navigate to="/" replace />} />
              <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />} />
              <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} />
              <Route path="/saved" element={isAuthenticated ? <SavedAssets /> : <Navigate to="/" replace />} />
              <Route path="/activity" element={isAuthenticated ? <ActivityLog /> : <Navigate to="/" replace />} />
              <Route path="/trust" element={isAuthenticated ? <TrustScore /> : <Navigate to="/" replace />} />
              <Route path="/proof" element={isAuthenticated ? <ProofOfCondition /> : <Navigate to="/" replace />} />
              <Route path="/user/:userId" element={isAuthenticated ? <UserProfile /> : <Navigate to="/" replace />} />
              <Route path="/return-handover/:txId" element={isAuthenticated ? <ReturnHandover /> : <Navigate to="/" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {isAuthenticated && (
            <AiAssistant />
          )}
        </>
      )}
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