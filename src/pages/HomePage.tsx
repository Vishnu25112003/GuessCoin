import { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import GuessTable from '../components/GuessTable';
import type { GuessEntry, ContractGuessData, LocalStorageRTDB, TransactionReceipt, WalletProvider } from '../types';
import Swal from 'sweetalert2';
import Web3 from 'web3';
import { getLogicContract, getTokenContractReadonly } from '../services/eth';
import { npInfura } from '../services/web3';
import { sendWithFees, isGasFeeError } from '../services/tx';

export default function HomePage() {
  const [wallet] = useState<string | null>(localStorage.getItem('currentAccount'));
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  const load = useCallback(async () => {
    const logic = localStorage.getItem('logicCrtAddress');
    const account = localStorage.getItem('currentAccount');
    if (!logic || !account) return;
    const { INFURA_HTTP_URL } = await import('../services/config');
    const web3ro = new Web3(INFURA_HTTP_URL);
    const LogicAbi = (await import('../abi/LogicCrt.json')).default;
    const logicCrt = new web3ro.eth.Contract(LogicAbi, logic);
    const entries: GuessEntry[] = [];
    const rtdbRaw = localStorage.getItem(`rtdb:${account}`);
    const rtdb: LocalStorageRTDB = rtdbRaw ? JSON.parse(rtdbRaw) : {};
    for (let i = 1; i <= 5; i++) {
      const d = await logicCrt.methods.getGuessEntry(i).call({ from: account }, 'latest') as unknown as ContractGuessData;
      const row = rtdb[`row${i}`] || {};
      entries.push({
        guessId: i,
        targetBlockNumber: Number(d.targetBlockNumber),
        userHashGuess: row.dummyHash ?? d.userHashGuess,
        tokenSize: Number(row.tokenSize ?? d.tokenSize),
        paidGuess: Boolean(row.paidGuess ?? d.paidGuess),
        targetVerified: Number(d.targetVerified),
        complex: Boolean(row.complex ?? d.complex),
        actualHash: row.actualHash ?? '',
        secretKey: row.secretKey ?? '',
      });
    }
    setGuesses(entries);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const bn = await npInfura.eth.getBlockNumber();
        if (alive) setCurrentBlock(Number(bn));
      } catch {
        // ignore
      }
    }
    tick();
    const id = setInterval(tick, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const [syncing, setSyncing] = useState(false);
  const [balLoading, setBalLoading] = useState(false);

  const onLogout = () => {
    localStorage.clear();
    Swal.fire('Logged out', '', 'success');
    window.location.href = '/session';
  };

  async function onGetBalance() {
    try {
      setBalLoading(true);
      const account = localStorage.getItem('currentAccount');
      if (!account) { Swal.fire('No wallet', 'Connect your wallet first', 'error'); return; }
      // Use readonly provider to avoid MetaMask internal JSON-RPC issues for view calls
      const token = getTokenContractReadonly();
      const bal = await token.methods.balanceOf(account).call({ from: account }, 'latest');
      const pretty = npInfura.utils.fromWei(String(bal), 'ether');
      await Swal.fire('Token balance', pretty, 'info');
    } catch (e) {
      const error = e as Error;
      Swal.fire('Error getting token balance', error?.message || 'Unknown error', 'error');
    } finally { setBalLoading(false); }
  }

  async function onSyncPool() {
    try {
      setSyncing(true);
      const account = localStorage.getItem('currentAccount');
      const logicAddr = localStorage.getItem('logicCrtAddress');
      if (!account || !logicAddr) { Swal.fire('Not logged in', 'Login first', 'error'); return; }
      const provider = (window as Window & { selectedWallet?: WalletProvider; ethereum?: WalletProvider }).selectedWallet || (window as Window & { ethereum?: WalletProvider }).ethereum;
      if (!provider) { Swal.fire('No wallet provider', 'Open MetaMask and retry', 'error'); return; }
      const web3 = new Web3(provider as never);
      const logic = getLogicContract(web3, logicAddr);
      await sendWithFees(
        web3,
        logic.methods.syncPoolData(),
        { from: account },
        {
          onHash: () => { Swal.fire('Transaction sent', "Don't refresh. Waiting for confirmation...", 'info'); },
          onReceipt: (receipt: TransactionReceipt) => {
            if (!receipt?.status) throw new Error('Sync failed');
            const ev = receipt.events?.updatedPoolData?.returnValues as Record<string, string | boolean> | undefined;
            if (ev && ev._userAddress && String(ev._userAddress).toLowerCase() === account.toLowerCase()) {
              if (ev.updatedStatus || ev.updateStatus) {
                Swal.fire('Success', 'Pool Data Synchronization Success! Returned Status True', 'success');
              } else {
                Swal.fire('Info', 'No Synchronization Required! Returned Status False', 'info');
              }
            } else {
              Swal.fire('Warning', 'Unable to retrieve event data', 'warning');
            }
          },
        },
      );
      await load();
    } catch (e) {
      const error = e as { code?: number; message?: string };
      if (error?.code === 4001) Swal.fire('Rejected', 'User rejected the transaction', 'error');
      else if (isGasFeeError(e)) Swal.fire('Gas fee too low', 'Please increase gas fee and try again.', 'warning');
      else Swal.fire('Error', error?.message || 'Error syncing pool data', 'error');
    } finally { setSyncing(false); }
  }

  return (
    <div>
      <Header trail={[{ label: 'Home' }]} onLogout={onLogout} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img src="https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png" className="w-16 h-16 rounded-full ring-2 ring-sky-100" />
            <div>
              <p className="text-slate-900 font-semibold text-lg">Welcome</p>
              <p className="text-slate-600 break-all text-sm">{wallet ?? 'Not connected'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onSyncPool} disabled={syncing} className="px-3 py-2 rounded border hover:bg-slate-50 disabled:opacity-50">
              {syncing ? 'Syncing...' : 'Sync Pool Data'}
            </button>
            <button onClick={onGetBalance} disabled={balLoading} className="px-3 py-2 rounded border hover:bg-slate-50 disabled:opacity-50">
              {balLoading ? 'Checking...' : 'Get Balance'}
            </button>
            <span className="px-3 py-2 rounded border bg-slate-50 text-slate-700 select-none">
              Current Block: {currentBlock ?? '—'}
            </span>
          </div>
        </div>

        <GuessTable
          guesses={guesses}
          onNewGuess={(g) => {
            localStorage.setItem('singleGuess', JSON.stringify(g));
            window.location.href = '/new';
          }}
          onVerify={(g) => {
            localStorage.setItem('singleGuess', JSON.stringify(g));
            window.location.href = '/seed';
          }}
          onValidity={async (g) => {
            try {
              const target = Number(g.targetBlockNumber);
              const head = Number(await npInfura.eth.getBlockNumber());
              if (!Number.isFinite(target) || target <= 0) { await Swal.fire('No target block', 'This row has no target block number', 'info'); return; }
              if (head < target) {
                await Swal.fire('Block not reached', `Current block: ${head}. Target: ${target}.`, 'info');
                return;
              }
              const dist = head - target;
              if (dist > 128) {
                await Swal.fire('Too long block distance', `Distance: ${dist} (>128).`, 'warning');
                return;
              }
              const blk = await npInfura.eth.getBlock(target);
              if (blk?.hash) {
                await Swal.fire('Block reached', `Block ${target} mined`, 'success');
              } else {
                await Swal.fire("Couldn't be mined", 'Block not available yet. Try again shortly.', 'warning');
              }
            } catch (e) {
              const error = e as Error;
              await Swal.fire('Error', error?.message || 'Unable to check validity', 'error');
            }
          }}
        />
      </div>
    </div>
  );
}
