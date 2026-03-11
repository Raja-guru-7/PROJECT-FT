import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    aadhaar: '',
    otp: ''
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSendOTP = () => {
    if (formData.aadhaar.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return;
    }
    setError('');
    showToast('OTP Sent to Mobile');
    setIsOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setError('');
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsVerifying(false);
    setIsVerified(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isVerified) {
      setError('Please verify your Aadhaar first');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms & Conditions');
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      showToast('Registered Successfully!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F6F6F6]">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-[#093E28] text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-3xl soft-shadow p-8 sm:p-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block bg-[#093E28] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:opacity-90 transition-opacity">
            <ShieldCheck className="text-white" size={32} />
          </Link>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Join AroundU</h1>
          <p className="text-slate-500 mt-2 font-medium">Create your trusted profile</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <InputField 
            icon={<User size={20} />} 
            label="Full Name" 
            placeholder="Siva Kumar" 
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <InputField 
            icon={<Mail size={20} />} 
            label="Email Address" 
            type="email"
            placeholder="siva@example.com" 
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
          />

          <InputField 
            icon={<Lock size={20} />} 
            label="Password" 
            type="password"
            placeholder="••••••••" 
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
          />

          {/* Aadhaar Section */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <CreditCard size={18} className="text-[#093E28]" />
              Aadhaar Verification
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="12-digit Aadhaar Number"
                maxLength={12}
                disabled={isVerified}
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-slate-800 font-semibold transition-all disabled:opacity-50"
              />
              {!isOtpSent && !isVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#093E28] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90"
                >
                  Send OTP
                </button>
              )}
            </div>

            {isOtpSent && !isVerified && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-slate-800 font-semibold text-center tracking-[0.5em]"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isVerifying}
                  className="w-full bg-[#093E28] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {isVerifying ? <Loader2 className="animate-spin" size={18} /> : 'Verify Aadhaar'}
                </button>
              </div>
            )}

            {isVerified && (
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 p-3 rounded-xl border border-green-100 animate-in zoom-in-95">
                <CheckCircle2 size={18} />
                Verified Successfully ✅
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#093E28] focus:ring-[#093E28]" 
            />
            <label htmlFor="terms" className="text-sm font-medium text-slate-600 cursor-pointer">
              I agree to the <span className="text-[#093E28] font-bold">Terms & Conditions</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={!isVerified || isLoading}
            className="w-full bg-[#093E28] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Register <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF7A59] font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
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
        required
        {...props}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-slate-800 font-semibold transition-all placeholder:text-slate-400"
      />
    </div>
  </div>
);

export default Signup;
