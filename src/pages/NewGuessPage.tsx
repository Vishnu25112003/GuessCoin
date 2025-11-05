import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Web3 from "web3";
import {
  genHashData,
  getUnrevealedHash,
  isValidChar,
  removePrefix,
  randomBytes32,
  npInfura,
} from "../services/web3";
import { getTokenContract, getTokenContractReadonly } from "../services/eth";
import { isGasFeeError, sendWithFees } from "../services/tx";
import type { GuessEntry, LocalStorageRTDB, WalletProvider } from "../types";
import {
  CyberButton,
  CyberCard,
  ToggleSwitch,
  CyberSlider,
  HexGrid,
  Scanlines,
  CyberModal,
} from "../components/cyberpunk";
import { useCyberModal } from "../hooks/useCyberModal";


export default function NewGuessPage() {
  const [retrieved, setRetrieved] = useState<GuessEntry | null>(null);

  // form state
  const [guessId, setGuessId] = useState<number>(0);
  const [blockInc, setBlockInc] = useState<number>(10);
  const [tokenSize, setTokenSize] = useState<number>(3);
  const [paidGuess, setPaidGuess] = useState<boolean>(false);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [complex, setComplex] = useState<boolean>(false);
  const modal = useCyberModal();

  const [actualHash, setActualHash] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [dummyHash, setDummyHash] = useState<string>(
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  );

  // errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("singleGuess");
    if (stored) {
      const g = JSON.parse(stored) as GuessEntry;
      setRetrieved(g);
      setGuessId(g.guessId);
      setPaidGuess(Boolean(g.paidGuess));
      setComplex(Boolean(g.complex));
      setOverwrite(true);
    }
  }, []);

  const actualLen = useMemo(
    () => removePrefix(actualHash)?.length ?? 0,
    [actualHash],
  );
  const secretLen = useMemo(
    () => removePrefix(secretKey)?.length ?? 0,
    [secretKey],
  );

  // auto-generate dummy hash when both inputs look valid
  useEffect(() => {
    const a = removePrefix(actualHash || "");
    const s = removePrefix(secretKey || "");
    if (isValidChar(a) && isValidChar(s)) {
      setDummyHash(getUnrevealedHash(actualHash, secretKey));
    } else {
      setDummyHash(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      );
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
    const zero =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const inc = Number(blockInc);
    const tsize = Number(tokenSize);
    const a = removePrefix(actualHash || "");
    const s = removePrefix(secretKey || "");
    const d = removePrefix(dummyHash || "");

    if (!guessId) errs.guessId = "Guess ID is required.";
    if (!inc) errs.blockInc = "Block Increment Count is required.";
    if (!tsize) errs.tokenSize = "Token Size is required.";
    if (!actualHash) errs.actualHash = "Actual Hash is required.";
    if (!secretKey) errs.secretKey = "Secret Key Hash is required.";
    if (!dummyHash) errs.dummyHash = "Dummy Hash is required.";

    if (!Number.isFinite(inc) || inc < 10 || inc > 2048)
      errs.blockInc = "Please enter a valid block number between 10 and 2048";
    if (!Number.isFinite(tsize) || tsize < 3 || tsize > 64)
      errs.tokenSize = "Please enter a valid token size between 3 and 64";

    if (dummyHash && !isValidChar(d))
      errs.dummyHash =
        "Dummy hash must be a valid 64-character hexadecimal string.";
    if (actualHash && !isValidChar(a))
      errs.actualHash =
        "Actual hash must be a valid 64-character hexadecimal string.";
    if (secretKey && !isValidChar(s))
      errs.secretKey =
        "Secret key Hash must be a valid 64-character hexadecimal string.";

    if (!overwrite)
      errs.overwrite = "Cannot submit the form with overwrite OFF";

    if (dummyHash === zero)
      errs.dummyHash = "Dummy hash cannot be the default zero value.";
    if (actualHash === zero)
      errs.actualHash = "Actual hash cannot be the default zero value.";
    if (secretKey === zero)
      errs.secretKey = "Secret key cannot be the default zero value.";

    setErrors(errs);
    if (Object.keys(errs).length) {
      const list = Object.values(errs).join("\n");
      modal.open({ title: "Validation Errors", message: list, type: "error" });
      return false;
    }
    return true;
  }

  function clearForm() {
    setBlockInc(10);
    setTokenSize(3);
    setPaidGuess(false);
    setOverwrite(true);
    setComplex(false);
    setActualHash("");
    setSecretKey("");
    setDummyHash(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    );
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
    if (!dummyHash || dummyHash === "0x" + "0".repeat(64)) {
      setDummyHash(getUnrevealedHash(_actual, _secret));
    }

    if (!validate()) return;
    const account = localStorage.getItem("currentAccount");
    if (!account) {
      modal.open({ title: "Not logged in", message: "No wallet account found", type: "error" });
      return;
    }

    // Determine paid amount like HTML/JS: 25 tokens -> 25e18
    const provider =
      (
        window as Window & {
          selectedWallet?: WalletProvider;
          ethereum?: WalletProvider;
        }
      ).selectedWallet ||
      (window as Window & { ethereum?: WalletProvider }).ethereum;
    const web3 = new Web3(provider as never);
    const amountWei = paidGuess ? web3.utils.toWei("25", "ether") : "0";

    // If paid guess, ensure user has at least 25 GUESS before proceeding
    if (paidGuess) {
      const tokenRO = getTokenContractReadonly();
      const bal = await tokenRO.methods
        .balanceOf(account)
        .call({ from: account }, "latest");
      if (BigInt(String(bal)) < BigInt(String(amountWei))) {
        const pretty = npInfura.utils.fromWei(String(bal), "ether");
        modal.open({
          title: "Insufficient GUESS balance",
          message: `You need at least 25 GUESS. Current balance: ${pretty}`,
          type: "error",
        });
        return;
      }
    }

    // If paid guess, ensure allowance for Logic contract
    if (paidGuess) {
      try {
        const tokenRO = getTokenContractReadonly();
        const logicAddr = localStorage.getItem("logicCrtAddress") as string;
        const allowance = await tokenRO.methods
          .allowance(account, logicAddr)
          .call({ from: account }, "latest");
        if (BigInt(String(allowance)) < BigInt(String(amountWei))) {
          const token = getTokenContract(web3);
          await sendWithFees(
            web3,
            token.methods.approve(logicAddr, amountWei),
            { from: account },
            {
              onHash: () => {
                modal.open({ title: "Approving", message: "Approving 25 tokens for Logic contract…", type: "info" });
              },
            },
          );
        }
      } catch (err) {
        const error = err as { code?: number; message?: string };
        if (isGasFeeError(err))
          modal.open({ title: "Gas fee too low", message: "Please increase gas fee and try again.", type: "warning" });
        else
          modal.open({ title: "Approval error", message: error?.message || "Failed to approve tokens", type: "error" });
        return;
      }
    }

    const data = {
      Sno: Number(guessId),
      blockIncrementCount: Number(blockInc),
      blockHashGuess: dummyHash,
      tokenSize: Number(tokenSize),
      paymentPaidBet: amountWei,
      overWrite: Boolean(overwrite),
      complex: Boolean(complex),
      actualHash: _actual,
      secretKey: _secret,
      dummyHash,
      paidGuessBool: Boolean(paidGuess),
    };

    // Submit on-chain first (MetaMask gas confirmation)
    try {
      const { getLogicContract, getTokenContract } = await import(
        "../services/eth"
      );
      const logicAddr = localStorage.getItem("logicCrtAddress") as string;
      const logic = getLogicContract(web3, logicAddr);

      // Capture balance before (to verify deduction for paid guess)
      let balBefore = "0";
      if (paidGuess) {
        const tokenForBal = getTokenContractReadonly();
        balBefore = await tokenForBal.methods
          .balanceOf(account)
          .call({ from: account }, "latest");
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
        {
          onHash: () => {
            modal.open({ title: "Transaction sent", message: "Don't refresh. Waiting for confirmation...", type: "info" });
          },
        },
      );

      // Ensure 25 GUESS deducted for paid guess if contract didn't pull tokens
      try {
        if (paidGuess) {
          const tokenForCheck = getTokenContractReadonly();
          const balAfter = await tokenForCheck.methods
            .balanceOf(account)
            .call({ from: account }, "latest");
          const need = BigInt(String(amountWei));
          const diff = BigInt(String(balBefore)) - BigInt(String(balAfter));
          if (diff < need) {
            // Fallback: direct transfer to logic contract
            const token = getTokenContract(web3);
            await sendWithFees(
              web3,
              token.methods.transfer(logicAddr, String(amountWei)),
              { from: account },
              {
                onHash: () => {
                  modal.open({ title: "Charging 25 GUESS", message: "Approving direct transfer…", type: "info" });
                },
              },
            );
          }
        }
      } catch {
        // ignore fallback errors; user can still proceed
      }
    } catch (err) {
      const error = err as { code?: number; message?: string };
      if (isGasFeeError(err))
        modal.open({ title: "Gas fee too low", message: "Please increase gas fee and try again.", type: "warning" });
      else
        modal.open({ title: "Transaction error", message: error?.message || "Failed to send transaction", type: "error" });
      return;
    }

    // Persist like HTML/JS firebase update (local fallback store)
    const key = `rtdb:${account}`;
    const prev = localStorage.getItem(key);
    let table: LocalStorageRTDB = {};
    try {
      table = prev ? JSON.parse(prev) : {};
    } catch {
      table = {};
    }
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

    modal.open({ title: "Success!", message: "Form submitted successfully!", type: "success" }, () => { window.location.href = "/home"; });
  }

  const isReadOnly = !overwrite;

  return (
    <div className="min-h-screen relative bg-cyber-darker">
      <HexGrid />
      <Scanlines />
      <Header
        trail={[{ label: "Home", to: "/home" }, { label: "New Guess" }]}
        onLogout={() => { localStorage.clear(); window.location.href = "/session"; }}
      />

      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-12 space-y-6">
        {retrieved && (
          <CyberCard>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Previous Target Block Number</p>
                <p className="font-mono text-cyber-text">{retrieved.targetBlockNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Previous Hash Committed</p>
                <p className="font-mono break-all text-cyber-text">{retrieved.userHashGuess}</p>
              </div>
            </div>
          </CyberCard>
        )}

        <CyberCard>
          <form onSubmit={onSubmit} className={`space-y-6 ${isReadOnly ? "opacity-90" : ""}`}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Guess ID</p>
                <div className="font-mono bg-cyber-dark/60 border-2 border-cyber-primary/30 rounded-xl p-3 text-cyber-text">
                  {guessId}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <ToggleSwitch label="Paid Guess" enabled={paidGuess} onChange={setPaidGuess} />
                <ToggleSwitch label="Overwrite" enabled={overwrite} onChange={setOverwrite} />
                <ToggleSwitch label="Complex" enabled={complex} onChange={setComplex} />
                {errors.overwrite && (
                  <div className="text-rose-500 text-xs">{errors.overwrite}</div>
                )}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid sm:grid-cols-2 gap-6 items-start">
              <div className="space-y-3">
                <CyberSlider label="Block Increment Count" value={blockInc} min={10} max={2048} step={1} onChange={setBlockInc} />
                {errors.blockInc && <div className="text-rose-500 text-xs">{errors.blockInc}</div>}
              </div>
              <div className="space-y-3">
                <CyberSlider label="Token Size" value={tokenSize} min={3} max={64} step={1} onChange={setTokenSize} suffix=" bytes" />
                {errors.tokenSize && <div className="text-rose-500 text-xs">{errors.tokenSize}</div>}
              </div>
            </div>

            {/* Hash inputs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Actual Hash</p>
                <div className="flex gap-2">
                  <input className="flex-1 bg-cyber-dark/60 border-2 border-cyber-primary/30 rounded-xl p-3 font-mono text-cyber-text" value={actualHash} onChange={(e) => setActualHash(e.target.value)} readOnly={isReadOnly} />
                  <CyberButton variant="secondary" onClick={generateActual} type="button">Generate</CyberButton>
                </div>
                <div className="text-xs text-gray-400 mt-1">Your hash length: {actualLen}</div>
                {errors.actualHash && <div className="text-rose-500 text-xs">{errors.actualHash}</div>}
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Secret Key</p>
                <div className="flex gap-2">
                  <input className="flex-1 bg-cyber-dark/60 border-2 border-cyber-primary/30 rounded-xl p-3 font-mono text-cyber-text" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} readOnly={isReadOnly} />
                  <CyberButton variant="secondary" onClick={generateSecret} type="button">Generate</CyberButton>
                </div>
                <div className="text-xs text-gray-400 mt-1">Your hash length: {secretLen}</div>
                {errors.secretKey && <div className="text-rose-500 text-xs">{errors.secretKey}</div>}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Dummy Hash</p>
              <input className="w-full bg-cyber-dark/60 border-2 border-cyber-primary/30 rounded-xl p-3 font-mono text-cyber-text" value={dummyHash} readOnly />
              {errors.dummyHash && <div className="text-rose-500 text-xs">{errors.dummyHash}</div>}
            </div>

            <div className="flex justify-end gap-3">
              <CyberButton variant="secondary" type="button" onClick={clearForm}>Clear</CyberButton>
              {overwrite && (
                <CyberButton variant="primary" type="submit">Submit</CyberButton>
              )}
            </div>
          </form>
        </CyberCard>
      </main>

      <CyberModal isOpen={modal.isOpen} onClose={modal.close} {...modal.config} onConfirm={modal.onConfirm || undefined} />
    </div>
  );
}
