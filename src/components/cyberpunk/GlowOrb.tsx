import React from "react";

interface GlowOrbProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "purple";
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({
  children,
  size = "md",
  color = "primary",
  active = false,
  onClick,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16 text-sm",
    md: "w-24 h-24 text-base",
    lg: "w-32 h-32 text-lg",
    xl: "w-48 h-48 text-2xl",
  };

  const colorClasses = {
    primary: "bg-gradient-to-br from-cyber-primary to-blue-500 shadow-cyber-lg",
    secondary:
      "bg-gradient-to-br from-cyber-secondary to-pink-500 shadow-cyber-pink",
    purple:
      "bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_30px_rgba(147,51,234,0.7)]",
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full flex items-center justify-center
        font-display font-bold uppercase
        ${active ? "animate-pulse-glow scale-110" : ""}
        ${onClick ? "cursor-pointer hover:scale-105" : ""}
        transition-all duration-300
        ${className}
      `}
    >
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
};
