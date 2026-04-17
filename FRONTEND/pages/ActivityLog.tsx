import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Video, Search, Loader2, X, Play } from 'lucide-react';
import { api } from '../services/api';
import { Transaction, User } from '../types';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '1.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

export const ActivityLog: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{ url: string; label: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = await api.getCurrentUser().catch(() => null);
        if (user) setCurrentUser(user);

        const [rTxs, oTxs] = await Promise.all([
          api.getTransactions('RENTER').catch(() => []),
          api.getTransactions('OWNER').catch(() => [])
        ]);
        const all = [...rTxs, ...oTxs];
        const unique = Array.from(new Map(all.map(item => [item._id || item.id, item])).values());

        setTransactions(unique);
      }
      catch (err) { console.error('Failed to fetch transactions'); }
      finally { setLoading(false); }
    };
    fetchTransactions();
  }, []);

  const filteredLogs = useMemo(() => transactions.filter(tx =>
    tx.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, transactions]);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] pb-24 relative">
      <button type="button" onClick={() => navigate(-1)} className="absolute top-4 sm:top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-14 sm:pt-12 pb-8">

        {/* Video Modal */}
        {videoModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div style={cardStyle} className="max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-xs">{videoModal.label}</p>
                <button onClick={() => setVideoModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="bg-slate-900 w-full flex justify-center">
                <video src={videoModal.url} controls autoPlay className="w-full max-h-[60vh]" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 mt-4 sm:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-800">Activity Log</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 font-medium">A secure audit trail of all your network transactions.</p>
          </div>
          <div className="relative w-full md:w-72 mt-2 md:mt-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by item or TX ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 sm:py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors shadow-sm"
              style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
          </div>
        </div>

        <div style={cardStyle} className="overflow-hidden bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-20 sm:py-32"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Item / Transaction ID', 'Proofs', 'Status', 'Amount'].map((h, i) => (
                      <th key={h} className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        style={{ textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 👇 FIX: Added proper parentheses around the map logic to fix the ts(1005) error 👇 */}
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map(tx => {
                      const currentUserIdStr = String(currentUser?._id || currentUser?.id);
                      const ownerIdStr = String((tx as any).ownerId?._id || (tx as any).ownerId);
                      const isOwnerNow = ownerIdStr === currentUserIdStr;

                      return (
                        <tr key={tx.id || tx._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 sm:py-5">
                            <p className="font-semibold text-sm sm:text-base text-slate-800 mb-1">{tx.itemTitle}</p>
                            <p className="text-[10px] sm:text-xs font-mono text-slate-400">{tx.id || tx._id}</p>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <ProofButton icon={<Video size={14} />} label="Handover Proof" hasVideo={!!(tx as any).renterVideoUrl}
                                onClick={() => { const u = (tx as any).renterVideoUrl; if (u) setVideoModal({ url: u, label: `Handover — ${tx.itemTitle}` }); }} />
                              <ProofButton icon={<Video size={14} />} label="Return Proof" hasVideo={!!(tx as any).ownerVideoUrl}
                                onClick={() => { const u = (tx as any).ownerVideoUrl; if (u) setVideoModal({ url: u, label: `Return — ${tx.itemTitle}` }); }} />
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-5">
                            {getStatusBadge(tx.status)}

                            {tx.status === 'HANDOVER_IN_PROGRESS' && !isOwnerNow && (
                              <button onClick={() => navigate(`/handover/${tx.id || tx._id}`)} className="mt-3 block px-3 sm:px-4 py-1.5 bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-wide font-bold rounded-full hover:bg-slate-800 shadow-sm">
                                Complete Handover
                              </button>
                            )}
                            {tx.status === 'RETURN_IN_PROGRESS' && isOwnerNow && (
                              <button onClick={() => navigate(`/return/${tx.id || tx._id}`)} className="mt-3 block px-3 sm:px-4 py-1.5 bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-wide font-bold rounded-full hover:bg-slate-800 shadow-sm">
                                Complete Return
                              </button>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                            <p className="font-bold text-slate-800 text-sm sm:text-base">₹{tx.totalAmount}</p>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 sm:py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="text-slate-300 mb-3" size={40} />
                          <p className="font-medium text-slate-500 text-sm sm:text-base">
                            {searchQuery ? 'No matching activity found.' : 'No transactions yet — start renting!'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusStyles = (status: string) => {
  let bg = '#fffbeb'; let text = '#b45309'; let border = '#fde68a'; let dot = '#f59e0b';
  if (status === 'ACTIVE' || status === 'COMPLETED') {
    bg = '#f0fdf4'; text = '#15803d'; border = '#bbf7d0'; dot = '#22c55e';
  } else if (status === 'OTP_VERIFIED' || status === 'HANDOVER_IN_PROGRESS' || status === 'RETURN_IN_PROGRESS' || status === 'RETURN_INITIATED') {
    bg = '#0f172a'; text = '#ffffff'; border = '#0f172a'; dot = '#ffffff';
  } else if (status === 'REQUESTED' || status === 'PENDING_OTP') {
    bg = '#f8fafc'; text = '#475569'; border = '#e2e8f0'; dot = '#94a3b8';
  }
  return { bg, text, border, dot };
};

const getStatusBadge = (status: string) => {
  const styles = getStatusStyles(status);
  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap"
      style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}>
      <div className={`w-1.5 h-1.5 rounded-full ${status.includes('IN_PROGRESS') || status === 'OTP_VERIFIED' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: styles.dot }} />
      {status.replace(/_/g, ' ')}
    </div>
  );
}

const ProofButton = ({ icon, label, hasVideo, onClick }: { icon: React.ReactNode; label: string; hasVideo: boolean; onClick: () => void }) => (
  <button onClick={onClick} disabled={!hasVideo}
    className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all border w-full sm:w-auto ${hasVideo
      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer'
      : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
      }`}>
    {icon}
    <span>{label}</span>
    {hasVideo && <Play size={10} className="ml-1 text-slate-400" />}
  </button>
);

export default ActivityLog;