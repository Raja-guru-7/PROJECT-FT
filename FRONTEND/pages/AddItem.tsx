
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, DollarSign, Package, ShieldCheck, Loader2, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    price: '',
    location: 'SoHo, New York',
    insurance: '10'
  });
  const [videoProof, setVideoProof] = useState<Blob | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoProof) return;
    
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsDeploying(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <button 
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900">List Your Item</h1>
        <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Join the neighborhood network by sharing your items securely.</p>
      </div>

      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-500">Step {step} of 2</span>
          <div className="flex gap-2">
            <div className={`h-2 w-10 rounded-full transition-all ${step >= 1 ? 'bg-[#093E28]' : 'bg-gray-200'}`} />
            <div className={`h-2 w-10 rounded-full transition-all ${step >= 2 ? 'bg-[#093E28]' : 'bg-gray-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in">
              <InputField icon={<Package />} label="Item Title" placeholder="e.g., Professional Camera Kit" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              
              <div>
                 <label className="text-sm font-bold text-slate-500 mb-2 block">Description</label>
                 <textarea 
                   rows={4}
                   required
                   placeholder="Describe the item's condition, specs, and any included accessories..."
                   className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-slate-800 transition-all placeholder:text-slate-400 resize-none"
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={<DollarSign />} label="Price per day (₹)" placeholder="0.00" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <InputField icon={<MapPin />} label="Your Location" placeholder="e.g., SoHo, New York" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>

              <button 
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.price || !formData.description}
                className="w-full bg-[#093E28] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                Next: Verify Item <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-green-50 border border-green-200 p-6 rounded-2xl space-y-2">
                <div className="flex items-center gap-3 text-green-800 font-bold">
                  <ShieldCheck size={20} />
                  Live Video Verification
                </div>
                <p className="text-sm text-green-700">
                  To ensure trust and safety, you must capture a short, live video of the item. This proves possession and current condition.
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden">
                <CameraCapture 
                  label="Begin Item Verification" 
                  mode="video"
                  onCapture={(blob) => setVideoProof(blob)} 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isDeploying}
                  className="w-full sm:flex-1 bg-gray-100 text-slate-700 py-4 rounded-full font-bold hover:bg-gray-200 transition-all"
                >
                  Back to Details
                </button>
                <button 
                  type="submit"
                  disabled={!videoProof || isDeploying}
                  className="w-full sm:flex-[2] bg-[#FF7A59] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 shadow-lg shadow-orange-200 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
                >
                  {isDeploying ? <Loader2 className="animate-spin" size={24} /> : 'List My Item'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const InputField = ({ icon, label, ...props }: { icon: React.ReactNode, label: string, [key: string]: any }) => (
  <div className="w-full">
    <label className="text-sm font-bold text-slate-500 mb-2 block">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input
        type="text"
        required
        {...props}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-slate-800 font-semibold transition-all placeholder:text-slate-400"
      />
    </div>
  </div>
);

export default AddItem;
