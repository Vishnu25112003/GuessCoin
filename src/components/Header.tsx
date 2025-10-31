import { Link } from 'react-router-dom';

type Props = { title?: string; trail?: Array<{ label: string; to?: string }>; onLogout?: () => void };

export default function Header({ trail = [], onLogout }: Props) {
  return (
    <header className="border-b bg-white/60 backdrop-blur sticky top-0 z-40">
      <div className="h-1 bg-gradient-to-r from-sky-700 via-indigo-600 to-fuchsia-600" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-sky-600 text-white grid place-items-center font-bold">G</div>
              <span className="hidden sm:block font-semibold text-slate-800">GuessCoin</span>
            </Link>
            <nav className="ml-4 text-sm text-slate-500 hidden sm:block">
              <ol className="flex gap-2">
                {trail.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {t.to ? (
                      <Link to={t.to} className="hover:text-slate-700">
                        {t.label}
                      </Link>
                    ) : (
                      <span className="text-slate-700">{t.label}</span>
                    )}
                    {i < trail.length - 1 && <span>/</span>}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button onClick={onLogout} className="px-3 py-1.5 rounded bg-rose-600 text-white text-sm hover:bg-rose-700">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
