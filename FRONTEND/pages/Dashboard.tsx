import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Transaction, User } from '../types';
import { ArrowRight, Clock, TrendingUp, PlusCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface DashboardProps {
  role: 'RENTER' | 'OWNER';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [tab, setTab] = useState<'renting' | 'lending'>(role === 'OWNER' ? 'lending' : 'renting');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(role === 'OWNER' ? 'lending' : 'renting');
  }, [role]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txData, userData] = await Promise.all([
          api.getTransactions(role),
          api.getCurrentUser()
        ]);
        setTransactions(txData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-16">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-black tracking-tighter text-slate-900 leading-tight">Dashboard</h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600">Monitor your active rentals and lending items.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-full border border-gray-200">
          <button onClick={() => setTab('renting')} className={`flex-1 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all ${tab === 'renting' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            My Rentals
          </button>
          <button onClick={() => setTab('lending')} className={`flex-1 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all ${tab === 'lending' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
            My Items
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {tab === 'renting' ? 'Active Rentals' : 'Your Listed Items'}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#093E28]" size={36} />
            </div>
          ) : tab === 'renting' ? (
            transactions.length > 0 ? transactions.map(tx => (
              <div key={tx.id} className="bg-white rounded-3xl soft-shadow overflow-hidden">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500">{tx.status.replace(/_/g, ' ')}</p>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">{tx.itemTitle}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-black text-slate-800">₹{tx.totalAmount}</p>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500">Total Cost</p>
                    </div>
                  </div>
                  <div className="pt-4 sm:pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Return by: {tx.endDate || 'TBD'}</span>
                    </div>
                    <Link to={`/handover/${tx.id}`} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#093E28] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:opacity-90">
                      {tx.status === 'HANDOVER_IN_PROGRESS' ? 'Complete Handover' : 'View Details'} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white/70 border-2 border-dashed border-gray-300 p-8 sm:p-12 rounded-3xl text-center">
                <p className="text-sm sm:text-base font-bold text-slate-600 mb-2">No active rentals</p>
                <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Start exploring items near you!</p>
                <Link to="/explore" className="inline-block bg-[#093E28] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm">Explore Now</Link>
              </div>
            )
          ) : (
            <div className="bg-white/70 border-2 border-dashed border-gray-300 p-12 rounded-3xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">You have no items listed</h3>
              <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Start earning by sharing your items with the community.</p>
              <Link to="/add" className="inline-block bg-[#093E28] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm">List an Item</Link>
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl soft-shadow">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Reputation Score</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Your community trust rating.</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#093E28] leading-none">{currentUser?.trustScore || 30}</span>
              <div className="text-green-600 font-bold flex items-center gap-1 text-sm pb-1">
                <TrendingUp size={16} /> pts
              </div>
            </div>
            <div className="mt-4 sm:mt-6 text-sm bg-green-50 text-green-700 font-semibold p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16} />
              {(currentUser?.trustScore || 30) >= 80 ? "You're a top-rated member!" : "Complete transactions to boost score!"}
            </div>
          </div>

          <div className="bg-[#093E28] text-white p-6 sm:p-8 rounded-3xl soft-shadow">
            <h3 className="text-base sm:text-lg font-bold mb-1">Account Security</h3>
            <p className="text-sm sm:text-base text-green-200/70 mb-4 sm:mb-6">Your account protection status.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-green-300" />
                <span className="font-semibold text-sm">{currentUser?.isVerified ? 'Identity Verified' : 'Identity Pending'}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-green-300" />
                <span className="font-semibold text-sm">JWT Secured</span>
              </div>
            </div>
            <Link to="/settings" className="w-full mt-4 sm:mt-6 bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm">
              Manage Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
