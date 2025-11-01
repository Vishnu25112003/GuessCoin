export type GuessEntry = {
  guessId: number;
  targetBlockNumber: number;
  userHashGuess: string;
  tokenSize: number;
  paidGuess: boolean;
  targetVerified: number; // 0 empty, 1 unverified, 2 verified
  complex: boolean;
  actualHash?: string;
  secretKey?: string;
};

export type MatchToken = {
  token: string;
  hex1: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
  hex2: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
  encoded: string;
};

export type ContractGuessData = {
  targetBlockNumber: string | number;
  userHashGuess: string;
  tokenSize: string | number;
  paidGuess: boolean;
  targetVerified: string | number;
  complex: boolean;
};

export type LocalStorageRTDB = Record<string, {
  guessId?: number;
  paidGuess?: boolean;
  tokenSize?: number;
  complex?: boolean;
  dummyHash?: string;
  actualHash?: string;
  secretKey?: string;
  targetVerified?: number;
}>;

export type TransactionReceipt = {
  status?: boolean;
  events?: Record<string, {
    returnValues?: Record<string, unknown>;
  }>;
};

export type WalletProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  close?: () => Promise<void>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export type EIP6963ProviderDetail = {
  info: {
    uuid: string;
    name: string;
    rdns: string;
    icon?: string;
  };
  provider: WalletProvider;
};
