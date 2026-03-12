import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Item } from '../types';
import { ChevronLeft, ShieldCheck, MapPin, Star, Loader2, Wallet } from 'lucide-react';

const ItemDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [days, setDays] = useState(2);
  const [securityStrategy, setSecurityStrategy] = useState<'insurance' | 'deposit'>('insurance');

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const data = await api.getItemById(id);
        setItem(data);
      } catch (err) {
        console.error('Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-[#093E28]" size={40} />
    </div>
  );

  if (!item) return (
    <div className="p-10 text-center font-bold text-slate-800">Item not found</div>
  );

  const handleCheckout = async () => {
    setIsInitializing(true);
    try {
      const token = localStorage.getItem('token');

      // ownerId — product model-la 'owner' field, api response-la item.owner irukum
      const ownerId = (item as any).owner || (item as any).ownerId;

      const res = await fetch('http://localhost:5000/api/transaction/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: JSON.stringify({
          itemId: item.id,
          itemTitle: item.title,
          ownerId: ownerId,          // ✅ NOW SENDING ownerId
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + days * 86400000).toISOString(),
          totalAmount: totalDue
        })
      });
      const json = await res.json();
      if (res.ok) {
        localStorage.setItem('currentOTP', json.otpCode);  // ✅ ADD HERE
  navigate(`/handover/${json.transaction._id}`);
      } else {
        alert(json.msg || 'Failed to create transaction');
      }
    } catch {
      alert('Server error. Try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const rentalFee = item.pricePerDay * days;
  const trustBonus = 10;
  const depositAmount = 200;
  const insuranceFee = 15;
  const totalDue = rentalFee + (securityStrategy === 'insurance' ? insuranceFee : 0) - trustBonus;

  const ownerAvatar = `https://ui-avatars.com/api/?name=${item.ownerName || 'Owner'}&background=093E28&color=fff&size=128`;

  // ownerId for navigation — product model 'owner' field
  const ownerId = (item as any).owner || (item as any).ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button
        type="button"
        onClick={() => navigate('/explore')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ChevronLeft size={20} /> Back to Explore
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:gap-16">
        <div className="space-y-8">
          {/* Item Image */}
          <div className="rounded-3xl overflow-hidden soft-shadow bg-gray-100">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-slate-400 font-bold text-xl">
                No Image
              </div>
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-500 mb-2 text-sm sm:text-base">{item.category}</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-3 sm:mb-4">{item.title}</h1>
            <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm sm:text-base">
              <MapPin size={14} className="sm:size-16" /> {item.location?.address || 'Location not set'}
            </div>
            <p className="text-slate-600 leading-relaxed max-w-2xl text-sm sm:text-base">{item.description}</p>
          </div>

          {/* Owner Card */}
          <div className="bg-white rounded-3xl soft-shadow p-4 sm:p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Item Provider</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={ownerAvatar}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  alt={item.ownerName}
                />
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-800">{item.ownerName || 'Unknown Owner'}</h4>
                  <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-green-700 mt-1">
                    <Star size={14} fill="currentColor" />
                    Trust Score: {item.ownerTrustScore || 30}
                  </div>
                </div>
              </div>
              <button
                onClick={() => ownerId ? navigate(`/user/${ownerId}`) : null}
                className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-100 text-slate-700 rounded-full font-bold text-sm hover:bg-gray-200"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        {/* Booking Panel */}
        <div>
          <div className="sticky top-20 sm:top-28 bg-white rounded-3xl soft-shadow p-6 sm:p-8">
            <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">₹{item.pricePerDay}</span>
              <span className="text-sm sm:text-base text-slate-500 font-semibold">/ day</span>
            </div>

            {/* Security Toggle */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-600 mb-2 block">Security</label>
              <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                <button
                  onClick={() => setSecurityStrategy('insurance')}
                  className={`flex-1 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${securityStrategy === 'insurance' ? 'bg-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <ShieldCheck size={16} /> Insurance
                </button>
                <button
                  onClick={() => setSecurityStrategy('deposit')}
                  className={`flex-1 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${securityStrategy === 'deposit' ? 'bg-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Wallet size={16} /> Deposit
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-600 mb-2 block">Rental Duration</label>
              <div className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-xl border border-gray-200">
                <span className="font-bold text-sm sm:text-base text-slate-800">{days} Days</span>
                <div className="flex gap-2">
                  <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-gray-200 hover:bg-gray-300 font-bold text-sm sm:text-base">-</button>
                  <button onClick={() => setDays(d => d + 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-gray-200 hover:bg-gray-300 font-bold text-sm sm:text-base">+</button>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 py-3 sm:py-4 border-t border-gray-100">
              <PriceRow label={`Rental fee (${days} days)`} value={`₹${rentalFee.toFixed(2)}`} />
              {securityStrategy === 'insurance' ?
                <PriceRow label="Trust Insurance" value={`₹${insuranceFee.toFixed(2)}`} /> :
                <PriceRow label="Refundable Deposit" value={`₹${depositAmount.toFixed(2)}`} />
              }
              <PriceRow label="Network Bonus" value={`-₹${trustBonus.toFixed(2)}`} isBonus />
              <div className="pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-base sm:text-lg">Total</span>
                <span className="font-black text-slate-900 text-xl sm:text-2xl">₹{totalDue.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isInitializing}
              className="w-full mt-4 sm:mt-6 bg-[#FF7A59] text-white py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg shadow-orange-200 disabled:opacity-50"
            >
              {isInitializing ? <Loader2 className="animate-spin" /> : 'Request Rental'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({ label, value, isBonus = false }: { label: string; value: string; isBonus?: boolean }) => (
  <div className={`flex justify-between items-center text-sm ${isBonus ? 'text-green-600' : 'text-slate-600'}`}>
    <span className="font-semibold">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export default ItemDetail;
