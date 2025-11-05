import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: "primary" | "success" | "warning" | "info";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  variant = "primary",
}) => {
  const variantColors = {
    primary: "text-cyber-primary border-cyber-primary",
    success: "text-cyber-success border-cyber-success",
    warning: "text-cyber-accent border-cyber-accent",
    info: "text-blue-400 border-blue-400",
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3
        bg-cyber-dark bg-opacity-50 backdrop-blur-sm
        border ${variantColors[variant]} border-opacity-30
        rounded-lg shadow-cyber-sm
      `}
    >
      <div className={variantColors[variant]}>{icon}</div>
      <div>
        <p className="text-gray-400 font-mono text-xs uppercase">{label}</p>
        <p
          className={`font-display font-bold text-lg ${variantColors[variant]}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
