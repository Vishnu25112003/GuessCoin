import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import WalletOption from "./WalletOption";

const WalletContainer: React.FC = () => {
  const {
    wallets,
    selectedWallet,
    connectedAccount,
    connectWallet,
    disconnectWallet,
    statusMessage,
    isLoading,
    setSelectedWallet,
  } = useAuth();

  const handleConnect = () => {
    if (selectedWallet) {
      connectWallet(selectedWallet);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 font-mono">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-gray-800/60 backdrop-blur-lg border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div
          className="absolute inset-0 rounded-2xl border-4 border-transparent pointer-events-none z-10"
          style={{
            borderImage:
              "linear-gradient(45deg, #a855f7, #6b21a8, transparent, #a855f7) 1",
            animation: "border-glow 4s infinite linear",
          }}
        />
        <style>{`
          @keyframes border-glow {
            0% { border-image-source: linear-gradient(45deg, #a855f7, #6b21a8, transparent, #a855f7); }
            25% { border-image-source: linear-gradient(135deg, #6b21a8, #a855f7, transparent, #6b21a8); }
            50% { border-image-source: linear-gradient(225deg, transparent, #a855f7, #6b21a8, transparent); }
            75% { border-image-source: linear-gradient(315deg, #a855f7, transparent, #6b21a8, #a855f7); }
            100% { border-image-source: linear-gradient(45deg, #a855f7, #6b21a8, transparent, #a855f7); }
          }
        `}</style>

        <h2 className="text-3xl font-bold text-center mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          DECENT TERMINAL
        </h2>

        {connectedAccount ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 shadow-inner"
          >
            <p className="text-gray-300 mb-2">ACCESS GRANTED</p>
            <p className="font-mono bg-gray-900/50 p-2 rounded break-all mb-4 text-green-400">
              {connectedAccount}
            </p>
            <motion.button
              onClick={disconnectWallet}
              disabled={isLoading}
              className="w-full px-5 py-3 rounded-lg font-bold text-white transition-colors duration-300 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "TERMINATING SESSION..." : "DISCONNECT"}
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {wallets.length === 0 && !isLoading && (
                <p className="text-center text-gray-500 text-sm">
                  SCANNING FOR WALLETS...
                </p>
              )}
              <AnimatePresence>
                {wallets.map((wallet) => (
                  <motion.div
                    key={wallet.uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WalletOption
                      wallet={wallet}
                      isSelected={selectedWallet?.uuid === wallet.uuid}
                      onSelect={() => setSelectedWallet(wallet)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-6">
              <motion.button
                onClick={handleConnect}
                disabled={!selectedWallet || isLoading}
                className="w-full px-5 py-3 rounded-lg font-bold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? "VERIFYING..." : "CONNECT TO PROCEED"}
              </motion.button>
            </div>
          </>
        )}

        <AnimatePresence>
          {statusMessage && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center text-sm text-gray-400 mt-4"
            >
              ► {statusMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WalletContainer;
