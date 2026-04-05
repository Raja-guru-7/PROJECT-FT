import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, ShieldCheck, Loader2, CheckCircle2, ChevronLeft, ArrowRight, Tag } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Electronics', 'Tools', 'Sports', 'Vehicles', 'Furniture', 'Books', 'Clothing', 'Other'];

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #f1f5f9',
  borderRadius: '2rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const inputStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  color: '#000000',
  WebkitTextFillColor: '#000000',
  width: '100%',
  padding: '14px 16px',
  outline: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
};

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Electronics', price: '',
    location: '', lat: 0, lng: 0
  });
  const [videoProof, setVideoProof] = useState<Blob | null>(null);

  const detectLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          setFormData(prev => ({
            ...prev,
            location: address,
            lat: latitude,
            lng: longitude
          }));
        } catch (err) {
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            lat: latitude,
            lng: longitude
          }));
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) alert("Please allow Location Access in your browser settings to detect exact location.");
        else alert("Location detection failed. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoProof) return;
    setIsDeploying(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('pricePerDay', formData.price);
      data.append('locationAddress', formData.location);
      data.append('lat', String(formData.lat));
      data.append('lng', String(formData.lng));
      data.append('image', videoProof, 'proof.webm');

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/product/add`, {
        method: 'POST',
        headers: { 'x-auth-token': token || '' },
        body: data
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const errData = await res.json();
        setError(errData.msg || 'Listing failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsDeploying(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] p-4 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Listing Published!</h1>
        <p className="text-slate-500 mt-2">Redirecting to your dashboard...</p>
      </div>
    );
  }

  const labelClass = "block text-sm font-bold text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 force-light-theme relative">
      <button onClick={() => navigate(-1)} className="absolute top-8 left-4 md:left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors z-10">
        <ChevronLeft size={18} /> Back
      </button>
      <style>{`
        .force-light-theme input, .force-light-theme textarea, .force-light-theme select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          background-color: #f8fafc !important;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-12">

        <h1 className="text-3xl font-bold text-slate-900 mb-10">List Your Item</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl font-medium text-sm text-red-600 bg-red-50 border border-red-100">
            {error}
          </div>
        )}

        <div style={cardStyle} className="bg-white overflow-hidden border border-slate-200">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Step {step} of 2</span>
            <div className="flex gap-2">
              <div className={`h-2 w-10 rounded-full transition-all ${step >= 1 ? 'bg-black' : 'bg-slate-200'}`} />
              <div className={`h-2 w-10 rounded-full transition-all ${step >= 2 ? 'bg-black' : 'bg-slate-200'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Item Title</label>
                  <div className="relative">
                    <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input style={{ ...inputStyle, paddingLeft: '2.5rem' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Sony DSLR Camera" required />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: '100px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Condition, inclusions, etc." required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price / Day (₹)</label>
                    <input style={inputStyle} type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="₹" required />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <div className="relative">
                      <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <select style={{ ...inputStyle, paddingLeft: '2.5rem' }} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={labelClass}>Exact Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea
                      style={{ ...inputStyle, paddingLeft: '3rem', minHeight: '100px', paddingTop: '14px', cursor: 'default' }}
                      value={formData.location}
                      readOnly
                      placeholder="Click 'Detect' to fetch exact location..."
                      required
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="absolute right-3 bottom-3 bg-black text-white text-[11px] font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                    >
                      {locationLoading ? <Loader2 size={14} className="animate-spin" /> : 'DETECT'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold px-1 uppercase tracking-tight">
                    {formData.lat !== 0 ? `Verified Coords: ${formData.lat.toFixed(6)}, ${formData.lng.toFixed(6)}` : '* High-accuracy GPS detection recommended.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!formData.title || !formData.price || !formData.location}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-black text-white rounded-full font-bold mt-4 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  Next: Verify Condition <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-8 py-4">

                {/* Step 2: Verification Section */}
                <div className="text-center space-y-3 mb-6">
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }} className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ShieldCheck size={32} color="#0f172a" />
                  </div>
                  <h3 style={{ color: '#0f172a' }} className="text-2xl font-bold tracking-tight">Live Condition Proof</h3>
                  <p style={{ color: '#64748b' }} className="text-sm font-medium max-w-sm mx-auto">Please record a short photo of the item. This ensures community trust and dispute safety.</p>
                </div>

                <div style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }} className="rounded-[2rem] overflow-hidden border-2 border-dashed p-4 relative z-10 flex flex-col items-center justify-center min-h-[320px]">
                  <CameraCapture label="Begin Scan" mode="photo" onCapture={(blob) => setVideoProof(blob)} />
                </div>

                {/* Success Message */}
                {videoProof && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce3', color: '#15803d' }} className="flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-semibold">
                    <CheckCircle2 size={20} color="#15803d" /> Proof captured successfully!
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} disabled={isDeploying}
                    style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', boxShadow: 'none' }}
                    className="px-8 py-4 rounded-full font-semibold transition-colors w-full sm:w-1/3 hover:opacity-80">
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!videoProof || isDeploying}
                    style={{
                      backgroundColor: (!videoProof || isDeploying) ? '#f1f5f9' : '#000000',
                      color: (!videoProof || isDeploying) ? '#94a3b8' : '#ffffff',
                      WebkitTextFillColor: (!videoProof || isDeploying) ? '#94a3b8' : '#ffffff',
                      border: (!videoProof || isDeploying) ? '1px solid #e2e8f0' : 'none',
                      boxShadow: 'none',
                      outline: 'none'
                    }}
                    className="flex-1 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {isDeploying ? <><Loader2 className="animate-spin" size={18} /> Publishing...</> : 'Publish Listing'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;