import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Real backend call — wrong password throws error here
      const { api } = await import('../services/api');
      await api.login({ email: formData.email, password: formData.password });

      // Only reaches here if backend says LOGIN SUCCESS
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      console.log(`[DEV] OTP for ${formData.email}: ${newOtp}`);
      setShowOtp(true);
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    await new Promise(r => setTimeout(r, 1000));

    if (otp === generatedOtp) {
      setIsSuccess(true);
      setTimeout(() => {
        onLogin();
        navigate('/explore');
      }, 1500);
    } else {
      setError('Incorrect OTP. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F6F6F6]">
      <div className="max-w-md w-full bg-white rounded-3xl soft-shadow p-6 sm:p-8 lg:p-10">
        <div className="text-center mb-8 sm:mb-10">
          <Link to="/" className="inline-block bg-[#093E28] w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 hover:opacity-90 transition-opacity">
            <ShieldCheck className="text-white" size={24} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900">
            {isSuccess ? 'Verified!' : showOtp ? 'Verify Email' : 'Welcome Back'}
          </h1>
          <div className="text-slate-500 mt-2 font-medium text-sm sm:text-base">
            {isSuccess ? 'Redirecting to explore...' : showOtp ? (
              <>
                Enter the code sent to <span className="text-slate-900 font-bold">{formData.email}</span>
                <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-xs">
                  [DEV MODE] Your OTP is: <span className="font-mono font-black text-sm">{generatedOtp}</span>
                </div>
              </>
            ) : 'Login to your AroundU account'}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-600" size={40} />
            </div>
            <p className="text-green-600 font-bold">Login Successful</p>
          </div>
        ) : !showOtp ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <InputField 
              icon={<Mail size={20} />} 
              label="Email Address" 
              type="email"
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />

            <InputField 
              icon={<Lock size={20} />} 
              label="Password" 
              type="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />

            <div className="flex justify-end">
              <button type="button" className="text-sm font-bold text-slate-500 hover:text-slate-800">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 sm:mt-8 bg-[#093E28] text-white py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <>Login <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <InputField 
              icon={<KeyRound size={20} />} 
              label="Enter 6-Digit OTP" 
              type="text"
              maxLength={6}
              placeholder="000000" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isVerifying}
            />

            <button 
              type="submit"
              disabled={isVerifying}
              className="w-full mt-6 sm:mt-8 bg-[#FF7A59] text-white py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="animate-spin" size={24} /> : (
                <>Verify & Login <ArrowRight size={20} /></>
              )}
            </button>

            <button 
              type="button"
              onClick={() => setShowOtp(false)}
              className="w-full text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}

        {!showOtp && !isSuccess && (
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-slate-500 font-medium">
              New User?{' '}
              <Link to="/signup" className="text-[#FF7A59] font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        )}
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
        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#093E28]/50 focus:border-[#093E28] outline-none text-sm sm:text-base text-slate-800 font-semibold transition-all placeholder:text-slate-400 disabled:opacity-60"
      />
    </div>
  </div>
);

export default Login;
