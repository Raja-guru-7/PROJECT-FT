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
  // Added 'whitespace-nowrap' to prevent the badge from breaking into two lines on mobile
  const sizes = {
    sm: 'text-[10px] sm:text-xs py-0.5 px-2 gap-1 whitespace-nowrap',
    md: 'text-xs sm:text-sm py-1 px-3 gap-1.5 sm:gap-2 whitespace-nowrap',
    lg: 'text-sm sm:text-base py-1.5 px-4 gap-2 whitespace-nowrap'
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-hidden">
      {/* Main Trust Pill */}
      <div className={`flex items-center border rounded-full font-bold transition-all ${getScoreColor()} ${sizes[size]}`}>
        <Star
          size={iconSizes[size]}
          fill="currentColor"
          className="shrink-0"
        />
        <span>{score}% <span className="hidden xs:inline">Trust</span></span>
      </div>

      {/* Verified Badge */}
      {isVerified && (
        <div className={`flex items-center gap-1 text-blue-600 font-bold shrink-0 ${size === 'sm' ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
          <ShieldCheck size={size === 'sm' ? 12 : 16} className="shrink-0" />
          <span className="tracking-tight">Verified</span>
        </div>
      )}
    </div>
  );
};

export default TrustBadge;