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
