import React, { useRef, useState } from 'react';
import { ShieldCheck, Video, Search, ArrowRight, MapPin, Sun, Moon } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Dotgrid from '../components/ui/Dotgrid';

interface LandingProps {
  onLogin: () => void;
}

type Theme = 'dark' | 'light';

const tokens = {
  dark: {
    pageBg: '#0a0a0a',
    navBg: 'rgba(10,10,10,0.80)',
    navBorder: 'rgba(255,255,255,0.10)',
    navShadow: '0 8px 40px rgba(0,0,0,0.6)',
    glassCard: {
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '20px',
      boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.10) inset',
    },
    logoIconBg: 'rgba(255,255,255,0.08)',
    logoIconBorder: 'rgba(255,255,255,0.18)',
    logoIconShadow: '0 4px 20px rgba(255,255,255,0.10)',
    logoText: '#ffffff',
    navLink: 'rgba(255,255,255,0.50)',
    navLinkHover: '#ffffff',
    exploreBtn: { bg: '#ffffff', color: '#000000', shadow: '0 0 24px rgba(255,255,255,0.20)' },
    heroTitle: '#ffffff',
    heroAccent: 'linear-gradient(135deg, #ffffff, #aaaaaa)',
    heroSub: 'rgba(255,255,255,0.50)',
    startBtn: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.25)',
      shadow: '0 4px 24px rgba(255,255,255,0.08)',
      color: '#ffffff',
    },
    tiltGloss: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
    cardLabel: 'rgba(255,255,255,0.60)',
    cardLabel2: 'rgba(255,255,255,0.60)',
    cardTitle: '#ffffff',
    cardSub: 'rgba(255,255,255,0.50)',
    featHeading: '#ffffff',
    featSub: 'rgba(255,255,255,0.50)',
    iconBg: 'rgba(255,255,255,0.08)',
    iconBorder: 'rgba(255,255,255,0.15)',
    iconShadow: '0 4px 16px rgba(255,255,255,0.05)',
    featTitle: '#ffffff',
    featBody: 'rgba(255,255,255,0.50)',
    toggleBg: 'rgba(255,255,255,0.08)',
    toggleBorder: 'rgba(255,255,255,0.18)',
    toggleThumb: '#ffffff',
    toggleIcon: '#000000',
    dotBase: '#2a2a2a',
    dotActive: '#ffffff',
    dotBg: '#000000',
    galaxyVisible: true,
  },
  light: {
    pageBg: '#ffffff',
    navBg: 'rgba(255,255,255,0.85)',
    navBorder: 'rgba(0,0,0,0.08)',
    navShadow: '0 4px 24px rgba(0,0,0,0.08)',
    glassCard: {
      background: 'rgba(255,255,255,0.80)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: '20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.90) inset',
    },
    logoIconBg: 'rgba(0,0,0,0.05)',
    logoIconBorder: 'rgba(0,0,0,0.12)',
    logoIconShadow: '0 4px 20px rgba(0,0,0,0.08)',
    logoText: '#0a0a0a',
    navLink: 'rgba(0,0,0,0.45)',
    navLinkHover: '#0a0a0a',
    exploreBtn: { bg: '#000000', color: '#ffffff', shadow: '0 0 20px rgba(0,0,0,0.15)' },
    heroTitle: '#0a0a0a',
    heroAccent: 'linear-gradient(135deg, #0a0a0a, #555555)',
    heroSub: 'rgba(0,0,0,0.50)',
    startBtn: {
      background: 'rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.15)',
      shadow: '0 4px 20px rgba(0,0,0,0.06)',
      color: '#0a0a0a',
    },
    tiltGloss: 'linear-gradient(135deg, rgba(255,255,255,0.70) 0%, transparent 60%)',
    cardLabel: 'rgba(0,0,0,0.45)',
    cardLabel2: 'rgba(0,0,0,0.45)',
    cardTitle: '#0a0a0a',
    cardSub: 'rgba(0,0,0,0.45)',
    featHeading: '#0a0a0a',
    featSub: 'rgba(0,0,0,0.50)',
    iconBg: 'rgba(0,0,0,0.05)',
    iconBorder: 'rgba(0,0,0,0.10)',
    iconShadow: '0 4px 16px rgba(0,0,0,0.05)',
    featTitle: '#0a0a0a',
    featBody: 'rgba(0,0,0,0.50)',
    toggleBg: 'rgba(0,0,0,0.07)',
    toggleBorder: 'rgba(0,0,0,0.15)',
    toggleThumb: '#000000',
    toggleIcon: '#ffffff',
    dotBase: '#d0d0d0',
    dotActive: '#000000',
    dotBg: 'transparent',
    galaxyVisible: true,
  },
} as const;

const getGlassCard = (theme: Theme): React.CSSProperties => tokens[theme].glassCard;

const ThemeToggle: React.FC<{ theme: Theme; onToggle: () => void }> = ({ theme, onToggle }) => {
  const t = tokens[theme];
  const isLight = theme === 'light';
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      style={{
        width: 52, height: 28, borderRadius: 14,
        background: t.toggleBg, border: `1px solid ${t.toggleBorder}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '3px',
        position: 'relative', transition: 'background 0.4s, border-color 0.4s',
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ x: isLight ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          width: 22, height: 22, borderRadius: '50%', background: t.toggleThumb,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
        }}
      >
        {isLight
          ? <Sun size={12} color={t.toggleIcon} strokeWidth={2.5} />
          : <Moon size={12} color={t.toggleIcon} strokeWidth={2.5} />
        }
      </motion.div>
    </motion.button>
  );
};

const TiltCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  theme: Theme;
}> = ({ children, style, className, theme }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });
  const gloss = useSpring(useTransform(x, [-0.5, 0.5], [0.05, 0.18]), { stiffness: 300, damping: 30 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ ...getGlassCard(theme), ...style, rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800, cursor: 'default' }}
      className={className}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <motion.div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: tokens[theme].tiltGloss, opacity: gloss, pointerEvents: 'none' }} />
      <div style={{ transform: 'translateZ(18px)', position: 'relative' }}>{children}</div>
    </motion.div>
  );
};

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const t = tokens[theme];
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden" style={{ backgroundColor: t.pageBg, transition: 'background-color 0.5s ease' }}>

      {/* DotGrid Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: t.dotBg, zIndex: 0, opacity: t.galaxyVisible ? 1 : 0, transition: 'opacity 0.6s ease, background-color 0.5s ease' }}>
        <Dotgrid dotSize={4} gap={18} baseColor={t.dotBase} activeColor={t.dotActive} proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
      </div>




      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full flex flex-col min-h-screen relative z-10 pointer-events-none">

        {/* Navbar */}
        <nav className="w-[calc(100%-2rem)] mx-auto mt-4 sticky top-4 z-50 pointer-events-auto" style={{ background: t.navBg, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: `1px solid ${t.navBorder}`, borderRadius: '9999px', boxShadow: t.navShadow, transition: 'background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease' }}>
          <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-full group-hover:scale-105 transition-transform" style={{ background: t.logoIconBg, border: `1px solid ${t.logoIconBorder}`, boxShadow: t.logoIconShadow, transition: 'background 0.5s, border-color 0.5s, box-shadow 0.5s' }}>
                <ShieldCheck style={{ color: theme === 'dark' ? '#ffffff' : '#0a0a0a' }} size={20} />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tight drop-shadow-md" style={{ color: t.logoText, transition: 'color 0.5s' }}>AroundU</span>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold">
              <a href="#features" className="transition-colors cursor-pointer" style={{ color: t.navLink }} onMouseEnter={e => (e.currentTarget.style.color = t.navLinkHover)} onMouseLeave={e => (e.currentTarget.style.color = t.navLink)}>How it Works</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <motion.button onClick={onLogin} whileHover={{ scale: 1.05, opacity: 0.92 }} whileTap={{ scale: 0.96 }} className="py-3 px-8 font-extrabold rounded-2xl uppercase tracking-widest text-xs transition-all" style={{ background: t.exploreBtn.bg, color: t.exploreBtn.color, boxShadow: t.exploreBtn.shadow, cursor: 'pointer', border: 'none', transition: 'background 0.5s, box-shadow 0.5s' }}>
                Explore Network
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="relative w-full min-h-[85vh] flex items-center">
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="text-center md:text-left pointer-events-auto">
              <h1 key={theme} className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6 drop-shadow-md" style={{ color: t.heroTitle, transition: 'color 0.5s' }}>
                Access Everything,
                <br />
                {/* ✅ FIX: display inline-block + color transparent prevents orange box in light mode */}
                <span style={{ background: t.heroAccent, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', display: 'inline-block', transition: 'background 0.5s' }}>
                  Locally.
                </span>
              </h1>
              <p className="max-w-md mx-auto md:mx-0 text-sm sm:text-base lg:text-lg mb-10 font-medium" style={{ color: t.heroSub, transition: 'color 0.5s' }}>
                Unlock a neighborhood of shared resources. Rent anything you need from trusted people nearby, secured by a revolutionary 3D trust protocol.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <motion.button onClick={onLogin} whileHover={{ scale: 1.05, opacity: 0.92 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-2 text-base sm:text-lg px-8 py-4 rounded-2xl font-black uppercase tracking-widest" style={{ background: t.startBtn.background, border: t.startBtn.border, boxShadow: t.startBtn.shadow, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', cursor: 'pointer', color: t.startBtn.color, transition: 'background 0.5s, border-color 0.5s, box-shadow 0.5s, color 0.5s' }}>
                  Start Exploring <ArrowRight size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* 3D Tilt Cards */}
            <div className="hidden md:flex relative h-[500px] items-center justify-center pointer-events-auto" style={{ perspective: 1000 }}>
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="absolute top-10 right-10">
                <TiltCard style={{ padding: '1.25rem', width: '16rem' }} theme={theme}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.cardLabel, transition: 'color 0.5s' }}>NOW RENTING</p>
                  <p className="text-lg font-bold mt-1" style={{ color: t.cardTitle, transition: 'color 0.5s' }}>Professional Camera</p>
                  <div className="flex items-center gap-2 mt-4">
                    <img src={`https://ui-avatars.com/api/?name=RG&background=${theme === 'dark' ? 'ffffff' : '0a0a0a'}&color=${theme === 'dark' ? '000000' : 'ffffff'}`} className="w-8 h-8 rounded-full" alt="user" style={{ border: `2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)'}` }} />
                    <span className="text-sm font-semibold" style={{ color: t.cardSub, transition: 'color 0.5s' }}>from RG</span>
                  </div>
                </TiltCard>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.8, y: -50 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="absolute bottom-10 left-10">
                <TiltCard style={{ padding: '1.25rem', width: '14rem' }} theme={theme}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: t.cardLabel2, transition: 'color 0.5s' }}>NEW LISTING</p>
                  <p className="text-lg font-bold mt-1" style={{ color: t.cardTitle, transition: 'color 0.5s' }}>Camping Tent</p>
                  <div className="flex items-center gap-2 mt-2 text-sm font-bold" style={{ color: t.cardSub, transition: 'color 0.5s' }}>
                    <MapPin size={14} /> SoHo Junction
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Features */}
        <section id="features" className="relative py-20 lg:py-32 pointer-events-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 drop-shadow-md uppercase" style={{ color: t.featHeading, transition: 'color 0.5s' }}>A Safer Way to Share</h2>
              <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-16 font-medium" style={{ color: t.featSub, transition: 'color 0.5s' }}>Our trust-first system ensures every transaction is secure, transparent, and simple.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<Search size={24} />} title="Discover Locally" description="Find what you need, right in your neighborhood, from tools to tech." delay={0.1} theme={theme} />
              <FeatureCard icon={<Video size={24} />} title="Verify Securely" description="Live video and OTP handshakes mean you know exactly what you're getting." delay={0.2} theme={theme} />
              <FeatureCard icon={<ShieldCheck size={24} />} title="Transact with Trust" description="Smart escrow holds payment until both parties confirm a successful return." delay={0.3} theme={theme} />
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay, theme }: { icon: React.ReactNode; title: string; description: string; delay: number; theme: Theme }) => {
  const t = tokens[theme];
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 280, damping: 28 });
  const gloss = useSpring(useTransform(x, [-0.5, 0.5], [0.04, 0.16]), { stiffness: 280, damping: 28 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} className="h-full">
      <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} whileHover={{ scale: 1.03, y: -6 }} transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        style={{ ...getGlassCard(theme), padding: '2rem', height: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transformStyle: 'preserve-3d', rotateX, rotateY, cursor: 'default', transition: 'background 0.5s, border-color 0.5s, box-shadow 0.5s' }}>
        <motion.div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: t.tiltGloss, opacity: gloss, pointerEvents: 'none' }} />
        <div style={{ transform: 'translateZ(12px)', position: 'relative' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: t.iconBg, border: `1px solid ${t.iconBorder}`, boxShadow: t.iconShadow, color: theme === 'dark' ? '#ffffff' : '#0a0a0a', transition: 'background 0.5s, border-color 0.5s, box-shadow 0.5s, color 0.5s' }}>
            {icon}
          </div>
          <h3 className="text-xl font-black mb-3 uppercase tracking-wide" style={{ color: t.featTitle, transition: 'color 0.5s' }}>{title}</h3>
          <p className="leading-relaxed font-medium" style={{ color: t.featBody, transition: 'color 0.5s' }}>{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;