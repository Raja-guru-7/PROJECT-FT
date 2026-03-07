
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Star, CheckCircle2, Award, Users, ArrowRight } from 'lucide-react';
import { MOCK_CURRENT_USER } from '../mockData';

const Profile: React.FC = () => {
  const navigate = useNavigate();

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

      <div className="bg-white rounded-3xl soft-shadow p-8 sm:p-12 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <img src={MOCK_CURRENT_USER.avatar} alt="Profile" className="w-32 h-32 rounded-full ring-4 ring-white shadow-lg"/>
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-2 rounded-full border-4 border-white">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 mb-2">{MOCK_CURRENT_USER.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                <span>{MOCK_CURRENT_USER.trustScore}% Trust Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span>42 Handovers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={16} className="text-orange-500" />
                <span>Master Handler Badge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Reputation Feed</h2>
          <div className="space-y-6">
            <ReviewCard 
              name="Marcus Chen" 
              comment="Extremely careful with my Sony A7III. Returned it cleaner than it was! Highly recommended."
              item="Sony A7III Camera"
            />
            <ReviewCard 
              name="Sarah Miller" 
              comment="Punctual and followed all protocol steps perfectly. The video verification was smooth."
              item="Heavy Duty Drill"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Operational History</h2>
          <div className="bg-white rounded-3xl soft-shadow p-8">
            <div className="space-y-6">
              <HistoryItem label="Nintendo Switch OLED" date="2 days ago" />
              <HistoryItem label="Professional Steam Cleaner" date="1 week ago" />
              <HistoryItem label="Camping Tent (4-Person)" date="Oct 12, 2023" />
            </div>
            <button className="w-full mt-8 text-sm font-bold text-slate-500 hover:text-slate-800 py-3 rounded-lg hover:bg-gray-100 transition-all">
              View Full History
            </button>
          </div>
        </section>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Verified Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CredentialCard label="Government ID" date="Verified Oct 2023" />
          <CredentialCard label="Liveness Check" date="Passed" />
          <CredentialCard label="Mobile Number" date="Verified" />
        </div>
      </div>
    </div>
  );
};

const CredentialCard = ({ label, date }: { label: string, date: string }) => (
  <div className="bg-white p-6 rounded-2xl soft-shadow">
    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
      <CheckCircle2 size={20} />
    </div>
    <h3 className="font-bold text-slate-800">{label}</h3>
    <p className="text-sm text-slate-500">{date}</p>
  </div>
);

const ReviewCard = ({ name, comment, item }: { name: string, comment: string, item: string }) => (
  <div className="bg-white p-6 rounded-2xl soft-shadow">
    <div className="flex items-center gap-3 mb-4">
      <img src={`https://picsum.photos/seed/${name}/100`} className="w-10 h-10 rounded-full" alt="" />
      <div>
        <p className="font-bold text-slate-800">{name}</p>
        <p className="text-xs text-slate-500 font-semibold">{item}</p>
      </div>
    </div>
    <p className="text-sm text-slate-600">"{comment}"</p>
  </div>
);

const HistoryItem = ({ label, date }: { label: string, date: string }) => (
  <div className="flex items-center justify-between group">
    <div>
      <p className="font-bold text-slate-800">{label}</p>
      <p className="text-sm text-slate-500">{date}</p>
    </div>
    <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
  </div>
);

export default Profile;
