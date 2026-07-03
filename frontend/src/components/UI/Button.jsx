export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  disabled, 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]";
  
  const variants = {
    primary: "bg-[#E50914] text-white hover:bg-[#f40612] focus:ring-[#E50914]",
    secondary: "bg-[#2a2a2a] text-white hover:bg-[#333] focus:ring-[#444]",
    outline: "border border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1f1f1f] focus:ring-[#444]",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const sizeClass = sizes[props.size] || sizes.md;
  const isDisabled = loading || disabled;

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizeClass} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
