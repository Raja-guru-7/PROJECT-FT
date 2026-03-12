import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  Search, 
  Settings, 
  Heart, 
  History, 
  LogOut, 
  UserCircle,
  Repeat
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface NavbarProps {
  userRole: 'RENTER' | 'OWNER';
  onToggleRole: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onToggleRole, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Fetch real user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch {
        console.error('Failed to fetch user');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    api.logout();
    onLogout();
    navigate('/');
  };

  const handleMenuAction = (path: string) => {
    setIsProfileOpen(false);
    if (path === '/switch') {
      onToggleRole();
    } else {
      navigate(path);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${currentUser?.name || 'U'}&background=093E28&color=fff&size=128&bold=true`;

  return (
    <>
      <div className="w-full h-16 sm:h-20 lg:h-24 sticky top-0 z-[1001] bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-2 sm:gap-3 group">
            <div className="bg-[#093E28] p-2 rounded-xl group-hover:scale-105 transition-transform">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tighter">
              AroundU
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6 relative" ref={dropdownRef}>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900">
                {currentUser ? getInitials(currentUser.name) : '...'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userRole} MODE</span>
            </div>
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative group transition-all"
            >
              <div className="relative">
                <img 
                  src={avatarUrl}
                  alt="Profile" 
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-transparent group-hover:border-[#093E28]/20 transition-all"
                />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-12 sm:top-16 lg:top-20 right-0 w-64 sm:w-72 bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl p-2 sm:p-3 animate-in fade-in slide-in-from-top-4 duration-200 z-[2001]">
                <div className="p-4 mb-2 border-b border-gray-50 flex items-center gap-3">
                  <img src={avatarUrl} alt="Profile" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                  <div>
                    <p className="text-sm sm:text-base font-black text-slate-800">{currentUser?.name || 'Loading...'}</p>
                    <p className="text-xs sm:text-sm font-bold text-green-600">{currentUser?.trustScore || 30} Trust Score</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <ProfileMenuItem icon={<UserCircle size={16} className="sm:size-18" />} label="My Profile" onClick={() => handleMenuAction('/profile')} />
                  <ProfileMenuItem icon={<Heart size={16} className="sm:size-18" />} label="Saved Assets" onClick={() => handleMenuAction('/saved')} />
                  <ProfileMenuItem icon={<History size={16} className="sm:size-18" />} label="Activity Log" onClick={() => handleMenuAction('/activity')} />
                  <ProfileMenuItem icon={<Settings size={16} className="sm:size-18" />} label="Settings" onClick={() => handleMenuAction('/settings')} />
                  <div className="h-px bg-gray-50 my-2" />
                  <ProfileMenuItem icon={<Repeat size={16} className="sm:size-18" />} label="Switch Mode" onClick={() => handleMenuAction('/switch')} subLabel={userRole === 'RENTER' ? 'to Owner' : 'to Renter'} />
                  <ProfileMenuItem icon={<LogOut size={16} className="sm:size-18" />} label="Log Out" variant="danger" onClick={handleLogout} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-[1002] px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded-full flex items-center gap-1.5 sm:gap-2 shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100 whitespace-nowrap animate-in slide-in-from-bottom-8 duration-500">
        <NavLink to="/explore" icon={<Search size={16} className="sm:size-18" />} label="Explore" active={isActive('/explore') || location.pathname.startsWith('/item')} />
        <NavLink to="/dashboard" icon={<LayoutDashboard size={16} className="sm:size-18" />} label="Dashboard" active={isActive('/dashboard')} />
        <div className="w-px h-6 bg-gray-100 mx-1" />
        <Link to="/add" className="flex items-center gap-1.5 sm:gap-2 bg-[#093E28] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:opacity-90 transition-all font-bold text-xs sm:text-sm shadow-lg active:scale-95 group">
          <PlusCircle size={16} className="sm:size-18" /> 
          <span>List Item</span>
        </Link>
      </div>
    </>
  );
};

const ProfileMenuItem = ({ icon, label, variant = 'default', onClick, subLabel }: { icon: React.ReactNode, label: string, variant?: 'default' | 'danger', onClick?: () => void, subLabel?: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    {subLabel && <span className="text-xs text-slate-400">{subLabel}</span>}
  </button>
);

const NavLink = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${active ? 'text-slate-900 bg-gray-100' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-50'}`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
);

export default Navbar;
