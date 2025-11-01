// src/context/AuthContext.ts
import { createContext, useContext } from 'react';
import type { WalletProvider } from '../types/eip6963';

export interface WalletInfo {
  name: string;
  uuid: string;
  rdns: string;
  provider: WalletProvider;
  icon: string;
}

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
  getWalletProvider: () => WalletProvider | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
