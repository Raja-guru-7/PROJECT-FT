
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { Item } from '../types';
import { MapPin, Filter, Star, Search, X, LayoutGrid, Map as MapIcon, Navigation, Heart, Loader2, Hammer, Laptop, Car, Sofa, User } from 'lucide-react';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Explore: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(5);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set(['item-1', 'item-3']));

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getItems({
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        query: searchQuery,
        category: selectedCategory || undefined
      });
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userLocation, selectedCategory]);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = new Set(savedItems);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedItems(newSaved);
  };

  const syncLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  useEffect(() => { syncLocation(); }, []);

  const itemsWithDistance = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      calculatedDistance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng) : index * 0.3 + 0.1
    }));
  }, [items, userLocation]);

  const filteredItems = itemsWithDistance.filter(item => 
    item.calculatedDistance <= maxDistance && item.pricePerDay <= maxPrice
  ).sort((a, b) => a.calculatedDistance - b.calculatedDistance);

  return (
    <div className="w-full bg-[#F6F6F6] min-h-screen">
      {showFilters && (
        <div className="fixed inset-0 z-[2000] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-full sm:max-w-md h-full bg-white p-8 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100 text-slate-500">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 space-y-8">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-3 block">Category</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Electronics', 'Tools', 'Camping', 'Vehicle', 'Media', 'Home'].map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedCategory === cat ? 'bg-[#093E28] text-white' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-600">Max Price</label>
                  <span className="text-sm font-bold text-slate-800">₹{maxPrice}</span>
                </div>
                <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="custom-slider w-full" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-600">Distance</label>
                  <span className="text-sm font-bold text-slate-800">{maxDistance.toFixed(1)} km</span>
                </div>
                <input type="range" min="1" max="20" step="0.5" value={maxDistance} onChange={(e) => setMaxDistance(parseFloat(e.target.value))} className="custom-slider w-full" />
              </div>
            </div>
            <button onClick={() => { setShowFilters(false); fetchItems(); }} className="w-full mt-8 bg-[#FF7A59] text-white py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-tight mb-4">
              Explore Nearby
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-base md:text-lg text-slate-500 font-medium">
                Find trusted items available for rent in your area.
              </p>
              <button 
                onClick={syncLocation} 
                disabled={isLocating} 
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 bg-white text-slate-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <Navigation size={12} className={isLocating ? "animate-spin" : ""} />
                Get Location
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex bg-slate-900 p-1 rounded-full shadow-xl">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-md' : 'text-white/60 hover:text-white'}`}
              >
                <LayoutGrid size={14} /> Assets
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-md' : 'text-white/60 hover:text-white'}`}
              >
                <MapIcon size={14} /> Map
              </button>
            </div>
            <button 
              onClick={() => setShowFilters(true)} 
              className="px-6 py-3.5 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-gray-100 hover:bg-gray-50 transition-all shadow-lg active:scale-95"
            >
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="mb-12 relative group max-w-4xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#093E28] transition-all duration-300" size={20} />
          <form onSubmit={(e) => { e.preventDefault(); fetchItems(); }}>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search for anything..." 
              className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#093E28]/5 outline-none text-lg text-slate-800 font-semibold shadow-xl transition-all placeholder:text-slate-300" 
            />
          </form>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="font-semibold">Searching the network...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {filteredItems.map(item => (
              <Link key={item.id} to={`/item/${item.id}`} className="group block">
                <div className="bg-white rounded-3xl soft-shadow soft-shadow-hover transition-all h-full flex flex-col overflow-hidden border border-slate-50 group-hover:-translate-y-1.5 duration-500">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    <button onClick={(e) => toggleSave(e, item.id)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg">
                      <Heart size={20} className={savedItems.has(item.id) ? "fill-[#FF7A59] text-[#FF7A59]" : "text-slate-300"} />
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{item.category}</p>
                      <h3 className="text-xl font-black text-slate-900 leading-tight mb-3 group-hover:text-[#093E28] transition-colors line-clamp-2">{item.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black text-green-600">
                      <Star size={14} fill="currentColor" />
                      {item.ownerTrustScore}% Trust
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-[65vh] w-full rounded-[3rem] overflow-hidden soft-shadow border border-gray-100">
            <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [40.7128, -74.0060]} zoom={13} className="h-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredItems.map(item => (
                <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
                  <Popup>
                    <div className="p-2 w-56">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-24 object-cover rounded-xl mb-3" />
                      <h4 className="font-black text-slate-800 text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">₹{item.pricePerDay}/day</p>
                      <Link to={`/item/${item.id}`} className="block text-center bg-[#093E28] text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all">View Details</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
