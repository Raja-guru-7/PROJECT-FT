
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, ShieldCheck, Video, History, ArrowRight, Search, Filter } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../mockData';

const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => 
      tx.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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

      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Activity Log</h1>
          <p className="mt-4 text-lg text-slate-600">A secure audit trail of all your network transactions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by item or TX ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-12 pr-4 font-semibold"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[800px]">
              <thead>
                 <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item / Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proofs</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filteredLogs.map(tx => (
                   <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                         <p className="font-bold text-slate-800">{tx.itemTitle}</p>
                         <p className="text-xs text-slate-500 font-mono">{tx.id}</p>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex gap-2">
                            <ProofButton icon={<Video size={14} />} label="Dispatch" />
                            <ProofButton icon={<Video size={14} />} label="Receipt" />
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                           tx.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                            <div className={`w-2 h-2 rounded-full ${tx.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                            {tx.status.replace('_', ' ')}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <p className="font-bold text-slate-800">₹{tx.totalAmount}</p>
                      </td>
                   </tr>
                 ))}
                 {filteredLogs.length === 0 && (
                   <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                         <p className="font-semibold text-slate-500">No matching activity found.</p>
                      </td>
                   </tr>
                 )}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

const ProofButton = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
    <span className="text-slate-500">{icon}</span>
    <span className="text-xs font-bold text-slate-600">{label}</span>
  </button>
);

export default ActivityLog;
