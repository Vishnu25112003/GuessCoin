import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WalletInfo } from "../../hooks/useWallet";
import { logos } from "../../assets/logolist";
import { Check } from "lucide-react";

const WalletOption: React.FC<{
  wallet: WalletInfo;
  isSelected: boolean;
  onSelect: (wallet: WalletInfo) => void;
}> = ({ wallet, isSelected, onSelect }) => {
  return (
    <motion.div
      onClick={() => onSelect(wallet)}
      className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer bg-gray-700/50 transition-all duration-300
        ${isSelected ? "border-purple-400 shadow-lg" : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/70"}`}
      whileHover={{
        scale: 1.03,
        boxShadow: isSelected
          ? "0 0 15px rgba(168, 85, 247, 0.4)"
          : "0 0 10px rgba(0, 0, 0, 0.5)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src={logos[wallet.name] || "./notfound.jpg"}
        alt={wallet.name}
        className="w-10 h-10 mr-4 rounded-full border border-gray-500/50"
      />
      <div className="flex-1 font-medium text-white text-lg">{wallet.name}</div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle hover effect for visual flair */}
      <div
        className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300
        ${isSelected ? "opacity-100 bg-purple-500/20" : "group-hover:opacity-10 opacity-0 bg-white/10"}`}
      />
    </motion.div>
  );
};

export default WalletOption;
