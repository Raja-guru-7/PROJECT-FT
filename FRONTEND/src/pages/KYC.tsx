import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, Loader2, ArrowRight, ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FloatingShapes } from '../../components/3d/FloatingShapes';

type Step = 'aadhar' | 'otp' | 'password' | 'success';

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://aroundu-backend-hd26.onrender.com') + '/api';

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('aadhar');
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharError, setAadharError] = useState('');
  const [aadharLoading, setAadharLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const userId = localStorage.getItem('pendingUserId') || localStorage.getItem('userId');

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadharNumber(raw);
  };
  const displayAadhar = aadharNumber.replace(/(\d{4})(\d{1,4})?(\d{1,4})?/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));

  const handleAadharSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAadharError('');
    if (!/^\d{12}$/.test(aadharNumber)) { setAadharError('Aadhaar number must be exactly 12 digits'); return; }
    setAadharLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/kyc/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadharNumber, userId })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.otp) setDevOtp(data.otp);
        setStep('otp');
      } else {
        setAadharError(data.msg || 'Failed to send OTP');
      }
    } catch { setAadharError('Network error. Please try again.'); }
    finally { setAadharLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setOtpError('');
    if (otp.length !== 4) { setOtpError('Enter 4-digit OTP'); return; }
    setOtpLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/kyc/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, userId })
      });
      const data = await res.json();
      if (res.ok) setStep('password'); else setOtpError(data.msg || 'Invalid OTP');
    } catch { setOtpError('Network error. Please try again.'); }
    finally { setOtpLoading(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError('');
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    setPasswordLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/kyc/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, userId })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('pendingUserId');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setStep('success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setPasswordError(data.msg || 'Failed to set password');
      }
    } catch { setPasswordError('Network error. Please try again.'); }
    finally { setPasswordLoading(false); }
  };

  const handleResendOtp = async () => {
    setOtpError(''); setOtpLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/kyc/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.otp) setDevOtp(data.otp);
      if (!res.ok) setOtpError(data.msg || 'Failed to resend OTP');
    } catch { setOtpError('Network error. Please try again.'); }
    finally { setOtpLoading(false); }
  };

  const inputClass = "w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm outline-none focus:border-slate-400 transition-all placeholder-slate-400";

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F5F5F7] force-light-theme overflow-hidden">
      <style>{`
        .force-light-theme input { color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
        .force-light-theme input::placeholder { color: #94a3b8 !important; -webkit-text-fill-color: #94a3b8 !important; }
        button.anti-pink-btn { box-shadow: none !important; background-image: none !important; }
        button.anti-pink-btn:disabled { background-color: #f1f5f9 !important; color: #94a3b8 !important; -webkit-text-fill-color: #94a3b8 !important; border: 1px solid #e2e8f0 !important; cursor: not-allowed !important; }
        button.anti-pink-btn:not(:disabled) { background-color: #000000 !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; border: none !important; cursor: pointer !important; }
        button.anti-pink-btn:not(:disabled):hover { background-color: #1e293b !important; }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply">
        <FloatingShapes />
      </div>

      <motion.div
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        className="relative z-20 w-full max-w-md"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <div
            className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200"
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
              transform: "translate3d(0, 0, 30px)",
              outline: "1px solid transparent",
              backfaceVisibility: "hidden"
            }}
          >
            <div style={{ transform: "translateZ(20px)", backfaceVisibility: "hidden" }}>

              {/* SUCCESS */}
              {step === 'success' && (
                <div className="text-center py-6">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-50 border border-green-200">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">KYC Verified!</h1>
                  <p className="font-bold text-lg uppercase tracking-widest text-slate-800">Password Created</p>
                  <p className="text-sm mt-2 text-slate-500 font-medium">Redirecting to login...</p>
                </div>
              )}

              {/* AADHAR */}
              {step === 'aadhar' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <ShieldCheck className="text-slate-800" size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Identity Verification</h1>
                    <p className="text-sm text-slate-500 font-medium">Complete KYC to access the network</p>
                  </div>
                  <AnimatePresence>
                    {aadharError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-3 rounded-xl text-center text-red-600 bg-red-50 border border-red-100 text-xs font-bold uppercase tracking-widest">
                        {aadharError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <form onSubmit={handleAadharSubmit} className="space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-widest mb-4">
                        <CreditCard size={16} className="text-slate-400" /> Government ID Registry
                      </div>
                      <div className="relative">
                        <input type="text" placeholder="XXXX XXXX XXXX" maxLength={14} value={displayAadhar} onChange={handleAadharChange} disabled={aadharLoading}
                          className={`${inputClass} tracking-[0.2em] font-mono`} />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">12 digits</div>
                      </div>
                    </div>
                    <button type="submit" disabled={aadharLoading || aadharNumber.length !== 12} className="anti-pink-btn w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                      {aadharLoading ? <Loader2 className="animate-spin" size={20} /> : <>Send OTP <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </>
              )}

              {/* OTP */}
              {step === 'otp' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <KeyRound className="text-slate-800" size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Verify OTP</h1>
                    <p className="text-sm text-slate-500 font-medium">Enter the 4-digit OTP</p>
                  </div>

                  {devOtp && (
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">dev</span>
                      <span className="text-lg font-black tracking-[0.3em] text-indigo-500 font-mono">{devOtp}</span>
                    </div>
                  )}

                  <AnimatePresence>
                    {otpError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-3 rounded-xl text-center text-red-600 bg-red-50 border border-red-100 text-xs font-bold uppercase tracking-widest">
                        {otpError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <input type="text" placeholder="1 2 3 4" maxLength={4} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} disabled={otpLoading}
                      className={`${inputClass} text-center text-2xl tracking-[0.5em] font-mono py-4`} />
                    <button type="submit" disabled={otpLoading || otp.length !== 4} className="anti-pink-btn w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4">
                      {otpLoading ? <Loader2 className="animate-spin" size={20} /> : <>Verify OTP <ArrowRight size={18} /></>}
                    </button>
                    <button type="button" onClick={handleResendOtp} disabled={otpLoading} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-800 transition-colors text-center block">
                      {otpLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                    <button type="button" onClick={() => setStep('aadhar')} className="w-full mt-2 text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-800 transition-colors text-center block">
                      ← Back
                    </button>
                  </form>
                </>
              )}

              {/* PASSWORD */}
              {step === 'password' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Lock className="text-slate-800" size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Create Password</h1>
                    <p className="text-sm text-slate-500 font-medium">Set your login password for AroundU</p>
                  </div>
                  <AnimatePresence>
                    {passwordError && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-3 rounded-xl text-center text-red-600 bg-red-50 border border-red-100 text-xs font-bold uppercase tracking-widest">
                        {passwordError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                      <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} disabled={passwordLoading} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">Confirm Password</label>
                      <input type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={passwordLoading} className={inputClass} />
                    </div>
                    <button type="submit" disabled={passwordLoading || !password || !confirmPassword} className="anti-pink-btn w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-6">
                      {passwordLoading ? <Loader2 className="animate-spin" size={20} /> : <>Create Password <ArrowRight size={18} /></>}
                    </button>
                    <button type="button" onClick={() => setStep('otp')} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-800 transition-colors text-center block">
                      ← Back
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default KYC;