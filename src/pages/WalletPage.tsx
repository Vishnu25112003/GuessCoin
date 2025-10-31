import { useEffect, useRef, useState } from 'react';
import { logos } from '../services/logos';

export default function WalletPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [status, setStatus] = useState('Please select a wallet to connect.');
  const queue = useRef<any[]>([]);
  const domLoaded = useRef(false);

  function handleNewProvider(detail: any) {
    setProviders((prev) => {
      if (prev.some((p) => p.info.uuid === detail.info.uuid)) return prev;
      return [...prev, detail];
    });
  }

  useEffect(() => {
    function onAnnounce(e: any) {
      if (domLoaded.current) handleNewProvider(e.detail);
      else queue.current.push(e.detail);
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce);
    domLoaded.current = true;
    while (queue.current.length) handleNewProvider(queue.current.shift());
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return () => window.removeEventListener('eip6963:announceProvider', onAnnounce);
  }, []);

  async function connect() {
    if (!selected) return;
    try {
      const accounts = await selected.provider.request({ method: 'eth_requestAccounts' });
      localStorage.setItem('selectedWalletRdns', selected.info.rdns);
      localStorage.setItem('currentAccount', accounts[0]);
      setStatus(`Connected: ${accounts[0]}`);
      setTimeout(() => (window.location.href = '/session'), 400);
    } catch (e) {
      setStatus('Connection failed.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Connect a Wallet</h1>
          <p className="text-slate-600 text-sm mt-1">{status}</p>
        </div>
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <div className="space-y-2">
            {providers.map((p) => (
              <label key={p.info.uuid} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                <img src={logos[p.info.name] || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded" />
                <span className="flex-1 text-left font-medium text-slate-800">{p.info.name}</span>
                <input type="radio" name="w" onChange={() => setSelected(p)} />
              </label>
            ))}
            {providers.length === 0 && (
              <div className="text-sm text-slate-500">No browser wallets detected. Open MetaMask and refresh.</div>
            )}
          </div>
          <button className="mt-4 w-full bg-sky-700 hover:bg-sky-800 text-white py-2.5 rounded-lg disabled:opacity-50" disabled={!selected} onClick={connect}>
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
