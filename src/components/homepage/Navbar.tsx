// src/components/layout/Navbar.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  DollarSign,
  Wallet,
  LogOut,
  Copy,
  Menu,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Web3 from "web3";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  LOGIC_CONTRACT_ABI,
} from "../../config/contracts";
import Swal from "sweetalert2";

interface NavbarProps {
  onLogout: () => void;
}

const ConnectionStatusIcon = ({ isConnected }: { isConnected: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
      }`}
    />
    <span className="text-xs text-gray-400">
      {isConnected ? "Connected" : "Disconnected"}
    </span>
  </div>
);

const Navbar: React.FC<NavbarProps> = ({
  onLogout,
}) => {
  const { connectedAccount, isConnected } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  // Get stored logic contract address
  const logicCrtAddress = localStorage.getItem("logicCrtAddress") || "0x";

  // Convert BigInt to String for JSON serialization
  const convertBigIntToString = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "bigint") {
      return obj.toString();
    }

    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }

    if (typeof obj === "object") {
      const converted: Record<string, unknown> = {};
      for (const key in obj) {
        converted[key] = convertBigIntToString((obj as Record<string, unknown>)[key]);
      }
      return converted;
    }

    return obj;
  };

  // Initialize contract instance
  const initContractInstance = async (
    contractType: "token" | "logic"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const browserWallet = (window as any).ethereum;
      if (!browserWallet) {
        throw new Error("No wallet detected");
      }

      const npWallet = new Web3(browserWallet);
      const currentNetwork = Number(await npWallet.eth.getChainId());

      // Check for Polygon network
      if (currentNetwork !== 137 && currentNetwork !== 80002) {
        Swal.fire({
          icon: "error",
          title: "Wrong Network",
          text: "Please switch to Polygon network!",
          background: "#1f2937",
          color: "#ffffff",
          confirmButtonColor: "#ef4444",
          iconColor: "#ef4444",
        });
        return null;
      }

      let abiCode, crtAddress;

      if (contractType === "token") {
        abiCode = TOKEN_CONTRACT_ABI;
        crtAddress = TOKEN_CONTRACT_ADDRESS;
      } else {
        abiCode = LOGIC_CONTRACT_ABI;
        crtAddress = logicCrtAddress;

        if (crtAddress === "0x" || !crtAddress) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Logic Contract is not loaded yet!",
            background: "#1f2937",
            color: "#ffffff",
            confirmButtonColor: "#ef4444",
            iconColor: "#ef4444",
          });
          return null;
        }
      }

      const crtInstance = new npWallet.eth.Contract(abiCode, crtAddress);
      return crtInstance;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize contract";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        background: "#1f2937",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
        iconColor: "#ef4444",
      });
      return null;
    }
  };

  // Get token balance with STUNNING UI
  const handleCheckBalance = async () => {
    if (!connectedAccount) {
      Swal.fire({
        icon: "warning",
        title: "No Wallet Connected",
        text: "Please connect your wallet first",
        background: "#1f2937",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
        iconColor: "#f59e0b",
      });
      return;
    }

    setIsLoadingBalance(true);

    try {
      const deGuessContract = await initContractInstance("token");
      if (!deGuessContract) {
        setIsLoadingBalance(false);
        return;
      }

      const balance = await deGuessContract.methods
        .balanceOf(connectedAccount)
        .call();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const web3 = new Web3((window as any).ethereum);
      const normalBalance = web3.utils.fromWei(balance, "ether");

      // STUNNING Balance Popup UI
      Swal.fire({
        title: '<span style="color: #10b981; font-weight: 800;">💰 Token Balance</span>',
        html: `
          <div style="
            background: linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
          ">
            <div style="
              font-size: 56px;
              font-weight: 900;
              color: #ffffff;
              text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
              margin-bottom: 10px;
              letter-spacing: -1px;
            ">
              ${parseFloat(normalBalance).toFixed(4)}
            </div>
            <div style="
              font-size: 18px;
              color: #d1fae5;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">
              🪙 GUESS Tokens
            </div>
          </div>
          
          <div style="
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            border: 2px solid #10b981;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            ">
              <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                Wallet Address
              </div>
              <div style="
                color: #10b981;
                font-family: monospace;
                font-size: 14px;
                font-weight: 700;
                background: #111827;
                padding: 8px 16px;
                border-radius: 8px;
              ">
                ${connectedAccount.substring(0, 8)}...${connectedAccount.substring(36)}
              </div>
            </div>
          </div>

          <div style="
            margin-top: 20px;
            padding: 15px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 10px;
            border-left: 4px solid #10b981;
          ">
            <div style="color: #6ee7b7; font-size: 12px;">
              ✨ Balance fetched successfully from blockchain
            </div>
          </div>
        `,
        background: "#111827",
        confirmButtonText: "✓ Close",
        confirmButtonColor: "#10b981",
        showClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut animate__faster",
        },
        customClass: {
          popup: "rounded-3xl",
          title: "text-2xl",
          confirmButton:
            "rounded-xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all",
        },
      });
    } catch (error: unknown) {
      console.error("Error getting token balance:", error);
      const errorMessage = error instanceof Error ? error.message : "Error getting token balance";
      Swal.fire({
        icon: "error",
        title: "Balance Check Failed",
        text: errorMessage,
        background: "#1f2937",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
        iconColor: "#ef4444",
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fill data from contract
  const fillDataFromContract = async (account: string) => {
    try {
      const poolSize = 5;
      const deGuessInfuraInst = await initContractInstance("logic");

      if (!deGuessInfuraInst) {
        return null;
      }

      const guessEntries: Record<number, unknown> = {};

      for (let SNo = 1; SNo <= poolSize; SNo++) {
        const guessData = await deGuessInfuraInst.methods
          .getGuessEntry(SNo)
          .call({ from: account });

        guessEntries[SNo] = convertBigIntToString(guessData);
      }

      return guessEntries;
    } catch (error: unknown) {
      console.error("Error fetching user data pool:", error);
      throw error;
    }
  };

  // Sync data pool with STUNNING UI
  const handleSyncDataPool = async () => {
    if (!connectedAccount) {
      Swal.fire({
        icon: "warning",
        title: "No Wallet Connected",
        text: "Please connect your wallet first",
        background: "#1f2937",
        color: "#ffffff",
        confirmButtonColor: "#f59e0b",
        iconColor: "#f59e0b",
      });
      return;
    }

    setIsLoadingSync(true);

    try {
      // STUNNING Loading UI
      Swal.fire({
        title: '<span style="color: #3b82f6;">🔄 Syncing Data Pool</span>',
        html: `
          <div style="padding: 20px;">
            <div style="
              display: inline-block;
              width: 60px;
              height: 60px;
              border: 6px solid #1e40af;
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
            <div style="
              margin-top: 20px;
              color: #93c5fd;
              font-size: 14px;
            ">
              Fetching your guess entries from the blockchain...
            </div>
          </div>
        `,
        background: "#111827",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const guessEntries = await fillDataFromContract(connectedAccount);

      if (!guessEntries) {
        setIsLoadingSync(false);
        return;
      }

      // Count valid entries
      let validEntries = 0;
      Object.values(guessEntries).forEach((entry: unknown) => {
        const entryObj = entry as Record<string, unknown>;
        if (entryObj.targetBlockNumber && Number(entryObj.targetBlockNumber) > 0) {
          validEntries++;
        }
      });

      // STUNNING Success UI
      Swal.fire({
        title: '<span style="color: #3b82f6; font-weight: 800;">✅ Sync Complete!</span>',
        html: `
          <div style="
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
            border-radius: 20px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 20px;
              margin-bottom: 20px;
            ">
              <div style="
                font-size: 72px;
                font-weight: 900;
                color: #ffffff;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
              ">
                ${validEntries}
              </div>
              <div style="
                font-size: 48px;
                color: #93c5fd;
                font-weight: 300;
              ">/</div>
              <div style="
                font-size: 48px;
                font-weight: 500;
                color: #dbeafe;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              ">
                ${Object.keys(guessEntries).length}
              </div>
            </div>
            <div style="
              font-size: 16px;
              color: #bfdbfe;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 2px;
            ">
              📊 Active Guess Entries
            </div>
          </div>
          
          <div style="
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            border-radius: 15px;
            padding: 25px;
            margin-top: 20px;
            border: 2px solid #3b82f6;
          ">
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            ">
              <div style="
                background: #111827;
                padding: 15px;
                border-radius: 10px;
                border-left: 3px solid #10b981;
              ">
                <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">
                  Active
                </div>
                <div style="color: #10b981; font-size: 24px; font-weight: 800;">
                  ${validEntries}
                </div>
              </div>
              <div style="
                background: #111827;
                padding: 15px;
                border-radius: 10px;
                border-left: 3px solid #6b7280;
              ">
                <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 5px;">
                  Empty
                </div>
                <div style="color: #9ca3af; font-size: 24px; font-weight: 800;">
                  ${Object.keys(guessEntries).length - validEntries}
                </div>
              </div>
            </div>
          </div>

          <div style="
            margin-top: 20px;
            padding: 15px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
          ">
            <div style="color: #93c5fd; font-size: 12px;">
              ⛓️ Data synchronized from Polygon blockchain
            </div>
          </div>
        `,
        background: "#111827",
        confirmButtonText: "✓ Done",
        confirmButtonColor: "#3b82f6",
        showClass: {
          popup: "animate__animated animate__bounceIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut animate__faster",
        },
        customClass: {
          popup: "rounded-3xl",
          confirmButton:
            "rounded-xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all",
        },
      });

      localStorage.setItem("syncedGuessData", JSON.stringify(guessEntries));
      window.dispatchEvent(
        new CustomEvent("dataSynced", { detail: guessEntries })
      );
    } catch (error: unknown) {
      console.error("Error syncing data pool:", error);
      const errorMessage = error instanceof Error ? error.message : "Error fetching user data pool";
      Swal.fire({
        icon: "error",
        title: "Sync Failed",
        text: errorMessage,
        background: "#1f2937",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
        iconColor: "#ef4444",
      });
    } finally {
      setIsLoadingSync(false);
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (connectedAccount) {
      navigator.clipboard.writeText(connectedAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "Not Connected";
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DecentGuessCoin</h1>
                <ConnectionStatusIcon isConnected={isConnected} />
              </div>
            </div>    

            {/* Wallet & Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Wallet Address Display */}
              {isConnected && connectedAccount && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300 font-mono">
                    {formatAddress(connectedAccount)}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              )}

              {/* Check Balance Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckBalance}
                disabled={isLoadingBalance || !isConnected}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign className="w-4 h-4" />
                {isLoadingBalance ? "Checking..." : "Check Balance"}
              </motion.button>

              {/* Sync Data Pool Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSyncDataPool}
                disabled={isLoadingSync || !isConnected}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${isLoadingSync ? "animate-spin" : ""}`}
                />
                {isLoadingSync ? "Syncing..." : "Sync Data Pool"}
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 backdrop-blur-lg bg-opacity-90">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">GuessCoin</h1>
                <ConnectionStatusIcon isConnected={isConnected} />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Wallet Address Display (Mobile) */}
          {isConnected && connectedAccount && (
            <div className="mt-3 flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300 font-mono flex-1">
                {formatAddress(connectedAccount)}
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-700 bg-gray-900 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">

                {/* Action Buttons */}
                <div className="pt-2 space-y-2 border-t border-gray-800">
                  <button
                    onClick={() => {
                      handleCheckBalance();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoadingBalance || !isConnected}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DollarSign className="w-4 h-4" />
                    {isLoadingBalance ? "Checking..." : "Check Balance"}
                  </button>

                  <button
                    onClick={() => {
                      handleSyncDataPool();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoadingSync || !isConnected}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCcw
                      className={`w-4 h-4 ${
                        isLoadingSync ? "animate-spin" : ""
                      }`}
                    />
                    {isLoadingSync ? "Syncing..." : "Sync Data Pool"}
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20 lg:h-24" />
    </>
  );
};

export default Navbar;
