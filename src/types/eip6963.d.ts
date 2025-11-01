// src/types/eip6963.d.ts
/// <reference types="vite/client" />

export interface WalletProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

export interface WalletProvider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  request: (request: { method: string; params?: Array<unknown> }) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

export interface WalletProviderDetail {
  info: WalletProviderInfo;
  provider: WalletProvider;
}

// Extend WindowEventMap to include custom events
declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent<WalletProviderDetail>;
    'eip6963:requestProvider': Event;
  }
}
