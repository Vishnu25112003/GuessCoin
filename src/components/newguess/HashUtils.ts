// src/components/newguess/HashUtils.ts
// Hash utility functions - Uses contracts from config/contracts.ts

import Web3 from "web3";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  LOGIC_CONTRACT_ABI,
} from "../../config/contracts";
import { POLYGON_AMOY_TESTNET } from "../../config/networks";

// Infura Web3 instance for hash operations
const npInfura = new Web3(
  "https://polygon-amoy.infura.io/v3/15817b570c64442b8913e5d031b6ee29",
);

// TypeScript interfaces
interface EthereumWallet {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

// TypeScript window.ethereum declaration
declare global {
  interface Window {
    ethereum?: EthereumWallet;
  }
}

// Global wallet variables
export let browserWallet: EthereumWallet | null = null;
export let currentAccount = "0x0";

// Initialize from localStorage
if (typeof window !== "undefined") {
  const savedAccount = localStorage.getItem("currentAccount");
  if (savedAccount) {
    currentAccount = savedAccount;
  }
}

// Hash generation - produces 64 characters (without 0x prefix)
export async function genHashData(entValue: string): Promise<string> {
  const hash = npInfura.utils.keccak256(entValue);
  return hash.startsWith("0x") ? hash.slice(2) : hash;
}

// Remove 0x prefix
export async function removePrefix(hexStr: string): Promise<string> {
  if (hexStr.startsWith("0x")) {
    return Promise.resolve(hexStr.slice(2));
  }
  return Promise.resolve(hexStr);
}

// Validate 64-character hex string
export async function isValidChar(hexStr: string): Promise<boolean> {
  return /^[0-9a-fA-F]{64}$/.test(hexStr);
}

// Tokenize hash string
export async function tokenize(
  hexStr: string,
  tokenSize: number,
): Promise<string[]> {
  const tokens: string[] = [];
  for (let i = 0; i <= hexStr.length - tokenSize; i++) {
    tokens.push(hexStr.slice(i, i + tokenSize));
  }
  return tokens;
}

// Generate unrevealed hash (dummy hash) from actual and secret
export async function getUnrevealedHash(
  actualHash: string,
  secretKey: string,
): Promise<string> {
  const actualWith0x = actualHash.startsWith("0x")
    ? actualHash
    : "0x" + actualHash;
  const secretWith0x = secretKey.startsWith("0x")
    ? secretKey
    : "0x" + secretKey;

  const encodedCombination = npInfura.eth.abi.encodeParameters(
    ["bytes32", "bytes32"],
    [actualWith0x, secretWith0x],
  );

  const unrevealedHash = npInfura.utils.keccak256(encodedCombination);
  return unrevealedHash.startsWith("0x")
    ? unrevealedHash.slice(2)
    : unrevealedHash;
}

// Validate hash format
export async function validateHashFormat(hash: string): Promise<boolean> {
  if (!hash || hash.trim() === "") return false;
  try {
    const cleanedHash = await removePrefix(hash.trim());
    return await isValidChar(cleanedHash);
  } catch {
    return false;
  }
}

// Initialize wallet
export async function initializeWallet(): Promise<boolean> {
  try {
    if (
      typeof window !== "undefined" &&
      typeof window.ethereum !== "undefined"
    ) {
      browserWallet = window.ethereum;
      const savedAccount = localStorage.getItem("currentAccount");
      if (savedAccount) {
        currentAccount = savedAccount;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error initializing wallet:", error);
    return false;
  }
}

// Check chain ID
export async function checkChainId(web3Instance: Web3): Promise<boolean> {
  try {
    const currentNetwork = Number(await web3Instance.eth.getChainId());
    console.log("Current Network Selected is ", currentNetwork);
    return currentNetwork === 137 || currentNetwork === 80002; // Polygon networks
  } catch {
    console.error("Error in accessing chain id information");
    return false;
  }
}

// Wallet network configuration check
export async function walletNetworkConfig(): Promise<[boolean, string]> {
  try {
    if (browserWallet == null) {
      return [false, "No wallet detected!"];
    }

    const web3 = new Web3(browserWallet);
    const isProperNetwork = await checkChainId(web3);

    if (!isProperNetwork) {
      return [
        false,
        "Inappropriate network! Please switch to Polygon network.",
      ];
    }

    return [true, "success"];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return [false, errorMessage];
  }
}

// Handle network change
export async function handleNetworkChange(): Promise<[boolean, string]> {
  try {
    if (!browserWallet) {
      throw new Error("Wallet not initialized");
    }
    await browserWallet.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
    });
    return [true, "Switched to the expected network successfully"];
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    if (err.code === 4902) {
      return [false, "Expected Network not found in the wallet"];
    } else if (err.code === 4001) {
      return [false, "Network switch request was rejected"];
    } else {
      return [false, err.message || "Unknown error"];
    }
  }
}

// UPDATED: Get contract address using contracts.ts
export async function getCrtAddress(
  crtType: "token" | "logic",
): Promise<string> {
  if (crtType === "token") {
    return TOKEN_CONTRACT_ADDRESS;
  } else if (crtType === "logic") {
    const savedLogicAddress = localStorage.getItem("logicCrtAddress");
    if (
      !savedLogicAddress ||
      savedLogicAddress === "0x0" ||
      savedLogicAddress === "0x"
    ) {
      throw new Error(
        "Logic Contract address not found! Please register/login first.",
      );
    }
    return savedLogicAddress;
  }
  throw new Error("Invalid contract type");
}

// UPDATED: Get ABI from contracts.ts
export async function getABI(crtType: "token" | "logic") {
  if (crtType === "token") {
    return TOKEN_CONTRACT_ABI;
  } else if (crtType === "logic") {
    return LOGIC_CONTRACT_ABI;
  }
  throw new Error("Incorrect Contract ABI requested");
}

// UPDATED: Initialize contract instance using contracts.ts
export async function initContractInstance(contractType: "token" | "logic") {
  try {
    // Ensure wallet is initialized
    if (!browserWallet) {
      const walletInitialized = await initializeWallet();
      if (!walletInitialized) {
        throw new Error("Wallet not initialized! Please connect your wallet.");
      }
    }

    const abiCode = await getABI(contractType);
    const crtAddress = await getCrtAddress(contractType);

    const web3 = new Web3(browserWallet as EthereumWallet);
    const chainIDStatus = await checkChainId(web3);

    if (!chainIDStatus) {
      throw new Error(
        "Inappropriate network! Please switch to Polygon network!",
      );
    }

    const crtInstance = new web3.eth.Contract(abiCode, crtAddress);
    console.log(`${contractType} contract initialized:`, crtAddress);
    return { contractInstance: crtInstance, web3 };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error initializing ${contractType} contract:`, errorMessage);
    throw error;
  }
}

// Zero hash constant (64 characters, no 0x)
export const ZERO_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000";

// Initialize wallet on module load
if (typeof window !== "undefined") {
  initializeWallet();
}