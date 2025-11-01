import Web3 from 'web3';
import { INFURA_HTTP_URL } from './config';

export const npInfura = new Web3(INFURA_HTTP_URL);

export function isValidChar(hexStr: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hexStr);
}

export function removePrefix(hexStr: string): string {
  if (!hexStr) return hexStr;
  return hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
}

export function tokenize(hexStr: string, tokenSize: number): string[] {
  const tokens: string[] = [];
  for (let i = 0; i <= hexStr.length - tokenSize; i++) {
    tokens.push(hexStr.slice(i, i + tokenSize));
  }
  return tokens;
}

export function encodeMatch(
  hitHex1: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean },
  hitHex2: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean },
): string {
  return npInfura.eth.abi.encodeParameters(
    ['uint8', 'uint8', 'bool', 'bool', 'uint8', 'uint8', 'bool', 'bool'],
    [
      hitHex1.startByte,
      hitHex1.endByte,
      hitHex1.leftSkip,
      hitHex1.rightSkip,
      hitHex2.startByte,
      hitHex2.endByte,
      hitHex2.leftSkip,
      hitHex2.rightSkip,
    ],
  );
}

export function safeKeccak(value: string): string {
  try {
    return npInfura.utils.keccak256(value);
  } catch {
    // Fallback: hash UTF-8 bytes explicitly
    const hex = npInfura.utils.utf8ToHex(value ?? '');
    return npInfura.utils.keccak256(hex);
  }
}

export function genHashData(entValue: string): string {
  return safeKeccak(entValue);
}

export function ensure0x(hex: string): string {
  if (!hex) return hex;
  return hex.startsWith('0x') ? hex : `0x${hex}`;
}

export function toBytes32FromInput(value: string): string {
  // If already a valid 32-byte hex, return as-is; else keccak256 of input text
  const v = value?.trim() ?? '';
  const maybe = ensure0x(v);
  const body = removePrefix(maybe);
  if (isValidChar(body)) return ensure0x(body);
  return npInfura.utils.keccak256(v);
}

export function getUnrevealedHash(actualHash: string, secretKey: string): string {
  // Inputs must be 0x-prefixed 32-byte hex strings
  const a = ensure0x(removePrefix(actualHash));
  const s = ensure0x(removePrefix(secretKey));
  const encoded = npInfura.eth.abi.encodeParameters(['bytes32', 'bytes32'], [a, s]);
  return npInfura.utils.keccak256(encoded);
}

export function randomBytes32(): string {
  const bytes = new Uint8Array(32);
  if (typeof globalThis !== 'undefined' && (globalThis as { crypto?: { getRandomValues?: (array: Uint8Array) => void } }).crypto?.getRandomValues) {
    (globalThis as { crypto: { getRandomValues: (array: Uint8Array) => void } }).crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return '0x' + hex;
}

export async function getRandomBlockHash(seedHash: string, targetBlockNumber: number): Promise<
  [hash: string | null, byteHex: string, adjustedRanBlockPos: number, randomBlockNumber: number]
> {
  const _seedHash = removePrefix(seedHash);
  const byteHex = _seedHash.slice(30, 32);
  let ranBlockPos = parseInt(byteHex, 16);
  if (ranBlockPos > 127) ranBlockPos = Math.floor(ranBlockPos / 2);
  const randomBlockNumber = Number(targetBlockNumber) - Number(ranBlockPos);
  const block = await npInfura.eth.getBlock(randomBlockNumber);
  return [block?.hash ?? null, byteHex, ranBlockPos, randomBlockNumber];
}

export async function compareHexValues(hex1: string, hex2: string, tokenSize: number) {
  const _hex1 = removePrefix(hex1).toLowerCase();
  const _hex2 = removePrefix(hex2).toLowerCase();
  if (!isValidChar(_hex1) || !isValidChar(_hex2)) return [];
  if (tokenSize < 3 || tokenSize > 64) return [];
  const tokens1 = tokenize(_hex1, tokenSize);
  const tokens2 = tokenize(_hex2, tokenSize);
  const matches: Array<{
    token: string;
    hex1: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
    hex2: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
    encoded: string;
  }> = [];
  tokens1.forEach((token1, i) => {
    tokens2.forEach((token2, j) => {
      if (token1 === token2) {
        const h1 = {
          startByte: Math.floor(i / 2),
          endByte: Math.floor((i + tokenSize - 1) / 2),
          leftSkip: i % 2 !== 0,
          rightSkip: (i + tokenSize) % 2 !== 0,
        };
        const h2 = {
          startByte: Math.floor(j / 2),
          endByte: Math.floor((j + tokenSize - 1) / 2),
          leftSkip: j % 2 !== 0,
          rightSkip: (j + tokenSize) % 2 !== 0,
        };
        matches.push({ token: token1, hex1: h1, hex2: h2, encoded: encodeMatch(h1, h2) });
      }
    });
  });
  return matches;
}
