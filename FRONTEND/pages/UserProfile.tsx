// UserProfile.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, Loader2, Edit2 } from 'lucide-react';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '2rem',
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
        <p className="text-slate-500 font-medium">User not found</p>
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
        className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity text-slate-500 z-10"
      >
        <ChevronLeft size={18} /> Back
      </button>
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 sm:py-12 lg:py-16">

        <div style={cardStyle} className="p-8 sm:p-10 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={`${user.name}'s Profile`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== fallbackAvatar) target.src = fallbackAvatar;
                }}
              />
              <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-4 border-white ${user.isVerified ? 'bg-green-500' : 'bg-slate-300'}`}>
                <ShieldCheck size={16} color="#ffffff" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full pt-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{user.name}</h1>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors self-center md:self-start"
                  >
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 mb-6">
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Star size={16} className="text-amber-500" />
                  <span className="text-amber-800 font-semibold text-sm">{user.trustScore} Trust Score</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                  <Users size={16} className="text-slate-400" />
                  <span>{user.successfulTransactions || 0} Deals</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                  <Award size={16} className="text-slate-400" />
                  <span>{badgeLabel}</span>
                </div>
              </div>

              <div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${user.kycStatus === 'verified'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                  {user.kycStatus === 'verified'
                    ? <><CheckCircle2 size={14} className="text-emerald-500" /> KYC Verified</>
                    : '⏳ KYC Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Reputation Feed</h2>
            <div style={cardStyle} className="p-8 text-center flex flex-col items-center justify-center min-h-[200px] bg-white">
              <Star className="mb-3 text-slate-200" size={40} />
              <p className="text-slate-500 text-sm font-medium">
                {isOwnProfile
                  ? 'No consensus records found. Complete a transaction to build reputation.'
                  : 'No reviews available for this user yet.'}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
              {isOwnProfile ? 'Activity' : 'Operational History'}
            </h2>
            <div style={cardStyle} className="p-8 flex flex-col justify-center min-h-[200px] bg-white text-center gap-4">
              <p className="text-slate-400 font-medium text-sm">
                {isOwnProfile ? 'No recent activity.' : 'No transactions yet.'}
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
                >
                  Browse Items →
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Trust & Verifications — own profile only */}
        {isOwnProfile && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Trust & Verifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Government ID', verified: user.kycStatus === 'verified' },
                { label: 'Liveness Check', verified: user.livenessStatus === true },
                { label: 'Mobile Number', verified: user.phoneVerified === true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={cardStyle}
                  className={`p-5 flex flex-col gap-3 border-2 ${item.verified ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.verified ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <CheckCircle2 size={18} className={item.verified ? 'text-emerald-500' : 'text-slate-400'} />
                  </div>
                  <p className="text-slate-700 font-semibold text-sm">{item.label}</p>
                  <span className={`text-xs font-bold ${item.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                    ● {item.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
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