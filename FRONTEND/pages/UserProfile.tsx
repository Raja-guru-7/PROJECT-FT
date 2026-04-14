// UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, Loader2, Edit2 } from 'lucide-react';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '1.5rem', // Slightly smaller border radius for mobile overall
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: localStorage key is "user", id field is "id" (not "_id")
  const getLoggedInUserId = (): string | null => {
    try {
      const userObj = localStorage.getItem('user');
      if (userObj) {
        const parsed = JSON.parse(userObj);
        return parsed.id || parsed._id || null;
      }
    } catch {
      // silent fail
    }
    return null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/user/${userId}`
        );
        const data = await res.json();
        if (res.ok) setUser(data);
      } catch (err) {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F5F7]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F5F7]">
        <p className="text-slate-500 font-medium text-sm">User not found</p>
      </div>
    );

  // ✅ FIXED: profile._id from MongoDB vs logged-in user's "id" from localStorage
  const loggedInUserId = getLoggedInUserId();
  const profileUserId = user._id || user.id;
  const isOwnProfile = !!(loggedInUserId && profileUserId && loggedInUserId === profileUserId);

  const badgeLabel =
    user.trustScore >= 80 ? 'Elite' : user.trustScore >= 50 ? 'Trusted' : 'New Member';

  // FIXED: Image Logic Changed Here
  const dynamicAvatar = user.avatar || user.profilePhoto || user.profileImageUrl || user.picture;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0f172a&color=fff&size=128&bold=true`;
  const avatarUrl = dynamicAvatar || fallbackAvatar;

  return (
    <div className="w-full min-h-screen bg-[#F5F5F7] pb-24 relative">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 sm:top-8 left-4 md:left-8 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium hover:opacity-70 transition-opacity text-slate-500 z-10"
      >
        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back
      </button>
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-6 sm:py-12 lg:py-16 mt-8 sm:mt-0">

        <div style={cardStyle} className="p-5 sm:p-10 mb-6 sm:mb-8 rounded-[1.5rem] sm:rounded-[2rem]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8">
            <div className="relative shrink-0 mt-2 sm:mt-0">
              <img
                src={avatarUrl}
                alt={`${user.name}'s Profile`}
                className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== fallbackAvatar) target.src = fallbackAvatar;
                }}
              />
              <div className={`absolute bottom-0 right-0 p-1 sm:p-1.5 rounded-full border-[3px] sm:border-4 border-white ${user.isVerified ? 'bg-green-500' : 'bg-slate-300'}`}>
                <ShieldCheck size={12} className="sm:w-4 sm:h-4" color="#ffffff" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full pt-1 sm:pt-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">{user.name}</h1>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    <Edit2 size={12} className="sm:w-[14px] sm:h-[14px]" /> Edit Profile
                  </button>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 sm:gap-6 mb-5 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-100">
                  <Star size={14} className="sm:w-4 sm:h-4 text-amber-500" />
                  <span className="text-amber-800 font-semibold text-[10px] sm:text-sm">{user.trustScore} Trust Score</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium text-[10px] sm:text-sm">
                  <Users size={14} className="sm:w-4 sm:h-4 text-slate-400" />
                  <span>{user.successfulTransactions || 0} Deals</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium text-[10px] sm:text-sm">
                  <Award size={14} className="sm:w-4 sm:h-4 text-slate-400" />
                  <span>{badgeLabel}</span>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${user.kycStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                  {user.kycStatus === 'verified'
                    ? <><CheckCircle2 size={12} className="sm:w-[14px] sm:h-[14px] text-emerald-500" /> KYC Verified</>
                    : '⏳ KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 px-1 sm:px-2">Reputation Feed</h2>
            <div style={cardStyle} className="p-6 sm:p-8 text-center flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] bg-white rounded-[1.25rem] sm:rounded-[1.5rem]">
              <Star className="mb-2 sm:mb-3 text-slate-200 w-8 h-8 sm:w-10 sm:h-10" />
              <p className="text-slate-500 text-xs sm:text-sm font-medium px-4">
                {isOwnProfile
                  ? 'No consensus records found. Complete a transaction to build reputation.'
                  : 'No reviews available for this user yet.'}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 px-1 sm:px-2">
              {isOwnProfile ? 'Activity' : 'Operational History'}
            </h2>
            <div style={cardStyle} className="p-6 sm:p-8 flex flex-col justify-center min-h-[160px] sm:min-h-[200px] bg-white text-center gap-3 sm:gap-4 rounded-[1.25rem] sm:rounded-[1.5rem]">
              <p className="text-slate-400 font-medium text-xs sm:text-sm">
                {isOwnProfile ? 'No recent activity.' : 'No transactions yet.'}
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="w-full max-w-[200px] mx-auto py-2.5 sm:py-3 rounded-full sm:rounded-xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-700 transition-colors mt-2 sm:mt-0"
                >
                  Browse Items →
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Trust & Verifications — own profile only */}
        {isOwnProfile && (
          <section className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 px-1 sm:px-2">Trust & Verifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Government ID', verified: user.kycStatus === 'verified' },
                { label: 'Liveness Check', verified: user.livenessStatus === true },
                { label: 'Mobile Number', verified: user.phoneVerified === true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={cardStyle}
                  className={`p-4 sm:p-5 flex flex-row sm:flex-col items-center sm:items-start gap-3 border-2 rounded-[1.25rem] sm:rounded-[1.5rem] ${item.verified ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${item.verified ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <CheckCircle2 size={16} className={`sm:w-[18px] sm:h-[18px] ${item.verified ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 sm:w-full flex flex-col sm:gap-1.5">
                    <p className="text-slate-700 font-semibold text-xs sm:text-sm">{item.label}</p>
                    <span className={`text-[9px] sm:text-[10px] font-bold ${item.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                      ● {item.verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default UserProfile;