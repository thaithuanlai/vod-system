import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-[#1c1c1c] border transition-colors rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-white/[0.06] focus:border-[#E50914]/60 focus:ring-[#E50914]/30'
          }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
