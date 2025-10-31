import Web3 from 'web3';
import type { TransactionReceipt, Block } from 'web3';

export type TxSendOpts = {
  from: string;
  value?: string;
};

export function isGasFeeError(e: unknown): boolean {
  const msg = ((e as Error)?.message || '').toLowerCase();
  const code = (e as { code?: number })?.code;
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
    const latest = await web3.eth.getBlock('latest') as Block;
    const hasBase = latest?.baseFeePerGas;
    if (hasBase) {
      const base = BigInt(String(latest.baseFeePerGas));
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

export async function estimateGasWithBuffer(method: unknown, params: TxSendOpts): Promise<string | undefined> {
  try {
    const est = await (method as { estimateGas: (p: TxSendOpts) => Promise<string> }).estimateGas(params);
    const withBuf = (BigInt(String(est)) * 12n) / 10n; // +20%
    return withBuf.toString();
  } catch {
    return undefined;
  }
}

export async function sendWithFees(
  web3: Web3,
  method: unknown,
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
    const promiEvent = (method as { send: (params: Record<string, unknown>) => { on: (event: string, cb: (...args: unknown[]) => void) => unknown } }).send(txParams);
    (promiEvent as { on: (event: string, cb: (...args: unknown[]) => void) => unknown }).on('transactionHash', (...args) => { handlers.onHash?.(args[0] as string); });
    (promiEvent as { on: (event: string, cb: (...args: unknown[]) => void) => unknown }).on('receipt', (...args) => { handlers.onReceipt?.(args[0] as TransactionReceipt); resolve(); });
    (promiEvent as { on: (event: string, cb: (...args: unknown[]) => void) => unknown }).on('error', (...args) => reject(args[0]));
  });
}