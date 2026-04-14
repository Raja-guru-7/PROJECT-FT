import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ score, isVerified, size = 'md' }) => {
  // Logic remains untouched, colors are consistent
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  // Responsive sizing logic 
  // Maintained whitespace-nowrap and flexible padding for mobile
  const sizes = {
    sm: 'text-[9px] sm:text-[10px] md:text-xs py-0.5 px-1.5 sm:px-2 gap-0.5 sm:gap-1 whitespace-nowrap',
    md: 'text-[10px] sm:text-xs md:text-sm py-1 px-2 sm:px-3 gap-1 sm:gap-1.5 whitespace-nowrap',
    lg: 'text-xs sm:text-sm md:text-base py-1 sm:py-1.5 px-3 sm:px-4 gap-1.5 sm:gap-2 whitespace-nowrap'
  };

  const iconSizes = {
    sm: 10,
    md: 12, // slightly smaller on mobile, scales naturally
    lg: 16
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 max-w-full overflow-hidden">
      {/* Main Trust Pill */}
      <div className={`flex items-center border rounded-full font-bold transition-all ${getScoreColor()} ${sizes[size]}`}>
        <Star
          size={iconSizes[size]}
          fill="currentColor"
          className="shrink-0"
        />
        <span>{score}% <span className="hidden sm:inline">Trust</span></span>
      </div>

      {/* Verified Badge */}
      {isVerified && (
        <div className={`flex items-center gap-0.5 sm:gap-1 text-blue-600 font-bold shrink-0 ${size === 'sm' ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs md:text-sm'}`}>
          <ShieldCheck size={size === 'sm' ? 10 : 14} className="shrink-0 sm:w-4 sm:h-4" />
          <span className="tracking-tight">Verified</span>
        </div>
      )}
    </div>
  );
};

export default TrustBadge;