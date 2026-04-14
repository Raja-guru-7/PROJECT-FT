import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Loader2, ChevronLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReturnHandover: React.FC = () => {
  const { txId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [returnOtp, setReturnOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = [React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null), React.useRef<HTMLInputElement>(null)];

  const initiateReturn = async () => {
    if (!txId) return; setLoading(true);
    try { const res = await api.requestReturn(txId); setReturnOtp(res.returnOtpCode); setStep(2); }
    catch { alert('Failed to initiate return'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const completeReturn = async () => {
    if (!txId) return; setLoading(true);
    try { await api.completeReturn(txId, otp.join('')); alert('Return completed! Trust score updated.'); setTimeout(() => navigate('/dashboard'), 2000); }
    catch { alert('Invalid OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen px-4 md:px-8 py-8 sm:py-12 pb-24 relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 sm:top-12 left-4 md:left-8 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors group z-10 bg-white/80 sm:bg-transparent backdrop-blur px-3 py-1.5 sm:p-0 rounded-full shadow-sm border border-slate-100 sm:shadow-none sm:border-none">
        <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] group-hover:-translate-x-1 transition-transform" /> Back
      </button>
      <div className="max-w-md mx-auto relative z-10 mt-10 sm:mt-0">

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-6 sm:mb-8 text-center">Return Protocol</h1>

        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 p-6 sm:p-8 shadow-sm">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 sm:space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto bg-amber-50 text-amber-600 border border-amber-100">
                <RotateCcw size={24} className="sm:w-[30px] sm:h-[30px]" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Initiate Return</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 px-2">Generate a return code. Share it with the owner to confirm item return.</p>
              </div>
              <button onClick={initiateReturn} disabled={loading} className="w-full py-3.5 rounded-full bg-black text-white text-sm sm:text-base font-semibold flex items-center justify-center disabled:opacity-50 mt-2 sm:mt-0">
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Code'}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 sm:space-y-6 text-center">
              {returnOtp && (
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-slate-50 border border-slate-200">
                  <p className="text-slate-500 font-semibold text-[10px] sm:text-xs uppercase tracking-wide mb-1 sm:mb-2">Dev Override Active</p>
                  <p className="text-slate-800 font-bold text-3xl sm:text-4xl font-mono tracking-widest">{returnOtp.slice(-4)}</p>
                </div>
              )}
              <div className="pt-2 sm:pt-4">
                <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-3 sm:mb-4">Owner enters code below</p>
                <div className="flex justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                  {otp.map((digit, i) => (
                    <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors"
                      style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }} />
                  ))}
                </div>
                <button onClick={completeReturn} disabled={otp.some(d => !d) || loading} className="w-full py-3.5 rounded-full bg-black text-white text-sm sm:text-base font-semibold flex items-center justify-center disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Return'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm items-start">
          <ShieldCheck size={20} className="sm:w-6 sm:h-6 shrink-0 text-slate-400 mt-0.5" />
          <p className="text-slate-600 font-medium text-[10px] sm:text-xs leading-relaxed">Both parties trust scores will increase upon successful return.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnHandover;