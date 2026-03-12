import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Video, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.getTransactions('RENTER');
        setTransactions(data);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredLogs = useMemo(() => {
    return transactions.filter(tx =>
      tx.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transactions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">Activity Log</h1>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600">A secure audit trail of all your network transactions.</p>
        </div>
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by item or TX ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm sm:text-base font-semibold"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#093E28]" size={36} />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left min-w-[600px] sm:min-w-[700px] lg:min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item / Transaction ID</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proofs</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length > 0 ? filteredLogs.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5">
                      <p className="font-bold text-sm sm:text-base text-slate-800 line-clamp-1">{tx.itemTitle}</p>
                      <p className="text-xs text-slate-500 font-mono">{tx.id}</p>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5">
                      <div className="flex gap-1 sm:gap-2">
                        <ProofButton icon={<Video size={12} />} label="Dispatch" />
                        <ProofButton icon={<Video size={12} />} label="Receipt" />
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5">
                      <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                        tx.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        tx.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        tx.status === 'REQUESTED' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          tx.status === 'ACTIVE' ? 'bg-green-500' :
                          tx.status === 'COMPLETED' ? 'bg-blue-500' :
                          tx.status === 'REQUESTED' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`} />
                        {tx.status.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-5 text-right">
                      <p className="font-bold text-sm sm:text-base text-slate-800">₹{tx.totalAmount}</p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-3 sm:px-4 lg:px-6 py-12 sm:py-20 text-center">
                      <p className="font-semibold text-slate-500">
                        {searchQuery ? 'No matching activity found.' : 'No transactions yet — start renting!'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ProofButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-xs">
    <span className="text-slate-500">{icon}</span>
    <span className="text-xs font-bold text-slate-600">{label}</span>
  </button>
);

export default ActivityLog;
