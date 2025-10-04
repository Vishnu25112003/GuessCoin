import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { GuessData } from "../../types/types";

interface CircularGuessRingProps {
  guesses: GuessData[];
  selectedGuess: GuessData | null;
  onSelectGuess: (guess: GuessData) => void;
  onNewGuess?: (guessId: number) => void;
  onVerify?: (guessId: number) => void;
  onCheckValidity?: (guessId: number) => void;
}

interface HashDetails {
  actualHash: string;
  secretKey: string;
  dummyHash: string;
  targetBlockNumber: number;
  tokenSizes: number;
  paidGuess: boolean;
  complex: boolean;
}

const CircularGuessRing: React.FC<CircularGuessRingProps> = ({
  guesses,
  selectedGuess,
  onSelectGuess,
  onNewGuess,
  onVerify,
  onCheckValidity,
}) => {
  useAuth();
  const navigate = useNavigate();
  const [activeGuessId, setActiveGuessId] = useState<number | null>(null);
  const [clockwiseAngle, setClockwiseAngle] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hashDetails, setHashDetails] = useState<HashDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRotationPaused, setIsRotationPaused] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Clockwise rotation for numbers (only when not paused)
  useEffect(() => {
    if (isRotationPaused) return;
    const interval = setInterval(() => {
      setClockwiseAngle((prev) => (prev + 0.6) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isRotationPaused]);

  // Responsive orbit configuration
  const getOrbitRadius = () => {
    if (isMobile) {
      return Math.min(window.innerWidth, window.innerHeight) * 0.22;
    }
    return 200;
  };

  const getNumberSize = () => {
    return isMobile ? 50 : 60;
  };

  const orbitRadius = getOrbitRadius();
  const numberSize = getNumberSize();

  const pentagonPositions = [
    { angle: -90, size: numberSize }, // Top
    { angle: -18, size: numberSize }, // Top-right
    { angle: 54, size: numberSize }, // Bottom-right
    { angle: 126, size: numberSize }, // Bottom-left
    { angle: 198, size: numberSize }, // Top-left
  ];

  const handleNewGuessClick = (guessId: number) => {
    navigate(`/guess/${guessId}`);
    if (onNewGuess) {
      onNewGuess(guessId);
    }
  };

  const actionButtons = [
    {
      label: "New Guess",
      color: "#3b82f6",
      bgColor: "from-blue-500 to-blue-600",
      icon: "➕",
      action: handleNewGuessClick,
      description: "Create new guess",
    },
    {
      label: "Verify",
      color: "#10b981",
      bgColor: "from-green-500 to-green-600",
      icon: "✓",
      action: onVerify,
      description: "Verify guess",
    },
    {
      label: "Check Validity",
      color: "#f59e0b",
      bgColor: "from-yellow-500 to-yellow-600",
      icon: "🔍",
      action: onCheckValidity,
      description: "Check validity",
    },
  ];

  const sampleHashDetails: HashDetails = {
    actualHash:
      "0xc5d24601867233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    secretKey:
      "0x10ca3eff73ebec87d2394fc58560afeab86dac7a21f5e402ea0a55e5c8a6758f",
    dummyHash:
      "0xe2475c80a56daf75c6d704deadb730719601c8b664144c0e4aea8574a8cf59f2",
    targetBlockNumber: 26912749,
    tokenSizes: 3,
    paidGuess: false,
    complex: true,
  };

  const handleNumberClick = (guess: GuessData) => {
    if (!isExpanded) {
      onSelectGuess(guess);
      setActiveGuessId((curr) => (curr === guess.id ? null : guess.id));
      setIsRotationPaused(true);
    }
  };

  const handleActionClick = (
    action: ((id: number) => void) | undefined,
    guessId: number,
  ) => {
    action?.(guessId);
    setActiveGuessId(null);
    setIsRotationPaused(false);
  };

  const handleCenterClick = async () => {
    if (!isExpanded) {
      setLoading(true);
      setTimeout(() => {
        setHashDetails(sampleHashDetails);
        setLoading(false);
        setIsExpanded(true);
        setActiveGuessId(null);
        setIsRotationPaused(false);
      }, 500);
    } else {
      setIsExpanded(false);
      setHashDetails(null);
    }
  };

  const handleCloseActions = () => {
    setActiveGuessId(null);
    setIsRotationPaused(false);
  };

  const handleBackFromDetails = () => {
    setIsExpanded(false);
    setHashDetails(null);
    setIsRotationPaused(false);
  };

  const handleHashDetailsAction = () => {
    console.log("Hash Details Action clicked for guess:", selectedGuess?.id);
    alert(`Processing hash details for Guess #${selectedGuess?.id}`);
  };

  const getBigCirclePosition = () => {
    const navbarHeight = 64;
    const centerY = window.innerHeight / 2;

    if (isExpanded) {
      if (isMobile) {
        return {
          x: window.innerWidth / 2,
          y: centerY,
        };
      } else {
        return {
          x: window.innerWidth * 0.15,
          y: centerY,
        };
      }
    }
    return {
      x: window.innerWidth / 2,
      y: centerY,
    };
  };

  const bigCirclePosition = getBigCirclePosition();

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
                      handleActionClick(button.action, activeGuessId);
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
            const guess = guesses.find((g) => g.id === numberId) || {
              id: numberId,
              status: "pending" as const,
              hash: "",
              timestamp: Date.now(),
            };

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
                onClick={() => handleNumberClick(guess)}
                className={`fixed number-ball cursor-pointer ${isActive ? "active" : ""}`}
                style={{
                  left: x - position.size / 2,
                  top: y - position.size / 2,
                  width: position.size,
                  height: position.size,
                  transform: `rotate(${-clockwiseAngle}deg)`,
                  zIndex: isSelected ? 25 : isActive ? 30 : 20,
                  pointerEvents: "auto",
                  display: "block !important",
                  opacity: "1 !important",
                  visibility: "visible !important",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {numberId}
                  {guess.status === "verified" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          <motion.div
            onClick={handleCenterClick}
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
            {selectedGuess?.status === "verified" && (
              <div className="text-xs text-green-300 mt-1">✓ VERIFIED</div>
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
                onClick={handleBackFromDetails}
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

              <motion.button
                onClick={handleBackFromDetails}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
              >
                ×
              </motion.button>
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
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(hashDetails.actualHash)
                    }
                    className="copy-button text-blue-400"
                  >
                    Copy
                  </button>
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
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(hashDetails.secretKey)
                    }
                    className="copy-button text-green-400"
                  >
                    Copy
                  </button>
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
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(hashDetails.dummyHash)
                    }
                    className="copy-button text-yellow-400"
                  >
                    Copy
                  </button>
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
            onClick={handleCloseActions}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </div>
    </>
  );
};

export default CircularGuessRing;
