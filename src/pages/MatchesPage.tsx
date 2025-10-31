import { useEffect, useState } from 'react';
import Header from '../components/Header';
import type { MatchToken, GuessEntry } from '../types';

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchToken[]>([]);
  const [guess, setGuess] = useState<GuessEntry | null>(null);
  const blockHash = localStorage.getItem('block-hash-generated') || '';

  useEffect(() => {
    const m = localStorage.getItem('matches');
    const g = localStorage.getItem('singleGuess');
    if (m) setMatches(JSON.parse(m));
    if (g) setGuess(JSON.parse(g));
  }, []);

  return (
    <div>
      <Header trail={[{ label: 'Get Seed Data', to: '/seed' }, { label: 'Matches Found' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">Block Hash Generated</p>
            <p className="font-mono break-all text-sm md:text-base">{blockHash}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">Actual Hash</p>
            <p className="font-mono break-all text-sm md:text-base">{guess?.actualHash}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">Secret Key</p>
            <p className="font-mono break-all text-sm md:text-base">{guess?.secretKey}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">Dummy Hash</p>
            <p className="font-mono break-all text-sm md:text-base">{guess?.userHashGuess}</p>
          </div>
        </div>

        <h3 className="mt-8 text-xl font-semibold text-slate-800">No of Matches <span>{matches.length}</span></h3>
        {matches.length === 0 && (
          <div className="mt-4 p-4 border bg-rose-50 text-rose-700 rounded">No Matches Found</div>
        )}

        <div className="mt-6 grid gap-4">
          {matches.map((m, i) => (
            <div key={i} className={`rounded-lg border ${i < 2 ? 'bg-sky-50' : 'bg-slate-50'}`}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sky-900 font-semibold">Match {i + 1}</div>
                  <input type="checkbox" defaultChecked={i < 2} />
                </div>
                <div className="mt-3">
                  <p className="text-sm">Token: <span className="font-mono">{m.token}</span></p>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 text-sm">
                  <div><div className="text-slate-500">Hex1 Start</div><div>{m.hex1.startByte}</div></div>
                  <div><div className="text-slate-500">Hex1 End</div><div>{m.hex1.endByte}</div></div>
                  <div><div className="text-slate-500">Hex2 Start</div><div>{m.hex2.startByte}</div></div>
                  <div><div className="text-slate-500">Hex2 End</div><div>{m.hex2.endByte}</div></div>
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sky-700">Encoded Data</summary>
                  <pre className="mt-2 overflow-auto text-xs">{m.encoded}</pre>
                </details>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            disabled={matches.length === 0}
            onClick={() => {
              if (matches.length === 0) return;
              const selected: number[] = [];
              const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
              boxes.forEach((b, idx) => { if (b.checked) selected.push(idx); });
              if (selected.length === 0) { alert('Please select at least one match'); return; }
              if (selected.length > 2) { alert('You can only select up to two matches.'); return; }
              const chosen = selected.map(i => matches[i]);
              localStorage.setItem('selectedMatches', JSON.stringify(chosen));
              window.location.href = '/onchain';
            }}
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded disabled:opacity-50"
          >
            Verify on Chain
          </button>
          <a href="/seed" className="px-4 py-2 border rounded hover:bg-slate-50">Back</a>
        </div>
      </div>
    </div>
  );
}
