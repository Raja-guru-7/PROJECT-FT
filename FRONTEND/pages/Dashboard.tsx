import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Transaction, User } from '../types';
import { ArrowRight, Clock, TrendingUp, PlusCircle, CheckCircle2, ShieldCheck, Loader2, Cpu, Lock, AlertCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import PeerShareChat from '../components/PeerShareChat';

interface DashboardProps {
  role: 'RENTER' | 'OWNER';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'renting' | 'lending'>(role === 'OWNER' ? 'lending' : 'renting');

  const [allTxs, setAllTxs] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAssets, setSavedAssets] = useState<any[]>([]);

  const [activeChatTx, setActiveChatTx] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    setTab(role === 'OWNER' ? 'lending' : 'renting');
  }, [role]);

  useEffect(() => {
    if (role !== 'OWNER') return;
    const pollForHandoverReady = async () => {
      try {
        const txs = await api.getTransactions('OWNER');
        const handoverTx = txs.find((tx: any) =>
          (tx.status === 'HANDOVER_IN_PROGRESS' || tx.status === 'OTP_VERIFIED') && !tx.ownerVideoUrl
        );
        if (handoverTx) {
          navigate(`/handover/${handoverTx.id || handoverTx._id}`);
        }
      } catch (err) { }
    };
    const interval = setInterval(pollForHandoverReady, 5000);
    return () => clearInterval(interval);
  }, [role, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rData, oData, userData, savedAssetsData] = await Promise.all([
        api.getTransactions('RENTER').catch(() => []),
        api.getTransactions('OWNER').catch(() => []),
        api.getCurrentUser().catch(() => null),
        api.getSavedAssets().catch(() => [])
      ]);

      const combined = [...rData, ...oData];
      const unique = Array.from(new Map(combined.map(item => [item._id || item.id, item])).values());

      setAllTxs(unique as any);
      if (userData) setCurrentUser(userData);
      setSavedAssets(savedAssetsData);
    } catch (err) {
      console.error('Terminal error reading ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handler = async () => {
      try {
        const userData = await api.getCurrentUser();
        setCurrentUser(userData);
      } catch { }
    };
    window.addEventListener('user-updated', handler as EventListener);
    return () => window.removeEventListener('user-updated', handler as EventListener);
  }, []);

  const storedUserRaw = localStorage.getItem('user');
  const storedUser = storedUserRaw ? (() => { try { return JSON.parse(storedUserRaw); } catch { return null; } })() : null;
  const currentUserId = String(currentUser?._id || currentUser?.id || storedUser?._id || storedUser?.id || localStorage.getItem('userId'));

  const filteredTransactions = allTxs.filter((tx: any) => {
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(tx.status)) return false;

    const oId = String(tx?.ownerId?._id || tx?.ownerId?.id || tx?.ownerId);
    const rId = String(tx?.renterId?._id || tx?.renterId?.id || tx?.renterId);

    if (tab === 'renting') return rId === currentUserId;
    if (tab === 'lending') return oId === currentUserId;
    return false;
  });

  return (
    <div className="min-h-screen w-full px-4 md:px-8 py-6 sm:py-8 lg:py-12 overflow-hidden relative z-10 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-800">Dashboard</h1>
            <p className="mt-1 sm:mt-2 text-slate-500 text-xs sm:text-sm font-medium">Manage your active contracts and assets.</p>
          </div>
          <div className="flex bg-white p-1 sm:p-1.5 rounded-full shadow-sm border border-slate-100 w-full sm:w-auto">
            <button onClick={() => setTab('renting')} className={`flex-1 sm:w-32 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${tab === 'renting' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
              Allocated
            </button>
            <button onClick={() => setTab('lending')} className={`flex-1 sm:w-32 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${tab === 'lending' ? 'bg-black text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
              Deployed
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 xl:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2 px-1">
              <Cpu size={18} className="text-slate-400 sm:w-5 sm:h-5" />
              {tab === 'renting' ? 'Active Contracts' : 'Deployed Assets'}
            </motion.h2>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-20 sm:py-32">
                  <Loader2 className="animate-spin text-slate-400 sm:w-10 sm:h-10" size={32} />
                </motion.div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx: any, i: number) => {
                  const isOwner = tab === 'lending';
                  const needsHandover = ['REQUESTED', 'PENDING_OTP', 'HANDOVER_IN_PROGRESS', 'OTP_VERIFIED', 'IN_PROGRESS'].includes(tx.status);
                  const needsReturn = ['RETURN_INITIATED', 'RETURN_IN_PROGRESS'].includes(tx.status);
                  const isReadyForReturn = ['ACTIVE', 'HANDOVER_COMPLETED', 'PICKED_UP'].includes(tx.status);

                  return (
                    <motion.div key={tx._id || tx.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div
                        onClick={() => {
                          if (tx.status === 'ACTIVE' || tx.status.includes('RETURN') || tx.status === 'COMPLETED') {
                            navigate(`/return/${tx._id || tx.id}`);
                          } else {
                            navigate(`/handover/${tx._id || tx.id}`);
                          }
                        }}
                        className="p-5 sm:p-6 md:p-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="w-full sm:w-auto">
                            <div className="inline-block px-2.5 sm:px-3 py-1 mb-2 sm:mb-3 rounded-full bg-slate-100 border border-slate-200 group-hover:bg-black group-hover:border-black transition-colors">
                              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-600 uppercase group-hover:text-white transition-colors">
                                {tx.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight group-hover:text-black transition-colors">{tx.itemTitle}</h3>
                          </div>
                          <div className="text-left sm:text-right bg-slate-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100 w-full sm:w-auto mt-2 sm:mt-0">
                            <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5 sm:mb-1">Value</p>
                            <p className="text-lg sm:text-xl font-bold text-slate-800">₹{tx.totalAmount}</p>
                          </div>
                        </div>

                        <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500">
                            <Clock size={14} className="sm:w-4 sm:h-4" />
                            <span>Ends: {tx.endDate ? new Date(tx.endDate).toLocaleDateString() : 'TBD'}</span>
                          </div>

                          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            {needsReturn ? (
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/return/${tx._id || tx.id}`); }} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors text-center">
                                {isOwner ? 'Verify Return' : 'Return Tracking'}
                              </button>
                            ) : needsHandover ? (
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/handover/${tx._id || tx.id}`); }} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors text-center">
                                {isOwner ? 'Manage Handover' : 'Complete Handover'}
                              </button>
                            ) : isReadyForReturn ? (
                              <button onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await api.initiateReturn(tx._id || tx.id);
                                  navigate(`/return/${tx._id || tx.id}`);
                                } catch (err) { alert('Failed to initiate return.'); }
                              }} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors text-center">
                                Initiate Return
                              </button>
                            ) : (
                              <button onClick={(e) => {
                                e.stopPropagation();
                                if (tx.status === 'ACTIVE' || tx.status.includes('RETURN') || tx.status === 'COMPLETED') {
                                  navigate(`/return/${tx._id || tx.id}`);
                                } else {
                                  navigate(`/handover/${tx._id || tx.id}`);
                                }
                              }} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium hover:bg-slate-200 transition-colors text-center">
                                Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-100 p-6 sm:p-16 rounded-[1.5rem] sm:rounded-[2rem] text-center shadow-sm">
                  {tab === 'lending' ? (
                    <>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-slate-100">
                        <PlusCircle className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">No Assets Deployed</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">Start sharing your items with the community.</p>
                      <button onClick={() => navigate('/add')} className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-slate-800 w-full sm:w-auto">Deploy Asset</button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mb-4 px-4">No Active Contracts Found</p>
                      <button onClick={() => navigate('/explore')} className="px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-slate-800 w-full sm:w-auto">Explore Items</button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5 sm:space-y-6 mt-2 lg:mt-0">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div onClick={() => navigate('/trust')} className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-0.5 sm:mb-1">Reputation</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">Your network standing</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-black transition-colors">
                    <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex items-end gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="text-5xl sm:text-6xl font-bold text-slate-800 tracking-tight leading-none">{currentUser?.trustScore || 30}</span>
                  <div className="text-slate-500 font-semibold flex items-center gap-1 text-[10px] sm:text-xs pb-1 sm:pb-2 uppercase">
                    <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" /> Score
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs font-semibold bg-slate-50 text-slate-700 p-2.5 sm:p-3 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <CheckCircle2 size={14} className={`sm:w-4 sm:h-4 ${(currentUser?.trustScore || 30) >= 80 ? "text-green-500" : "text-amber-500"}`} />
                  {(currentUser?.trustScore || 30) >= 80 ? "Trusted Node (Elite)" : "Standard Clearance"}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-800 mb-0.5 sm:mb-1">Messages</h3>
                    <p className="text-[10px] sm:text-xs text-slate-500">Active transaction chats</p>
                  </div>
                  <MessageSquare size={16} className="text-slate-400" />
                </div>
                <div className="space-y-2">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx: any) => (
                      <div
                        key={tx._id || tx.id}
                        onClick={() => setActiveChatTx({ id: tx._id || tx.id, title: tx.itemTitle })}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          <span className="text-sm">💬</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate group-hover:text-black transition-colors">{tx.itemTitle}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 truncate">Tap to open chat</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-black transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <p className="text-[10px] sm:text-xs text-slate-400">No active chats.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeChatTx && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[130px] left-[5%] right-[5%] w-[90%] h-[60vh] max-h-[450px] md:right-auto md:left-8 lg:left-12 md:bottom-24 md:w-[350px] md:h-[450px] z-[9999] shadow-2xl rounded-[2rem] overflow-hidden bg-white border border-slate-100"
          >
            <PeerShareChat
              transactionId={activeChatTx.id}
              currentUser={currentUser?.name || 'User'}
              isHandoverMode={false}
              chatTitle={activeChatTx.title}
              onClose={() => setActiveChatTx(null)}
              receiverId={(() => {
                const tx: any = allTxs.find((t: any) => (t._id || t.id) === activeChatTx.id);
                if (!tx) return undefined;
                const ownerIdStr = String(tx.ownerId?._id || tx.ownerId?.id || tx.ownerId);
                const isOwner = ownerIdStr === currentUserId;
                const receiver = isOwner ? tx.renterId : tx.ownerId;
                return typeof receiver === 'object' ? (receiver?._id || receiver?.id || '') : String(receiver);
              })()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;