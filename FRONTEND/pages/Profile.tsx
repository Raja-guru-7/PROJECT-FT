import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, ArrowRight, Loader2, CreditCard, X, Camera, Smartphone, Edit2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { User, Transaction } from '../types';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '2rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [avatarFileBase64, setAvatarFileBase64] = useState<string | null>(null);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [livenessStep, setLivenessStep] = useState<'idle' | 'scanning' | 'complete'>('idle');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

        // 1. User Data Fetch
        const userData = await api.getCurrentUser();
        setUser(userData);

        const userId = localStorage.getItem('userId') || (userData as any)?._id || (userData as any)?.id || '';

        // 2. BULLETPROOF TRANSACTIONS FETCH
        // Mudal la original method try pannuvom (From your first code)
        let txRes = await fetch(`${API_URL}/api/transactions/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Oruvela antha route illana, namma default route-kku poguvom
        if (!txRes.ok) {
          txRes = await fetch(`${API_URL}/api/transaction/my`, {
            headers: { 'x-auth-token': token }
          });
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          // Data array-va irukka nu check panni set pandrom
          if (Array.isArray(txData)) {
            setTransactions(txData);
          } else if (txData.transactions && Array.isArray(txData.transactions)) {
            setTransactions(txData.transactions);
          } else if (txData.data && Array.isArray(txData.data)) {
            setTransactions(txData.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => { if (user?.name && !isEditingName) setNameDraft(user.name); }, [user, isEditingName]);

  const handleSaveProfile = async (newName: string, newAvatarBase64: string | null) => {
    setSavingName(true);
    const token = localStorage.getItem('token');
    if (!token) { alert('Authentication required'); setSavingName(false); return; }
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

      let finalAvatar = newAvatarBase64;
      if (!finalAvatar) {
        finalAvatar = user?.avatar || '';
        if (finalAvatar.includes('dicebear')) finalAvatar = '';
      }

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), avatar: finalAvatar }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Update failed');
      setUser(data);

      localStorage.setItem('user', JSON.stringify(data));
      setIsEditingName(false);
      setAvatarFileBase64(null);
      alert('Profile updated!');
    } catch (error: any) { alert(error.message); }
    finally { setSavingName(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setAvatarFileBase64(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = (type: 'liveness' | 'phone' | 'kyc') => {
    if (type === 'phone') {
      setShowPhoneModal(true);
    } else if (type === 'liveness') {
      setShowLivenessModal(true);
    } else if (type === 'kyc') {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
        fetch(`${API_URL}/api/auth/verify-kyc`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(data => {
          if (data.user) { setUser(data.user); localStorage.setItem('user', JSON.stringify(data.user)); }
        }).catch(error => console.error('KYC verification failed'));
      } catch (error) { console.error('KYC verification failed'); }
    }
  };

  const handleSendOtp = () => {
    if (phoneNumber.length < 10) return;
    setOtpSent(true);
    setTimeout(() => { alert(`OTP sent to ${phoneNumber}`); }, 1000);
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) return;
    setVerifyingOtp(true);
    setTimeout(() => {
      const updatedUser = { ...user, phoneVerified: true };
      setUser(updatedUser as any);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowPhoneModal(false);
      setOtpSent(false);
      setPhoneNumber('');
      setOtp(['', '', '', '']);
      setVerifyingOtp(false);
      alert('Phone number verified successfully!');
    }, 2000);
  };

  const handleStartLiveness = () => {
    setLivenessStep('scanning');
    setTimeout(() => {
      setLivenessStep('complete');
      setTimeout(() => {
        const updatedUser = { ...user, livenessStatus: true };
        setUser(updatedUser as any);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowLivenessModal(false);
        setLivenessStep('idle');
        alert('Liveness check completed successfully!');
      }, 1500);
    }, 3000);
  };

  const getAvatarUrl = () => {
    const u = user as any;
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0f172a&color=fff&size=128&bold=true`;

    if (u?.avatar && !u.avatar.includes('dicebear')) return u.avatar;
    if (u?.picture) return u.picture;
    if (u?.photoURL) return u.photoURL;
    return fallback;
  };

  const currentAvatarUrl = getAvatarUrl();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F7' }}>
      <Loader2 className="animate-spin text-slate-400 w-8 h-8 sm:w-10 sm:h-10" />
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F7' }}>
      <p style={{ color: '#64748b', fontWeight: 500 }} className="text-sm sm:text-base">Failed to load profile</p>
    </div>
  );

  const badgeLabel = (user.trustScore || 30) >= 80 ? 'Elite' : (user.trustScore || 30) >= 50 ? 'Trusted' : 'New Member';

  // Safe Array mapping for latest 2 activities
  const latestActivities = (transactions || []).length > 0 ? transactions.slice(0, 2) : [];

  return (
    <div className="w-full min-h-screen pb-36 md:pb-24" style={{ background: '#F5F5F7' }}>

      {/* ✅ FIXED BACK BUTTON - NORMAL FLOW, RESPONSIVE */}
      <div className="max-w-[1000px] mx-auto px-4 md:px-8">
        <div className="pt-4 sm:pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-all group"
          >
            <ChevronLeft
              size={16}
              className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform"
            />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-4 sm:py-6 lg:py-8">

        <div style={{ ...cardStyle, borderRadius: '1.5rem' }} className="p-4 sm:p-10 mb-6 sm:mb-8 sm:rounded-[2rem]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8">
            <div className="relative group cursor-pointer shrink-0 mt-2 sm:mt-0" onClick={() => setIsEditingName(true)}>
              <img
                src={avatarFileBase64 || currentAvatarUrl}
                alt="Profile"
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover transition-transform group-hover:scale-105 bg-slate-100"
                style={{ border: '4px solid #ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />

              <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}>
                <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }} className="sm:text-xs">Edit</span>
              </div>

              <div className="absolute bottom-0 right-0 p-1 sm:p-1.5 rounded-full border-[3px] sm:border-4 border-white" style={{ background: user.isVerified ? '#10b981' : '#cbd5e1' }}>
                <ShieldCheck size={12} className="sm:w-4 sm:h-4" color="#ffffff" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full pt-1 sm:pt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }} className="sm:text-3xl lg:text-4xl">{user.name}</h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:py-2.5 rounded-full sm:rounded-[99px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors w-full sm:w-auto"
                  style={{ border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  <Edit2 size={12} className="sm:w-[14px] sm:h-[14px]" /> Edit Profile
                </button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 sm:gap-6 mb-5 sm:mb-6 pb-5 sm:pb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fffbeb', padding: '4px 12px', borderRadius: '99px', border: '1px solid #fef3c7' }} className="sm:gap-[8px] sm:px-[16px] sm:py-[6px]">
                  <Star size={14} className="sm:w-4 sm:h-4" color="#f59e0b" />
                  <span style={{ color: '#92400e', fontSize: '12px', fontWeight: 600 }} className="sm:text-sm">{user.trustScore || 30} Trust Score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 500 }} className="sm:gap-[8px] sm:text-sm">
                  <Users size={14} className="sm:w-4 sm:h-4" color="#94a3b8" />
                  <span>{user.successfulTransactions || 0} Deals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', fontWeight: 500 }} className="sm:gap-[8px] sm:text-sm">
                  <Award size={14} className="sm:w-4 sm:h-4" color="#94a3b8" />
                  <span>{badgeLabel}</span>
                </div>
              </div>

              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
                  background: user.kycStatus === 'verified' ? '#d1fae5' : '#fffbeb',
                  color: user.kycStatus === 'verified' ? '#047857' : '#b45309',
                  border: `1px solid ${user.kycStatus === 'verified' ? '#a7f3d0' : '#fde68a'}`
                }} className="sm:gap-[8px] sm:px-[16px] sm:py-[6px] sm:text-xs">
                  {user.kycStatus === 'verified' ? <><CheckCircle2 size={12} className="sm:w-[14px] sm:h-[14px]" /> KYC Verified</> : '⏳ KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditingName && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: '1.5rem' }} className="sm:p-8 sm:rounded-[2rem]">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }} className="sm:text-xl sm:mb-6">Edit Profile</h2>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }} className="sm:text-sm sm:mb-2 uppercase tracking-wide">Display Name</label>
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '10px 14px', fontSize: '14px', fontWeight: 500, color: '#000000', outline: 'none' }}
                    className="sm:rounded-xl sm:p-3"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }} className="sm:text-sm sm:mb-2 uppercase tracking-wide">Profile Picture</label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={avatarFileBase64 || currentAvatarUrl}
                      alt="Preview"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '8px', fontSize: '12px', color: '#64748b', outline: 'none' }}
                      className="sm:rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <button onClick={() => { setIsEditingName(false); setAvatarFileBase64(null); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                    className="sm:p-3 sm:text-sm order-2 sm:order-1">
                    Cancel
                  </button>
                  <button onClick={() => handleSaveProfile(nameDraft, avatarFileBase64)} disabled={savingName}
                    style={{ flex: 1, padding: '10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, color: '#ffffff', background: '#0f172a', border: 'none', cursor: savingName ? 'not-allowed' : 'pointer', opacity: savingName ? 0.7 : 1 }}
                    className="sm:p-3 sm:text-sm order-1 sm:order-2 flex justify-center items-center">
                    {savingName ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phone Verification Modal */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', borderRadius: '1.5rem' }} className="sm:p-8 sm:rounded-[2rem]">
              <button onClick={() => setShowPhoneModal(false)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-slate-600"><X size={18} className="sm:w-5 sm:h-5" /></button>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }} className="sm:text-xl sm:mb-6">Verify Mobile Number</h2>
              {!otpSent ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }} className="sm:text-sm sm:mb-2 uppercase tracking-wide">Phone Number</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                      <Smartphone size={16} className="text-slate-400 mr-2 sm:w-[18px] sm:h-[18px]" />
                      <input type="tel" placeholder="Enter 10-digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} />
                    </div>
                  </div>
                  <button onClick={handleSendOtp} disabled={phoneNumber.length < 10} style={{ width: '100%', padding: '10px', borderRadius: '99px', background: phoneNumber.length < 10 ? '#cbd5e1' : '#0f172a', color: 'white', fontWeight: 600, fontSize: '12px', cursor: phoneNumber.length < 10 ? 'not-allowed' : 'pointer' }} className="sm:p-3 sm:text-sm mt-2 sm:mt-0">
                    Send OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  <p className="text-xs sm:text-sm text-slate-500 text-center">OTP sent to <span className="font-bold text-slate-800">{phoneNumber}</span></p>
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                        onChange={(e) => {
                          const newOtp = [...otp];
                          newOtp[index] = e.target.value;
                          setOtp(newOtp);
                          if (e.target.value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
                        }}
                        style={{ width: '40px', height: '45px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                        className="sm:w-[50px] sm:h-[50px] sm:text-2xl sm:rounded-xl"
                      />
                    ))}
                  </div>
                  <button onClick={handleVerifyOtp} disabled={verifyingOtp} style={{ width: '100%', padding: '10px', borderRadius: '99px', background: '#0f172a', color: 'white', fontWeight: 600, fontSize: '12px', opacity: verifyingOtp ? 0.7 : 1 }} className="sm:p-3 sm:text-sm mt-2 flex justify-center items-center">
                    {verifyingOtp ? <Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" /> : 'Verify OTP'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Liveness Check Modal */}
        {showLivenessModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', textAlign: 'center', borderRadius: '1.5rem' }} className="sm:p-8 sm:rounded-[2rem]">
              <button onClick={() => setShowLivenessModal(false)} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-slate-600"><X size={18} className="sm:w-5 sm:h-5" /></button>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }} className="sm:text-xl sm:mb-6">Liveness Check</h2>
              <div className="w-full aspect-square bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mb-4 sm:mb-6 relative overflow-hidden">
                {livenessStep === 'idle' && (
                  <>
                    <Camera size={40} className="text-slate-400 mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                    <p className="text-xs sm:text-sm text-slate-500 px-6 sm:px-8">Position your face in the frame and click start.</p>
                  </>
                )}
                {livenessStep === 'scanning' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-3 sm:mb-4"></div>
                    <p className="text-emerald-400 font-medium text-xs sm:text-sm animate-pulse">Scanning face...</p>
                  </div>
                )}
                {livenessStep === 'complete' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500 text-white">
                    <CheckCircle2 size={48} className="mb-2 sm:w-16 sm:h-16" />
                    <p className="font-bold text-base sm:text-lg">Verified</p>
                  </div>
                )}
              </div>
              {livenessStep === 'idle' && (
                <button onClick={handleStartLiveness} style={{ width: '100%', padding: '10px', borderRadius: '99px', background: '#0f172a', color: 'white', fontWeight: 600, fontSize: '12px' }} className="sm:p-3 sm:text-sm">
                  Start Camera
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
          {/* Reputation */}
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-2">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }} className="sm:text-lg">Reputation Feed</h2>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }} className="sm:text-xs sm:py-1 sm:px-2.5">Live</span>
            </div>
            <div style={{ ...cardStyle, borderRadius: '1.5rem', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }} className="sm:p-8 sm:min-h-[200px] sm:rounded-[2rem]">
              <Star style={{ marginBottom: '8px', color: '#e2e8f0' }} className="w-8 h-8 sm:w-10 sm:h-10 sm:mb-3" />
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 500, maxWidth: '250px' }} className="sm:text-sm">No consensus records found. Complete a transaction to build reputation.</p>
            </div>
          </section>

          {/* Activity */}
          <section>
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1 sm:px-2">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }} className="sm:text-lg">Activity</h2>
              <Link to="/activity" style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', textDecoration: 'none' }} className="sm:text-sm hover:underline">View All</Link>
            </div>
            <div style={{ ...cardStyle, borderRadius: '1.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', minHeight: '160px', background: '#ffffff' }} className="sm:p-6 sm:min-h-[200px] sm:rounded-[2rem]">
              {latestActivities.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 h-full flex flex-col justify-center w-full">
                  {latestActivities.map((tx: any, idx) => {
                    const currentUserId = String(user?._id || user?.id);
                    const renterIdStr = String(tx.renterId?._id || tx.renterId?.id || tx.renterId);
                    const isRenting = renterIdStr === currentUserId;

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate(`/handover/${tx._id}`)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${isRenting ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {isRenting ? <ArrowRight size={16} /> : <CheckCircle2 size={16} />}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{tx.itemTitle || 'Rental Asset'}</p>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> {(tx.status || 'ACTIVE').replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right pl-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-800">₹{tx.totalAmount || tx.totalPrice || 0}</p>
                          <p className={`text-[10px] sm:text-[11px] font-bold ${isRenting ? 'text-slate-500' : 'text-emerald-600'}`}>
                            {isRenting ? 'Paid' : 'Earned'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full pt-4 pb-2">
                  <div style={{ textAlign: 'center', marginBottom: '12px', color: '#94a3b8', fontWeight: 500, fontSize: '12px' }} className="sm:mb-4 sm:text-sm">
                    No recent activity.
                  </div>
                  <button onClick={() => navigate('/explore')}
                    style={{ display: 'flex', alignItems: 'center', alignSelf: 'center', justifyContent: 'center', gap: '6px', padding: '10px 24px', borderRadius: '99px', fontWeight: 600, fontSize: '12px', color: '#ffffff', background: '#0f172a', border: 'none', cursor: 'pointer' }} className="sm:gap-2 sm:p-3 sm:px-6 sm:text-sm">
                    Browse Items <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Verifications */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', paddingLeft: '4px' }} className="sm:text-xl sm:mb-6 sm:pl-2">Trust & Verifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <CredentialCard label="Government ID" status={user.kycStatus === 'verified' ? 'Verified' : 'Pending'} onClick={() => handleVerify('kyc')} icon={<CreditCard size={18} className="sm:w-5 sm:h-5" />} verified={user.kycStatus === 'verified'} />
            <CredentialCard label="Liveness Check" status={user.livenessStatus ? 'Passed' : 'Pending'} onClick={() => handleVerify('liveness')} icon={<ShieldCheck size={18} className="sm:w-5 sm:h-5" />} verified={user.livenessStatus} />
            <CredentialCard label="Mobile Number" status={user.phoneVerified ? 'Verified' : 'Pending'} onClick={() => handleVerify('phone')} icon={<Users size={18} className="sm:w-5 sm:h-5" />} verified={user.phoneVerified} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CredentialCard = ({ label, status, icon, verified, onClick }: { label: string; status: string; icon: React.ReactNode; verified?: boolean; onClick?: () => void }) => (
  <div onClick={onClick} style={{
    background: '#ffffff',
    border: verified ? '1px solid #10b981' : '1px solid #e2e8f0',
    borderRadius: '1.25rem',
    padding: '1.25rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px'
  }} className="sm:rounded-[1.5rem] sm:p-6 sm:flex-col sm:items-start sm:gap-0 hover:border-slate-300">
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: verified ? '#d1fae5' : '#f1f5f9',
      color: verified ? '#059669' : '#64748B'
    }} className="sm:w-10 sm:h-10 sm:rounded-xl sm:mb-4 shrink-0">
      {verified ? <CheckCircle2 size={18} className="sm:w-5 sm:h-5" /> : icon}
    </div>
    <div className="flex-1 sm:w-full flex flex-col justify-center">
      <h3 style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', marginBottom: '2px' }} className="sm:text-sm sm:mb-1">{label}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="sm:gap-1.5">
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: verified ? '#10b981' : '#f59e0b' }} className="sm:w-1.5 sm:h-1.5" />
        <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: verified ? '#10b981' : '#64748B' }} className="sm:text-[10px]">{status}</p>
      </div>
    </div>
  </div>
);

export default Profile;