// src/context/AuthContext.tsx
import { createContext, useContext } from 'react';

export type WalletInfo = {
  name: string;
  uuid: string;
  rdns: string;
  provider: any;
  icon?: string;
};

export interface AuthContextType {
  wallets: WalletInfo[];
  selectedWallet: WalletInfo | null;
  connectedAccount: string | null;
  isLoading: boolean;
  statusMessage: string;
  connectWallet: (wallet: WalletInfo) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleRegister: () => Promise<void>;
  walletAddress: string | null;
  isConnected: boolean;
  setSelectedWallet: (wallet: WalletInfo | null) => void;
  // NEW: Add provider access
  getWalletProvider: () => any;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
