import React from "react";
import { useAuth } from "../../context/AuthContext";
import WalletOption from "./WalletOption"; // Ensure WalletOption component exists

const WalletContainer: React.FC = () => {
  const { wallets, selectedWallet, connectedAccount, connectWallet, disconnectWallet, statusMessage, isLoading, setSelectedWallet } = useAuth();

  const handleConnect = () => {
    if (selectedWallet) {
      connectWallet(selectedWallet);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 rounded-lg shadow-xl bg-gray-50 font-sans">
      <h2 className="text-2xl font-bold text-center mb-6">GuessCoin Wallet</h2>
      
      {/* Conditionally render based on connection status */}
      {connectedAccount ? (
        <div className="text-center">
          <p className="text-gray-700 mb-2">You are connected as:</p>
          <p className="font-mono bg-gray-200 p-2 rounded break-all mb-4">{connectedAccount}</p>
          <button
            onClick={disconnectWallet}
            disabled={isLoading}
            className="w-full px-5 py-3 rounded-md font-bold text-white transition-colors duration-300 bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {wallets.length === 0 && !isLoading && (
              <p className="text-center text-gray-500">Scanning for wallets...</p>
            )}
            {wallets.map((wallet) => (
              <WalletOption
                key={wallet.uuid}
                wallet={wallet}
                isSelected={selectedWallet?.uuid === wallet.uuid}
                onSelect={() => setSelectedWallet(wallet)}
              />
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={handleConnect}
              disabled={!selectedWallet || isLoading}
              className="w-full px-5 py-3 rounded-md font-bold text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Connect to Proceed'}
            </button>
          </div>
        </>
      )}

      {statusMessage && <p className="text-center text-sm text-gray-600 mt-4">{statusMessage}</p>}
    </div>
  );
};

export default WalletContainer;
