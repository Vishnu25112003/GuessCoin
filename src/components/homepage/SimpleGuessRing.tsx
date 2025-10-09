import React from "react";
import { motion } from "framer-motion";
import type { GuessData } from "../../types/types";

interface HashDetails {
  actualHash: string;
  secretKey: string;
  dummyHash: string;
  targetBlockNumber: number;
  tokenSizes: number;
  paidGuess: boolean;
  complex: boolean;
}

interface ActionButton {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  action: ((id: number) => void) | undefined;
  description: string;
}

interface CircularGuessRingUIProps {
  guesses: GuessData[];
  selectedGuess: GuessData | null;
  activeGuessId: number | null;
  clockwiseAngle: number;
  isExpanded: boolean;
  hashDetails: HashDetails | null;
  loading: boolean;
  isMobile: boolean;
  orbitRadius: number;
  numberSize: number;
  bigCirclePosition: { x: number; y: number };
  actionButtons: ActionButton[];
  isSelectedGuessPlaced: boolean; // NEW PROP
  onNumberClick: (guess: GuessData) => void;
  onActionClick: (
    action: ((id: number) => void) | undefined,
    guessId: number,
  ) => void;
  onCenterClick: () => void;
  onCloseActions: () => void;
  onBackFromDetails: () => void;
}

const pentagonPositions = [
  { angle: -90, size: 60 },
  { angle: -18, size: 60 },
  { angle: 54, size: 60 },
  { angle: 126, size: 60 },
  { angle: 198, size: 60 },
];

const CircularGuessRingUI: React.FC<CircularGuessRingUIProps> = ({
  guesses,
  selectedGuess,
  activeGuessId,
  clockwiseAngle,
  isExpanded,
  hashDetails,
  loading,
  isMobile,
  orbitRadius,
  numberSize,
  bigCirclePosition,
  actionButtons,
  isSelectedGuessPlaced, // NEW PROP
  onNumberClick,
  onActionClick,
  onCenterClick,
  onCloseActions,
  onBackFromDetails,
}) => {
  return (
    <>
      <style>{`
        /* --- GLOBAL GAME-THEME STYLES --- */
        .number-ball {
          background: linear-gradient(135deg, #1d4ed8 0%, #4c1d95 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 1.2em;
          box-shadow: 0 4px 15px rgba(29, 78, 216, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          font-family: 'Space Mono', monospace;
        }

        .number-ball:hover {
          box-shadow: 0 6px 20px rgba(29, 78, 216, 0.6);
          transform: scale(1.05);
        }

        .number-ball.empty {
          background: transparent;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          box-shadow: none;
          cursor: default;
        }

        .number-ball.empty:hover {
          transform: scale(1);
          box-shadow: none;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .number-ball.active {
          background: linear-gradient(135deg, #a78bfa 0%, #e879f9 100%);
          box-shadow: 0 6px 20px rgba(167, 139, 250, 0.6);
          animation: pulse-glow 1.5s infinite;
        }

        .copy-button {
          padding: 4px 8px;
          font-size: 0.75rem;
          transition: all 0.2s ease;
          border: 1px solid;
          border-image-slice: 1;
          border-image-source: linear-gradient(to right, #4ade80, #16a34a);
          background: #1f2937;
        }

        .copy-button:hover {
          transform: scale(1.05);
          background: #252e3d;
        }

        .panel-bg {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid #374151;
          box-shadow: 0 0 25px rgba(0,0,0,0.5);
        }

        .glow-button {
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          transition: all 0.3s ease-in-out;
        }

        .glow-button:hover {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.6);
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.8), 0 0 25px rgba(167, 139, 250, 0.6); }
          50% { box-shadow: 0 0 30px rgba(167, 139, 250, 1), 0 0 40px rgba(167, 139, 250, 0.8); }
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden font-mono text-white">
        {activeGuessId !== null && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-lg px-4"
          >
            <div className="panel-bg rounded-2xl p-4 border-2 border-purple-500/30">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-white mb-1">
                  GUESS #<span className="text-green-400">{activeGuessId}</span>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-purple-400">STATUS:</span> ACTIVE
                </div>
              </div>

              <div
                className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}
              >
                {actionButtons.map((button) => (
                  <motion.button
                    key={button.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeGuessId) {
                        onActionClick(button.action, activeGuessId);
                      }
                    }}
                    className={`flex items-center justify-center p-3 rounded-lg bg-gradient-to-r ${button.bgColor} hover:shadow-lg transition-all duration-200 text-sm font-medium text-white ${
                      isMobile ? "min-h-[44px]" : "min-h-[48px]"
                    } border-2 border-white/20`}
                  >
                    <span className="mr-2">{button.icon}</span>
                    {button.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="fixed inset-0 overflow-hidden">
          {[1, 2, 3, 4, 5].map((numberId, index) => {
            const guess = guesses.find((g) => g.id === numberId);

            const position = pentagonPositions[index];
            const currentAngle = position.angle + clockwiseAngle;
            const rad = (currentAngle * Math.PI) / 180;
            const x = bigCirclePosition.x + orbitRadius * Math.cos(rad);
            const y = bigCirclePosition.y + orbitRadius * Math.sin(rad);

            const isSelected = selectedGuess?.id === numberId;
            const isActive = activeGuessId === numberId;

            return (
              <motion.div
                key={numberId}
                onClick={() => guess && onNumberClick(guess)}
                className={`fixed number-ball ${isActive ? "active" : ""} ${!guess ? "empty" : ""}`}
                style={{
                  left: x - numberSize / 2,
                  top: y - numberSize / 2,
                  width: numberSize,
                  height: numberSize,
                  transform: `rotate(${-clockwiseAngle}deg)`,
                  zIndex: isSelected ? 25 : isActive ? 30 : 20,
                  pointerEvents: guess ? "auto" : "none",
                  display: "block",
                }}
                whileHover={guess ? { scale: 1.1 } : {}}
                whileTap={guess ? { scale: 0.95 } : {}}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {guess && numberId}
                </div>
              </motion.div>
            );
          })}

          <motion.div
            onClick={onCenterClick}
            className="fixed bg-gradient-to-br from-purple-700 to-indigo-800 rounded-full cursor-pointer flex flex-col items-center justify-center text-white font-bold shadow-2xl border-4 border-white/20 hover:border-white/40 transition-all duration-300"
            style={{
              left: bigCirclePosition.x - 80,
              top: bigCirclePosition.y - 80,
              width: 160,
              height: 160,
              zIndex: 15,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: isExpanded
                ? "0 0 30px rgba(139, 92, 246, 0.8)"
                : "0 0 20px rgba(139, 92, 246, 0.4)",
            }}
          >
            <div className="text-xs opacity-80 mb-1">ACTIVE GUESS</div>
            <div className="text-xl mb-1 text-teal-400">
              #{selectedGuess?.id ?? 1}
            </div>
            <div className="text-xs text-center px-2">
              {loading ? "Loading..." : isExpanded ? "CLOSE" : "VIEW DETAILS"}
            </div>
            {/* UPDATED: Only show "UNVERIFIED" if the selected guess has data in storage */}
            {selectedGuess && isSelectedGuessPlaced && (
              <div className="text-xs text-yellow-400 mt-1">UNVERIFIED</div>
            )}
          </motion.div>
        </div>

        {isExpanded && hashDetails && (
          <motion.div
            initial={{
              opacity: 0,
              x: isMobile ? 0 : 300,
              y: isMobile ? 300 : 0,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isMobile ? 0 : 300, y: isMobile ? 300 : 0 }}
            className={`fixed panel-bg rounded-2xl p-6 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto ${
              isMobile
                ? "bottom-4 left-4 right-4 top-20"
                : "top-20 right-4 w-96 max-h-[calc(100vh-6rem)]"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <motion.button
                onClick={onBackFromDetails}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm border border-gray-500/50"
              >
                <span>←</span>
                Back
              </motion.button>

              <h2 className="text-lg font-bold text-teal-300 text-center flex-1">
                HASH DETAILS
              </h2>
            </div>

            <div className="text-sm text-gray-400 mb-6 font-sans">
              Blockchain hash information and verification data
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4 border-2 border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-300">
                    Actual Hash
                  </span>
                </div>
                <div className="text-xs text-gray-300 break-all">
                  {hashDetails.actualHash}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border-2 border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-300">
                    Secret Key
                  </span>
                </div>
                <div className="text-xs text-gray-300 break-all">
                  {hashDetails.secretKey}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border-2 border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-300">
                    Dummy Hash
                  </span>
                </div>
                <div className="text-xs text-gray-300 break-all">
                  {hashDetails.dummyHash}
                </div>
              </div>

              <div
                className={`grid gap-3 ${isMobile ? "grid-cols-2" : "grid-cols-2"}`}
              >
                <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
                  <div className="text-xs text-gray-400">Target Block</div>
                  <div className="text-sm text-white">
                    {hashDetails.targetBlockNumber}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
                  <div className="text-xs text-gray-400">Token Sizes</div>
                  <div className="text-sm text-white">
                    {hashDetails.tokenSizes}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
                  <div className="text-xs text-gray-400">Paid Guess</div>
                  <div className="text-sm text-white">
                    {hashDetails.paidGuess ? "TRUE" : "FALSE"}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50">
                  <div className="text-xs text-gray-400">Complex</div>
                  <div className="text-sm text-white">
                    {hashDetails.complex ? "TRUE" : "FALSE"}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeGuessId !== null && !isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseActions}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </div>
    </>
  );
};

export default CircularGuessRingUI;
