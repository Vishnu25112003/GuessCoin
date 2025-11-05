// import React from "react";
// import { motion, type HTMLMotionProps } from "framer-motion";

// type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info";
// type ButtonSize = "sm" | "md" | "lg";

// interface CyberButtonProps
//   extends Omit<HTMLMotionProps<"button">, "children"> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   glow?: boolean;
//   icon?: React.ReactNode;
//   children: React.ReactNode;
// }

// export const CyberButton: React.FC<CyberButtonProps> = ({
//   variant = "primary",
//   size = "md",
//   glow = true,
//   icon,
//   children,
//   className = "",
//   disabled,
//   ...props
// }) => {
//   const baseClasses =
//     "relative font-display font-bold uppercase tracking-wider overflow-hidden";

//   const variantClasses = {
//     primary:
//       "bg-cyber-primary text-cyber-darker hover:bg-opacity-90 border-2 border-cyber-primary",
//     secondary:
//       "bg-cyber-secondary text-white hover:bg-opacity-90 border-2 border-cyber-secondary",
//     success:
//       "bg-cyber-success text-cyber-darker hover:bg-opacity-90 border-2 border-cyber-success",
//     danger:
//       "bg-cyber-danger text-white hover:bg-opacity-90 border-2 border-cyber-danger",
//     warning:
//       "bg-cyber-accent text-cyber-darker hover:bg-opacity-90 border-2 border-cyber-accent",
//     info:
//       "bg-blue-500 text-white hover:bg-opacity-90 border-2 border-blue-500",
//   };

//   const sizeClasses = {
//     sm: "px-4 py-2 text-xs",
//     md: "px-6 py-3 text-sm",
//     lg: "px-8 py-4 text-base",
//   };

//   const glowClasses = {
//     primary: "shadow-cyber-md hover:shadow-cyber-lg",
//     secondary: "shadow-cyber-pink hover:shadow-[0_0_30px_rgba(255,0,110,0.7)]",
//     success: "shadow-cyber-green hover:shadow-[0_0_30px_rgba(57,255,20,0.7)]",
//     danger:
//       "shadow-[0_0_20px_rgba(255,0,85,0.5)] hover:shadow-[0_0_30px_rgba(255,0,85,0.7)]",
//     warning: "shadow-cyber-yellow hover:shadow-[0_0_30px_rgba(255,214,10,0.7)]",
//     info: "shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]",
//   };

//   return (
//     <motion.button
//       transition={{ type: "spring", stiffness: 400, damping: 17 }}
//       className={`
//         ${baseClasses}
//         ${variantClasses[variant]}
//         ${sizeClasses[size]}
//         ${glow ? glowClasses[variant] : ""}
//         disabled:opacity-50 disabled:cursor-not-allowed
//         ${className}
//       `}
//       disabled={disabled}
//       {...props}
//     >
//       <span className="relative flex items-center justify-center gap-2">
//         {icon && <span className="inline-block">{icon}</span>}
//         {children}
//       </span>
//     </motion.button>
//   );
// };



import React from "react";
import { motion } from "framer-motion";

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = "primary",
  disabled = false,
  onClick,
  icon,
  className = "",
  type = "button",
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/30",
    secondary:
      "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/30",
    danger:
      "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/30",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        relative px-6 py-3 font-mono font-semibold rounded-lg
        border-2 border-current transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      <span className="text-high-contrast">{children}</span>
    </motion.button>
  );
};
