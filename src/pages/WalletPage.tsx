import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Power,
} from "lucide-react";
import { logos } from "../services/logos";
import { CyberButton } from "../components/cyberpunk/Button";
import { CyberCard } from "../components/cyberpunk/Card";
import { CyberBadge } from "../components/cyberpunk/Badge";
import { GlitchText } from "../components/cyberpunk/effects/GlitchText";
import { Scanlines } from "../components/cyberpunk/effects/Scanlines";
import { HexGrid } from "../components/cyberpunk/effects/HexGrid";
import { CyberModal } from "../components/cyberpunk/Modal";
import { useCyberModal } from "../hooks/useCyberModal";

interface WalletProvider {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: { request: (args: { method: string; params?: unknown[] }) => Promise<string[]> };
}

export default function WalletPage() {
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [selected, setSelected] = useState<WalletProvider | null>(null);
  const [status, setStatus] = useState("INITIATING CONNECTION");
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const queue = useRef<WalletProvider[]>([]);
  const domLoaded = useRef(false);
  const modal = useCyberModal();

  function handleNewProvider(detail: WalletProvider) {
    setProviders((prev) => {
      if (prev.some((p) => p.info.uuid === detail.info.uuid)) return prev;
      return [...prev, detail];
    });
  }

  useEffect(() => {
    function onAnnounce(e: Event) {
      const detail = (e as CustomEvent<WalletProvider>).detail;
      if (domLoaded.current) handleNewProvider(detail);
      else queue.current.push(detail);
    }
    window.addEventListener("eip6963:announceProvider", onAnnounce as EventListener);
    domLoaded.current = true;
    while (queue.current.length) {
      const provider = queue.current.shift();
      if (provider) handleNewProvider(provider);
    }
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnounce as EventListener);
  }, []);

  async function connect() {
    if (!selected) return;
    setIsConnecting(true);
    setStatus("ESTABLISHING SECURE CONNECTION...");
    try {
      const accounts = await selected.provider.request({
        method: "eth_requestAccounts",
      });
      (window as { selectedWallet?: unknown }).selectedWallet = selected.provider;
      localStorage.setItem("selectedWalletRdns", selected.info.rdns);
      localStorage.setItem("currentAccount", accounts[0]);
      setConnectedAccount(accounts[0]);
      setStatus("CONNECTION ESTABLISHED");
      modal.open(
        {
          title: "Connection Established",
          message: `Successfully connected to ${selected.info.name}`,
          type: "success",
          confirmText: "CONTINUE",
        },
        () => {
          window.location.href = "/session";
        },
      );
    } catch (e) {
      const error = e as Error;
      setStatus("CONNECTION FAILED - RETRY PROTOCOL");
      modal.open({
        title: "Connection Failed",
        message: error?.message || "Unable to connect to wallet. Please try again.",
        type: "error",
      });
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnect() {
    setStatus("TERMINATING CONNECTION...");
    try {
      const prov =
        selected?.provider ||
        (window as { selectedWallet?: { request?: unknown; disconnect?: unknown; close?: unknown } }).selectedWallet ||
        (window as { ethereum?: { request?: unknown; disconnect?: unknown; close?: unknown } }).ethereum;
      if (prov && typeof prov === 'object' && 'request' in prov) {
        try {
          await (prov as { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }).request({
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch {
          // Ignore revoke errors
        }
      }
      if (prov && typeof prov === 'object' && 'disconnect' in prov && typeof prov.disconnect === "function") {
        try {
          await prov.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
      if (prov && typeof prov === 'object' && 'close' in prov && typeof prov.close === "function") {
        try {
          await prov.close();
        } catch {
          // Ignore close errors
        }
      }
    } finally {
      try {
        delete (window as { selectedWallet?: unknown }).selectedWallet;
      } catch {
        // Ignore deletion errors
      }
      localStorage.removeItem("selectedWalletRdns");
      localStorage.removeItem("currentAccount");
      localStorage.removeItem("logicCrtAddress");
      localStorage.removeItem("auth");
      setConnectedAccount(null);
      setSelected(null);
      setStatus("CONNECTION TERMINATED");
      modal.open({
        title: "Disconnected",
        message: "Wallet has been disconnected successfully",
        type: "info",
      });
    }
  }

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-cyber-darker">
      <HexGrid />
      <Scanlines />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-cyber-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-secondary rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <GlitchText className="text-5xl md:text-7xl font-display font-black mb-4">
              DECENT GUESS NETWORK
            </GlitchText>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-cyber-primary text-sm md:text-base font-mono uppercase tracking-widest"
            >
              {status}
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {connectedAccount ? (
              <ConnectedView
                key="connected"
                selected={selected}
                connectedAccount={connectedAccount}
                formatAddress={formatAddress}
                disconnect={disconnect}
              />
            ) : (
              <ConnectView
                key="connect"
                providers={providers}
                selected={selected}
                setSelected={setSelected}
                connect={connect}
                isConnecting={isConnecting}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <CyberModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        {...modal.config}
        onConfirm={modal.onConfirm || undefined}
      />
    </div>
  );
}

// Connected View Component
interface ConnectedViewProps {
  selected: WalletProvider | null;
  connectedAccount: string;
  formatAddress: (addr: string) => string;
  disconnect: () => void;
}

const ConnectedView: React.FC<ConnectedViewProps> = ({
  selected,
  connectedAccount,
  formatAddress,
  disconnect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CyberCard glow className="max-w-2xl mx-auto">
        {/* Wallet Icon & Name */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyber-primary to-blue-600 p-1 shadow-cyber-lg">
              <div className="w-full h-full rounded-full bg-cyber-dark flex items-center justify-center overflow-hidden">
                {selected?.info?.icon ? (
                  <img
                    src={selected.info.icon}
                    alt={selected.info.name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <Wallet className="w-12 h-12 text-cyber-primary" />
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-2 border-cyber-primary border-dashed rounded-full opacity-30"
            />
          </motion.div>

          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-cyber-primary mb-2 cyber-text-glow">
              {selected?.info?.name || "Wallet"}
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {selected?.info?.rdns || "io.metamask"}
            </p>
          </div>
        </div>

        {/* Address Display */}
        <div className="mb-8">
          <div className="bg-cyber-dark bg-opacity-50 backdrop-blur-sm border-2 border-cyber-primary border-opacity-30 rounded-lg p-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-cyber-primary font-mono text-2xl tracking-wider cyber-text-glow">
                {formatAddress(connectedAccount)}
              </span>
            </div>
            <div className="text-center">
              <CyberBadge variant="success" pulse>
                <CheckCircle className="w-3 h-3" />
                Connected to {selected?.info?.name || "Wallet"}
              </CyberBadge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={() => (window.location.href = "/session")}
            className="flex-1"
          >
            Continue →
          </CyberButton>
          <CyberButton
            variant="danger"
            size="lg"
            glow
            icon={<Power className="w-5 h-5" />}
            onClick={disconnect}
            className="flex-1 sm:flex-none"
          >
            Disconnect
          </CyberButton>
        </div>
      </CyberCard>
    </motion.div>
  );
};

// Connect View Component
interface ConnectViewProps {
  providers: WalletProvider[];
  selected: WalletProvider | null;
  setSelected: (provider: WalletProvider) => void;
  connect: () => void;
  isConnecting: boolean;
}

const ConnectView: React.FC<ConnectViewProps> = ({
  providers,
  selected,
  setSelected,
  connect,
  isConnecting,
}) => {
  return (
  <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CyberCard glow className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-cyber-text mb-2 cyber-text-glow">
            SELECT WALLET PROVIDER
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Choose your preferred wallet to establish connection
          </p>
        </div>

        {/* Wallet Grid */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {providers.map((provider, index) => (
              <WalletCard
                key={provider.info.uuid}
                provider={provider}
                isSelected={selected?.info.uuid === provider.info.uuid}
                onClick={() => setSelected(provider)}
                delay={index * 0.1}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-cyber-accent mx-auto mb-4" />
            <p className="text-cyber-text font-mono text-lg mb-2">
              NO WALLET DETECTED
            </p>
            <p className="text-gray-400 text-sm">
              Please install MetaMask or another Web3 wallet and refresh the
              page
            </p>
          </motion.div>
        )}

        {/* Connect Button */}
        {providers.length > 0 && (
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={connect}
            disabled={!selected || isConnecting}
            icon={<Wallet className="w-5 h-5" />}
            className="w-full"
          >
            {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
          </CyberButton>
        )}
      </CyberCard>
    </motion.div>
  );
};

// Wallet Card Component (No Hover Animation)
interface WalletCardProps {
  provider: WalletProvider;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}

const WalletCard: React.FC<WalletCardProps> = ({
  provider,
  isSelected,
  onClick,
  delay,
}) => {
  const logoUrl = logos[provider.info.name] || provider.info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      onClick={onClick}
      className={`
        relative p-6 rounded-lg cursor-pointer
        bg-cyber-dark bg-opacity-50 backdrop-blur-sm
        border-2 transition-all duration-300
        ${
          isSelected
            ? "border-cyber-primary shadow-cyber-lg"
            : "border-cyber-primary border-opacity-20"
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle className="w-6 h-6 text-cyber-success" />
        </motion.div>
      )}

      {/* Wallet Icon */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`
          w-16 h-16 rounded-full bg-cyber-dark flex items-center justify-center
          border-2 transition-all duration-300
          ${
            isSelected
              ? "border-cyber-primary shadow-cyber-md"
              : "border-cyber-primary border-opacity-20"
          }
        `}
        >
          <img
            src={logoUrl}
            alt={provider.info.name}
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = provider.info.icon;
            }}
          />
        </div>

        {/* Wallet Name */}
        <div className="text-center">
          <p className="font-display font-bold text-cyber-text text-sm">
            {provider.info.name}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            {provider.info.rdns.split(".").pop()}
          </p>
        </div>
      </div>

      {/* Glow effect when selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-cyber-primary opacity-5 rounded-lg animate-pulse-glow" />
      )}
    </motion.div>
  );
};
