
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_TRANSACTIONS, MOCK_CURRENT_USER } from '../mockData';
// FIX: Add TrendingUp to lucide-react imports
import { ArrowUpRight, Activity, Loader2, PlusCircle, CheckCircle2, ShieldCheck, ChevronLeft, ArrowRight, Clock, TrendingUp } from 'lucide-react';

interface DashboardProps {
  role: 'RENTER' | 'OWNER';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'renting' | 'lending'>(role === 'OWNER' ? 'lending' : 'renting');

  useEffect(() => {
    setTab(role === 'OWNER' ? 'lending' : 'renting');
  }, [role]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 leading-tight">
            Dashboard
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Monitor your active rentals and lending items.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button onClick={() => setTab('renting')} className={`flex-1 px-8 py-3 rounded-full text-sm font-bold transition-all ${tab === 'renting' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            My Rentals
          </button>
          <button onClick={() => setTab('lending')} className={`flex-1 px-8 py-3 rounded-full text-sm font-bold transition-all ${tab === 'lending' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            My Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {tab === 'renting' ? 'Active Rentals' : 'Your Listed Items'}
          </h2>

          {tab === 'renting' ? (
            MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="bg-white rounded-3xl soft-shadow soft-shadow-hover transition-all overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">{tx.status.replace('_', ' ')}</p>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight group-hover:text-[#093E28]">{tx.itemTitle}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">₹{tx.totalAmount}</p>
                      <p className="text-xs font-semibold text-slate-500">Total Cost</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <Clock size={16} className="text-slate-400" />
                       <span className="text-sm font-semibold text-slate-600">Return by: {tx.endDate}</span>
                    </div>
                    <Link to={`/handover/${tx.id}`} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#093E28] text-white px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95">
                      {tx.status === 'HANDOVER_IN_PROGRESS' ? 'Complete Handover' : 'View Details'} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/70 border-2 border-dashed border-gray-300 p-12 rounded-3xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="text-slate-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You have no items listed</h3>
              <p className="text-slate-500 mb-6">Start earning by sharing your items with the community.</p>
              <Link to="/add" className="inline-block bg-[#093E28] text-white px-6 py-3 rounded-full font-bold text-sm">List an Item</Link>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl soft-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Reputation Score</h3>
            <p className="text-sm text-slate-500 mb-6">Your community trust rating based on successful rentals.</p>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black text-[#093E28] leading-none">{MOCK_CURRENT_USER.trustScore}%</span>
              <div className="text-green-600 font-bold flex items-center gap-1 text-sm pb-1">
                <TrendingUp size={16} /> +5%
              </div>
            </div>
            <div className="mt-6 text-sm bg-green-50 text-green-700 font-semibold p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16}/> You're a top-rated member!
            </div>
          </div>
          
          <div className="bg-[#093E28] text-white p-8 rounded-3xl soft-shadow">
            <h3 className="text-lg font-bold mb-1">Account Security</h3>
            <p className="text-sm text-green-200/70 mb-6">Your account is fully verified and protected.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-green-300"/>
                <span className="font-semibold text-sm">Identity Verified</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-green-300"/>
                <span className="font-semibold text-sm">Payment Method Secured</span>
              </div>
            </div>
             <Link to="/settings" className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm">
                Manage Settings
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
