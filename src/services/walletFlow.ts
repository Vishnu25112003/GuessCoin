import Web3 from 'web3';
import { getTokenContract, getTokenContractReadonly } from './eth';
import { sendWithFees, isGasFeeError } from './tx';
import type { WalletProvider } from '../types';

export type LoginResult = { ok: boolean; logicCrtAddress?: string; error?: string };

function getBrowserWeb3(): Web3 {
  const provider = (window as Window & { selectedWallet?: WalletProvider; ethereum?: WalletProvider }).selectedWallet || (window as Window & { ethereum?: WalletProvider }).ethereum;
  if (!provider) throw new Error('No wallet detected');
  return new Web3(provider as never);
}

export async function ensureNetwork(): Promise<boolean> {
  const web3 = getBrowserWeb3();
  const chainId = Number(await web3.eth.getChainId());
  return chainId === 137 || chainId === 80002; // Polygon mainnet or Amoy
}

export async function isUserActive(account: string): Promise<boolean> {
  // Use readonly provider for view calls to avoid RPC indexing issues
  const token = getTokenContractReadonly();
  const active = await token.methods.isUserActive().call({ from: account }, 'latest');
  return Boolean(active);
}

export async function getLogicAddress(account: string): Promise<string> {
  // Use readonly provider for view calls
  const token = getTokenContractReadonly();
  const addr = (await token.methods.getLogicAddress().call({ from: account }, 'latest')) as unknown as string;
  return addr;
}

export async function login(): Promise<LoginResult> {
  try {
    const okNet = await ensureNetwork();
    if (!okNet) return { ok: false, error: 'Wrong network. Switch to Polygon.' };
    const ethereumProvider = (window as Window & { ethereum?: WalletProvider }).ethereum;
    if (!ethereumProvider) return { ok: false, error: 'No Ethereum provider found' };
    const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' }) as string[];
    const account = accounts[0];
    const active = await isUserActive(account);
    if (!active) return { ok: false, error: 'Not a registered wallet' };
    const logic = await getLogicAddress(account);
    if (!logic || logic === '0x0000000000000000000000000000000000000000') return { ok: false, error: 'No logic address mapped' };
    localStorage.setItem('currentAccount', account);
    localStorage.setItem('logicCrtAddress', logic);
    localStorage.setItem('auth', 'true');
    return { ok: true, logicCrtAddress: logic };
  } catch (e) {
    const error = e as Error;
    return { ok: false, error: error?.message || 'Login failed' };
  }
}

export async function register(): Promise<LoginResult> {
  try {
    const web3 = getBrowserWeb3();
    const okNet = await ensureNetwork();
    if (!okNet) return { ok: false, error: 'Wrong network. Switch to Polygon.' };
    const ethereumProvider = (window as Window & { ethereum?: WalletProvider }).ethereum;
    if (!ethereumProvider) return { ok: false, error: 'No Ethereum provider found' };
    const accounts = await ethereumProvider.request({ method: 'eth_requestAccounts' }) as string[];
    const account = accounts[0];

    // If already active, treat as login
    const active = await isUserActive(account);
    if (active) {
      const logic = await getLogicAddress(account);
      localStorage.setItem('currentAccount', account);
      localStorage.setItem('logicCrtAddress', logic);
      localStorage.setItem('auth', 'true');
      return { ok: true, logicCrtAddress: logic };
    }

    // Call createUser
    const token = getTokenContract(web3);
    await sendWithFees(web3, token.methods.createUser(), { from: account });

    const logic = await getLogicAddress(account);
    if (!logic || logic === '0x0000000000000000000000000000000000000000') return { ok: false, error: 'No logic address mapped after registration' };

    localStorage.setItem('currentAccount', account);
    localStorage.setItem('logicCrtAddress', logic);
    localStorage.setItem('auth', 'true');
    return { ok: true, logicCrtAddress: logic };
  } catch (e) {
    if (isGasFeeError(e)) return { ok: false, error: 'Gas fee too low. Please increase gas fee and try again.' };
    const error = e as Error;
    return { ok: false, error: error?.message || 'Registration failed' };
  }
}
