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

export type ContractGuessEntry = {
  targetBlockNumber: string;
  userHashGuess: string;
  tokenSize: string;
  paidGuess: boolean;
  targetVerified: string;
  complex: boolean;
};

export type RTDBEntry = {
  guessId?: number;
  dummyHash?: string;
  tokenSize?: number;
  paidGuess?: boolean;
  complex?: boolean;
  actualHash?: string;
  secretKey?: string;
  targetVerified?: number;
};

export type RTDBData = Record<string, RTDBEntry>;

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: unknown; // EIP1193Provider
}
