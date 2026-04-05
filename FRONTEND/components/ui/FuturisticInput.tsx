import React from 'react';

interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  textarea?: boolean;
}

export const FuturisticInput: React.FC<FuturisticInputProps> = ({ label, icon, textarea = false, className = '', ...props }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <label className="block text-xs font-bold text-[#334155] mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {textarea ? (
          <textarea
            {...(props as any)}
            className="w-full liquid-glass text-[#0f172a] focus:border-[#6366f1] focus:ring-0 transition-all placeholder:text-[#64748b] min-h-[100px] px-4 py-3"
          />
        ) : (
          <input
            {...props}
            className={`w-full liquid-glass text-[#0f172a] focus:border-[#6366f1] focus:ring-0 transition-all placeholder:text-[#64748b] px-4 py-3 ${icon ? 'pl-10' : ''}`}
          />
        )}
        {icon && (
          <div className="absolute left-3 top-[14px] text-[#475569]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
