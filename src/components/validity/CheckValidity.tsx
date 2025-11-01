// CheckValidity.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hourglass,
  CheckCircle,
  BarChart2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Web3 from "web3";

// Interface remains the same
interface StoredGuessData {
  Sno: number;
  blockIncrementCount: number;
  tokenSize: number;
  complex: boolean;
  actualHash: string;
  guessId: number;
  timestamp: number;
  contractBlockNumber?: string;
}

// Props for the new component
interface CheckValidityProps {
  guessId: number;
  onClose: () => void;
}

const CheckValidity: React.FC<CheckValidityProps> = ({ guessId, onClose }) => {
  // We still use navigate for the "Proceed" button
  const navigate = useNavigate();

  const [guessData, setGuessData] = useState<StoredGuessData | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when guessId changes to handle re-opening the modal for different guesses
    setIsLoading(true);
    setError(null);
    setGuessData(null);
    setCurrentBlock(null);

    let isMounted = true;

    // 1. Load Guess Data from LocalStorage
    const loadData = () => {
      const allGuessesRaw = localStorage.getItem("allGuessSubmissions");
      if (allGuessesRaw) {
        try {
          const allGuesses: StoredGuessData[] = JSON.parse(allGuessesRaw);
          const data = allGuesses.find((g) => g.guessId === guessId);
          if (isMounted) {
            if (data) {
              setGuessData(data);
            } else {
              setError(
                `No data found for Guess ID #${guessId}. Please ensure you have submitted this guess.`,
              );
              setIsLoading(false);
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          if (isMounted) {
            setError("Failed to parse guess data from storage.");
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setError("No guess submissions found in your local storage.");
          setIsLoading(false);
        }
      }
    };

    // 2. Fetch Current Block Number
    const fetchBlockNumber = async () => {
      try {
        const web3 = new Web3("https://rpc-amoy.polygon.technology/");
        const blockNumber = await web3.eth.getBlockNumber();
        if (isMounted) {
          setCurrentBlock(Number(blockNumber));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (isMounted) {
          setError(
            "Could not connect to the blockchain to get the current block number.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    fetchBlockNumber();

    return () => {
      isMounted = false;
    };
  }, [guessId]); // Effect now re-runs if the guessId prop changes

  const targetBlock = guessData?.contractBlockNumber
    ? parseInt(guessData.contractBlockNumber)
    : 0;
  const blocksRemaining =
    targetBlock && currentBlock ? targetBlock - currentBlock : null;
  const isMined = blocksRemaining !== null && blocksRemaining <= 0;

  const startBlock =
    targetBlock && guessData?.blockIncrementCount
      ? targetBlock - guessData.blockIncrementCount
      : null;
  const progress =
    startBlock && currentBlock && !isMined
      ? Math.max(
          0,
          Math.min(
            100,
            ((currentBlock - startBlock) / (targetBlock - startBlock)) * 100,
          ),
        )
      : isMined
        ? 100
        : 0;

  const statusConfig = isMined
    ? {
        text: "Mined & Ready for Verification",
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        icon: <CheckCircle />,
      }
    : {
        text: "Pending - Awaiting Target Block",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        icon: <Hourglass />,
      };

  return (
    // Note: The outer container styles are now for the modal content area
    <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-4 sm:p-8 font-mono text-white max-h-[90vh] overflow-y-auto">
      <motion.button
        onClick={onClose} // Use the onClose prop to close the modal
        className="flex items-center text-purple-300 hover:text-purple-100 transition-colors font-semibold mb-8 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Guesses
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Guess Validity Status
        </h1>
        <p className="text-xl text-gray-400">
          Live Blockchain Check for Guess #{guessId}
        </p>
      </motion.div>

      {isLoading && (
        <div className="text-center mt-8 text-lg animate-pulse">
          Loading blockchain data...
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-red-900/50 border border-red-500/50 rounded-xl p-6 text-center"
        >
          <AlertTriangle className="mx-auto text-red-400 h-10 w-10 mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
        </motion.div>
      )}

      {!isLoading && !error && guessData && currentBlock && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-xl"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${statusConfig.bgColor} border border-white/10`}
          >
            <div className={statusConfig.color}>{statusConfig.icon}</div>
            <span className={`font-bold text-lg ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Target Block</p>
              <p className="text-2xl font-bold text-white">
                {targetBlock.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Current Block</p>
              <p className="text-2xl font-bold text-teal-300">
                {currentBlock.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg mb-6 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <BarChart2 size={16} /> Block Progress
              </p>
              <p className="text-lg font-bold text-white">
                {blocksRemaining !== null
                  ? isMined
                    ? "Complete!"
                    : `${blocksRemaining.toLocaleString()} Blocks Remaining`
                  : "Calculating..."}
              </p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </div>

          {isMined && (
            <motion.button
              onClick={() => navigate(`/verify/${guessId}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Off-Chain Verification <ChevronRight />
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CheckValidity;
