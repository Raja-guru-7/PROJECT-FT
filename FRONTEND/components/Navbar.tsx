import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Settings, Heart, History, LogOut, UserCircle, Repeat
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import GooeyNav from './GooeyNav';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try { const user = await api.getCurrentUser(); setCurrentUser(user); } catch { }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 10);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    api.logout();
    onLogout();
    navigate('/');
  };

  const handleMenuAction = (path: string) => {
    setIsProfileOpen(false);
    if (path === '/switch') { onToggleRole(); } else { navigate(path); }
  };

  // ✅ Image Logic Changed Here to fix the random "boy" avatar issue
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=0f172a&color=fff&size=128&bold=true`;
  let avatarUrl = (currentUser as any)?.avatar || (currentUser as any)?.picture || (currentUser as any)?.profilePhoto || fallbackAvatar;
  
  // If the backend forces the annoying dicebear face, override it with normal name initials!
  if (avatarUrl && avatarUrl.includes('dicebear')) {
    avatarUrl = fallbackAvatar;
  }

  const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: '+ List Item', href: '/add' },
  ];

  const activeNavIndex =
    isActive('/explore') || location.pathname.startsWith('/item') ? 0
      : isActive('/dashboard') ? 1
        : isActive('/add') ? 2
          : 0;

  function isActive(path: string) {
    return location.pathname.startsWith(path);
  }

  return (
    <>
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[2000] bg-slate-900/30"
            onClick={() => setIsProfileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <div className={`w-[calc(100%-2rem)] mx-auto mt-4 h-16 rounded-full sticky top-4 z-[2500] transition-all duration-300 bg-white border border-slate-100 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="w-full px-4 md:px-6 h-full flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
              <ShieldCheck className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">AroundU</span>
          </Link>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800">{currentUser ? currentUser.name : '...'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userRole} MODE</span>
            </div>

            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="relative hover:scale-105 transition-transform">
              <img
                src={avatarUrl} alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 bg-slate-100"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar; }}
              />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            </button>

            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-64 p-2 z-[100] bg-white rounded-2xl shadow-xl border border-slate-100">
                <div className="p-3 mb-1 flex items-center gap-3 border-b border-slate-50">
                  <img src={avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover bg-slate-100" onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackAvatar; }} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{currentUser?.name || 'Loading...'}</p>
                    <p className="text-xs font-medium text-slate-500">{currentUser?.trustScore || 30} Trust Score</p>
                  </div>
                </div>
                <div className="space-y-1 mt-1">
                  <ProfileMenuItem icon={<UserCircle size={16} />} label="My Profile" onClick={() => handleMenuAction('/profile')} />
                  <ProfileMenuItem icon={<Heart size={16} />} label="Saved Assets" onClick={() => handleMenuAction('/saved')} />
                  <ProfileMenuItem icon={<History size={16} />} label="Activity Log" onClick={() => handleMenuAction('/activity')} />
                  <ProfileMenuItem icon={<Settings size={16} />} label="Settings" onClick={() => handleMenuAction('/settings')} />
                  <div className="h-px my-1 bg-slate-100" />
                  <ProfileMenuItem icon={<Repeat size={16} />} label="Switch Mode" onClick={() => handleMenuAction('/switch')} subLabel={userRole === 'RENTER' ? 'to Owner' : 'to Renter'} />
                  <ProfileMenuItem icon={<LogOut size={16} />} label="Log Out" variant="danger" onClick={handleLogout} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2500]">
        <GooeyNav
          items={navItems}
          initialActiveIndex={activeNavIndex}
        />
      </div>
    </>
  );
};

const ProfileMenuItem = ({ icon, label, variant = 'default', onClick, subLabel }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${variant === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-50 hover:text-black'}`}
  >
    <div className="flex items-center gap-3">{icon} {label}</div>
    {subLabel && <span className="text-xs text-slate-400">{subLabel}</span>}
  </button>
);

export default Navbar;