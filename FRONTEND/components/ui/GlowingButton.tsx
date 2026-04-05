import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlowingButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "relative px-6 py-3 rounded-full font-bold text-sm tracking-wide overflow-hidden flex items-center justify-center gap-2";
  
  const variants = {
    primary: "btn-primary shadow-lg shadow-indigo-500/30 text-white",
    outline: "border border-purple-500/50 text-purple-600 hover:bg-purple-500/10",
    ghost: "text-slate-500 hover:text-purple-600 hover:bg-purple-500/5",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-cyan-100/10 rounded-full" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
