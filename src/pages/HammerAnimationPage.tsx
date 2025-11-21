import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { RealisticHammer } from "../components/RealisticHammer";
import { TreasureBox } from "../components/TreasureBox";
import { HexGrid, Scanlines, CyberButton, CyberModal } from "../components/cyberpunk";
import { useCyberModal } from "../hooks/useCyberModal";
import type { GuessEntry, MatchToken } from "../types";

interface AnimationState {
  hammerIndex: number;
  treasureIndex: number;
  isFlying: boolean;
  isBreaking: boolean;
}

export default function HammerAnimationPage() {
  const navigate = useNavigate();
  const modal = useCyberModal();

  // States
  const [guess, setGuess] = useState<GuessEntry | null>(null);
  const [matches, setMatches] = useState<MatchToken[]>([]);
  const [blockHash, setBlockHash] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [splitHashes, setSplitHashes] = useState<string[]>([]);
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );
  const [completedMatches, setCompletedMatches] = useState<Set<number>>(
    new Set(),
  );
  const [isComplete, setIsComplete] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const storedGuess = localStorage.getItem("singleGuess");
    const storedMatches =
      localStorage.getItem("selectedMatches") ||
      localStorage.getItem("matches");
    const storedBlockHash = localStorage.getItem("block-hash-generated");

    if (storedGuess) setGuess(JSON.parse(storedGuess));
    if (storedMatches) setMatches(JSON.parse(storedMatches));
    if (storedBlockHash) setBlockHash(storedBlockHash);
  }, []);

  // Split hash based on token size
  useEffect(() => {
    if (!guess || !blockHash) return;

    const tokenSize = guess.tokenSize || 3;
    const cleanHash = blockHash.replace("0x", "");
    const splits: string[] = [];

    for (let i = 0; i <= cleanHash.length - tokenSize; i++) {
      splits.push(cleanHash.slice(i, i + tokenSize));
    }

    setSplitHashes(splits);
  }, [guess, blockHash]);

  // Sequential hammer animation with treasure box interaction
  useEffect(() => {
    if (splitHashes.length === 0 || isComplete) return;

    const handleAnimationStep = async () => {
      if (currentStep < splitHashes.length) {
        const currentToken = splitHashes[currentStep];
        const matchingTreasuryIndex = matches.findIndex(
          (m) => m.token === currentToken,
        );

        if (matchingTreasuryIndex >= 0) {
          // Hammer has a matching treasure box - trigger flight animation
          setAnimationState({
            hammerIndex: currentStep,
            treasureIndex: matchingTreasuryIndex,
            isFlying: true,
            isBreaking: false,
          });

          // Wait for flight animation to complete
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Trigger break animation
          setAnimationState((prev) =>
            prev ? { ...prev, isFlying: false, isBreaking: true } : null,
          );

          // Wait for break animation
          await new Promise((resolve) => setTimeout(resolve, 1200));

          // Mark as completed
          setCompletedMatches(
            (prev) => new Set([...prev, matchingTreasuryIndex]),
          );
        } else {
          // No match - simple hammer strike animation
          setAnimationState({
            hammerIndex: currentStep,
            treasureIndex: -1,
            isFlying: false,
            isBreaking: false,
          });

          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        setCurrentStep(currentStep + 1);
      } else {
        // All animations complete
        setIsComplete(true);
        setAnimationState(null);

        // Navigate after 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate("/on-chain");
      }
    };

    handleAnimationStep();
  }, [currentStep, splitHashes, matches, navigate, isComplete]);

  function skipAnimation() {
    setIsComplete(true);
    navigate("/on-chain");
  }

  if (!guess || !blockHash) {
    return (
      <div className="min-h-screen relative bg-cyber-darker">
        <HexGrid />
        <Scanlines />
        <Header
          trail={[{ label: "Loading..." }]}
          onLogout={() => {
            localStorage.clear();
            window.location.href = "/session";
          }}
        />
        <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <p className="text-gray-200 font-mono">Loading verification...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-cyber-darker overflow-hidden">
      <HexGrid />
      <Scanlines />
      <Header
        trail={[
          { label: "Matches", to: "/matches" },
          { label: "Hammer Animation" },
        ]}
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/session";
        }}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold text-cyan-300 mb-2 cyber-text-glow">
            ⚡ HASH VERIFICATION SEQUENCE ⚡
          </h1>
          <p className="text-gray-200 font-mono mb-6">
            Splitting & Verifying Hash Tokens
          </p>

          {/* Statistics */}
          <div className="flex justify-center gap-8 mt-6 flex-wrap">
            <div className="bg-gray-900/40 border border-cyan-500/30 rounded px-4 py-2">
              <p className="text-xs text-gray-300">Token Size</p>
              <p className="font-mono text-lg font-bold text-cyan-300">
                {guess.tokenSize} bytes
              </p>
            </div>
            <div className="bg-gray-900/40 border border-purple-500/30 rounded px-4 py-2">
              <p className="text-xs text-gray-300">Total Splits</p>
              <p className="font-mono text-lg font-bold text-purple-300">
                {splitHashes.length}
              </p>
            </div>
            <div className="bg-gray-900/40 border border-green-500/30 rounded px-4 py-2">
              <p className="text-xs text-gray-300">Matches Found</p>
              <p className="font-mono text-lg font-bold text-green-300">
                {matches.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Animation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
          {/* LEFT: PREDICTION HAMMERS */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-cyan-300 mb-3">
                🔨 PREDICTION HAMMERS
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              <p className="text-xs text-gray-300 mt-2">
                Each hammer strikes a token verification
              </p>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <AnimatePresence>
                {splitHashes.map((token, index) => {
                  const isCurrentlyAnimating = index === currentStep - 1;
                  const hasAnimated = index < currentStep;
                  const matchFound = matches.some((m) => m.token === token);
                  const isFlying =
                    animationState?.hammerIndex === index &&
                    animationState?.isFlying;

                  return (
                    <motion.div
                      key={`hammer-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <RealisticHammer
                        index={index}
                        token={token}
                        shouldAnimate={isCurrentlyAnimating}
                        isMatched={hasAnimated ? matchFound : undefined}
                        isMismatch={hasAnimated ? !matchFound : undefined}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: TREASURY BOXES */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-purple-300 mb-3">
                💎 TREASURY BLOCKS
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <p className="text-xs text-gray-300 mt-2">
                Matched tokens unlock treasure
              </p>
            </motion.div>

            {matches.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative">
                <AnimatePresence>
                  {matches.map((match, index) => {
                    const isBeingHit =
                      animationState?.treasureIndex === index &&
                      animationState?.isFlying;
                    const isBreaking =
                      animationState?.treasureIndex === index &&
                      animationState?.isBreaking;
                    const isCompleted = completedMatches.has(index);

                    return (
                      <motion.div
                        key={`treasure-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {/* Treasure Box */}
                        <TreasureBox
                          hash={match.token}
                          isLocked={false}
                          animate={!isCompleted}
                          index={index}
                          label={`Match #${index + 1}`}
                          shouldBreak={isBreaking}
                          isMatched={true}
                        />

                        {/* Hammer Flight Path (animated when flying) */}
                        {isBeingHit && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="absolute w-8 h-10 bg-gradient-to-b from-amber-600 to-amber-700 rounded shadow-lg"
                              initial={{
                                left: "0%",
                                top: "-50px",
                                rotate: 0,
                              }}
                              animate={{
                                left: "50%",
                                top: "50%",
                                rotate: 360,
                              }}
                              transition={{
                                duration: 1.2,
                                ease: "easeInOut",
                              }}
                              style={{
                                boxShadow: "0 0 20px rgba(255, 193, 7, 0.8)",
                              }}
                            />

                            {/* Particle trail */}
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-300 rounded-full blur-sm"
                                initial={{
                                  left: "0%",
                                  top: "-50px",
                                  opacity: 1,
                                }}
                                animate={{
                                  left: "50%",
                                  top: "50%",
                                  opacity: 0,
                                }}
                                transition={{
                                  duration: 1.2,
                                  delay: i * 0.1,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </motion.div>
                        )}

                        {/* Impact glow when hammer hits */}
                        {isBreaking && (
                          <motion.div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            initial={{ opacity: 1 }}
                            animate={{
                              opacity: [1, 0.5, 0],
                            }}
                            transition={{ duration: 0.8 }}
                            style={{
                              boxShadow:
                                "inset 0 0 40px rgba(255, 193, 7, 0.8)",
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-gray-900/40 border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-300 font-mono">
                  No matches found in verification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-6">
            <div className="flex justify-between text-sm text-gray-300 mb-3 font-mono">
              <span>Verification Progress</span>
              <span>
                {currentStep} / {splitHashes.length} tokens checked
              </span>
            </div>
            <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-cyan-500/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStep / splitHashes.length) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
                className="absolute h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-lg shadow-cyan-500/50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white drop-shadow-lg">
                  {Math.round((currentStep / splitHashes.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          {currentStep < splitHashes.length && !isComplete && (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gray-300 font-mono"
            >
              ⚡ Processing token {currentStep + 1} of {splitHashes.length}...
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              initial={{}}
              animate={{}}
              className="text-green-300 font-mono text-lg font-semibold"
            >
              ✓ Verification complete! Redirecting...
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Skip Animation Button */}
      {guess && blockHash && (
        <div className="fixed bottom-4 right-4 z-50">
          <CyberButton onClick={skipAnimation} variant="primary">
            Skip Animation
          </CyberButton>
        </div>
      )}
      <CyberModal {...modal.props} />
    </div>
  );
}
