import { useCallback, useEffect, useState } from "react";
import { Coins, RefreshCw, Activity } from "lucide-react";
import Header from "../components/Header";
import GuessTable from "../components/GuessTable";
import {
  CyberButton,
  CyberCard,
  CyberModal,
  StatCard,
  HexGrid,
  Scanlines,
} from "../components/cyberpunk";
import { useCyberModal } from "../hooks/useCyberModal";
import type { GuessEntry } from "../types";
import Web3 from "web3";
import { getLogicContract, getTokenContractReadonly } from "../services/eth";
import { npInfura } from "../services/web3";
import { sendWithFees, isGasFeeError } from "../services/tx";

export default function HomePage() {
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [balLoading, setBalLoading] = useState(false);
  const modal = useCyberModal();

  const load = useCallback(async () => {
    try {
      const logic = localStorage.getItem("logicCrtAddress");
      const account = localStorage.getItem("currentAccount");
      
      if (!logic || !account) {
        // If no contract or account, show empty guesses with default structure
        const defaultEntries: GuessEntry[] = Array.from({ length: 5 }, (_, i) => ({
          guessId: i + 1,
          targetBlockNumber: 0,
          userHashGuess: "",
          tokenSize: 0,
          paidGuess: false,
          targetVerified: 0,
          complex: false,
          actualHash: "",
          secretKey: "",
        }));
        setGuesses(defaultEntries);
        return;
      }

      const { INFURA_HTTP_URL } = await import("../services/config");
      const web3ro = new Web3(INFURA_HTTP_URL);
      const LogicAbi = (await import("../abi/LogicCrt.json")).default;
      const logicCrt = new web3ro.eth.Contract(LogicAbi as never, logic);
      const entries: GuessEntry[] = [];
      const rtdbRaw = localStorage.getItem(`rtdb:${account}`);
      const rtdb: Record<string, Record<string, unknown>> = rtdbRaw ? JSON.parse(rtdbRaw) : {};

      for (let i = 1; i <= 5; i++) {
        try {
          const d = await logicCrt.methods
            .getGuessEntry(i)
            .call({ from: account }, "latest") as { 
              targetBlockNumber: bigint | number; 
              userHashGuess: string; 
              tokenSize: bigint | number; 
              paidGuess: boolean; 
              targetVerified: bigint | number; 
              complex: boolean 
            };
          const row = rtdb[`row${i}`] || {};
          entries.push({
            guessId: i,
            targetBlockNumber: Number(d.targetBlockNumber) || 0,
            userHashGuess: (row.dummyHash as string) || d.userHashGuess || "",
            tokenSize: Number((row.tokenSize as number) || d.tokenSize) || 0,
            paidGuess: Boolean((row.paidGuess as boolean) ?? d.paidGuess),
            targetVerified: Number(d.targetVerified) || 0,
            complex: Boolean((row.complex as boolean) ?? d.complex),
            actualHash: (row.actualHash as string) || "",
            secretKey: (row.secretKey as string) || "",
          });
        } catch {
          // If contract call fails for this guess, add empty entry
          entries.push({
            guessId: i,
            targetBlockNumber: 0,
            userHashGuess: "",
            tokenSize: 0,
            paidGuess: false,
            targetVerified: 0,
            complex: false,
            actualHash: "",
            secretKey: "",
          });
        }
      }
      setGuesses(entries);
    } catch (error) {
      console.error("Error loading guesses:", error);
      // On error, show 5 empty guess slots
      const defaultEntries: GuessEntry[] = Array.from({ length: 5 }, (_, i) => ({
        guessId: i + 1,
        targetBlockNumber: 0,
        userHashGuess: "",
        tokenSize: 0,
        paidGuess: false,
        targetVerified: 0,
        complex: false,
        actualHash: "",
        secretKey: "",
      }));
      setGuesses(defaultEntries);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const bn = await npInfura.eth.getBlockNumber();
        if (alive) setCurrentBlock(Number(bn));
      } catch {
        // Ignore block fetch errors
      }
    }
    tick();
    const id = setInterval(tick, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const onLogout = () => {
    localStorage.clear();
    modal.open(
      {
        title: "Logged Out",
        message: "Successfully logged out",
        type: "success",
      },
      () => {
        window.location.href = "/session";
      },
    );
  };

  async function onGetBalance() {
    try {
      setBalLoading(true);
      const account = localStorage.getItem("currentAccount");
      if (!account)
        return modal.open({
          title: "No Wallet",
          message: "Connect your wallet first",
          type: "error",
        });

      modal.open({
        title: "Checking Balance",
        message: "Fetching your token balance...",
        type: "info",
      });

      const token = getTokenContractReadonly();
      const bal = await token.methods
        .balanceOf(account)
        .call({ from: account }, "latest");
      const pretty = npInfura.utils.fromWei(String(bal), "ether");

      modal.open({
        title: "💰 TOKEN BALANCE",
        message: `You have\n\n${parseFloat(pretty).toFixed(4)} GC\n\nGuess Coins`,
        type: "success",
      });
    } catch (e) {
      const error = e as Error;
      modal.open({
        title: "Balance Error",
        message: error?.message || "Unable to fetch balance",
        type: "error",
      });
    } finally {
      setBalLoading(false);
    }
  }

  async function onSyncPool() {
    try {
      setSyncing(true);
      const account = localStorage.getItem("currentAccount");
      const logicAddr = localStorage.getItem("logicCrtAddress");
      if (!account || !logicAddr)
        return modal.open({
          title: "Not Logged In",
          message: "Login first",
          type: "error",
        });

      const provider =
        (window as { selectedWallet?: unknown; ethereum?: unknown }).selectedWallet || 
        (window as { selectedWallet?: unknown; ethereum?: unknown }).ethereum;
      if (!provider)
        return modal.open({
          title: "No Wallet Provider",
          message: "Open MetaMask and retry",
          type: "error",
        });

      const web3 = new Web3(provider);
      const logic = getLogicContract(web3, logicAddr);

      modal.open({
        title: "Syncing Data Pool",
        message: "Processing transaction...\nPlease confirm in your wallet",
        type: "info",
      });

      await sendWithFees(
        web3,
        logic.methods.syncPoolData(),
        { from: account },
        {
          onHash: () => {
            modal.open({
              title: "⏳ Transaction Submitted",
              message:
                "Your transaction has been sent\n\nWaiting for blockchain confirmation...\n\nDo NOT refresh the page",
              type: "info",
            });
          },
          onReceipt: (receipt: { status?: boolean; events?: { updatedPoolData?: { returnValues?: { _userAddress?: string; updatedStatus?: boolean; updateStatus?: boolean } } } }) => {
            if (!receipt?.status) throw new Error("Sync failed");
            const ev = receipt.events?.updatedPoolData?.returnValues;
            if (ev?._userAddress?.toLowerCase() === account.toLowerCase()) {
              const isUpdated = ev.updatedStatus || ev.updateStatus;
              modal.open({
                title: isUpdated ? "✅ Sync Success" : "ℹ️ No Changes",
                message: isUpdated
                  ? "Pool data synchronized successfully!\n\nYour guess entries have been updated."
                  : "No synchronization required.\n\nYour data is already up to date.",
                type: isUpdated ? "success" : "info",
              });
            } else {
              modal.open({
                title: "⚠️ Warning",
                message: "Unable to retrieve sync event data",
                type: "warning",
              });
            }
          },
        },
      );
      await load();
    } catch (e) {
      const error = e as { code?: number; message?: string };
      if (error?.code === 4001) {
        modal.open({
          title: "❌ Transaction Rejected",
          message: "You rejected the transaction in your wallet",
          type: "error",
        });
      } else if (isGasFeeError(error)) {
        modal.open({
          title: "⛽ Gas Fee Issue",
          message:
            "Gas fee is too low.\n\nPlease increase gas fee and try again",
          type: "warning",
        });
      } else {
        modal.open({
          title: "❌ Sync Failed",
          message: error?.message || "Error syncing pool data",
          type: "error",
        });
      }
    } finally {
      setSyncing(false);
    }
  }

  const checkValidity = async (g: GuessEntry) => {
    try {
      const target = Number(g.targetBlockNumber);
      const head = Number(await npInfura.eth.getBlockNumber());

      if (!Number.isFinite(target) || target <= 0)
        return modal.open({
          title: "No Target Block",
          message: "This row has no target block number",
          type: "info",
        });
      if (head < target)
        return modal.open({
          title: "Block Not Reached",
          message: `Current: ${head}\nTarget: ${target}`,
          type: "info",
        });

      const dist = head - target;
      if (dist > 128)
        return modal.open({
          title: "Too Long Distance",
          message: `Distance: ${dist} blocks\n(Maximum: 128)`,
          type: "warning",
        });

      const blk = await npInfura.eth.getBlock(target);
      modal.open({
        title: blk?.hash ? "✅ Block Reached" : "⏳ Not Yet",
        message: blk?.hash
          ? `Block #${target} has been mined\n\nReady for verification`
          : `Block #${target} not available yet\n\nTry again shortly`,
        type: blk?.hash ? "success" : "warning",
      });
    } catch (e) {
      const error = e as Error;
      modal.open({
        title: "Error",
        message: error?.message || "Unable to check validity",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker relative">
      <HexGrid />
      <Scanlines />
      <Header trail={[{ label: "Home" }]} onLogout={onLogout} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        <CyberCard glow className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5" />}
              label="Current Block"
              value={currentBlock ?? "—"}
              variant="info"
            />
            <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
              <CyberButton
                variant="success"
                onClick={onSyncPool}
                disabled={syncing}
                icon={
                  <RefreshCw
                    className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                  />
                }
              >
                {syncing ? "Syncing..." : "Sync Data Pool"}
              </CyberButton>
              <CyberButton
                variant="primary"
                onClick={onGetBalance}
                disabled={balLoading}
                icon={<Coins className="w-4 h-4" />}
              >
                {balLoading ? "Checking..." : "Check Balance"}
              </CyberButton>
            </div>
          </div>
        </CyberCard>

        <GuessTable
          guesses={guesses}
          onEdit={(g) => {
            localStorage.setItem("singleGuess", JSON.stringify(g));
            window.location.href = "/new-guess";
          }}
          onVerify={(g) => {
            localStorage.setItem("singleGuess", JSON.stringify(g));
            window.location.href = "/seed-data";
          }}
          onValidity={checkValidity}
        />
      </main>

      <CyberModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        {...modal.config}
        onConfirm={modal.onConfirm || undefined}
      />
    </div>
  );
}
