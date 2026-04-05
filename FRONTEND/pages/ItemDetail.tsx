import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Item } from '../types';
import { ChevronLeft, ShieldCheck, MapPin, Star, Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const cardStyle = {
  background: '#ffffff',
  borderRadius: '2rem',
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
};

const ItemDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [days, setDays] = useState(2);
  const [securityStrategy, setSecurityStrategy] = useState<'insurance' | 'deposit'>('insurance');

  // ✅ get logged-in user id from localStorage correctly
  const getLoggedInUserId = (): string => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return parsed.id || parsed._id || '';
      }
    } catch { }
    return localStorage.getItem('userId') || '';
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const data = await api.getItemById(id);
        setItem(data ?? null);
      } catch (err) {
        console.error('Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] z-10">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
        <span className="font-semibold text-slate-500 text-sm">Loading details...</span>
      </div>
    </div>
  );

  if (!item) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] z-10">
      <div style={{ ...cardStyle, padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
        <h2 className="text-xl font-bold text-slate-800">Asset Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">The requested asset ID does not exist in the registry.</p>
        <button
          onClick={() => navigate('/explore')}
          className="mt-6 px-6 py-3 rounded-full font-medium text-white bg-black hover:bg-slate-800 transition-colors w-full"
        >
          Return to Explore
        </button>
      </div>
    </div>
  );

  const handleInitializeProtocol = async () => {
    setIsInitializing(true);
    try {
      const token = localStorage.getItem('token');
      const lenderId = ownerId;
      const renterId = getLoggedInUserId();

      const payload = {
        productId: item.id,
        renterId,
        lenderId,
        totalPrice: totalDue,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + days * 86400000).toISOString()
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/transaction/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.status === 201 || res.status === 200) {
        localStorage.setItem('currentOTP', data.handoverOTP || data.transaction?.handoverOTP || data.otpCode);
        navigate(`/handover/${data._id || data.transaction?._id}`);
      } else {
        alert(data.msg || 'Transaction Failed');
      }
    } catch {
      alert('Network error. Transaction rejected.');
    } finally {
      setIsInitializing(false);
    }
  };

  const rentalFee = item.pricePerDay * days;
  const trustBonus = 10;
  const depositAmount = 200;
  const insuranceFee = 15;
  const totalDue = rentalFee + (securityStrategy === 'insurance' ? insuranceFee : 0) - trustBonus;

  // ✅ FIX: extract ownerId as clean string from populated owner object or plain string
  const rawOwner = item.owner || item.ownerId;
  const ownerId: string = typeof rawOwner === 'object' && rawOwner !== null
    ? (rawOwner._id || rawOwner.id || '').toString()
    : (rawOwner || '').toString();

  // ✅ FIX: use ownerAvatar mapped in api.ts, fallback to ui-avatars
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.ownerName || 'Unknown')}&background=0f172a&color=fff&size=128`;
  const ownerAvatar = item.ownerAvatar || fallbackAvatar;

  const loggedInUserId = getLoggedInUserId();
  const isOwnItem = !!(ownerId && loggedInUserId && ownerId === loggedInUserId);

  return (
    <div className="bg-[#F5F5F7] min-h-screen z-10 pt-4 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 lg:py-8">

        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Explore
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">

          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* Image */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="w-full aspect-[16/10] sm:aspect-video rounded-[2rem] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl} alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-slate-400 font-medium text-sm">No image available</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <p className="font-semibold text-slate-400 mb-2 text-xs uppercase tracking-wide">{item.category}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800 mb-4 leading-tight">{item.title}</h1>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 bg-white border border-slate-200 font-medium text-sm mb-6 shadow-sm">
                <MapPin size={16} className="text-slate-400" /> {item.location?.address || 'Location unavailable'}
              </div>

              <div className="relative pl-6 border-l-4 border-slate-200">
                <p className="text-slate-600 leading-relaxed max-w-2xl text-sm lg:text-base">{item.description}</p>
              </div>
            </motion.div>

            {/* Provider */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div style={cardStyle} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* ✅ FIX: real avatar from ownerAvatar field */}
                      <img
                        src={ownerAvatar}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                        alt={item.ownerName}
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackAvatar) e.currentTarget.src = fallbackAvatar;
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                        <ShieldCheck size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Provided By</h4>
                      <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        {item.ownerName || 'Unknown'}
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> {item.ownerTrustScore || 30}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* ✅ FIX: navigate with correct string ownerId */}
                  <button
                    onClick={() => ownerId ? navigate(`/user/${ownerId}`) : null}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full font-medium text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking Terminal */}
          <div className="lg:col-span-5 xl:col-span-4 mt-4 lg:mt-0">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sticky top-24">
              <div style={cardStyle} className="p-6 sm:p-8">

                <div className="mb-8">
                  <p className="text-sm font-medium text-slate-500 mb-1">Standard Rate</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">₹{item.pricePerDay}</span>
                    <span className="text-sm font-semibold text-slate-400">/ day</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Strategy Toggle */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-3 block">Security Option</label>
                    <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                      <button
                        onClick={() => setSecurityStrategy('insurance')}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${securityStrategy === 'insurance' ? 'bg-white text-black shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <ShieldCheck size={16} /> Insurance
                      </button>
                      <button
                        onClick={() => setSecurityStrategy('deposit')}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 ${securityStrategy === 'deposit' ? 'bg-white text-black shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Wallet size={16} /> Deposit
                      </button>
                    </div>
                  </div>

                  {/* Days */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-3 block">Duration</label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-800 ml-3">{days} <span className="text-slate-400 font-medium">days</span></span>
                      <div className="flex gap-1">
                        <button onClick={() => setDays(d => Math.max(1, d - 1))}
                          className="w-10 h-10 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-lg transition-colors">-</button>
                        <button onClick={() => setDays(d => d + 1)}
                          className="w-10 h-10 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-lg transition-colors">+</button>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 py-6 border-t border-b border-slate-100">
                    <PriceRow label={`Base Rent (${days} days)`} value={`₹${rentalFee.toFixed(2)}`} />
                    {securityStrategy === 'insurance'
                      ? <PriceRow label="Protection Plan" value={`₹${insuranceFee.toFixed(2)}`} />
                      : <PriceRow label="Refundable Deposit" value={`₹${depositAmount.toFixed(2)}`} />
                    }
                    <PriceRow label="Trust Bonus" value={`-₹${trustBonus.toFixed(2)}`} isBonus />
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-slate-600 text-sm">Total Due</span>
                    <span className="font-bold text-slate-800 text-2xl">₹{totalDue.toFixed(2)}</span>
                  </div>

                  {/* ✅ FIX: correct own-item check using string IDs */}
                  {isOwnItem ? (
                    <div className="text-center text-sm font-medium text-slate-400 py-4 bg-slate-50 rounded-xl border border-slate-100">
                      This is your own asset
                    </div>
                  ) : (
                    <button
                      onClick={handleInitializeProtocol}
                      disabled={isInitializing}
                      className="w-full py-4 mt-2 rounded-full font-semibold text-white flex items-center justify-center gap-2 transition-all bg-black hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                    >
                      {isInitializing ? <Loader2 className="animate-spin" size={20} /> : 'Proceed to Checkout'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({ label, value, isBonus = false }: { label: string; value: string; isBonus?: boolean }) => (
  <div className={`flex justify-between items-center text-sm font-medium ${isBonus ? 'text-green-600' : 'text-slate-500'}`}>
    <span>{label}</span>
    <span className={isBonus ? 'font-semibold' : 'text-slate-800'}>{value}</span>
  </div>
);

export default ItemDetail;