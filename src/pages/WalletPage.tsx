import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const WalletPage: React.FC = () => {
  const {
    wallets,
    connectWallet,
    disconnectWallet,
    isLoading,
    statusMessage,
    connectedAccount,
    selectedWallet,
  } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-950 font-mono">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
          DECENT GUESS NETWORK
        </h1>
        <p className="text-xl text-purple-300 mt-2">
          {connectedAccount
            ? "CONNECTION ESTABLISHED"
            : "INITIATING CONNECTION"}
        </p>
      </motion.div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {connectedAccount && selectedWallet ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl shadow-xl border border-gray-700"
            >
              <div className="flex items-center justify-center mb-4">
                <img
                  src={selectedWallet.icon || "./notfound.jpg"}
                  alt={selectedWallet.name}
                  className="w-12 h-12 mr-4 rounded-full border-2 border-green-500"
                />
                <div>
                  <h3 className="text-lg font-bold text-green-400">
                    {selectedWallet.name}
                  </h3>
                  <p className="text-sm text-gray-400 truncate max-w-[200px]">
                    {selectedWallet.rdns}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                <p
                  className="text-green-400 text-sm break-all"
                  title={connectedAccount}
                >
                  {`${connectedAccount.substring(0, 8)}...${connectedAccount.substring(connectedAccount.length - 8)}`}
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => navigate("/auth")}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  CONTINUE →
                </motion.button>

                <motion.button
                  onClick={disconnectWallet}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>DISCONNECTING...</span>
                    </div>
                  ) : (
                    "DISCONNECT"
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="selecting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              {wallets.length > 0 ? (
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <motion.button
                      key={`${wallet.uuid}-${wallet.rdns}`}
                      onClick={() => connectWallet(wallet)}
                      disabled={isLoading}
                      className="w-full flex items-center justify-start bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl border border-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={wallet.icon || "./notfound.jpg"}
                        alt={wallet.name}
                        className="w-8 h-8 mr-4 rounded-full border border-gray-500"
                      />
                      <div className="text-left flex-1">
                        <div className="font-bold text-white text-lg">
                          {wallet.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate max-w-[250px]">
                          {wallet.rdns}
                        </div>
                      </div>
                      {isLoading && (
                        <div className="ml-auto">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
                  <div className="text-6xl text-gray-600 mb-4 animate-bounce">
                    <span role="img" aria-label="magnifying glass">
                      🔍
                    </span>
                  </div>
                  <p className="text-gray-400 mb-2 text-lg font-semibold">
                    NO WALLETS DETECTED
                  </p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Please install a wallet extension like MetaMask, Coinbase
                    Wallet, or WalletConnect to continue.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 text-sm text-yellow-300 p-4 bg-gray-800/50 rounded-lg border border-yellow-500/20 max-w-md text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
              {statusMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;
