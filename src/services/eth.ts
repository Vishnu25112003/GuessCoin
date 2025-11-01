import TokenAbi from '../abi/TokenCrt.json';
import LogicAbi from '../abi/LogicCrt.json';
import Web3 from 'web3';
import { TOKEN_CONTRACT_ADDRESS } from './config';
import { npInfura } from './web3';
import type { WalletProvider } from '../types';

export type { WalletProvider };

export function getBrowserWallet(): WalletProvider | null {
  const w = (window as Window & { selectedWallet?: WalletProvider; ethereum?: WalletProvider }).selectedWallet || (window as Window & { ethereum?: WalletProvider }).ethereum || null;
  return w;
}

export async function getChainId(web3: Web3): Promise<number> {
  return Number(await web3.eth.getChainId());
}

export function getTokenContract(web3: Web3) {
  return new web3.eth.Contract(TokenAbi, TOKEN_CONTRACT_ADDRESS);
}

export function getLogicContract(web3: Web3, logicAddress: string) {
  return new web3.eth.Contract(LogicAbi, logicAddress);
}

// Read-only contracts via Infura (avoid MetaMask RPC indexing issues on view calls)
export function getTokenContractReadonly() {
  return new npInfura.eth.Contract(TokenAbi, TOKEN_CONTRACT_ADDRESS);
}

export function getLogicContractReadonly(logicAddress: string) {
  return new npInfura.eth.Contract(LogicAbi, logicAddress);
}
