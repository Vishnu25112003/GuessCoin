// import React from "react";
// import { motion } from "framer-motion";

// interface CyberCardProps {
//   children: React.ReactNode;
//   className?: string;
//   glow?: boolean;
//   animated?: boolean;
//   onClick?: () => void;
// }

// export const CyberCard: React.FC<CyberCardProps> = ({
//   children,
//   className = "",
//   glow = true,
//   animated = true,
//   onClick,
// }) => {
//   return (
//     <motion.div
//       initial={animated ? { opacity: 0, y: 20 } : {}}
//       animate={animated ? { opacity: 1, y: 0 } : {}}
//       whileHover={animated ? {} : {}}
//       transition={{ duration: 0.3 }}
//       onClick={onClick}
//       className={`
//         relative bg-cyber-dark bg-opacity-70 backdrop-blur-md
//         border border-cyber-primary border-opacity-30
//         rounded-lg p-6
//         ${glow ? "shadow-cyber-md" : ""}
//         ${onClick ? "cursor-pointer" : ""}
//         ${className}
//       `}
//     >
//       {/* Corner accents */}
//       <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-primary" />
//       <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-primary" />
//       <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-primary" />
//       <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-primary" />

//       {/* Grid pattern overlay */}
//       <div className="absolute inset-0 cyber-grid-bg opacity-10 rounded-lg" />

//       {/* Content */}
//       <div className="relative z-10">{children}</div>
//     </motion.div>
//   );
// };



import React from "react";
import { motion } from "framer-motion";

interface CyberCardProps {
  children: React.ReactNode;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  glow = false,
  className = "",
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900
        border-2 border-cyan-500/30 hover:border-cyan-400/60 rounded-lg
        p-6 transition-all duration-300 cursor-auto
        ${onClick ? "cursor-pointer" : ""}
        ${glow ? "shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40" : ""}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>

      {/* Glow effect background */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
};
