import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FloatingShapes } from '../components/3d/FloatingShapes';
import { signInWithGoogle } from '../services/googleAuth';

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: Math.random().toString(36).slice(-10) + 'A1!',
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const googleUserData = await signInWithGoogle();
      navigate('/kyc');
    } catch (err: any) {
      setError('Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.name) {
      setError('Please enter your name and email first');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.sendRegistrationOtp(formData.email, formData.name);
      showToast('Verification Code Sent to Email');
      setIsOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isOtpSent) {
      await handleSendOTP();
      return;
    }

    if (formData.otp.length !== 4) {
      setError('Enter 4-digit Verification Code');
      return;
    }

    if (!agreed) {
      setError('You must agree to the Network Protocols');
      return;
    }

    setIsVerifying(true);
    setIsLoading(true);
    try {
      const { api } = await import('../services/api');

      await api.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });

      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.id) {
          localStorage.setItem('pendingUserId', savedUser.id);
          localStorage.setItem('userId', savedUser.id);
        }
      }

      showToast('Profile Registered on Network');
      setTimeout(() => navigate('/kyc'), 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failure. Try again.');
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

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

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-slate-400 transition-all placeholder-slate-400";

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

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700"
          >
            <span className="font-bold tracking-widest uppercase text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply">
        <FloatingShapes />
      </div>

      <motion.div
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        className="relative z-20 w-full max-w-lg my-auto"
      >
        <motion.div
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        >
          <div
            className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200"
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
              transform: "translate3d(0, 0, 30px)",
              outline: "1px solid transparent",
              backfaceVisibility: "hidden"
            }}
          >
            <div style={{ transform: "translateZ(20px)", backfaceVisibility: "hidden" }}>

              <div className="text-center mb-8">
                <Link to="/" className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 bg-slate-50 border border-slate-200 shadow-sm hover:scale-105 transition-transform">
                  <ShieldCheck className="text-slate-800" size={32} />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2 uppercase">Create Profile</h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base">Register your identity on the network</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl flex items-center justify-center bg-red-50 border border-red-100"
                  >
                    <span className="text-red-600 font-bold text-xs uppercase tracking-[0.1em] text-center">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSignup} className="space-y-5">

                <div>
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-1.5">Operative Designation</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-1.5">Communication Frequency</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="john@network.local" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                  </div>
                </div>

                {isOtpSent && !isVerified && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 p-5 rounded-2xl bg-amber-50 border border-amber-200"
                  >
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-widest">
                      <ShieldCheck size={16} /> Verification Required
                    </div>
                    <input type="text" placeholder="ENTER 4-DIGIT CODE" maxLength={4} value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-center tracking-[0.5em] font-mono outline-none focus:border-slate-400 transition-all"
                    />
                    <p className="text-[10px] text-amber-700 text-center uppercase tracking-wider font-bold">
                      Check your email for the security cipher
                    </p>
                  </motion.div>
                )}

                <div className="flex items-start gap-3 px-1 mt-2">
                  <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-slate-900" />
                  <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer leading-tight font-medium">
                    I acknowledge the <span className="text-slate-900 font-bold hover:underline">Network Terms</span> and consent to data node synchronization.
                  </label>
                </div>

                <button type="submit" disabled={isLoading || (isOtpSent && formData.otp.length !== 4)}
                  className="anti-pink-btn w-full mt-2 py-3.5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={22} /> : isOtpSent ? <>Verify & Register <CheckCircle2 size={18} /></> : <>Send Verification Code <ArrowRight size={18} /></>}
                </button>

                <div className="relative mt-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center"><span className="px-4 text-slate-400 uppercase tracking-widest text-xs font-bold bg-white">Or Sign Up With</span></div>
                </div>

                <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm transition-all hover:bg-slate-50 disabled:opacity-60 active:scale-[0.98]"
                >
                  {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4" />}
                  Continue with Google
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm font-medium">
                  Recognized Entity?{' '}
                  <Link to="/login" className="text-slate-900 font-bold hover:underline uppercase tracking-wider text-xs ml-1">Access Node</Link>
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;