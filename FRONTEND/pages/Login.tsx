import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FloatingShapes } from '../components/3d/FloatingShapes';
import { signInWithGoogle } from '../services/googleAuth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- 3D Tilt Physics (Flicker-Free) ---
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

  // ── Original Backend Logic ───────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const { api } = await import('../services/api');
      await api.login({ email: formData.email, password: formData.password });
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const googleUserData = await signInWithGoogle();
      if (googleUserData.redirectTo) {
        if (googleUserData.token) {
          onLogin();
          navigate(googleUserData.redirectTo);
        } else {
          navigate(googleUserData.redirectTo);
        }
      } else {
        navigate('/kyc-verification');
      }
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
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
  // ────────────────────────────────────────────────────────────────────────

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm outline-none focus:border-slate-400 transition-all placeholder-slate-400";

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F5F5F7] force-light-theme overflow-hidden">

      {/* 💥 NUCLEAR CSS FOR PURE THEME & NO PINK BUTTONS 💥 */}
      <style>{`
        .force-light-theme input { color: #000000 !important; -webkit-text-fill-color: #000000 !important; }
        .force-light-theme input::placeholder { color: #94a3b8 !important; -webkit-text-fill-color: #94a3b8 !important; }
        
        button.anti-pink-btn { box-shadow: none !important; background-image: none !important; }
        button.anti-pink-btn:disabled { background-color: #f1f5f9 !important; color: #94a3b8 !important; -webkit-text-fill-color: #94a3b8 !important; border: 1px solid #e2e8f0 !important; cursor: not-allowed !important; }
        button.anti-pink-btn:not(:disabled) { background-color: #000000 !important; color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; border: none !important; cursor: pointer !important; }
        button.anti-pink-btn:not(:disabled):hover { background-color: #1e293b !important; }
      `}</style>

      {/* Optional: Subtle floating shapes in light mode colors */}
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
          {/* ── Main Card ── */}
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

              {/* Header */}
              <div className="text-center mb-8">
                <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 bg-slate-50 border border-slate-200 shadow-sm hover:scale-105 transition-transform">
                  <ShieldCheck className="text-slate-800" size={32} />
                </Link>

                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                  {isSuccess ? 'Verified!' : showOtp ? 'Security Check' : 'Welcome Back'}
                </h1>

                <div className="text-slate-500 text-sm font-medium">
                  {isSuccess
                    ? 'Accessing secure mainframe...'
                    : showOtp ? (
                      <>
                        OTP sent to{' '}
                        <span className="font-bold text-slate-800">{formData.email}</span>
                        <div className="mt-4 p-3 rounded-2xl text-xs font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200">
                          [DEV] Bypass Key:{' '}
                          <span className="font-mono tracking-widest text-sm ml-1">{generatedOtp}</span>
                        </div>
                      </>
                    )
                      : 'Sign in to access the network'}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-3 rounded-xl text-center text-red-600 bg-red-50 border border-red-100 text-xs font-bold uppercase tracking-widest"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success */}
              {isSuccess ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center justify-center py-8">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-green-50 border border-green-200">
                    <CheckCircle2 className="text-green-500" size={48} />
                  </div>
                  <p className="text-slate-800 font-black text-lg tracking-widest uppercase">Connection Secured</p>
                </motion.div>
              ) : !showOtp ? (

                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">Email</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={isLoading} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={isLoading} className={inputClass} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider">
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={isLoading} className="anti-pink-btn w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><span>Sign In</span><ArrowRight size={18} /></>}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-white">or</span></div>
                  </div>

                  <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold transition-all hover:bg-slate-50 disabled:opacity-50">
                    {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4" />}
                    Continue with Google
                  </button>
                </form>

              ) : (
                /* OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-slate-600 text-xs font-bold uppercase tracking-widest mb-2">6-Digit OTP</label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} disabled={isVerifying} className={`${inputClass} text-center tracking-[0.4em] font-mono text-xl`} />
                    </div>
                  </div>

                  <button type="submit" disabled={isVerifying} className="anti-pink-btn w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    {isVerifying ? <Loader2 className="animate-spin" size={20} /> : <><span>Verify OTP</span><ArrowRight size={18} /></>}
                  </button>

                  <button type="button" onClick={() => setShowOtp(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-800 transition-colors text-center block pt-2">
                    ← Go Back
                  </button>
                </form>
              )}

              {!showOtp && !isSuccess && (
                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm font-medium">
                    New here?{' '}
                    <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-2">Create Account</Link>
                  </p>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;