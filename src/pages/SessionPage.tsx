import Header from '../components/Header';

import { login, register } from '../services/walletFlow';

export default function SessionPage() {
  async function onLogin() {
    const res = await login();
    if (res.ok) window.location.href = '/home';
    else alert(res.error);
  }
  async function onRegister() {
    const res = await register();
    if (res.ok) window.location.href = '/home';
    else alert(res.error);
  }
  return (
    <div>
      <Header trail={[{ label: 'Session' }]} onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center space-y-5 p-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-sky-100 text-sky-700 grid place-items-center text-4xl">🔐</div>
          <h1 className="text-2xl font-semibold text-slate-800">Login or Register</h1>
          <p className="text-slate-600">Use your connected wallet to continue.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onLogin} className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg">Login</button>
            <button onClick={onRegister} className="px-5 py-2.5 border rounded-lg hover:bg-slate-50">Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
