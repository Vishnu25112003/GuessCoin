import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { compareHexValues, getRandomBlockHash, npInfura } from '../services/web3';
import type { GuessEntry, MatchToken } from '../types';
import Swal from 'sweetalert2';

export default function SeedDataPage() {
  const [guess, setGuess] = useState<GuessEntry | null>(null);
  const [generatedHash, setGeneratedHash] = useState('');
  const [, setMatches] = useState<MatchToken[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('singleGuess');
    if (stored) setGuess(JSON.parse(stored));
  }, []);

  async function fetchGenerated() {
    if (!guess) return;
    const targetBlockNumber = Number(guess.targetBlockNumber);
    const currentBlockNumber = await npInfura.eth.getBlockNumber();
    const blockDistance = Number(currentBlockNumber) - Number(targetBlockNumber);

    if (blockDistance <= -1) {
      await Swal.fire('Block yet to be mined', '', 'error');
      setGeneratedHash('');
      return;
    }

    if (!guess.complex) {
      if (blockDistance <= 255) {
        const block = await npInfura.eth.getBlock(targetBlockNumber);
        if (block && block.hash) {
          setGeneratedHash(block.hash);
          localStorage.setItem('block-hash-generated', String(block.hash));
        } else {
          await Swal.fire('Block hash retrieve issue', '', 'error');
        }
      } else {
        await Swal.fire('Block out of range', `Block Distance - ${blockDistance}`, 'error');
      }
      return;
    }

    // complex case
    if (blockDistance <= 128) {
      const block = await npInfura.eth.getBlock(targetBlockNumber);
      if (!block || !block.hash) {
        await Swal.fire('Random Block hash retrieve issue', '', 'error');
        return;
      }
      const [randomBlockHash] = await getRandomBlockHash(block.hash, targetBlockNumber);
      if (randomBlockHash) {
        setGeneratedHash(randomBlockHash);
        localStorage.setItem('block-hash-generated', String(randomBlockHash));
      } else {
        await Swal.fire('Random Block hash retrieve issue', '', 'error');
      }
    } else {
      await Swal.fire('Block out of range', `Block Distance - ${blockDistance}`, 'error');
    }
  }

  async function verifyOffChain() {
    if (!guess || !generatedHash) { await Swal.fire('No generated hash', 'Fetch generated hash first', 'error'); return; }
    const m = await compareHexValues(generatedHash, guess.actualHash || '', guess.tokenSize);
    setMatches(m);
    localStorage.setItem('matches', JSON.stringify(m));
    window.location.href = '/matches';
  }

  return (
    <div>
      <Header trail={[{ label: 'Home', to: '/' }, { label: 'Get Seed Data' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Guess Info</h2>
        {guess && (
          <div className="space-y-3 text-sm bg-white border rounded-lg p-4">
            <div><span className="text-slate-500">Guess ID</span>: <span className="font-medium">{guess.guessId}</span></div>
            <div><span className="text-slate-500">Target Block Count</span>: <span className="font-medium">{guess.targetBlockNumber}</span></div>
            <div><span className="text-slate-500">Token Size</span>: <span className="font-medium">{guess.tokenSize}</span></div>
            <div><span className="text-slate-500">Paid Guess</span>: <span className="font-medium">{String(guess.paidGuess)}</span></div>
            <div><span className="text-slate-500">Complex</span>: <span className="font-medium">{String(guess.complex)}</span></div>
            <div className="break-all"><span className="text-slate-500">Actual Hash</span>: <span className="font-mono">{guess.actualHash}</span></div>
            <div className="break-all"><span className="text-slate-500">Secret Key</span>: <span className="font-mono">{guess.secretKey}</span></div>
            <div className="break-all"><span className="text-slate-500">Dummy Hash</span>: <span className="font-mono">{guess.userHashGuess}</span></div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-500">Generated Hash</label>
            <input className="w-full border rounded p-2 font-mono" value={generatedHash} readOnly />
          </div>
          <button onClick={fetchGenerated} className="h-11 bg-sky-700 hover:bg-sky-800 text-white rounded">Fetch generated hash</button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={verifyOffChain} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">Verify Off Chain</button>
          <a href="/" className="px-4 py-2 border rounded hover:bg-slate-50">Back</a>
        </div>
      </div>
    </div>
  );
}
