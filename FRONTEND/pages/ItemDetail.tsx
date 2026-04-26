import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, ShieldCheck, MapPin, Star, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const cardStyle = {
  background: '#ffffff',
  borderRadius: '2rem',
  border: '1px solid #f1f5f9',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
};

const ItemDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [days, setDays] = useState(2);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'normal' | 'escrow'>('normal');

  const [isOwnItem, setIsOwnItem] = useState(false);

  useEffect(() => {
    const fetchItemAndCheckOwner = async () => {
      if (!id) return;
      try {
        // 1. Fetch mapped data from existing API
        const mappedData = await api.getItemById(id);

        // 🔥 THE ULTIMATE HACKER BYPASS 🔥
        // api.ts file is secretly dropping the new deposit fields because it maps only old fields.
        // We directly fetch the RAW database document to force the deposit amounts to come through!
        const API_URL = import.meta.env.VITE_API_URL || 'https://aroundu-backend-hd26.onrender.com';
        const rawResponse = await fetch(`${API_URL}/api/product/${id}`);
        const rawData = await rawResponse.json();

        // Merge raw backend data with frontend mapped data
        const finalData = { ...mappedData, ...rawData, id: mappedData?.id || rawData?._id };

        setItem(finalData ?? null);

        if (finalData) {
          const dbPaymentMode = String(finalData.paymentMode || '').toLowerCase().trim();
          if (dbPaymentMode.includes('escrow')) {
            setSelectedPaymentMode('escrow');
          } else {
            setSelectedPaymentMode('normal');
          }
        }

        let loggedInId = '';
        let loggedInName = '';

        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            loggedInId = String(u.id || u._id || '');
            loggedInName = String(u.name || u.username || '').toLowerCase().trim();
          }
        } catch (e) { }

        if (!loggedInId) {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              loggedInId = String(payload.id || payload._id || payload.user?.id || payload.userId || '');
            }
          } catch (e) { }
        }

        const ownerId = String(finalData?.owner?._id || finalData?.owner?.id || finalData?.ownerId || finalData?.owner || '');
        const ownerName = String(finalData?.ownerName || finalData?.owner?.name || '').toLowerCase().trim();

        if ((loggedInId && ownerId && loggedInId === ownerId) ||
          (loggedInName && ownerName && loggedInName === ownerName)) {
          setIsOwnItem(true);
        } else {
          setIsOwnItem(false);
        }

      } catch (err) {
        console.error('Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndCheckOwner();
  }, [id]);

  const getLoggedInUserId = (): string => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        return String(parsed.id || parsed._id || '');
      }
    } catch { }
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return String(payload.id || payload._id || payload.user?.id || payload.userId || '');
      }
    } catch (e) { }
    return String(localStorage.getItem('userId') || localStorage.getItem('currentUserId') || '');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const rentalFee = (item?.pricePerDay || 0) * days;
  const trustBonus = 10;

  // 🔥 DIRECT EXTRACTION FROM RAW DATA
  const escrowDeposit = Number(item?.escrowDepositAmount) || Number(item?.insuranceDeposit) || Number(item?.securityDeposit) || 0;

  const totalDue = rentalFee + (selectedPaymentMode === 'escrow' ? escrowDeposit : 0) - trustBonus;

  const handleCheckoutProcess = async () => {
    setIsInitializing(true);

    const token = localStorage.getItem('token');
    let renterId = getLoggedInUserId();

    if (!renterId) {
      alert('Authentication missing. Please login again.');
      navigate('/login');
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Check your connection.');
      setIsInitializing(false);
      return;
    }

    const rawOwner = item.owner || item.ownerId;
    const finalOwnerId = String(typeof rawOwner === 'object' && rawOwner !== null ? (rawOwner._id || rawOwner.id || '') : (rawOwner || ''));

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: totalDue * 100,
      currency: "INR",
      name: "AroundU",
      description: selectedPaymentMode === 'escrow' ? "Escrow Payment" : "Rental Payment",
      image: "https://img.icons8.com/fluency/128/shield.png",
      handler: async function (response: any) {
        try {
          if (selectedPaymentMode === 'escrow') {
            localStorage.setItem('demo_escrow_amount', String(escrowDeposit));
          }

          const payload = {
            productId: item.id, lenderId: finalOwnerId, renterId: renterId, totalPrice: totalDue,
            itemId: item.id, itemTitle: item.title, ownerId: finalOwnerId, totalAmount: totalDue,
            startDate: new Date().toISOString(), endDate: new Date(Date.now() + days * 86400000).toISOString(),
            paymentId: response.razorpay_payment_id,
            transactionType: selectedPaymentMode,
            escrowDepositAmount: selectedPaymentMode === 'escrow' ? escrowDeposit : 0
          };

          const API_URL = import.meta.env.VITE_API_URL || 'https://aroundu-backend-hd26.onrender.com';
          const apiRes = await fetch(`${API_URL}/api/transaction/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
          });

          const data = await apiRes.json();

          if (apiRes.status === 201 || apiRes.status === 200) {
            localStorage.setItem('currentOTP', data.handoverOTP || data.transaction?.handoverOTP || data.otpCode || '1234');
            navigate(`/handover/${data._id || data.transaction?._id}`);
          } else {
            alert(data.msg || 'Database Transaction Failed after payment');
          }
        } catch (err) { alert('Backend error after successful payment.'); }
        finally { setIsInitializing(false); }
      },
      prefill: {
        name: "AroundU User",
        email: "user@aroundu.online",
        contact: "9999999999"
      },
      theme: {
        color: "#121212",
        backdrop_color: "#000000a6",
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      alert("Payment Failed: " + response.error.description);
      setIsInitializing(false);
    });
    paymentObject.open();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] z-10"><Loader2 className="animate-spin text-slate-400" size={40} /></div>
  );

  if (!item) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] z-10 px-4">
      <div style={{ ...cardStyle, padding: '2rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h2 className="text-xl font-bold text-slate-800">Asset Not Found</h2>
        <button onClick={() => navigate('/explore')} className="mt-4 px-6 py-3 rounded-full text-white bg-black hover:bg-slate-800 w-full">Return to Explore</button>
      </div>
    </div>
  );

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.ownerName || item.owner?.name || 'Unknown')}&background=0f172a&color=fff&size=128`;
  const ownerAvatar = item.ownerAvatar || fallbackAvatar;

  return (
    <div className="bg-[#F5F5F7] min-h-screen z-10 pt-4 sm:pt-8 pb-24 relative">
      <button onClick={() => navigate('/explore')} className="absolute top-4 left-4 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 z-20 md:hidden bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm"><ChevronLeft size={16} /> Back</button>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 lg:py-8 mt-10 md:mt-0">
        <button onClick={() => navigate('/explore')} className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 group"><ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Explore</button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-white p-2 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="w-full aspect-[4/3] sm:aspect-video rounded-[1rem] sm:rounded-[2rem] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /> : <span className="text-slate-400">No image</span>}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <p className="font-semibold text-slate-400 mb-1 text-[10px] sm:text-xs uppercase tracking-wide">{item.category}</p>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 leading-tight">{item.title}</h1>

              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-[10px] sm:text-xs mb-4 shadow-sm border ${selectedPaymentMode === 'escrow' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {selectedPaymentMode === 'escrow' ? <ShieldCheck size={14} /> : <CreditCard size={14} />}
                {selectedPaymentMode === 'escrow' ? 'Strict Escrow Protected' : 'Standard Payment'}
              </div>

              <div className="relative pl-4 sm:pl-6 border-l-2 sm:border-l-4 border-slate-200">
                <p className="text-slate-600 leading-relaxed max-w-2xl text-xs sm:text-sm lg:text-base">{item.description}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div style={cardStyle} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={ownerAvatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-100" alt={item.ownerName} />
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wide">Provided By</h4>
                      <div className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                        {item.ownerName || item.owner?.name || 'Unknown'} <span className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-1"><Star size={10} fill="currentColor" /> {item.ownerTrustScore || 30}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/profile`)} className="w-full sm:w-auto px-4 py-2 rounded-full font-medium text-xs sm:text-sm text-slate-600 bg-slate-50 border border-slate-200">View Profile</button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 mt-2 sm:mt-4 lg:mt-0">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sticky top-20 sm:top-24">
              <div style={{ ...cardStyle, background: '#252525', borderColor: '#333' }} className="p-5 sm:p-6 md:p-8 text-white">

                <div className="mb-6">
                  <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1">Standard Rate</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">₹{item.pricePerDay}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">/ day</span>
                  </div>
                </div>

                <div className="space-y-5 sm:space-y-6">

                  <div>
                    <label className="text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3 block">Duration</label>
                    <div className="flex items-center justify-between p-1.5 rounded-xl bg-[#1a1a1a] border border-[#333]">
                      <span className="font-semibold text-white ml-2 text-sm">{days} <span className="text-slate-400 font-medium">days</span></span>
                      <div className="flex gap-1">
                        <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-8 h-8 rounded-lg bg-[#333] border border-[#444] hover:bg-[#444] flex items-center justify-center font-bold text-base">-</button>
                        <button onClick={() => setDays(d => d + 1)} className="w-8 h-8 rounded-lg bg-[#333] border border-[#444] hover:bg-[#444] flex items-center justify-center font-bold text-base">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 py-4 border-t border-b border-[#444]">
                    <div className="text-xs tracking-wider text-slate-400 uppercase font-bold mb-4">What Renter Sees At Checkout</div>
                    <PriceRow label={`Base rent (${days} days)`} value={`₹${rentalFee.toFixed(2)}`} />
                    <PriceRow label="Payment mode" value={selectedPaymentMode === 'escrow' ? 'Escrow protected' : 'Normal checkout'} />
                    {selectedPaymentMode === 'escrow' && <PriceRow label="Security Deposit (Refundable)" value={`₹${escrowDeposit.toFixed(2)}`} />}
                    <PriceRow label="Trust bonus" value={`-₹${trustBonus.toFixed(2)}`} isBonus />
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-white text-sm">Total due</span>
                    <span className="font-bold text-white text-xl sm:text-2xl">₹{totalDue.toFixed(2)}</span>
                  </div>

                  {isOwnItem ? (
                    <div className="w-full py-3.5 sm:py-4 mt-2 rounded-full text-sm font-bold bg-red-500/10 text-red-400 flex items-center justify-center gap-2 border border-red-500/20 shadow-inner cursor-not-allowed">
                      <AlertCircle size={18} />
                      You cannot rent your own asset
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckoutProcess}
                      disabled={isInitializing}
                      className="w-full py-3.5 sm:py-4 mt-2 rounded-full text-sm font-bold text-black flex items-center justify-center gap-2 bg-white hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-colors"
                    >
                      {isInitializing ? <Loader2 className="animate-spin text-black" size={18} /> : (selectedPaymentMode === 'escrow' ? 'Pay via Escrow' : 'Pay Direct')}
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
  <div className={`flex justify-between items-center text-xs sm:text-sm font-medium ${isBonus ? 'text-emerald-400' : 'text-slate-300'}`}>
    <span>{label}</span>
    <span className={isBonus ? 'font-bold' : 'text-white'}>{value}</span>
  </div>
);

export default ItemDetail;