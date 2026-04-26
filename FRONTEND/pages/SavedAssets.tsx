import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Plus, Heart, Loader2, Star } from 'lucide-react';
import { api } from '../services/api';
import { Item } from '../types';

export const SavedAssets: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedItems = async () => {
    setIsLoading(true);
    try {
      // ✅ ALWAYS read from localStorage first - most reliable source
      const userStr = localStorage.getItem('user');
      const savedIds: string[] = userStr ? (JSON.parse(userStr).savedAssets || []) : [];

      if (savedIds.length === 0) {
        // Try backend as fallback
        try {
          const backendItems = await api.getSavedAssets();
          if (backendItems && backendItems.length > 0) {
            setSavedItems(backendItems);
            setIsLoading(false);
            return;
          }
        } catch (_) { }
        setSavedItems([]);
        setIsLoading(false);
        return;
      }

      // ✅ Fetch all items and filter by saved ids
      const allItems = await api.getItems({});
      const filtered = allItems.filter((item: Item) =>
        savedIds.includes(item.id) || savedIds.includes((item as any)._id)
      );
      setSavedItems(filtered);
    } catch (error) {
      console.error('Failed to load saved items:', error);
      setSavedItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedItems();

    // ✅ Re-load when heart toggled in Explore page
    const handleUpdate = () => loadSavedItems();
    window.addEventListener('savedAssetsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('savedAssetsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleRemoveSaved = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Instant UI removal
    setSavedItems(prev => prev.filter(item => item.id !== productId && (item as any)._id !== productId));

    // 2. localStorage update
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      userObj.savedAssets = (userObj.savedAssets || []).filter(
        (id: string) => id !== productId
      );
      localStorage.setItem('user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('savedAssetsUpdated'));
    }

    // 3. Silent backend sync
    try {
      await api.toggleSaveAsset(productId);
    } catch (err) {
      console.warn('Backend sync failed, local removed.');
    }
  };

  const filteredItems = savedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] pb-24">

      {/* ✅ Responsive Back Button - normal flow */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="pt-4 sm:pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ChevronLeft
              size={16}
              className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform"
            />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 sm:py-6">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-800">Saved Items</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 font-medium">Your curated list of items for future rentals.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 sm:py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors shadow-sm"
              style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 sm:py-32 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-slate-400 mb-3 sm:mb-4 w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-slate-500 font-medium text-xs sm:text-sm">Loading saved items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 sm:py-16 text-center bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm px-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-slate-50 border border-slate-100">
                  <Heart className="text-slate-300 w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 sm:mb-2">No saved items yet</h3>
                <p className="mb-4 sm:mb-6 text-xs sm:text-sm font-medium text-slate-500">Tap the heart icon on any item to save it here!</p>
                <Link to="/explore" className="inline-flex px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-white bg-black hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center">
                  Explore Items
                </Link>
              </div>
            )}

            {filteredItems.map(item => (
              <Link to={`/item/${item.id}`} key={item.id} className="block group outline-none h-full">
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-2.5 sm:p-3 border border-slate-100 flex flex-col h-full relative hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden mb-3 sm:mb-4 bg-slate-50">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <button
                      onClick={(e) => handleRemoveSaved(e, item.id || (item as any)._id)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    >
                      <Heart size={16} className="sm:w-[18px] sm:h-[18px] fill-red-500 text-red-500" />
                    </button>
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">₹{item.pricePerDay}</span>
                      <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 mt-0.5">/day</span>
                    </div>
                  </div>
                  <div className="px-2 pb-2 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wide">{item.category}</p>
                      <div className="flex items-center gap-1 bg-amber-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-100/50">
                        <Star size={8} className="sm:w-[10px] sm:h-[10px]" fill="#f59e0b" color="#f59e0b" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-700">{item.ownerTrustScore}</span>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 leading-tight group-hover:text-black transition-colors line-clamp-2 mb-2 sm:mb-3">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}

            {filteredItems.length > 0 && (
              <Link to="/explore" className="flex flex-col items-center justify-center text-center rounded-[1.5rem] sm:rounded-[2rem] transition-all hover:bg-slate-50 cursor-pointer border-2 border-dashed border-slate-200 min-h-[200px] sm:min-h-[250px] group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-white border border-slate-200 group-hover:scale-110 transition-transform">
                  <Plus size={20} className="sm:w-6 sm:h-6 text-slate-400" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-slate-800">Find More Items</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Explore the network</p>
              </Link>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAssets;