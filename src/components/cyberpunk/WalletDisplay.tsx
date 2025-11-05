import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface WalletDisplayProps {
  address: string;
  className?: string;
}

export const WalletDisplay: React.FC<WalletDisplayProps> = ({
  address,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2
        bg-cyber-dark bg-opacity-50 backdrop-blur-sm
        border border-cyber-primary border-opacity-30
        rounded-lg font-mono text-cyber-primary text-sm
        ${className}
      `}
    >
      <span className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
      <span>{formatAddress(address)}</span>
      <button
        onClick={copyToClipboard}
        className="ml-1 p-1 hover:bg-cyber-primary hover:bg-opacity-20 rounded transition-all"
      >
        {copied ? (
          <Check className="w-3 h-3 text-cyber-success" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
};
