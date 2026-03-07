
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Search, Plus } from 'lucide-react';
import { MOCK_ITEMS } from '../mockData';

const SavedAssets: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const baseSavedItems = useMemo(() => MOCK_ITEMS.slice(0, 4), []);

  const filteredItems = useMemo(() => {
    return baseSavedItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, baseSavedItems]);

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
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Saved Items</h1>
          <p className="mt-4 text-lg text-slate-600">Your curated list of items for future rentals.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search saved items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 pl-12 pr-4 font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.map(item => (
          <Link key={item.id} to={`/item/${item.id}`} className="group block">
            <div className="bg-white rounded-3xl soft-shadow soft-shadow-hover transition-all h-full flex flex-col">
              <div className="relative aspect-square overflow-hidden rounded-t-3xl">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-[#093E28]">{item.title}</h3>
                  <div className="flex items-center gap-1 text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md w-fit mb-2">
                    <Star size={12} fill="currentColor" /> {item.ownerTrustScore}% Trust
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <MapPin size={12} /> {item.location.address}
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <span className="text-xl font-black text-slate-900">₹{item.pricePerDay}</span>
                  <span className="text-sm text-slate-500 font-semibold">/day</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="font-semibold text-slate-500">No matching items found in your saved list.</p>
          </div>
        )}

        <Link to="/explore" className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-center text-slate-500 hover:border-[#093E28] hover:text-[#093E28] transition-all min-h-[300px]">
           <div className="w-16 h-16 bg-gray-100 group-hover:bg-green-50 rounded-full flex items-center justify-center mb-4">
             <Plus size={32} />
           </div>
           <p className="font-bold">Find More Items</p>
           <p className="text-sm">Explore the network</p>
        </Link>
      </div>
    </div>
  );
};

export default SavedAssets;
