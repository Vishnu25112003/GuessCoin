import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const CyberToast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-cyber-success",
      borderColor: "border-cyber-success",
      bgGlow: "shadow-cyber-green",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-cyber-danger",
      borderColor: "border-cyber-danger",
      bgGlow: "shadow-[0_0_20px_rgba(255,0,85,0.5)]",
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      color: "text-cyber-primary",
      borderColor: "border-cyber-primary",
      bgGlow: "shadow-cyber-md",
    },
  };

  const typeConfig = config[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`
            flex items-center gap-3 px-4 py-3 min-w-[300px]
            bg-cyber-dark bg-opacity-95 backdrop-blur-md
            border-2 ${typeConfig.borderColor} ${typeConfig.bgGlow}
            rounded-lg
          `}
        >
          <div className={typeConfig.color}>{typeConfig.icon}</div>
          <p className="flex-1 font-mono text-sm text-cyber-text">{message}</p>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cyber-primary hover:bg-opacity-20 rounded transition-all"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
