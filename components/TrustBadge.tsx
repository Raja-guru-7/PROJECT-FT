
import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';

interface TrustBadgeProps {
  score: number;
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ score, isVerified, size = 'md' }) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const sizes = {
    sm: 'text-xs py-0.5 px-1.5 px-2 gap-1',
    md: 'text-sm py-1 px-3 px-2 gap-2',
    lg: 'text-base py-2 px-4 px-3 gap-2'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center border rounded-full font-bold ${getScoreColor()} ${sizes[size]}`}>
        <Star size={size === 'sm' ? 12 : 16} fill="currentColor" />
        <span>{score}% Trust</span>
      </div>
      {isVerified && (
        <div className={`flex items-center gap-1 text-blue-600 font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          <ShieldCheck size={size === 'sm' ? 14 : 18} />
          <span>Verified</span>
        </div>
      )}
    </div>
  );
};

export default TrustBadge;
