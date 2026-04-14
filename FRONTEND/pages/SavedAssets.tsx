import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Plus, Heart, Loader2, Star, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { Item } from '../types';

export const SavedAssets: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        let items: Item[] = [];
        try {
          items = await api.getSavedAssets();
        } catch (backendError) {
          const userStr = localStorage.getItem('user');
          const savedIds = userStr ? JSON.parse(userStr).savedAssets || [] : [];

          if (savedIds.length > 0) {
            const allItems = await api.getItems({});
            items = allItems.filter((item: Item) => savedIds.includes(item.id));
          }
        }
        setSavedItems(items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleRemoveSaved = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. INSTANT UI REMOVAL 
    setSavedItems(prev => prev.filter(item => item.id !== productId));

    // 2. INSTANT LOCAL STORAGE UPDATE
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.savedAssets) {
        userObj.savedAssets = userObj.savedAssets.filter((id: string) => id !== productId);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }

    // 3. SILENT BACKEND SYNC
    try {
      await api.toggleSaveAsset(productId);
    } catch (err) {
      console.warn("Backend crash ignored. Item removed locally! 😎");
    }
  };

  const filteredItems = savedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] pb-24 relative">
      <button type="button" onClick={() => navigate(-1)}
        className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 sm:py-12">

        <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">Saved Items</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">Your curated list of items for future rentals.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search saved items..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors shadow-sm"
              style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
            <p className="text-slate-500 font-medium text-sm">Loading saved items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-50 border border-slate-100">
                  <Heart className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No saved items yet</h3>
                <p className="mb-6 text-sm font-medium text-slate-500">Tap the heart icon on any item to save it here!</p>
                <Link to="/explore" className="inline-flex px-6 py-3 rounded-full text-sm font-medium text-white bg-black hover:bg-slate-800 transition-colors">
                  Explore Items
                </Link>
              </div>
            )}

            {filteredItems.map(item => (
              <Link to={`/item/${item.id}`} key={item.id} className="block group outline-none h-full">
                <div className="bg-white rounded-[2rem] p-3 border border-slate-100 flex flex-col h-full relative hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-slate-50">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />

                    <button onClick={(e) => handleRemoveSaved(e, item.id)} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                      <span className="text-sm font-semibold text-slate-800">₹{item.pricePerDay}</span>
                      <span className="text-[10px] font-medium text-slate-500 mt-0.5">/day</span>
                    </div>
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.category}</p>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">
                        <Star size={10} fill="#f59e0b" className="text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700">{item.ownerTrustScore}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 leading-tight group-hover:text-black transition-colors line-clamp-2 mb-3">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}

            {filteredItems.length > 0 && (
              <Link to="/explore" className="flex flex-col items-center justify-center text-center rounded-[2rem] transition-all hover:bg-slate-50 cursor-pointer border-2 border-dashed border-slate-200 min-h-[250px] group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white border border-slate-200 group-hover:scale-110 transition-transform">
                  <Plus size={24} className="text-slate-400" />
                </div>
                <p className="font-semibold text-slate-800">Find More Items</p>
                <p className="text-xs text-slate-500 mt-1">Explore the network</p>
              </Link>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAssets;