import Web3 from 'web3';

export type TxSendOpts = {
  from: string;
  value?: string;
};

export function isGasFeeError(e: any): boolean {
  const msg = (e?.message || '').toLowerCase();
  const code = e?.code;
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
    const hasBase = (latest as any)?.baseFeePerGas;
    if (hasBase) {
      const base = BigInt(String((latest as any).baseFeePerGas));
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

export async function estimateGasWithBuffer(method: any, params: TxSendOpts): Promise<string | undefined> {
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
  method: any,
  params: TxSendOpts,
  handlers: {
    onHash?: (h: string) => void;
    onReceipt?: (r: any) => void;
  } = {},
): Promise<void> {
  const fee = await getFeeParams(web3);
  const gas = await estimateGasWithBuffer(method, params);
  const txParams = { ...params, ...(gas ? { gas } : {}), ...fee } as any;
  await new Promise<void>((resolve, reject) => {
    method
      .send(txParams)
      .on('transactionHash', (h: string) => { handlers.onHash?.(h); })
      .on('receipt', (r: any) => { handlers.onReceipt?.(r); resolve(); })
      .on('error', (err: any) => reject(err));
  });
}