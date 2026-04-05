import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('signup_email');
    if (!storedEmail) navigate('/signup');
    else setEmail(storedEmail);
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (otp.length !== 6) { setError('Invalid sequence. Neural code must be 6 digits.'); return; }
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 1500));
    const storedOTP = localStorage.getItem('signup_otp');
    if (otp === storedOTP) {
      setSuccess('Identity Verified. Establishing secure connection...');
      setIsVerifying(false);
      localStorage.removeItem('signup_otp');
      // FIXED ROUTING: Now navigates to /kyc instead of /login
      setTimeout(() => navigate('/kyc'), 2000);
    } else { setError('Authorization denied. Invalid token.'); setIsVerifying(false); }
  };

  return (
    // Restricted to new color palette: bg-[#f5f5f7]
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#F5F5F7] force-light-theme relative overflow-hidden">

      {/* NUCLEAR CSS OVERRIDE to guarantee text visibility */}
      <style>{`
        .force-light-theme { color: #0f172a !important; }
        .force-light-theme h1, 
        .force-light-theme h2, 
        .force-light-theme span { color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; }
        .force-light-theme input::placeholder { color: #94a3b8 !important; }
      `}</style>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">

        {/* White Bento Card */}
        <div className="p-8 sm:p-10 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">

          <button onClick={() => navigate('/signup')}
            className="absolute left-6 top-6 flex items-center gap-1 text-xs uppercase font-bold tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft size={16} /> Abort
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 bg-slate-50 border border-slate-100 shadow-sm text-black">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Authentication</h1>
          <p className="text-slate-500 font-medium text-sm mb-1">Neural token dispatched to node:</p>
          <span className="text-slate-900 font-bold text-sm">{email}</span>

          <form onSubmit={handleVerify} className="mt-10 space-y-6 flex flex-col items-center">

            {/* INPUT FIELD FIXED - Pure White/Grey, Pure Black text */}
            <div className="w-full">
              <input
                type="text" maxLength={6} placeholder="000000" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl tracking-[0.5em] font-mono py-4 rounded-2xl outline-none text-black font-bold bg-slate-50 border border-slate-200 focus:border-slate-400 transition-colors"
                style={{ color: '#000000', WebkitTextFillColor: '#000000' }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="w-full p-4 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 text-red-600 font-medium text-xs text-center">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="w-full p-4 rounded-xl flex items-center justify-center bg-green-50 border border-green-100 text-green-700 font-medium text-xs text-center">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* BLACK ACTION BUTTON */}
            <button type="submit" disabled={isVerifying || otp.length !== 6}
              className="w-full py-4 rounded-full font-semibold text-white bg-black hover:bg-slate-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isVerifying ? <Loader2 className="animate-spin" size={24} /> : <>Verify Token <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8">
            <button onClick={() => navigate('/signup')}
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest">
              Request New Token
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;