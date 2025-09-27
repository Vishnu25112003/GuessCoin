import React from "react";
import type { WalletInfo } from "../../hooks/useWallet"; // Adjust path if needed
import { logos } from "../../assets/logolist"; // Adjust path and create this file

const WalletOption: React.FC<{
  wallet: WalletInfo;
  isSelected: boolean;
  onSelect: (wallet: WalletInfo) => void;
}> = ({ wallet, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(wallet)}
      className={`flex items-center p-3 mb-2 rounded-lg border-2 cursor-pointer bg-white transition-all duration-300 ${
        isSelected ? "border-blue-500 shadow-md" : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <img
        src={logos[wallet.name] || './notfound.jpg'}
        alt={wallet.name}
        className="w-8 h-8 mr-4"
      />
      <div className="flex-1 font-medium text-gray-800">{wallet.name}</div>
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
      )}
    </div>
  );
};

export default WalletOption;
