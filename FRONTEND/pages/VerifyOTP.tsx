
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('signup_email');
    if (!storedEmail) {
      navigate('/signup');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1500));

    const storedOTP = localStorage.getItem('signup_otp');

    if (otp === storedOTP) {
      setSuccess('OTP verified successfully! Redirecting to login...');
      setIsVerifying(false);
      
      // Clear simulation data
      localStorage.removeItem('signup_otp');
      // Keep email for login convenience if desired, but for now we follow requirements
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError('Invalid OTP. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#F6F6F6]">
      <div className="max-w-md w-full bg-white rounded-3xl soft-shadow p-8 sm:p-10 text-center relative">
        <button 
          onClick={() => navigate('/signup')}
          className="absolute left-6 top-6 p-2 text-slate-400 hover:text-slate-800 transition-colors"
          title="Back to Signup"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="bg-[#FF7A59] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-100">
          <ShieldCheck className="text-white" size={32} />
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Verify OTP</h1>
        <p className="text-slate-500 mt-2 font-medium">
          We've sent a 6-digit code to <br />
          <span className="text-slate-900 font-bold">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-10 space-y-6">
          <div>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-4xl tracking-[0.5em] font-black py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF7A59]/50 focus:border-[#FF7A59] outline-none text-slate-800 transition-all placeholder:text-slate-200"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-1">
              {success}
            </div>
          )}

          <button 
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full bg-[#093E28] text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 disabled:opacity-50"
          >
            {isVerifying ? <Loader2 className="animate-spin" size={24} /> : (
              <>Verify Account <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8">
          <button 
            onClick={() => navigate('/signup')}
            className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
