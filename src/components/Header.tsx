import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Copy, Check, WifiOff } from "lucide-react";

type Props = {
  title?: string;
  trail?: Array<{ label: string; to?: string }>;
  onLogout?: () => void;
};

export default function Header({ trail = [], onLogout }: Props) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check wallet connection on mount and listen for changes
  useEffect(() => {
    const checkConnection = () => {
      const account = localStorage.getItem("currentAccount");
      setWalletAddress(account);
      setIsConnected(!!account);
    };

    checkConnection();

    // Listen for storage changes (in case of logout from another tab)
    window.addEventListener("storage", checkConnection);

    return () => window.removeEventListener("storage", checkConnection);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error("Failed to copy");
      }
    }
  };

  return (
    <header className="border-b border-cyber-primary border-opacity-30 bg-cyber-darker bg-opacity-95 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-cyber-primary/10">
      {/* Enhanced gradient line with glow */}
      <div className="h-1 bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent shadow-[0_0_10px_rgba(0,243,255,0.5)]" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="py-3 flex items-center justify-between gap-4">
          {/* Logo and Navigation Section */}
          <div className="flex items-center gap-3">
            {/* Enhanced Logo */}
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="relative">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-cyber-primary blur-md opacity-50 rounded group-hover:opacity-75 transition-opacity" />

                {/* Logo */}
                <div className="relative w-8 h-8 rounded bg-gradient-to-br from-cyber-primary to-blue-500 text-cyber-darker grid place-items-center font-bold shadow-cyber-md group-hover:shadow-cyber-lg transition-all">
                  <span className="text-sm">G</span>
                </div>
              </div>

              {/* Brand name with glow */}
              <span className="hidden sm:block font-semibold text-cyber-text font-display text-lg cyber-text-glow">
                GuessCoin
              </span>
            </Link>

            {/* Breadcrumb Navigation */}
            <nav className="ml-4 text-sm text-gray-400 hidden md:block font-mono">
              <ol className="flex gap-2">
                {trail.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {t.to ? (
                      <Link
                        to={t.to}
                        className="hover:text-cyber-primary transition-colors hover:cyber-text-glow"
                      >
                        {t.label}
                      </Link>
                    ) : (
                      <span className="text-cyber-primary cyber-text-glow font-semibold">
                        {t.label}
                      </span>
                    )}
                    {i < trail.length - 1 && (
                      <span className="text-cyber-primary opacity-30">/</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Right Section - Wallet Status & Logout */}
          <div className="flex items-center gap-3">
            {/* Wallet Status Indicator */}
            {isConnected && walletAddress ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyber-dark bg-opacity-50 backdrop-blur-sm border border-cyber-primary border-opacity-30 rounded-lg shadow-cyber-sm">
                {/* Connection Status */}
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <div className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-2 h-2 bg-cyber-success rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="hidden sm:block text-[10px] text-cyber-success font-mono uppercase tracking-wider">
                    Connected
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px h-4 bg-cyber-primary opacity-20" />

                {/* Wallet Address */}
                <div className="flex items-center gap-2">
                  <span className="text-cyber-primary font-mono text-sm cyber-text-glow">
                    {formatAddress(walletAddress)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-cyber-primary hover:bg-opacity-20 rounded transition-all"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-cyber-success" />
                    ) : (
                      <Copy className="w-3 h-3 text-cyber-primary" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyber-dark bg-opacity-50 backdrop-blur-sm border border-cyber-danger border-opacity-30 rounded-lg">
                <WifiOff className="w-3 h-3 text-cyber-danger" />
                <span className="hidden sm:block text-[10px] text-cyber-danger font-mono uppercase tracking-wider">
                  Disconnected
                </span>
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="
                  relative px-4 py-2 rounded
                  bg-cyber-danger text-white text-sm
                  font-display font-bold uppercase tracking-wider
                  border-2 border-cyber-danger
                  shadow-[0_0_20px_rgba(255,0,85,0.5)]
                  hover:shadow-[0_0_30px_rgba(255,0,85,0.7)]
                  hover:bg-opacity-90
                  transition-all duration-300
                  overflow-hidden
                  flex items-center gap-2
                "
                title="Logout"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-all duration-700" />
                <LogOut className="w-4 h-4 relative" />
                <span className="relative hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-50" />
    </header>
  );
}
