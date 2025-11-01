import Web3 from 'web3';
import type { TransactionReceipt } from '../types';

export type TxSendOpts = {
  from: string;
  value?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContractMethod = any;

export function isGasFeeError(e: unknown): boolean {
  const error = e as { message?: string; code?: number };
  const msg = (error?.message || '').toLowerCase();
  const code = error?.code;
  return (
    code === -32000 ||
    msg.includes('intrinsic gas too low') ||
    msg.includes('transaction underpriced') ||
    msg.includes('replacement transaction underpriced') ||
    msg.includes('max fee per gas less than block base fee') ||
    msg.includes('fee too low') ||
    msg.includes('base fee') ||
    msg.includes('insufficient funds for gas') ||
    msg.includes('maxpriorityfeepergas') ||
    msg.includes('maxfeepergas')
  );
}

export async function getFeeParams(web3: Web3): Promise<Record<string, string>> {
  try {
    const latest = await web3.eth.getBlock('latest');
    const hasBase = (latest as { baseFeePerGas?: bigint | string })?.baseFeePerGas;
    if (hasBase) {
      const base = BigInt(String(hasBase));
      // Reasonable defaults for Polygon; MM will still allow user to edit
      const priority = 30n * 10n ** 9n; // 30 gwei
      const maxFee = base * 2n + priority;
      return {
        maxPriorityFeePerGas: priority.toString(),
        maxFeePerGas: maxFee.toString(),
      };
    }
  } catch {
    // ignore; fallback to gasPrice
  }
  try {
    const gp = await web3.eth.getGasPrice();
    return { gasPrice: String(gp) };
  } catch {
    return {};
  }
}

export async function estimateGasWithBuffer(method: ContractMethod, params: TxSendOpts): Promise<string | undefined> {
  try {
    const est = await method.estimateGas(params);
    const withBuf = (BigInt(String(est)) * 12n) / 10n; // +20%
    return withBuf.toString();
  } catch {
    return undefined;
  }
}

export async function sendWithFees(
  web3: Web3,
  method: ContractMethod,
  params: TxSendOpts,
  handlers: {
    onHash?: (h: string) => void;
    onReceipt?: (r: TransactionReceipt) => void;
  } = {},
): Promise<void> {
  const fee = await getFeeParams(web3);
  const gas = await estimateGasWithBuffer(method, params);
  const txParams = { ...params, ...(gas ? { gas } : {}), ...fee };
  await new Promise<void>((resolve, reject) => {
    method
      .send(txParams)
      .on('transactionHash', (h: string) => { handlers.onHash?.(h); })
      .on('receipt', (r: TransactionReceipt) => { handlers.onReceipt?.(r); resolve(); })
      .on('error', (err: Error) => reject(err));
  });
}