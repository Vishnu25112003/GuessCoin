import React, { forwardRef } from "react";

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-cyber-primary font-display text-sm uppercase tracking-wider mb-2 cyber-text-glow">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-primary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-cyber-dark bg-opacity-50 backdrop-blur-sm
              border-2 border-cyber-primary border-opacity-30
              focus:border-opacity-100 focus:shadow-cyber-md
              rounded px-4 py-3 ${icon ? "pl-11" : ""}
              text-cyber-text font-mono
              placeholder:text-gray-500
              outline-none transition-all duration-300
              ${error ? "border-cyber-danger" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-cyber-danger text-xs font-mono">{error}</p>
        )}
      </div>
    );
  },
);

CyberInput.displayName = "CyberInput";
