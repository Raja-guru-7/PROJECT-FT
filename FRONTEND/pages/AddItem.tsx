import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, ShieldCheck, Loader2, CheckCircle2, ChevronLeft, ArrowRight, Tag } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const CATEGORIES = ['Electronics', 'Tools', 'Sports', 'Vehicles', 'Furniture', 'Books', 'Clothing', 'Other'];

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '2rem',
  boxShadow: '0 4px 24px -4px rgba(0,0,0,0.08)',
};

const inputStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.875rem',
  color: '#0f172a',
  WebkitTextFillColor: '#0f172a',
  width: '100%',
  padding: '13px 16px',
  outline: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'border-color 0.2s',
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
    location: '', lat: 0, lng: 0, paymentMode: 'normal', escrowDeposit: ''
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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFormData(prev => ({ ...prev, location: address, lat: latitude, lng: longitude }));
        } catch (err) {
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, lat: latitude, lng: longitude }));
        } finally { setLocationLoading(false); }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) alert("Please allow Location Access.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
      data.append('locationAddress', formData.location);
      data.append('lat', String(formData.lat));
      data.append('lng', String(formData.lng));
      data.append('paymentMode', formData.paymentMode);

      const finalDeposit = formData.paymentMode === 'escrow' ? String(formData.escrowDeposit) : '0';
      data.append('insuranceDeposit', finalDeposit);
      data.append('escrowDepositAmount', finalDeposit);

      data.append('image', videoProof, 'proof.jpg');

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
    } catch (err) { setError('Network error'); }
    finally { setIsDeploying(false); }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] p-4 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Listing Published!</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">Redirecting to your dashboard...</p>
      </div>
    );
  }

  const labelClass = "block text-xs sm:text-sm font-semibold text-slate-500 mb-2";
  const isEscrowValid = formData.paymentMode !== 'escrow' || (formData.paymentMode === 'escrow' && formData.escrowDeposit);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24 relative">

      {/* ✅ Responsive Back Button - normal flow */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="pt-4 sm:pt-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 sm:pt-6 pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-10">List Your Item</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl font-medium text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100">{error}</div>
        )}

        <div style={cardStyle}>
          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            {step === 1 ? (
              <div className="space-y-6 sm:space-y-7">

                {/* Item Name */}
                <div>
                  <label className={labelClass}>Item name</label>
                  <div className="relative">
                    <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. HP Victus Laptop"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Condition, inclusions, etc."
                    required
                  />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Daily rate (₹)</label>
                    <input
                      style={inputStyle}
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 350"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <div className="relative">
                      <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                      <select
                        style={{ ...inputStyle, paddingLeft: '2.75rem', appearance: 'none', cursor: 'pointer' }}
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {/* Dropdown arrow */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className={labelClass}>Payment mode for this item</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { value: 'normal', label: 'Normal checkout' },
                      { value: 'escrow', label: 'Escrow protected' },
                      { value: 'renter_choice', label: 'Let renter choose' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMode: opt.value })}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border-2 ${formData.paymentMode === opt.value
                          ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                          : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {formData.paymentMode === 'escrow' && (
                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-semibold text-emerald-600 mb-2">
                        Security Deposit Amount (₹) — Refundable
                      </label>
                      <input
                        style={{ ...inputStyle, borderColor: '#10b981' }}
                        type="number"
                        value={formData.escrowDeposit}
                        onChange={e => setFormData({ ...formData, escrowDeposit: e.target.value })}
                        placeholder="e.g. 2000"
                        required={formData.paymentMode === 'escrow'}
                      />
                      <p className="text-[10px] text-emerald-500 mt-1.5 font-medium">
                        Held in Escrow and auto-refunded upon safe return.
                      </p>
                    </div>
                  )}

                  <div
                    className="p-4 rounded-xl text-xs sm:text-sm leading-relaxed font-medium"
                    style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}
                  >
                    {formData.paymentMode === 'normal' && "Renter pays directly at checkout. Amount goes to your account after platform fee deduction. No video verification required."}
                    {formData.paymentMode === 'escrow' && "Funds are held securely in a Razorpay Escrow account. Money is released only after successful Proof of Condition verification and safe return."}
                    {formData.paymentMode === 'renter_choice' && "Give flexibility to your renter. They can decide whether to pay normally or opt for Escrow protection with video verification during checkout."}
                  </div>
                </div>

                {/* ✅ Location - FIXED DETECT BUTTON ALIGNMENT */}
                <div>
                  <label className={labelClass}>Exact Pickup Location</label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-3.5 text-slate-400 pointer-events-none"
                      size={16}
                    />
                    <textarea
                      style={{
                        ...inputStyle,
                        paddingLeft: '2.75rem',
                        paddingRight: '5.5rem',
                        minHeight: '80px',
                        paddingTop: '13px',
                        resize: 'none',
                      }}
                      value={formData.location}
                      readOnly
                      placeholder="Click 'Detect' to fetch exact location..."
                      required
                    />
                    {/* ✅ Detect button - top-right aligned, not overlapping text */}
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="absolute right-2.5 top-2.5 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      {locationLoading
                        ? <Loader2 size={12} className="animate-spin" />
                        : <MapPin size={12} />
                      }
                      {locationLoading ? 'Detecting...' : 'Detect'}
                    </button>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={!formData.title || !formData.price || !formData.location || !isEscrowValid}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 sm:py-4 bg-slate-900 text-white rounded-full text-sm sm:text-base font-bold hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Next: Verify Condition <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
                <div className="text-center space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-sm bg-slate-50 border border-slate-100">
                    <ShieldCheck size={28} className="sm:w-8 sm:h-8 text-slate-800" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Live Condition Proof</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 max-w-sm mx-auto">Please record a short photo of the item.</p>
                </div>

                <div className="rounded-2xl sm:rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-200 bg-white p-2 sm:p-4 relative z-10 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[320px]">
                  <CameraCapture label="Begin Scan" mode="photo" onCapture={(blob) => setVideoProof(blob)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isDeploying}
                    className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold w-full sm:w-1/3 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!videoProof || isDeploying}
                    className="flex-1 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-2"
                  >
                    {isDeploying
                      ? <><Loader2 className="animate-spin" size={18} /> Publishing...</>
                      : 'Publish Listing'
                    }
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