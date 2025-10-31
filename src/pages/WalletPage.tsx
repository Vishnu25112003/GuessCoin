import { useEffect, useRef, useState } from "react";
import { logos } from "../services/logos";
import type { EIP6963ProviderDetail } from "../types";

export default function WalletPage() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selected, setSelected] = useState<EIP6963ProviderDetail | null>(null);
  const [status, setStatus] = useState("Please select a wallet to connect.");
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const queue = useRef<EIP6963ProviderDetail[]>([]);
  const domLoaded = useRef(false);

  function handleNewProvider(detail: EIP6963ProviderDetail) {
    setProviders((prev) => {
      if (prev.some((p) => p.info.uuid === detail.info.uuid)) return prev;
      return [...prev, detail];
    });
  }

  useEffect(() => {
    function onAnnounce(e: Event) {
      const detail = (e as CustomEvent<EIP6963ProviderDetail>).detail;
      if (domLoaded.current) handleNewProvider(detail);
      else queue.current.push(detail);
    }
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    domLoaded.current = true;
    const nextItem = queue.current.shift();
    while (nextItem) {
      handleNewProvider(nextItem);
    }
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
  }, []);

  async function connect() {
    if (!selected) return;
    try {
      const accounts = await (selected.provider as { request: (args: { method: string }) => Promise<string[]> }).request({
        method: "eth_requestAccounts",
      });
      (window as { selectedWallet?: unknown }).selectedWallet = selected.provider;
      localStorage.setItem("selectedWalletRdns", selected.info.rdns);
      localStorage.setItem("currentAccount", accounts[0]);
      setConnectedAccount(accounts[0]);
      setStatus(`Connected: ${accounts[0]}`);
    } catch {
      setStatus("Connection failed.");
    }
  }

  async function disconnect() {
    try {
      const prov: {
        request?: (args: { method: string; params: unknown[] }) => Promise<unknown>;
        disconnect?: () => Promise<void>;
        close?: () => Promise<void>;
      } =
        selected?.provider ||
        (window as { selectedWallet?: unknown; ethereum?: unknown }).selectedWallet ||
        (window as { selectedWallet?: unknown; ethereum?: unknown }).ethereum ||
        {};
      if (prov?.request) {
        try {
          await prov.request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch {
          // Ignore errors
        }
      }
      if (typeof prov?.disconnect === "function") {
        try {
          await prov.disconnect();
        } catch {
          // Ignore errors
        }
      }
      if (typeof prov?.close === "function") {
        try {
          await prov.close();
        } catch {
          // Ignore errors
        }
      }
    } finally {
      try {
        delete (window as { selectedWallet?: unknown }).selectedWallet;
      } catch {
        // Ignore errors
      }
      localStorage.removeItem("selectedWalletRdns");
      localStorage.removeItem("currentAccount");
      localStorage.removeItem("logicCrtAddress");
      localStorage.removeItem("auth");
      setConnectedAccount(null);
      setSelected(null);
      setStatus("Disconnected.");
    }
  }

  const ConnectedView = () => (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <img
          src={logos[selected?.info?.name || ""] || "https://via.placeholder.com/40"}
          className="w-10 h-10 rounded"
        />
        <div className="flex-1">
          <div className="font-medium text-slate-800">
            {selected?.info?.name || "Wallet"}
          </div>
          <div className="text-slate-600 text-sm break-all">
            {connectedAccount}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded"
          onClick={() => (window.location.href = "/session")}
        >
          Continue
        </button>
        <button
          className="px-4 py-2 border rounded hover:bg-slate-50"
          onClick={disconnect}
        >
          Disconnect
        </button>
      </div>
    </div>
  );

  const ConnectView = () => (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <div className="space-y-2">
        {providers.map((p) => (
          <label
            key={p.info.uuid}
            className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-slate-50"
          >
            <img
              src={logos[p.info.name] || "https://via.placeholder.com/40"}
              className="w-10 h-10 rounded"
            />
            <span className="flex-1 text-left font-medium text-slate-800">
              {p.info.name}
            </span>
            <input type="radio" name="w" onChange={() => setSelected(p)} />
          </label>
        ))}
        {providers.length === 0 && (
          <div className="text-sm text-slate-500">
            No browser wallets detected. Open MetaMask and refresh.
          </div>
        )}
      </div>
      <button
        className="mt-4 w-full bg-sky-700 hover:bg-sky-800 text-white py-2.5 rounded-lg disabled:opacity-50"
        disabled={!selected}
        onClick={connect}
      >
        Connect
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            Connect a Wallet
          </h1>
          <p className="text-slate-600 text-sm mt-1">{status}</p>
        </div>
        {connectedAccount ? <ConnectedView /> : <ConnectView />}
      </div>
    </div>
  );
}
