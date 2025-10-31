import Header from '../components/Header';
import Swal from 'sweetalert2';
import Web3 from 'web3';
import type { TransactionReceipt } from 'web3';
import { getLogicContract } from '../services/eth';
import { npInfura, getRandomBlockHash } from '../services/web3';
import { sendWithFees, isGasFeeError } from '../services/tx';
import { useEffect, useState } from 'react';
import type { RTDBData } from '../types';

export default function OnChainPage() {
  const guess = (() => {
    const g = localStorage.getItem('singleGuess');
    return g ? JSON.parse(g) : null;
  })();
  const selected = (() => {
    const s = localStorage.getItem('selectedMatches');
    return s ? JSON.parse(s) as Array<{ encoded: string }> : [];
  })();

  const [complexCalc, setComplexCalc] = useState<{
    targetBlockHash?: string;
    byteHex?: string;
    adjRanBlockPos?: number;
    randomBlockNumber?: number;
    randomHash?: string | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!guess?.complex) { setComplexCalc(null); return; }
      try {
        const targetBlockNumber = Number(guess.targetBlockNumber);
        const currentBlockNumber = await npInfura.eth.getBlockNumber();
        const dist = Number(currentBlockNumber) - Number(targetBlockNumber);
        if (dist > 128) { setComplexCalc({}); return; }
        const block = await npInfura.eth.getBlock(targetBlockNumber);
        const seedHash = block?.hash || '';
        if (!seedHash) { setComplexCalc({}); return; }
        const [randomHash, byteHex, adjRanBlockPos, randomBlockNumber] = await getRandomBlockHash(seedHash, targetBlockNumber);
        setComplexCalc({ targetBlockHash: seedHash, byteHex, adjRanBlockPos, randomBlockNumber, randomHash });
      } catch {
        setComplexCalc({});
      }
    })();
  }, [guess]);

  async function verifyOnChain() {
    try {
      const account = localStorage.getItem('currentAccount');
      const logicAddr = localStorage.getItem('logicCrtAddress');
      if (!account || !logicAddr || !guess) { Swal.fire('Missing data', 'Please go back and try again', 'error'); return; }
      if (selected.length === 0) { Swal.fire('No matches selected', 'Select at least one match', 'error'); return; }
      const code1 = selected[0]?.encoded;
      const code2 = selected[1]?.encoded || '0x';

      const provider = (window as { selectedWallet?: unknown; ethereum?: unknown }).selectedWallet || (window as { selectedWallet?: unknown; ethereum?: unknown }).ethereum;
      if (!provider) { Swal.fire('No wallet provider', 'Open MetaMask and retry', 'error'); return; }
      const web3 = new Web3(provider);
      const logic = getLogicContract(web3, logicAddr);

      await sendWithFees(
        web3,
        logic.methods.verifyBlockGuess(guess.guessId, guess.actualHash, guess.secretKey, [code1, code2]),
        { from: account },
        {
          onHash: () => { Swal.fire('Transaction sent', "Don't refresh. Waiting for confirmation...", 'info'); },
          onReceipt: (receipt: TransactionReceipt) => {
            if (!receipt?.status) throw new Error('Verification failed');
             const ev = receipt.events?.guessVerified?.returnValues as { _userAddress?: string; _targetStatus?: string | number; _rewardsTotal?: string };
             if (ev && ev._userAddress && ev._userAddress.toLowerCase() === account.toLowerCase()) {
               const totalRewards = npInfura.utils.fromWei(ev._rewardsTotal || '0', 'ether');
               if ((ev._targetStatus === 'verified') || Number(ev._targetStatus) === 2) {
                const isNormal = !guess.paidGuess && !guess.complex;
                const expected = isNormal ? (selected.filter(Boolean).length * 500) : null;
                const msg = isNormal
                  ? `Verified! Expected Rewards: ${expected} GUESS${Number(ev._rewardsTotal) > 0 ? `\nOn-chain Rewards: ${totalRewards} GUESS` : ''}`
                  : (Number(ev._rewardsTotal) > 0 ? `Rewards Received: ${totalRewards}` : 'Verified with no rewards');
                Swal.fire('Verified!', msg, Number(ev._rewardsTotal) > 0 || isNormal ? 'success' : 'info');
                const key = `rtdb:${account}`;
                const prev = localStorage.getItem(key);
                let table: RTDBData = {}; try { table = prev ? JSON.parse(prev) : {}; } catch { table = {}; }
                const rowName = `row${guess.guessId}`;
                table[rowName] = { ...(table[rowName] || {}), targetVerified: 2 };
                localStorage.setItem(key, JSON.stringify(table));
              } else {
                Swal.fire('Incorrect data returned', '', 'warning');
              }
            } else {
              Swal.fire('No Guess Verified event found', '', 'error');
            }
          },
        },
      );

      setTimeout(() => { window.location.href = '/home'; }, 500);
    } catch (e: unknown) {
      if ((e as { code?: number })?.code === 4001) Swal.fire('Rejected', 'User rejected the transaction', 'error');
      else if (isGasFeeError(e)) Swal.fire('Gas fee too low', 'Please increase gas fee and try again.', 'warning');
      else Swal.fire('Error', (e as Error)?.message || 'Verification failed', 'error');
    }
  }

  return (
    <div>
      <Header trail={[{ label: 'Get Seed Data', to: '/seed' }, { label: 'Verify On Chain' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Prepared Data</h3>
            <div className="text-sm space-y-1">
              <div><span className="text-slate-500">SNo</span>: <span className="font-medium">{guess?.guessId}</span></div>
              <div className="break-all"><span className="text-slate-500">Actual Hash</span>: <span className="font-mono">{guess?.actualHash}</span></div>
              <div className="break-all"><span className="text-slate-500">Secret Key</span>: <span className="font-mono">{guess?.secretKey}</span></div>
              <div className="mt-2 p-2 bg-sky-50 rounded border text-slate-700">
                <div><span className="text-slate-500">Paid Guess</span>: <span className="font-medium">{String(guess?.paidGuess)}</span></div>
                <div><span className="text-slate-500">Token Required</span>: <span className="font-medium">{guess?.paidGuess ? '25' : '0'} GUESS</span></div>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Encoded Matches</h3>
            <div className="text-xs break-all font-mono">
              <div className="mb-2"><span className="text-slate-500">code_1</span>: {selected[0]?.encoded || '—'}</div>
              <div><span className="text-slate-500">code_2</span>: {selected[1]?.encoded || '0x'}</div>
            </div>
          </div>
        </div>

        {guess?.complex && (
          <div className="mt-6 bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Complex Guess Calculation</h3>
            {complexCalc && complexCalc.targetBlockHash ? (
              <div className="text-sm space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span>Target Block Number:</span>
                  <span className="font-medium">{guess?.targetBlockNumber}</span>
                </div>
                <div className="break-all">
                  <span className="text-slate-500">Target Block Hash</span>:
                  <span className="font-mono ml-2">{complexCalc.targetBlockHash}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <span>Random Block Number:</span>
                  <span className="font-mono">{String(guess?.targetBlockNumber)}</span>
                  <span className="mx-1">-</span>
                  <span className="font-mono">{complexCalc.adjRanBlockPos}</span>
                  <span className="mx-1">=</span>
                  <span className="font-mono">{complexCalc.randomBlockNumber}</span>
                </div>
                <div className="break-all">
                  <span className="text-slate-500">Final Random Block Hash</span>:
                  <span className="font-mono ml-2">{complexCalc.randomHash}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-amber-700 bg-amber-50 border rounded p-3">Complex equation cannot be shown (block distance may exceed limit).</div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={verifyOnChain} className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded">Verify on Chain</button>
          <a href="/matches" className="px-4 py-2 border rounded hover:bg-slate-50">Back</a>
        </div>
      </div>
    </div>
  );
}
