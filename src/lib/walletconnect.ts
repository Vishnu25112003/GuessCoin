// Extend the global Window type to include selectedWallet
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  close?: () => Promise<void>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    selectedWallet: EthereumProvider | null;
  }
}

// Initialize the selectedWallet
window.selectedWallet = null;

/**
 * Restore previously selected wallet from localStorage
 * and listen for EIP-6963 provider announcements
 */
export const restoreWallet = (): void => {
  const storedWalletRdns = localStorage.getItem("selectedWalletRdns");

  if (!storedWalletRdns) return;

  const handleProviderAnnouncement = (event: CustomEvent): void => {
    if (event.detail.info.rdns === storedWalletRdns) {
      window.selectedWallet = event.detail.provider;
      console.log(`Selected Wallet Detected: ${event.detail.info.name}`);

      // Mark wallet as successfully reconnected
      localStorage.setItem("walletReconnected", "true");

      // Stop listening to the event after reconnecting
      window.removeEventListener(
        "eip6963:announceProvider",
        handleProviderAnnouncement as EventListener,
      );
    } else {
      console.log("Waiting for Selected Wallet Provider Announcement");
    }
  };

  window.addEventListener(
    "eip6963:announceProvider",
    handleProviderAnnouncement as EventListener,
  );

  if (!window.selectedWallet) {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  }
};

export {};
