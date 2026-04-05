import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Activity, Star, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { User } from '../../types';

const TrustScore: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error('Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">Loading...</div>;
  }

  const score = user?.trustScore || 30;
  const isTrusted = score >= 80;

  // Algorithm breakdown simulation based on your paper
  const kycPoints = user?.isVerified ? 30 : 0;
  const historyPoints = (user?.successfulTransactions || 0) * 5;
  const ratingPoints = 40; // Simulated base rating points
  
  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] px-4 md:px-8 py-8 pb-24 relative">
      <button onClick={() => navigate(-1)} className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>
      <div className="max-w-[800px] mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 mb-2">Network Reputation</h1>
          <p className="text-sm font-medium text-slate-500">Dynamic Social Trust Algorithm Overview</p>
        </div>

        {/* Big Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black text-white rounded-[2rem] p-8 sm:p-12 mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={160} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-slate-400 font-semibold tracking-wide text-sm uppercase mb-2">Current Trust Score</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl sm:text-8xl font-bold tracking-tighter">{score}</span>
                <span className="text-xl font-medium text-slate-400 pb-2">/ 150</span>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-full flex items-center gap-3 font-bold border-2 ${isTrusted ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/10 border-white/20 text-white'}`}>
              {isTrusted ? <ShieldCheck size={20} /> : <Info size={20} />}
              {isTrusted ? 'Elite Trusted Node' : 'Standard Clearance'}
            </div>
          </div>
        </motion.div>

        {/* Algorithm Breakdown */}
        <h2 className="text-xl font-bold text-slate-800 mb-6 px-2">Score Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          
          <ScoreFactor 
            icon={<ShieldCheck size={20} className="text-emerald-500" />} 
            title="Identity (KYC)" 
            points={`+${kycPoints}`} 
            desc="Government ID & Liveness verified." 
            active={!!user?.isVerified}
          />
          <ScoreFactor 
            icon={<Activity size={20} className="text-blue-500" />} 
            title="Transaction History" 
            points={`+${historyPoints}`} 
            desc={`${user?.successfulTransactions || 0} successful handovers (+5 pts each).`} 
            active={(user?.successfulTransactions || 0) > 0}
          />
          <ScoreFactor 
            icon={<Star size={20} className="text-amber-500" />} 
            title="Peer Ratings" 
            points={`+${ratingPoints}`} 
            desc="Average community rating (out of 50)." 
            active={true}
          />
          <ScoreFactor 
            icon={<AlertTriangle size={20} className="text-red-500" />} 
            title="Penalties" 
            points="-0" 
            desc="Deductions for damages or disputes." 
            active={false}
            isPenalty={true}
          />
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Info size={18} className="text-slate-400" /> How to improve?
          </h3>
          <ul className="space-y-3 text-sm font-medium text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
              Complete all KYC verifications from your Profile page to get the base 30 points.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
              Successfully complete rentals without disputes (+5 points per transaction).
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-slate-400 shrink-0 mt-0.5" />
              Maintain high ratings from peers to maximize your Peer Rating multiplier.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

const ScoreFactor = ({ icon, title, points, desc, active, isPenalty }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
    className={`p-6 rounded-3xl border transition-all ${active && !isPenalty ? 'bg-white border-slate-200 shadow-sm' : isPenalty ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active && !isPenalty ? 'bg-slate-50' : isPenalty ? 'bg-red-100' : 'bg-slate-200'}`}>
        {icon}
      </div>
      <span className={`text-xl font-bold ${active && !isPenalty ? 'text-slate-800' : isPenalty ? 'text-red-500' : 'text-slate-400'}`}>
        {points}
      </span>
    </div>
    <h3 className="font-bold text-slate-800 text-sm mb-1">{title}</h3>
    <p className="text-xs text-slate-500 font-medium">{desc}</p>
  </motion.div>
);

export default TrustScore;