import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, Loader2 } from 'lucide-react';

interface PublicUser {
  _id: string;
  name: string;
  trustScore: number;
  kycStatus: string;
  isVerified: boolean;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
        const data = await res.json();
        if (res.ok) setUser(data);
        else console.error(data.msg);
      } catch (err) {
        console.error('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#093E28]" size={40} />
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500 font-bold">User not found</p>
    </div>
  );

  const badgeLabel = user.trustScore >= 80 ? 'Master Handler' : user.trustScore >= 50 ? 'Trusted User' : 'New Member';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl soft-shadow p-8 sm:p-12 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=093E28&color=fff&size=128`}
              alt="Profile"
              className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-2 rounded-full border-4 border-white">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 mb-2">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" fill="currentColor" />
                <span>{user.trustScore} Trust Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span>0 Handovers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-orange-500" />
                <span>{badgeLabel} Badge</span>
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                user.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {user.kycStatus === 'verified' ? '✅ KYC Verified' : '⏳ KYC Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reputation + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Reputation Feed</h2>
          <div className="bg-white p-6 rounded-2xl soft-shadow text-center text-slate-400 font-semibold">
            No reviews yet — complete your first transaction!
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Operational History</h2>
          <div className="bg-white rounded-3xl soft-shadow p-8">
            <div className="text-center text-slate-400 font-semibold py-4">
              No transactions yet
            </div>
            <button className="w-full mt-4 text-sm font-bold text-slate-500 hover:text-slate-800 py-3 rounded-lg hover:bg-gray-100 transition-all">
              View Full History
            </button>
          </div>
        </section>
      </div>

      {/* Verified Credentials */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Verified Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CredentialCard label="Government ID" date={user.kycStatus === 'verified' ? 'Verified' : 'Pending'} />
          <CredentialCard label="Liveness Check" date={user.isVerified ? 'Passed' : 'Pending'} />
          <CredentialCard label="Mobile Number" date="Pending" />
        </div>
      </div>
    </div>
  );
};

const CredentialCard = ({ label, date }: { label: string; date: string }) => (
  <div className="bg-white p-6 rounded-2xl soft-shadow">
    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
      <CheckCircle2 size={20} />
    </div>
    <h3 className="font-bold text-slate-800">{label}</h3>
    <p className="text-sm text-slate-500">{date}</p>
  </div>
);

export default UserProfile;
