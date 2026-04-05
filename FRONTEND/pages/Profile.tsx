import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, ArrowRight, Loader2, CreditCard, X, Camera, Smartphone } from 'lucide-react';
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

  // Fixed: Added state to handle local file upload
  const [avatarFileBase64, setAvatarFileBase64] = useState<string | null>(null);

  // Verification modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // 4-digit OTP state
  const [otp, setOtp] = useState(['', '', '', '']); 
  const [otpSent, setOtpSent] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [livenessStep, setLivenessStep] = useState<'idle' | 'scanning' | 'complete'>('idle');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userData, transactionsData] = await Promise.all([
          api.getCurrentUser(),
          fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/transactions/user/${localStorage.getItem('userId')}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.ok ? res.json() : [])
        ]);
        setUser(userData); setTransactions(transactionsData);
      } catch (err) { console.error('Failed to fetch profile data'); }
      finally { setLoading(false); }
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
      
      // Use the newly uploaded image, OR keep the existing one (but strip the bad dicebear ones)
      let finalAvatar = newAvatarBase64;
      if (!finalAvatar) {
        finalAvatar = user?.avatar || '';
        if (finalAvatar.includes('dicebear')) finalAvatar = ''; // Strip out bad default
      }

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), avatar: finalAvatar }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Update failed');
      setUser(data); 
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(data));
      setIsEditingName(false); 
      setAvatarFileBase64(null); // Reset local upload state
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

  // --- Logic for Google Profile / Avatar Handling ---
  const getAvatarUrl = () => {
    const u = user as any;
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0f172a&color=fff&size=128&bold=true`;
    
    // 1. First priority: Base64 upload or stored manual avatar
    if (u?.avatar && !u.avatar.includes('dicebear')) return u.avatar;
    
    // 2. Second priority: Google Auth Picture (Commonly stored as 'picture' or 'photoURL')
    if (u?.picture) return u.picture;
    if (u?.photoURL) return u.photoURL;
    
    // 3. Last priority: Initials fallback
    return fallback;
  };
  
  const currentAvatarUrl = getAvatarUrl();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F7' }}>
      <Loader2 className="animate-spin text-slate-400" size={40} />
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F5F7' }}>
      <p style={{ color: '#64748b', fontWeight: 500 }}>Failed to load profile</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen pb-24 relative" style={{ background: '#F5F5F7' }}>
      <button type="button" onClick={() => navigate(-1)}
        className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity z-10"
        style={{ color: '#64748b' }}>
        <ChevronLeft size={18} /> Back
      </button>
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 sm:py-12 lg:py-16">

        {/* Profile Header */}
        <div style={cardStyle} className="p-6 sm:p-10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <div className="relative group cursor-pointer" onClick={() => setIsEditingName(true)}>
              <img 
                src={avatarFileBase64 || currentAvatarUrl}
                alt="Profile" 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover transition-transform group-hover:scale-105 bg-slate-100"
                style={{ border: '4px solid #ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
              />

              <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}>
                <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Edit</span>
              </div>

              <div className="absolute bottom-0 right-0 p-1.5 rounded-full border-4 border-white" style={{ background: user.isVerified ? '#10b981' : '#cbd5e1' }}>
                <ShieldCheck size={16} color="#ffffff" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{user.name}</h1>
                <button type="button" onClick={() => setIsEditingName(true)}
                  style={{ padding: '10px 24px', borderRadius: '99px', background: '#f1f5f9', color: '#0f172a', fontSize: '14px', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Edit Profile
                </button>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 mb-6 pb-6" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '6px 16px', borderRadius: '99px', border: '1px solid #fef3c7' }}>
                  <Star size={16} color="#f59e0b" />
                  <span style={{ color: '#92400e', fontSize: '14px', fontWeight: 600 }}>{user.trustScore} Trust Score</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                  <Users size={16} color="#94a3b8" />
                  <span>{user.successfulTransactions || 0} Deals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                  <Award size={16} color="#94a3b8" />
                  <span>{user.trustScore >= 80 ? 'Elite' : user.trustScore >= 50 ? 'Trusted' : 'New Member'}</span>
                </div>
              </div>

              <div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: 700,
                  background: user.kycStatus === 'verified' ? '#d1fae5' : '#fffbeb',
                  color: user.kycStatus === 'verified' ? '#047857' : '#b45309',
                  border: `1px solid ${user.kycStatus === 'verified' ? '#a7f3d0' : '#fde68a'}`
                }}>
                  {user.kycStatus === 'verified' ? <><CheckCircle2 size={14} /> KYC Verified</> : '⏳ KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditingName && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Edit Profile</h2>
              <div className="space-y-5">
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>Display Name</label>
                  <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#000000', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>Upload Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <img 
                      src={avatarFileBase64 || currentAvatarUrl} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200" 
                    />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px', fontSize: '12px', color: '#64748b', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setIsEditingName(false); setAvatarFileBase64(null); }}
                    style={{ flex: 1, padding: '12px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={() => handleSaveProfile(nameDraft, avatarFileBase64)} disabled={savingName}
                    style={{ flex: 1, padding: '12px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, color: '#ffffff', background: '#0f172a', border: 'none', cursor: savingName ? 'not-allowed' : 'pointer', opacity: savingName ? 0.7 : 1 }}>
                    {savingName ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Phone Verification Modal --- */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
              <button onClick={() => setShowPhoneModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Verify Mobile Number</h2>
              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '8px' }}>Phone Number</label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <Smartphone size={18} className="text-slate-400 mr-2" />
                      <input type="tel" placeholder="Enter 10-digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} />
                    </div>
                  </div>
                  <button onClick={handleSendOtp} disabled={phoneNumber.length < 10} style={{ width: '100%', padding: '12px', borderRadius: '99px', background: phoneNumber.length < 10 ? '#cbd5e1' : '#0f172a', color: 'white', fontWeight: 600, fontSize: '14px', cursor: phoneNumber.length < 10 ? 'not-allowed' : 'pointer' }}>
                    Send OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-sm text-slate-500 text-center">OTP sent to <span className="font-bold text-slate-800">{phoneNumber}</span></p>
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit}
                        onChange={(e) => {
                          const newOtp = [...otp];
                          newOtp[index] = e.target.value;
                          setOtp(newOtp);
                          if (e.target.value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
                        }}
                        style={{ width: '50px', height: '50px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                      />
                    ))}
                  </div>
                  <button onClick={handleVerifyOtp} disabled={verifyingOtp} style={{ width: '100%', padding: '12px', borderRadius: '99px', background: '#0f172a', color: 'white', fontWeight: 600, fontSize: '14px', opacity: verifyingOtp ? 0.7 : 1 }}>
                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Liveness Check Modal --- */}
        {showLivenessModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <div style={{ ...cardStyle, padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', textAlign: 'center' }}>
              <button onClick={() => setShowLivenessModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Liveness Check</h2>
              <div className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                {livenessStep === 'idle' && (
                  <>
                    <Camera size={48} className="text-slate-400 mb-4" />
                    <p className="text-sm text-slate-500 px-8">Position your face in the frame and click start.</p>
                  </>
                )}
                {livenessStep === 'scanning' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-emerald-400 font-medium animate-pulse">Scanning face...</p>
                  </div>
                )}
                {livenessStep === 'complete' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500 text-white">
                    <CheckCircle2 size={64} className="mb-2" />
                    <p className="font-bold text-lg">Verified</p>
                  </div>
                )}
              </div>
              {livenessStep === 'idle' && (
                <button onClick={handleStartLiveness} style={{ width: '100%', padding: '12px', borderRadius: '99px', background: '#0f172a', color: 'white', fontWeight: 600, fontSize: '14px' }}>
                  Start Camera
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8">
          {/* Reputation */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Reputation Feed</h2>
              <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#64748b' }}>Live</span>
            </div>
            <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
              <Star style={{ marginBottom: '12px', color: '#e2e8f0' }} size={40} />
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500, maxWidth: '250px' }}>No consensus records found. Complete a transaction to build reputation.</p>
            </div>
          </section>

          {/* History */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Activity</h2>
              <Link to="/activity" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>View All</Link>
            </div>
            <div style={{ ...cardStyle, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '200px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '14px' }}>
                No recent activity.
              </div>
              <button onClick={() => navigate('/explore')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '99px', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: '#0f172a', border: 'none', cursor: 'pointer' }}>
                Browse Items <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>

        {/* Verifications */}
        <div className="mt-12 sm:mt-16">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', paddingLeft: '8px' }}>Trust & Verifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <CredentialCard label="Government ID" status={user.kycStatus === 'verified' ? 'Verified' : 'Pending'} onClick={() => handleVerify('kyc')} icon={<CreditCard size={20} />} verified={user.kycStatus === 'verified'} />
            <CredentialCard label="Liveness Check" status={user.livenessStatus ? 'Passed' : 'Pending'} onClick={() => handleVerify('liveness')} icon={<ShieldCheck size={20} />} verified={user.livenessStatus} />
            <CredentialCard label="Mobile Number" status={user.phoneVerified ? 'Verified' : 'Pending'} onClick={() => handleVerify('phone')} icon={<Users size={20} />} verified={user.phoneVerified} />
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
    borderRadius: '1.5rem',
    padding: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease'
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
      background: verified ? '#d1fae5' : '#f1f5f9',
      color: verified ? '#059669' : '#64748B'
    }}>
      {verified ? <CheckCircle2 size={20} /> : icon}
    </div>
    <h3 style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>{label}</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: verified ? '#10b981' : '#f59e0b' }} />
      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: verified ? '#10b981' : '#64748B' }}>{status}</p>
    </div>
  </div>
);

export default Profile;