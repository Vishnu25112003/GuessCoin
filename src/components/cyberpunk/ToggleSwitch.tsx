import React from "react";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  enabled,
  onChange,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-cyber-dark bg-opacity-50 backdrop-blur-sm rounded-2xl border-2 border-cyber-primary border-opacity-30">
      <div className="flex items-center gap-3">
        {icon && <div className="text-cyber-primary">{icon}</div>}
        <span className="font-display font-semibold text-cyber-text uppercase tracking-wider">
          {label}
        </span>
      </div>

      <motion.button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-all ${
          enabled
            ? "bg-gradient-to-r from-cyber-success to-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
            : "bg-gray-700 border-2 border-gray-600"
        }`}
      >
        <motion.div
          initial={false}
          animate={{ x: enabled ? 28 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-6 h-6 bg-white rounded-full shadow-lg"
        />
      </motion.button>
    </div>
  );
};
