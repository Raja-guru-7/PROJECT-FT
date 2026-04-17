import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../services/api';
import { Item } from '../types';
import { MapPin, Filter, Star, Search, X, Heart, Loader2, Navigation, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371.0710;
  const radLat1 = lat1 * Math.PI / 180;
  const radLat2 = lat2 * Math.PI / 180;
  const deltaLat = (lat2 - lat1) * Math.PI / 180;
  const deltaLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapUpdater = ({ center }: { center: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.flyTo([center.lat, center.lng], 13, { animate: true, duration: 1.5 });
      setTimeout(() => { map.invalidateSize(); }, 100);
    }
  }, [center, map]);
  return null;
};

const HeartButton: React.FC<{ productId: string; initialSaved: boolean }> = ({ productId, initialSaved }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(initialSaved);

  useEffect(() => { setIsHeartFilled(initialSaved); }, [initialSaved]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const token = localStorage.getItem('token') || localStorage.getItem('x-auth-token');
    if (!token) { alert("Please login to save items."); return; }

    const nextState = !isHeartFilled;
    setIsHeartFilled(nextState);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      let assets = userObj.savedAssets || [];
      if (nextState) {
        if (!assets.includes(productId)) assets.push(productId);
      } else {
        assets = assets.filter((id: string) => id !== productId);
      }
      userObj.savedAssets = assets;
      localStorage.setItem('user', JSON.stringify(userObj));
    }

    try {
      await api.toggleSaveAsset(productId);
    } catch (err) {
      console.warn("Backend crash ignored. Local state forced! 😎");
    }
  };

  return (
    <button onClick={handleToggleSave} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95">
      <Heart size={18} className={isHeartFilled ? "fill-red-500 text-red-500" : "text-gray-400"} />
    </button>
  );
};

const TiltCard = React.memo(({ item, savedAssets }: { item: Item & { calculatedDistance: number }, savedAssets: Set<string> }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // 🚀 FIX: Detect if device supports hover (Laptop/PC) vs touch (Mobile)
  const isHoverable = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isHoverable) return; // Disable 3D calc on mobile
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ perspective: 1200, transformStyle: "preserve-3d" }} className="h-full relative">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // 🚀 FIX: Apply rotate ONLY on Desktop. Apply whileTap (click feedback) ONLY on Mobile.
        style={{
          rotateX: isHoverable ? rotateX : 0,
          rotateY: isHoverable ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
        whileHover={isHoverable ? { scale: 1.02 } : {}}
        whileTap={!isHoverable ? { scale: 0.98 } : {}}
        className="h-full w-full"
      >
        <Link to={`/item/${item.id}`} className="block h-full group outline-none">
          <div className="bg-white rounded-[2rem] p-3 border border-slate-100 flex flex-col h-full relative"
            style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)", transform: "translate3d(0, 0, 30px)", outline: "1px solid transparent", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", WebkitFontSmoothing: "antialiased" }}
          >
            <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-4 bg-slate-50"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translate3d(0,0,0)", WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}>
              <img src={item.imageUrl} alt={item.title} className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isHoverable ? 'group-hover:scale-105' : ''}`} />
              <HeartButton productId={item.id} initialSaved={savedAssets.has(item.id)} />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"
                style={{ transform: "translateZ(20px)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                <span className="text-sm font-semibold text-slate-800">₹{item.pricePerDay}</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">/day</span>
              </div>
            </div>
            <div className="px-2 pb-2 flex-1 flex flex-col" style={{ transform: "translateZ(15px)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{item.category}</p>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">
                  <Star size={10} fill="#f59e0b" className="text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-700">{item.ownerTrustScore}</span>
                </div>
              </div>
              <h3 className={`text-base sm:text-lg font-medium text-slate-800 leading-tight line-clamp-2 mb-3 transition-colors ${isHoverable ? 'group-hover:text-black' : ''}`}>{item.title}</h3>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MapPin size={14} className="text-slate-400" />
                <span>{item.calculatedDistance.toFixed(1)} km away</span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
});

const Explore: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [savedAssets, setSavedAssets] = useState<Set<string>>(new Set());

  const fetchSavedAssets = () => {
    try {
      const localUserStr = localStorage.getItem('user');
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;
      if (localUser && localUser.savedAssets) {
        setSavedAssets(new Set(localUser.savedAssets));
      }
    } catch (err) { console.error(err); }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getItems({
        lat: userLocation?.lat, lng: userLocation?.lng, radius: maxDistance, query: searchQuery, category: selectedCategory || undefined
      });
      setItems(data);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); fetchSavedAssets(); }, [userLocation, selectedCategory, maxDistance]);

  const syncLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => { setIsLocating(false); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const handleMarkerDragEnd = (event: any) => {
    const marker = event.target;
    const position = marker.getLatLng();
    setUserLocation({ lat: position.lat, lng: position.lng });
  };

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('x-auth-token');
        if (!token) { syncLocation(); return; }
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/user`, { headers: { 'x-auth-token': token } });
        const user = await res.json();
        if (user?.location?.lat && user?.location?.lng) { setUserLocation({ lat: user.location.lat, lng: user.location.lng }); } else { syncLocation(); }
      } catch { syncLocation(); }
    };
    loadLocation();
  }, []);

  const itemsWithDistance = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      calculatedDistance: (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number')
        ? calculateDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng)
        : index * 0.3 + 0.1
    }));
  }, [items, userLocation]);

  const filteredItems = useMemo(() => {
    return itemsWithDistance
      .filter(item => item.calculatedDistance <= maxDistance && item.pricePerDay <= maxPrice)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [itemsWithDistance, maxDistance, maxPrice]);

  return (
    <div className="w-full min-h-screen pb-32 bg-[#F5F5F7]">
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="relative w-full sm:w-[85vw] md:max-w-md h-full bg-white p-5 sm:p-8 flex flex-col shadow-2xl sm:rounded-l-[2rem] ml-auto"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8 mt-4 sm:mt-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 space-y-6 sm:space-y-8 overflow-y-auto pr-2 pb-10">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 sm:mb-3 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {['Electronics', 'Tools', 'Camping', 'Vehicle', 'Media', 'Home'].map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <label className="text-xs sm:text-sm font-semibold text-slate-600">Max Price (₹)</label>
                    <span className="text-sm sm:text-base font-bold text-slate-800">₹{maxPrice}</span>
                  </div>
                  <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
                <div className="p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <label className="text-xs sm:text-sm font-semibold text-slate-600">Distance Limit</label>
                    <span className="text-sm sm:text-base font-bold text-slate-800">{maxDistance.toFixed(1)} km</span>
                  </div>
                  <input type="range" min="1" max="100" step="0.5" value={maxDistance} onChange={(e) => setMaxDistance(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                </div>
              </div>
              <div className="pt-4 bg-white">
                <button onClick={() => { setShowFilters(false); fetchItems(); }} className="w-full py-3.5 sm:py-4 rounded-full bg-slate-900 text-white text-sm sm:text-base font-bold transition-all hover:bg-slate-800 shadow-md">Apply Filters</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-8 lg:py-12 mt-2 sm:mt-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">Explore Collection</h1>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[250px] flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-full bg-white text-sm font-medium text-slate-900 border border-slate-100 focus:outline-none focus:border-slate-300" style={{ color: '#000', WebkitTextFillColor: '#000' }} />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto">
              <button onClick={syncLocation} className="flex-1 sm:flex-none flex items-center justify-center min-w-max gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-white border border-slate-100 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                {isLocating ? <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" /> : <Navigation size={14} className="text-blue-500 sm:w-4 sm:h-4" />}
                Near Me
              </button>

              <div className="flex items-center min-w-max bg-white border border-slate-100 rounded-full p-1 shadow-sm">
                <button onClick={() => setViewMode('grid')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                  <LayoutGrid size={14} className="sm:w-4 sm:h-4" /> Grid
                </button>
                <button onClick={() => setViewMode('map')} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                  <MapIcon size={14} className="sm:w-4 sm:h-4" /> Map
                </button>
              </div>

              <button onClick={() => setShowFilters(true)} className="p-2.5 sm:p-3 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"><Filter size={16} className="text-slate-600 sm:w-[18px] sm:h-[18px]" /></button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 sm:py-32 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" size={40} /></div>
        ) : viewMode === 'map' ? (
          <div className="h-[400px] lg:h-[600px] w-full rounded-3xl sm:rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm relative z-10">
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : [11.3410, 77.7172]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {userLocation && <MapUpdater center={userLocation} />}

              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} draggable={true} eventHandlers={{ dragend: handleMarkerDragEnd }}>
                  <Popup>You are here (Drag to adjust)</Popup>
                </Marker>
              )}

              {filteredItems.map(item => (
                <Marker key={item.id} position={[item.location.lat, item.location.lng]}>
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-2">₹{item.pricePerDay}/day • {item.calculatedDistance.toFixed(1)} km</p>
                      <Link to={`/item/${item.id}`} className="block w-full py-2 bg-black text-white text-center text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
                        View Item
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredItems.map((item) => (<TiltCard key={item.id} item={item} savedAssets={savedAssets} />))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;