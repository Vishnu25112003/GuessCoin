import React, { useState, useEffect } from "react";
import {
  RefreshCcw,
  DollarSign,
  Wallet,
  LogOut,
  Copy,
  Menu,
  X,
} from "lucide-react";

interface NavItem {}
interface NavbarProps {
  navItems: NavItem[];
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onLogout: () => void;
  onSyncDataPool: () => void;
  onCheckBalance: () => void;
}

const useAuth = () => ({
  walletAddress: "0x1aF07E7B3A2C87C99E03080c55dF98d752B31d7e",
  isConnected: true,
});

const ConnectionStatusIcon = ({ isConnected }: { isConnected: boolean }) => (
  <div
    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} shadow-md shadow-inner ${isConnected ? "animate-pulse" : ""}`}
  />
);

const Navbar: React.FC<NavbarProps> = ({
  onLogout,
  onSyncDataPool,
  onCheckBalance,
}) => {
  const { walletAddress, isConnected } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    if (walletAddress) {
      navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const MobileButton = ({ label, onClick, icon: Icon, colorClass }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center w-full ${colorClass} text-white px-4 py-3 rounded-xl transition-all duration-200 text-base font-semibold shadow-md hover:shadow-lg border border-white/20`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        width: "100%",
      }}
    >
      <nav className="bg-gray-900 border-b border-gray-700/70 shadow-lg backdrop-blur-sm bg-opacity-95 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <div className="text-white text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 cursor-default">
                GuessCoin
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onSyncDataPool}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md shadow-indigo-600/30 hover:shadow-lg border border-white/20"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Sync Data Pool
                </button>

                <button
                  onClick={onCheckBalance}
                  className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md shadow-emerald-600/30 hover:shadow-lg border border-white/20"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Check Balance
                </button>
              </div>

              {walletAddress && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-800 rounded-full pl-3 pr-2 py-1 border border-gray-700/70 shadow-inner hover:border-purple-500 transition-all duration-300">
                    <ConnectionStatusIcon isConnected={isConnected} />
                    <span className="ml-2 text-xs text-gray-300 mr-2">
                      {isConnected ? "Live" : "Offline"}
                    </span>
                    <div className="w-px h-5 bg-gray-700/50" />
                    <Wallet className="w-4 h-4 text-purple-400 ml-2" />
                    <span
                      className="ml-2 text-sm text-white cursor-default"
                      title={walletAddress}
                    >
                      {formatWalletAddress(walletAddress)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(walletAddress)}
                      className="ml-2 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700 relative group"
                    >
                      <Copy className="w-4 h-4" />
                      {copyStatus === "copied" && (
                        <span className="absolute top-0 right-0 transform translate-y-full px-2 py-1 bg-green-500 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={onLogout}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium shadow-md shadow-red-600/30 hover:shadow-lg border border-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Logout</span>
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="md:hidden"
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 9998,
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            <div className="px-4 py-6 space-y-4 bg-gray-800 shadow-xl border-t border-gray-700">
              {walletAddress && (
                <div className="bg-gray-700 rounded-xl p-4 space-y-2 shadow-inner border border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ConnectionStatusIcon isConnected={isConnected} />
                      <span className="text-sm text-gray-300 font-semibold">
                        Status: {isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    <LogOut
                      className="w-5 h-5 text-red-400 cursor-pointer"
                      onClick={onLogout}
                    />
                  </div>

                  <div className="h-px bg-gray-600/50" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 text-purple-400 mr-2" />
                      <span
                        className="text-sm text-white break-all"
                        title={walletAddress}
                      >
                        {formatWalletAddress(walletAddress)}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(walletAddress)}
                      className="text-gray-400 hover:text-white transition-colors p-1 relative"
                    >
                      <Copy className="w-4 h-4" />
                      {copyStatus === "copied" && (
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-green-500 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <MobileButton
                  label="Sync Data Pool"
                  onClick={onSyncDataPool}
                  icon={RefreshCcw}
                  colorClass="bg-indigo-600 hover:bg-indigo-700"
                />
                <MobileButton
                  label="Check Balance"
                  onClick={onCheckBalance}
                  icon={DollarSign}
                  colorClass="bg-emerald-600 hover:bg-emerald-700"
                />
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-colors duration-200 mt-4 font-semibold text-base shadow-lg shadow-red-600/30 border border-white/20"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
