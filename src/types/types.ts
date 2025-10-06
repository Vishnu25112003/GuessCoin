import type { ReactNode } from "react";

export interface GuessData {
  angle: number;
  number: ReactNode;
  starIndex: undefined;
  id: number;
  status: "verified" | "unverified";
  actualHash: string;
  secretKey: string;
  dummyHash: string;
  targetBlockNumber: number;
  tokenSizes: number;
  paidGuess: boolean;
  complex: boolean;
}

export interface User {
  address: string;
  balance?: string;
}

export interface NavItem {
  name: ReactNode;
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
}
