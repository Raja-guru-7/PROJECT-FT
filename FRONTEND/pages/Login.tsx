import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
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
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      await api.sendLoginOtp(formData.email, formData.password);
      setShowOtp(true);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }
    setIsVerifying(true);
    try {
      const { api } = await import('../services/api');
      await api.verifyLoginOtp(formData.email, otp);
      setIsSuccess(true);
      setTimeout(() => {
        onLogin();
        navigate('/explore');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Incorrect OTP. Please try again.');
      setIsVerifying(false);
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

  const inputClass =
    "w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs sm:text-sm outline-none focus:border-slate-400 transition-all placeholder-slate-400";

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
        className="relative z-20 w-full max-w-md mx-auto"
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
            className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200"
            style={{
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
              transform: "translate3d(0, 0, 30px)",
              outline: "1px solid transparent",
              backfaceVisibility: "hidden"
            }}
          >
            <div style={{ transform: "translateZ(20px)", backfaceVisibility: "hidden" }}>

              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-2xl mb-4 sm:mb-5 bg-slate-50 border border-slate-200 shadow-sm hover:scale-105 transition-transform"
                >
                  <ShieldCheck className="text-slate-800 w-6 h-6 sm:w-8 sm:h-8" />
                </Link>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1.5 sm:mb-2">
                  {isSuccess ? 'Verified!' : showOtp ? 'Security Check' : 'Welcome Back'}
                </h1>

                <div className="text-slate-500 text-xs sm:text-sm font-medium px-2">
                  {isSuccess
                    ? 'Accessing secure mainframe...'
                    : showOtp
                      ? <>OTP sent to <span className="font-bold text-slate-800 break-all">{formData.email}</span></>
                      : 'Sign in to access the network'}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 sm:mb-6 p-2.5 sm:p-3 rounded-xl text-center text-red-600 bg-red-50 border border-red-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Success ── */}
              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 sm:py-8"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 bg-green-50 border border-green-200">
                    <CheckCircle2 className="text-green-500 w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <p className="text-slate-800 font-black text-base sm:text-lg tracking-wider sm:tracking-widest uppercase text-center">
                    Connection Secured
                  </p>
                </motion.div>

              ) : !showOtp ? (

                /* ── Step 1: Email + Password ── */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ml-1">Email</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-4 sm:h-4 w-[14px] h-[14px]" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ml-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-4 sm:h-4 w-[14px] h-[14px]" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="anti-pink-btn w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading
                      ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                      : <><span>Sign In</span><ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest bg-white">or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isGoogleLoading
                      ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                      : <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    Continue with Google
                  </button>
                </form>

              ) : (

                /* ── Step 2: OTP ── */
                <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ml-1">
                      4-Digit OTP
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 sm:w-4 sm:h-4 w-[14px] h-[14px]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        disabled={isVerifying}
                        className={`${inputClass} text-center tracking-[0.3em] sm:tracking-[0.5em] font-mono text-lg sm:text-xl`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="anti-pink-btn w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isVerifying
                      ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                      : <><span>Verify OTP</span><ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowOtp(false); setOtp(''); setError(''); }}
                    className="w-full text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:text-slate-800 transition-colors text-center block pt-2"
                  >
                    ← Go Back
                  </button>
                </form>
              )}

              {!showOtp && !isSuccess && (
                <div className="mt-6 sm:mt-8 text-center pt-5 sm:pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    New here?{' '}
                    <Link to="/signup" className="text-slate-900 font-bold hover:underline underline-offset-2">
                      Create Account
                    </Link>
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