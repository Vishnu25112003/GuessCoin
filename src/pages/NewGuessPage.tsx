import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Swal from 'sweetalert2';
import { genHashData, getUnrevealedHash, isValidChar, removePrefix, randomBytes32 } from '../services/web3';
import Web3 from 'web3';
import { getTokenContract, getTokenContractReadonly } from '../services/eth';
import { isGasFeeError, sendWithFees } from '../services/tx';
import type { GuessEntry, RTDBData } from '../types';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-slate-600 text-sm mb-1">{children}</div>;
}

export default function NewGuessPage() {
  const [retrieved, setRetrieved] = useState<GuessEntry | null>(null);

  // form state
  const [guessId, setGuessId] = useState<number>(0);
  const [blockInc, setBlockInc] = useState<string>('');
  const [tokenSize, setTokenSize] = useState<string>('');
  const [paidGuess, setPaidGuess] = useState<'true' | 'false'>('false');
  const [overwrite, setOverwrite] = useState<'true' | 'false'>('true');
  const [complex, setComplex] = useState<'true' | 'false'>('false');

  const [actualHash, setActualHash] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [dummyHash, setDummyHash] = useState<string>('0x0000000000000000000000000000000000000000000000000000000000000000');

  // errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem('singleGuess');
    if (stored) {
      const g = JSON.parse(stored) as GuessEntry;
      setRetrieved(g);
      setGuessId(g.guessId);
      setPaidGuess(g.paidGuess ? 'true' : 'false');
      setComplex(g.complex ? 'true' : 'false');
      setOverwrite('true');
    }
  }, []);

  const actualLen = useMemo(() => removePrefix(actualHash)?.length ?? 0, [actualHash]);
  const secretLen = useMemo(() => removePrefix(secretKey)?.length ?? 0, [secretKey]);

  // auto-generate dummy hash when both inputs look valid
  useEffect(() => {
    const a = removePrefix(actualHash || '');
    const s = removePrefix(secretKey || '');
    if (isValidChar(a) && isValidChar(s)) {
      setDummyHash(getUnrevealedHash(actualHash, secretKey));
    } else {
      setDummyHash('0x0000000000000000000000000000000000000000000000000000000000000000');
    }
  }, [actualHash, secretKey]);

  function generateActual() {
    if (!actualHash || !actualHash.trim()) {
      // generate random bytes32 when empty
      const rnd = randomBytes32();
      setActualHash(rnd);
      return;
    }
    const h = genHashData(actualHash.trim());
    setActualHash(h);
  }
  function generateSecret() {
    if (!secretKey || !secretKey.trim()) {
      const rnd = randomBytes32();
      setSecretKey(rnd);
      return;
    }
    const h = genHashData(secretKey.trim());
    setSecretKey(h);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const zero = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const inc = Number(blockInc);
    const tsize = Number(tokenSize);
    const a = removePrefix(actualHash || '');
    const s = removePrefix(secretKey || '');
    const d = removePrefix(dummyHash || '');

    if (!guessId) errs.guessId = 'Guess ID is required.';
    if (!blockInc) errs.blockInc = 'Block Increment Count is required.';
    if (!tokenSize) errs.tokenSize = 'Token Size is required.';
    if (!actualHash) errs.actualHash = 'Actual Hash is required.';
    if (!secretKey) errs.secretKey = 'Secret Key Hash is required.';
    if (!dummyHash) errs.dummyHash = 'Dummy Hash is required.';

    if (!Number.isFinite(inc) || inc < 10 || inc > 2048) errs.blockInc = 'Please enter a valid block number between 10 and 2048';
    if (!Number.isFinite(tsize) || tsize < 3 || tsize > 64) errs.tokenSize = 'Please enter a valid token size between 3 and 64';

    if (dummyHash && !isValidChar(d)) errs.dummyHash = 'Dummy hash must be a valid 64-character hexadecimal string.';
    if (actualHash && !isValidChar(a)) errs.actualHash = 'Actual hash must be a valid 64-character hexadecimal string.';
    if (secretKey && !isValidChar(s)) errs.secretKey = 'Secret key Hash must be a valid 64-character hexadecimal string.';

    if (overwrite === 'false') errs.overwrite = 'Cannot submit the form with overwrite is false';

    if (dummyHash === zero) errs.dummyHash = 'Dummy hash cannot be the default zero value.';
    if (actualHash === zero) errs.actualHash = 'Actual hash cannot be the default zero value.';
    if (secretKey === zero) errs.secretKey = 'Secret key cannot be the default zero value.';

    setErrors(errs);
    if (Object.keys(errs).length) {
      Swal.fire({ title: 'Validation Errors', html: `<ul>${Object.values(errs).map((e) => `<p>${e}</p>`).join('')}</ul>`, icon: 'error' });
      return false;
    }
    return true;
  }

  function clearForm() {
    setBlockInc('');
    setTokenSize('');
    setPaidGuess('false');
    setOverwrite('true');
    setComplex('false');
    setActualHash('');
    setSecretKey('');
    setDummyHash('0x0000000000000000000000000000000000000000000000000000000000000000');
    setErrors({});
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Ensure hashes exist even if user didn't type
    let _actual = actualHash?.trim();
    let _secret = secretKey?.trim();
    if (!_actual) _actual = randomBytes32();
    if (!_secret) _secret = randomBytes32();
    setActualHash(_actual);
    setSecretKey(_secret);
    if (!dummyHash || dummyHash === '0x' + '0'.repeat(64)) {
      setDummyHash(getUnrevealedHash(_actual, _secret));
    }

    if (!validate()) return;
    const account = localStorage.getItem('currentAccount');
    if (!account) { Swal.fire('Not logged in', 'No wallet account found', 'error'); return; }

    // Determine paid amount like HTML/JS: 25 tokens -> 25e18
    const provider = (window as { selectedWallet?: unknown; ethereum?: unknown }).selectedWallet || (window as { selectedWallet?: unknown; ethereum?: unknown }).ethereum;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const web3 = new Web3(provider as any);
    const amountWei = paidGuess === 'true' ? web3.utils.toWei('25', 'ether') : '0';

    // If paid guess, ensure allowance for Logic contract
    if (paidGuess === 'true') {
      try {
        const tokenRO = getTokenContractReadonly();
        const logicAddr = localStorage.getItem('logicCrtAddress') as string;
        const allowance = await tokenRO.methods.allowance(account, logicAddr).call({ from: account }, 'latest');
        if (BigInt(String(allowance)) < BigInt(String(amountWei))) {
          const token = getTokenContract(web3);
          await sendWithFees(
            web3,
            token.methods.approve(logicAddr, amountWei),
            { from: account },
            { onHash: () => { void Swal.fire('Approving', 'Approving 25 tokens for Logic contract…', 'info'); } },
          );
        }
       } catch (err: unknown) {
         if (isGasFeeError(err)) await Swal.fire('Gas fee too low', 'Please increase gas fee and try again.', 'warning');
         else await Swal.fire('Approval error', (err as Error)?.message || 'Failed to approve tokens', 'error');
        return;
      }
    }

    const data = {
      Sno: Number(guessId),
      blockIncrementCount: Number(blockInc),
      blockHashGuess: dummyHash,
      tokenSize: Number(tokenSize),
      paymentPaidBet: amountWei,
      overWrite: overwrite === 'true',
      complex: complex === 'true',
      actualHash: _actual,
      secretKey: _secret,
      dummyHash,
      paidGuessBool: paidGuess === 'true',
    };

    // Submit on-chain first (MetaMask gas confirmation)
    try {
      const { getLogicContract, getTokenContract } = await import('../services/eth');
      const logicAddr = localStorage.getItem('logicCrtAddress') as string;
      const logic = getLogicContract(web3, logicAddr);

      // Capture balance before (to verify deduction for paid guess)
      let balBefore = '0';
      if (paidGuess === 'true') {
        const tokenForBal = getTokenContractReadonly();
        balBefore = await tokenForBal.methods.balanceOf(account).call({ from: account }, 'latest');
      }

      await sendWithFees(
        web3,
        logic.methods.submitBlockGuess(
          data.Sno,
          data.blockIncrementCount,
          data.blockHashGuess,
          data.tokenSize,
          data.paymentPaidBet,
          data.overWrite,
          data.complex,
        ),
        { from: account },
        { onHash: () => { Swal.fire('Transaction sent', "Don't refresh. Waiting for confirmation...", 'info'); } },
      );

      // Ensure 25 GUESS deducted for paid guess if contract didn't pull tokens
      try {
        if (paidGuess === 'true') {
          const tokenForCheck = getTokenContractReadonly();
          const balAfter = await tokenForCheck.methods.balanceOf(account).call({ from: account }, 'latest');
          const need = BigInt(String(amountWei));
          const diff = BigInt(String(balBefore)) - BigInt(String(balAfter));
          if (diff < need) {
            // Fallback: direct transfer to logic contract
            const token = getTokenContract(web3);
            await sendWithFees(
              web3,
              token.methods.transfer(logicAddr, String(amountWei)),
              { from: account },
              { onHash: () => { void Swal.fire('Charging 25 GUESS', 'Approving direct transfer…', 'info'); } },
            );
          }
        }
       } catch {
         // ignore fallback errors; user can still proceed
       }
     } catch (err: unknown) {
       if (isGasFeeError(err)) Swal.fire('Gas fee too low', 'Please increase gas fee and try again.', 'warning');
       else Swal.fire('Transaction error', (err as Error)?.message || 'Failed to send transaction', 'error');
      return;
    }

    // Persist like HTML/JS firebase update (local fallback store)
    const key = `rtdb:${account}`;
    const prev = localStorage.getItem(key);
    let table: RTDBData = {};
    try { table = prev ? JSON.parse(prev) : {}; } catch { table = {}; }
    const rowName = `row${data.Sno}`;
    table[rowName] = {
      ...(table[rowName] || {}),
      guessId: data.Sno,
      paidGuess: data.paidGuessBool,
      tokenSize: data.tokenSize,
      complex: data.complex,
      dummyHash: data.dummyHash,
      actualHash: data.actualHash,
      secretKey: data.secretKey,
      // keep targetBlockNumber/targetVerified as contract values
    };
    localStorage.setItem(key, JSON.stringify(table));

    await Swal.fire('Form submitted successfully!', '', 'success');
    window.location.href = '/home';
  }

  const isReadOnly = overwrite === 'false';

  return (
    <div>
      <Header trail={[{ label: 'Home', to: '/home' }, { label: 'New Guess' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
      <div className="max-w-3xl mx-auto py-8">
        {retrieved && (
          <div className="mb-6 p-4 bg-slate-50 rounded border">
            <div className="text-slate-500 text-sm">Previous Target Block Number</div>
            <div className="font-mono">{retrieved.targetBlockNumber}</div>
            <div className="text-slate-500 text-sm mt-3">Previous Hash Committed</div>
            <div className="font-mono break-all">{retrieved.userHashGuess}</div>
          </div>
        )}

        <form onSubmit={onSubmit} className={`space-y-5 ${isReadOnly ? 'opacity-90' : ''}`}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Guess ID</FieldLabel>
              <input className="w-full border rounded p-2" value={guessId} readOnly />
            </div>
            <div>
              <FieldLabel>Block Increment Count</FieldLabel>
              <input className="w-full border rounded p-2" value={blockInc} onChange={(e) => setBlockInc(e.target.value)} readOnly={isReadOnly} />
              {errors.blockInc && <div className="text-rose-600 text-xs mt-1">{errors.blockInc}</div>}
            </div>
            <div>
              <FieldLabel>Token Size</FieldLabel>
              <input className="w-full border rounded p-2" value={tokenSize} onChange={(e) => setTokenSize(e.target.value)} readOnly={isReadOnly} />
              {errors.tokenSize && <div className="text-rose-600 text-xs mt-1">{errors.tokenSize}</div>}
            </div>
            <div>
              <FieldLabel>Paid Guess</FieldLabel>
               <select className="w-full border rounded p-2" value={paidGuess} onChange={(e) => setPaidGuess(e.target.value as 'true' | 'false')} disabled={isReadOnly}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
            <div>
              <FieldLabel>Overwrite</FieldLabel>
               <select className="w-full border rounded p-2" value={overwrite} onChange={(e) => setOverwrite(e.target.value as 'true' | 'false')}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
              {errors.overwrite && <div className="text-rose-600 text-xs mt-1">{errors.overwrite}</div>}
            </div>
            <div>
              <FieldLabel>Complex</FieldLabel>
               <select className="w-full border rounded p-2" value={complex} onChange={(e) => setComplex(e.target.value as 'true' | 'false')} disabled={isReadOnly}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>

          {/* Paid/Free notes */}
          {paidGuess === 'true' && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded border">Proceeding with Paid Guess.</div>
          )}
          {paidGuess === 'false' && (
            <div className="p-3 bg-sky-50 text-sky-700 rounded border">Proceeding with Free Guess.</div>
          )}

          {/* Hash inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Actual Hash</FieldLabel>
              <div className="flex gap-2">
                <input className="flex-1 border rounded p-2 font-mono" value={actualHash} onChange={(e) => setActualHash(e.target.value)} readOnly={isReadOnly} />
                <button type="button" className="px-3 border rounded" onClick={generateActual}>Generate</button>
              </div>
              <div className="text-xs text-slate-500 mt-1">Your hash length: {actualLen}</div>
              {errors.actualHash && <div className="text-rose-600 text-xs mt-1">{errors.actualHash}</div>}
            </div>
            <div>
              <FieldLabel>Secret Key</FieldLabel>
              <div className="flex gap-2">
                <input className="flex-1 border rounded p-2 font-mono" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} readOnly={isReadOnly} />
                <button type="button" className="px-3 border rounded" onClick={generateSecret}>Generate</button>
              </div>
              <div className="text-xs text-slate-500 mt-1">Your hash length: {secretLen}</div>
              {errors.secretKey && <div className="text-rose-600 text-xs mt-1">{errors.secretKey}</div>}
            </div>
          </div>

          <div>
            <FieldLabel>Dummy Hash</FieldLabel>
            <input className="w-full border rounded p-2 font-mono" value={dummyHash} readOnly />
            {errors.dummyHash && <div className="text-rose-600 text-xs mt-1">{errors.dummyHash}</div>}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 border rounded" onClick={clearForm}>Clear</button>
            {overwrite === 'true' && (
              <button type="submit" className="px-4 py-2 bg-sky-700 text-white rounded">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
