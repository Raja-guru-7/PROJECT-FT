
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_ITEMS } from '../mockData';
import { ChevronLeft, ShieldCheck, Info, Calendar, MapPin, ArrowRight, Star, Loader2, Wallet, Users } from 'lucide-react';
import TrustBadge from '../components/TrustBadge';

const ItemDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = MOCK_ITEMS.find(i => i.id === id);
  const [isInitializing, setIsInitializing] = useState(false);
  const [days, setDays] = useState(2);
  const [securityStrategy, setSecurityStrategy] = useState<'insurance' | 'deposit'>('insurance');

  if (!item) return <div className="p-10 text-center font-bold text-slate-800">Item not found</div>;

  const handleCheckout = async () => {
    setIsInitializing(true);
    await new Promise(r => setTimeout(r, 2000));
    navigate('/handover/tx-1');
  };

  const rentalFee = item.pricePerDay * days;
  const trustBonus = 10;
  const depositAmount = item.depositAmount || 200;
  const insuranceFee = item.insuranceFee || 15;
  const totalDue = rentalFee + (securityStrategy === 'insurance' ? insuranceFee : 0) - trustBonus;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <button 
        type="button"
        onClick={() => navigate('/explore')} 
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        Back to Explore
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-8">
          <div className="rounded-3xl overflow-hidden soft-shadow">
            <img src={item.imageUrl} alt={item.title} className="w-full aspect-video object-cover" />
          </div>
          <div>
            <p className="font-semibold text-slate-500 mb-2">{item.category}</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 mb-4">{item.title}</h1>
            <div className="flex items-center gap-2 text-slate-600 font-semibold mb-6">
               <MapPin size={16} /> {item.location.address}
            </div>
            <p className="text-slate-600 leading-relaxed max-w-2xl">{item.description}</p>
          </div>
          <div className="bg-white rounded-3xl soft-shadow p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Item Provider</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={`https://picsum.photos/seed/${item.ownerId}/100`} className="w-16 h-16 rounded-full" alt={item.ownerName} />
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Owner: {item.ownerName}</h4>
                  <div className="flex items-center gap-2 text-sm font-bold text-green-700 mt-1">
                    <Star size={14} fill="currentColor" />
                    Trust Score: {(item.ownerTrustScore / 20).toFixed(1)}/5
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/profile')} className="px-5 py-2.5 bg-gray-100 text-slate-700 rounded-full font-bold text-sm hover:bg-gray-200">View Profile</button>
            </div>
          </div>
        </div>

        <div>
           <div className="sticky top-28 bg-white rounded-3xl soft-shadow p-8">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-slate-900">₹{item.pricePerDay}</span>
                <span className="text-slate-500 font-semibold">/ day</span>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Security</label>
                <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                  <button onClick={() => setSecurityStrategy('insurance')} className={`flex-1 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${securityStrategy === 'insurance' ? 'bg-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                    <ShieldCheck size={16} /> Insurance
                  </button>
                  <button onClick={() => setSecurityStrategy('deposit')} className={`flex-1 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 ${securityStrategy === 'deposit' ? 'bg-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
                    <Wallet size={16} /> Deposit
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Rental Duration</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                   <span className="font-bold text-slate-800">{days} Days</span>
                   <div className="flex gap-2">
                     <button onClick={() => setDays(d => Math.max(1, d - 1))} className="w-8 h-8 rounded-md bg-gray-200 hover:bg-gray-300">-</button>
                     <button onClick={() => setDays(d => d + 1)} className="w-8 h-8 rounded-md bg-gray-200 hover:bg-gray-300">+</button>
                   </div>
                </div>
              </div>

              <div className="space-y-3 py-4 border-t border-gray-100">
                <PriceRow label={`Rental fee (${days} days)`} value={`₹${rentalFee.toFixed(2)}`} />
                {securityStrategy === 'insurance' ? 
                  <PriceRow label="Trust Insurance" value={`₹${insuranceFee.toFixed(2)}`} /> :
                  <PriceRow label="Refundable Deposit" value={`₹${depositAmount.toFixed(2)}`} />
                }
                <PriceRow label="Network Bonus" value={`-₹${trustBonus.toFixed(2)}`} isBonus />
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-lg">Total</span>
                  <span className="font-black text-slate-900 text-2xl">₹{totalDue.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} disabled={isInitializing} className="w-full mt-6 bg-[#FF7A59] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg shadow-orange-200">
                 {isInitializing ? <Loader2 className="animate-spin" /> : 'Request Rental'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const PriceRow = ({ label, value, isBonus = false }: { label: string, value: string, isBonus?: boolean }) => (
  <div className={`flex justify-between items-center text-sm ${isBonus ? 'text-green-600' : 'text-slate-600'}`}>
    <span className="font-semibold">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export default ItemDetail;
