// import React from "react";

// type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info";

// interface CyberBadgeProps {
//   children: React.ReactNode;
//   variant?: BadgeVariant;
//   pulse?: boolean;
//   className?: string;
// }

// export const CyberBadge: React.FC<CyberBadgeProps> = ({
//   children,
//   variant = "primary",
//   pulse = false,
//   className = "",
// }) => {
//   const variantClasses = {
//     primary: "bg-cyber-primary text-cyber-darker border-cyber-primary",
//     success: "bg-cyber-success text-cyber-darker border-cyber-success",
//     warning: "bg-cyber-accent text-cyber-darker border-cyber-accent",
//     danger: "bg-cyber-danger text-white border-cyber-danger",
//     info: "bg-blue-500 text-white border-blue-500",
//   };

//   return (
//     <span
//       className={`
//         inline-flex items-center gap-2 px-3 py-1
//         border-2 rounded-full
//         font-mono text-xs font-bold uppercase tracking-wider
//         ${variantClasses[variant]}
//         ${pulse ? "animate-pulse-glow" : ""}
//         ${className}
//       `}
//     >
//       {pulse && (
//         <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
//       )}
//       {children}
//     </span>
//   );
// };



import React from "react";

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "error";
  className?: string;
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = "info",
  className = "",
}) => {
  const variants = {
    success: "bg-green-900/50 border-green-500/50 text-green-300",
    warning: "bg-yellow-900/50 border-yellow-500/50 text-yellow-300",
    info: "bg-cyan-900/50 border-cyan-500/50 text-cyan-300",
    error: "bg-red-900/50 border-red-500/50 text-red-300",
  };

  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold
        border border-current
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};
