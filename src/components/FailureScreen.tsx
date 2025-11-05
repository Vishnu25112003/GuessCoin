import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

interface FailureScreenProps {
  onComplete: () => void;
  actualHash: string;
  realBlockHash: string;
}

export const FailureScreen: React.FC<FailureScreenProps> = ({
  onComplete,
  actualHash,
  realBlockHash,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <XCircle className="w-20 h-20 text-red-500 mx-auto drop-shadow-lg" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mt-4 font-display">
          No Match Found
        </h1>
        <p className="text-lg text-gray-400 mt-2">Better luck next time!</p>

        <div className="mt-6 text-left text-xs font-mono max-w-2xl mx-auto space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg border border-red-500/30">
            <p className="text-red-400 font-semibold mb-1">YOUR HASH:</p>
            <p className="text-gray-300 break-all">{actualHash}</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-semibold mb-1">
              REAL BLOCK HASH:
            </p>
            <p className="text-gray-300 break-all">{realBlockHash}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
