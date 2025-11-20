import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface NumberIncrementProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  icon?: React.ReactNode;
}

export const NumberIncrement: React.FC<NumberIncrementProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 999999,
  step = 1,
  suffix = "",
  icon,
}) => {
  const decrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const increase = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="text-cyber-primary">{icon}</div>}
        <label className="text-sm font-display font-bold text-cyber-primary uppercase tracking-wider">
          {label}
        </label>
      </div>

      <div className="flex items-center gap-3 bg-cyber-dark bg-opacity-50 backdrop-blur-sm p-4 rounded-2xl border-2 border-cyber-primary border-opacity-30">
        {/* Decrease Button */}
        <motion.button
          onClick={decrease}
          disabled={value <= min}
          className={`p-3 rounded-xl transition-all ${
            value <= min
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-cyber-danger hover:bg-opacity-90 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          }`}
        >
          <Minus className="w-5 h-5" />
        </motion.button>

        {/* Value Display */}
        <div className="flex-1">
          <motion.div
            key={value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="text-center"
          >
            <p className="text-3xl font-display font-black text-cyber-primary cyber-text-glow">
              {value}
            </p>
            {suffix && (
              <p className="text-xs text-gray-400 font-mono mt-1">{suffix}</p>
            )}
          </motion.div>
        </div>

        {/* Increase Button */}
        <motion.button
          onClick={increase}
          disabled={value >= max}
          className={`p-3 rounded-xl transition-all ${
            value >= max
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-cyber-success hover:bg-opacity-90 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          }`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
