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
      setTimeout(() => navigate('/kyc'), 2000);
    } else { setError('Authorization denied. Invalid token.'); setIsVerifying(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-[#F5F5F7] force-light-theme relative overflow-hidden">
      <style>{`
        .force-light-theme { color: #0f172a !important; }
        .force-light-theme h1, 
        .force-light-theme h2, 
        .force-light-theme span { color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; }
        .force-light-theme input::placeholder { color: #94a3b8 !important; }
      `}</style>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10 mt-8 sm:mt-0">
        <div className="p-5 sm:p-10 text-center bg-white border border-slate-200 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm relative pt-12 sm:pt-10">

          <button onClick={() => navigate('/signup')}
            className="absolute left-4 sm:left-6 top-4 sm:top-6 flex items-center gap-1 text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-md sm:rounded-none border border-slate-100 sm:border-none">
            <ChevronLeft size={14} className="sm:w-4 sm:h-4" /> Abort
          </button>

          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 bg-slate-50 border border-slate-100 shadow-sm text-black">
            <ShieldCheck size={24} className="sm:w-8 sm:h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1.5 sm:mb-2">Authentication</h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Neural token dispatched to node:</p>
          <span className="text-slate-900 font-bold text-xs sm:text-sm break-all px-2">{email}</span>

          <form onSubmit={handleVerify} className="mt-6 sm:mt-10 space-y-5 sm:space-y-6 flex flex-col items-center">
            <div className="w-full px-2 sm:px-0">
              <input
                type="text" maxLength={6} placeholder="000000" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl sm:text-4xl tracking-[0.3em] sm:tracking-[0.5em] font-mono py-3 sm:py-4 rounded-xl sm:rounded-2xl outline-none text-black font-bold bg-slate-50 border border-slate-200 focus:border-slate-400 transition-colors"
                style={{ color: '#000000', WebkitTextFillColor: '#000000' }}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="w-full p-3 sm:p-4 rounded-xl flex items-center justify-center bg-red-50 border border-red-100 text-red-600 font-medium text-[10px] sm:text-xs text-center overflow-hidden">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="w-full p-3 sm:p-4 rounded-xl flex items-center justify-center bg-green-50 border border-green-100 text-green-700 font-medium text-[10px] sm:text-xs text-center overflow-hidden">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR FIXED HERE: Loader2 kula iruntha duplicate className thookiyachu */}
            <button type="submit" disabled={isVerifying || otp.length !== 6}
              className="w-full py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base text-white bg-black hover:bg-slate-800 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isVerifying ? <Loader2 className="animate-spin sm:w-6 sm:h-6" size={20} /> : <>Verify Token <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" /></>}
            </button>
          </form>

          <div className="mt-6 sm:mt-8">
            <button onClick={() => navigate('/signup')}
              className="text-slate-400 font-bold hover:text-slate-600 transition-colors text-[10px] sm:text-xs uppercase tracking-widest bg-slate-50 sm:bg-transparent px-4 py-2 sm:p-0 rounded-full sm:rounded-none border border-slate-100 sm:border-none">
              Request New Token
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;