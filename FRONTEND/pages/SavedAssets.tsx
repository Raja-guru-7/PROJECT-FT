import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Plus, Heart } from 'lucide-react';

const SavedAssets: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
        {/* Empty state */}
        <div className="col-span-full py-20 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-red-400" size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No saved items yet</h3>
          <p className="text-slate-500 mb-6">Tap the heart icon on any item to save it here!</p>
          <Link to="/explore" className="inline-block bg-[#093E28] text-white px-8 py-3 rounded-full font-bold">
            Explore Items
          </Link>
        </div>

        <Link to="/explore" className="border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-center text-slate-500 hover:border-[#093E28] hover:text-[#093E28] transition-all min-h-[300px]">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
