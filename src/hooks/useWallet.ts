import { useState, useEffect, useCallback } from "react";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  close?: () => Promise<void>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export type WalletInfo = {
  name: string;
  uuid: string;
  rdns: string;
  provider: EthereumProvider;
};

export const useWallet = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Please select a wallet to connect.");

  useEffect(() => {
    const announceListener = (event: CustomEvent) => {
      const newWallet = {
        name: event.detail.info.name,
        uuid: event.detail.info.uuid,
        rdns: event.detail.info.rdns,
        provider: event.detail.provider,
      };
      setWallets((prev) => {
        if (prev.some((w) => w.uuid === newWallet.uuid)) return prev;
        return [...prev, newWallet];
      });
    };

    window.addEventListener("eip6963:announceProvider", announceListener as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", announceListener as EventListener);
    };
  }, []);

  const connectWallet = useCallback(async (wallet: WalletInfo) => {
    if (!wallet) {
      setStatusMessage("No wallet selected.");
      return;
    }
    try {
      const accounts = await wallet.provider.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock or create one.");
      }
      setConnectedAccount(accounts[0]);
      setSelectedWallet(wallet);
      localStorage.setItem("selectedWalletRdns", wallet.rdns);
      setStatusMessage(`Connected: ${accounts[0]}`);
      
      // If you need to navigate after connection, you can add it here:
      // navigate('/dashboard');

    } catch (err: unknown) {
        const error = err as { code?: number; message?: string };
        if (error.code === 4001) {
            setStatusMessage("User rejected the connection request.");
        } else {
            console.error(`Connection failed for ${wallet.name}`, err);
            setStatusMessage(`Connection failed: ${error.message || "Unknown error"}`);
        }
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    if (!selectedWallet) return;

    console.log(`🔌 Initiating full disconnect for ${selectedWallet.name}...`);

    try {
        const provider = selectedWallet.provider;

        // Method 1: For WalletConnect providers (e.g., Rainbow, Trust Wallet)
        if (typeof provider.disconnect === 'function') {
            await provider.disconnect();
            console.log("✅ Provider disconnected via disconnect().");
        }
        // Method 2: For MetaMask
        else if (provider.request && typeof provider.request === 'function') {
            await provider.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }],
            });
            console.log("✅ MetaMask permissions revoked.");
        }
        // Method 3: Fallback for other wallets
        else if (typeof provider.close === 'function') {
            await provider.close();
            console.log("✅ Provider connection closed via close().");
        }
    } catch (error) {
        console.error("Error during provider-level disconnection:", error);
    } finally {
        // This cleanup block ALWAYS runs, ensuring a clean state
        localStorage.removeItem("selectedWalletRdns");
        setConnectedAccount(null);
        setSelectedWallet(null);
        setStatusMessage("Wallet disconnected. Please select a wallet to connect.");
        console.log("🧹 Local state and storage cleared.");
    }
  }, [selectedWallet]);

  return {
    wallets,
    selectedWallet,
    connectedAccount,
    statusMessage,
    connectWallet,
    disconnectWallet,
    setSelectedWallet,
  };
};
