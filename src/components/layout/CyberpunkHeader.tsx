import React from "react";
import { motion } from "framer-motion";
import { LogOut, Wallet } from "lucide-react";
import { CyberButton } from "../cyberpunk/Button";
import { WalletDisplay } from "../cyberpunk/WalletDisplay";
import { GlitchText } from "../cyberpunk/effects/GlitchText";

interface CyberpunkHeaderProps {
  walletAddress?: string;
  onCheckBalance?: () => void;
  onSyncData?: () => void;
  onLogout?: () => void;
}

export const CyberpunkHeader: React.FC<CyberpunkHeaderProps> = ({
  walletAddress,
  onCheckBalance,
  onSyncData,
  onLogout,
}) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 bg-cyber-darker bg-opacity-90 backdrop-blur-lg border-b border-cyber-primary border-opacity-30"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyber-primary to-blue-500 rounded-lg flex items-center justify-center shadow-cyber-md">
              <Wallet className="w-6 h-6 text-cyber-darker" />
            </div>
            <div>
              <GlitchText className="text-xl font-display font-bold">
                DecentGuessCoin
              </GlitchText>
              <div className="flex items-center gap-2 text-xs text-cyber-success">
                <span className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
                Connected
              </div>
            </div>
          </div>

          {/* Wallet & Actions */}
          <div className="flex items-center gap-4">
            {walletAddress && <WalletDisplay address={walletAddress} />}

            {onCheckBalance && (
              <CyberButton
                variant="success"
                size="sm"
                onClick={onCheckBalance}
                icon={<span>💰</span>}
              >
                Check Balance
              </CyberButton>
            )}

            {onSyncData && (
              <CyberButton
                variant="primary"
                size="sm"
                onClick={onSyncData}
                icon={<span>🔄</span>}
              >
                Sync Data Pool
              </CyberButton>
            )}

            {onLogout && (
              <CyberButton
                variant="danger"
                size="sm"
                onClick={onLogout}
                icon={<LogOut className="w-4 h-4" />}
              >
                Logout
              </CyberButton>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
