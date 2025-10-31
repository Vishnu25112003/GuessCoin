import type { GuessEntry } from '../types';
import React, { useState } from 'react';

type Props = {
  guesses: GuessEntry[];
  onNewGuess: (g: GuessEntry) => void;
  onVerify: (g: GuessEntry) => void;
  onValidity: (g: GuessEntry) => void;
};

function StatusBadge({ status }: { status: number }) {
  const label = status === 2 ? 'Verified' : status === 1 ? 'Unverified' : 'EMPTY';
  const cls = status === 2 ? 'bg-emerald-100 text-emerald-700' : status === 1 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700';
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

export default function GuessTable({ guesses, onNewGuess, onVerify, onValidity }: Props) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="rounded-xl overflow-hidden shadow bg-gradient-to-br from-sky-100 via-indigo-100 to-fuchsia-100">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-sky-600 to-indigo-600 text-left text-white">
          <tr>
            <th className="p-3 font-medium">Guess ID</th>
            <th className="p-3 font-medium">Target Verified Status</th>
            <th className="p-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/40">
          {guesses.map((g) => (
            <React.Fragment key={g.guessId}>
              <tr className={`${open[g.guessId] ? 'bg-white/70' : 'bg-white/80'} backdrop-blur`}>
                <td className="p-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <button aria-label="toggle" className="text-slate-700 hover:text-slate-900" onClick={() => setOpen({ ...open, [g.guessId]: !open[g.guessId] })}>
                      <span className={`inline-block transition-transform ${open[g.guessId] ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    <span className="inline-flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${Number(g.targetVerified) === 2 ? 'bg-emerald-500' : Number(g.targetVerified) === 1 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      {g.guessId}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-slate-800"><StatusBadge status={Number(g.targetVerified)} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700" onClick={() => onNewGuess(g)}>New Guess</button>
                    {Number(g.targetVerified) !== 2 && (
                      <button className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => onVerify(g)}>Verify</button>
                    )}
                    <button className="px-3 py-1 rounded bg-fuchsia-600 text-white hover:bg-fuchsia-700" onClick={() => onValidity(g)}>Validity</button>
                  </div>
                </td>
              </tr>
              {open[g.guessId] && (
                <tr>
                  <td colSpan={3} className="p-0">
                    <div className="p-4 bg-white/70 backdrop-blur">
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-600">Target Block Number</div>
                          <div className="font-medium text-slate-900">{g.targetBlockNumber}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Token Sizes</div>
                          <div className="font-medium text-slate-900">{g.tokenSize}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">PaidGuess</div>
                          <div><span className={`px-2 py-0.5 rounded text-xs ${g.paidGuess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{String(g.paidGuess)}</span></div>
                        </div>
                        <div>
                          <div className="text-slate-600">Complex</div>
                          <div><span className={`px-2 py-0.5 rounded text-xs ${g.complex ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{String(g.complex)}</span></div>
                        </div>
                      </div>
                      <hr className="my-4 border-slate-200" />
                      <div className="grid md:grid-cols-3 gap-4 break-all">
                        <div>
                          <div className="text-slate-600">Actual Hash</div>
                          <div className="font-mono text-xs md:text-[13px] text-slate-800">{g.actualHash}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Secret Key</div>
                          <div className="font-mono text-xs md:text-[13px] text-slate-800">{g.secretKey}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Dummy Hash</div>
                          <div className="font-mono text-xs md:text-[13px] text-slate-800">{g.userHashGuess}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
