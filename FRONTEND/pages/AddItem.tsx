import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, ShieldCheck, Loader2, CheckCircle2, ChevronLeft, ArrowRight, Tag } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Electronics', 'Tools', 'Sports', 'Vehicles', 'Furniture', 'Books', 'Clothing', 'Other'];

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    location: '',
    insurance: '10',
    lat: 0,
    lng: 0,
  });
  const [videoProof, setVideoProof] = useState<Blob | null>(null);

  const detectLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const address = data.address;
          const label = `${address.suburb || address.village || address.town || ''}, ${address.city || address.state || ''}`.trim().replace(/^,|,$/g, '');
          setFormData(f => ({ ...f, location: label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, lat: latitude, lng: longitude }));
        } catch {
          setFormData(f => ({ ...f, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, lat: latitude, lng: longitude }));
        }
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setError('Location access denied. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoProof) return;
    setIsDeploying(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('pricePerDay', formData.price);
      data.append('insuranceDeposit', formData.insurance);
      data.append('locationAddress', formData.location);
      data.append('lat', String(formData.lat || 11.3410));
      data.append('lng', String(formData.lng || 77.7172));
      data.append('video', videoProof, 'item-proof.webm');

      const res = await fetch('http://localhost:5000/api/product/add', {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || 'Failed to list item');

      setIsDeploying(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsDeploying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-40 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Item Listed Successfully!</h1>
        <p className="text-slate-500">Your item is now live on the AroundU network and visible to trusted renters nearby.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-8 bg-[#093E28] text-white font-bold py-3 px-6 rounded-full">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-20">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6 sm:mb-8">
        <ChevronLeft size={20} /> Back
      </button>

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">List Your Item</h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto">Join the neighborhood network by sharing your items securely.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold">❌ {error}</div>
      )}

      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-slate-500">Step {step} of 2</span>
          <div className="flex gap-2">
            <div className={`h-2 w-10 rounded-full transition-all ${step >= 1 ? 'bg-[#093E28]' : 'bg-gray-200'}`} />
            <div className={`h-2 w-10 rounded-full transition-all ${step >= 2 ? 'bg-[#093E28]' : 'bg-gray-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in">

              {/* Item Title */}
              <div className="w-full">
                <label className="text-sm font-bold text-slate-500 mb-2 block">Item Title</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Package size={18} /></div>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Professional Camera Kit"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-sm sm:text-base text-slate-800 font-semibold placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the item's condition, specs, and any included accessories..."
                  className="w-full px-3 sm:px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-sm sm:text-base text-slate-800 transition-all placeholder:text-slate-400 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Category</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Tag size={18} /></div>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-sm sm:text-base text-slate-800 font-semibold appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div className="w-full">
                  <label className="text-sm font-bold text-slate-500 mb-2 block">Price per day</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-black text-lg">₹</div>
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-sm sm:text-base text-slate-800 font-semibold placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-bold text-slate-500 mb-2 block">Your Location</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><MapPin size={18} /></div>
                    <input
                      type="text"
                      required
                      placeholder="Type or detect .."
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm sm:text-base text-slate-800 font-semibold placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locationLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#093E28] text-white text-xs font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:opacity-90"
                    >
                      {locationLoading ? <Loader2 size={14} className="animate-spin" /> : 'Detect'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.price || !formData.description || !formData.location}
                className="w-full bg-[#093E28] text-white py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                Next: Verify Item <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl space-y-2">
                <div className="flex items-center gap-3 text-green-800 font-bold">
                  <ShieldCheck size={20} /> Live Video Verification
                </div>
                <p className="text-sm text-green-700">Record a short live video of the item to prove possession and current condition.</p>
              </div>

              <div className="rounded-3xl overflow-hidden">
                <CameraCapture label="Begin Item Verification" mode="photo" onCapture={(blob) => setVideoProof(blob)} />
              </div>

              {videoProof && (
                <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-xl font-semibold">
                  <CheckCircle2 size={20} /> Video captured! Ready to list.
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button type="button" onClick={() => setStep(1)} disabled={isDeploying} className="w-full sm:flex-1 bg-gray-100 text-slate-700 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-200 transition-all text-sm sm:text-base">
                  Back to Details
                </button>
                <button type="submit" disabled={!videoProof || isDeploying} className="w-full sm:flex-[2] bg-[#FF7A59] text-white py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg hover:opacity-90 shadow-lg shadow-orange-200 disabled:opacity-40 transition-all flex items-center justify-center gap-3">
                  {isDeploying ? <><Loader2 className="animate-spin" size={24} /> Uploading...</> : 'List My Item'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddItem;
