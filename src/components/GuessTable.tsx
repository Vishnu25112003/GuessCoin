import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CyberButton } from "./cyberpunk";
import { Zap, Lock, Target, Gamepad2, Info } from "lucide-react";
import type { GuessEntry } from "../types";

interface Props {
  guesses: GuessEntry[];
  onEdit: (g: GuessEntry) => void;
  onVerify: (g: GuessEntry) => void;
  onValidity: (g: GuessEntry) => void;
}

export default function GuessTable({
  guesses,
  onEdit,
  onVerify,
  onValidity,
}: Props) {
  const [selectedGuess, setSelectedGuess] = useState<GuessEntry | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Always show 5 guess slots even if empty
  const displayGuesses = guesses.length > 0 ? guesses : Array.from({ length: 5 }, (_, i) => ({
    guessId: i + 1,
    targetBlockNumber: 0,
    userHashGuess: "",
    tokenSize: 0,
    paidGuess: false,
    targetVerified: 0,
    complex: false,
    actualHash: "",
    secretKey: "",
  }));

  const isVerified =
    selectedGuess && Number(selectedGuess.targetVerified) === 2;

  return (
    <div className="w-full space-y-8">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-cyber-primary cyber-text-glow mb-2">
          SELECT YOUR GUESS
        </h2>
        <p className="text-gray-400 font-mono text-sm">
          Click to select and view details
        </p>
      </div>

      {/* Main Layout - Guess List + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Guess Selection - Left */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            <h3 className="text-sm font-display font-bold text-cyber-primary uppercase tracking-wider mb-4">
              Your Guesses
            </h3>

            {/* Guess Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {displayGuesses.map((guess, index) => {
                const isSelected = selectedGuess?.guessId === guess.guessId;
                const guessVerified = Number(guess.targetVerified) === 2;

                return (
                  <motion.button
                    key={guess.guessId}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedGuess(guess);
                      setShowInfo(false);
                    }}
                    className={`relative overflow-hidden rounded-2xl p-4 transition-all group ${
                      isSelected
                        ? "bg-gradient-to-br from-cyber-primary to-cyan-500 shadow-[0_0_30px_rgba(0,243,255,0.6)]"
                        : "bg-gradient-to-br from-blue-600/30 to-purple-600/30 hover:from-blue-600/50 hover:to-purple-600/50 border-2 border-cyber-primary border-opacity-30 hover:border-opacity-60"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Background Glow */}
                    <motion.div
                      animate={
                        isSelected
                          ? { scale: [1, 1.2], opacity: [0.5, 0.2] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                    />

                    {/* Content */}
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        <span className="text-2xl font-display font-black">
                          #{guess.guessId}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`text-xs font-mono uppercase tracking-wider ${
                          guessVerified
                            ? "text-cyber-success"
                            : "text-cyber-accent"
                        }`}
                      >
                        {guessVerified ? "✓ Verified" : "⏳ Pending"}
                      </div>

                      {/* Quick Info */}
                      <div className="text-xs text-gray-300">
                        <p>Block: {guess.targetBlockNumber || "—"}</p>
                        <p>{guess.tokenSize} GC</p>
                      </div>
                    </div>

                    {/* Corner Accent */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-1 h-1 bg-cyber-primary rounded-full shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details Section - Right */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedGuess ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-primary to-cyan-500 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-display font-black text-white">
                      #{selectedGuess.guessId}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Selected Guess
                    </p>
                    <p
                      className={`text-xl font-display font-bold ${isVerified ? "text-cyber-success" : "text-cyber-accent"}`}
                    >
                      {isVerified ? "✓ VERIFIED" : "⏳ PENDING"}
                    </p>
                  </div>
                  {/* Info button */}
                  <button
                    type="button"
                    onClick={() => setShowInfo((v) => !v)}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-cyber-primary/40 text-cyber-primary hover:border-cyber-primary hover:bg-cyber-primary/10 transition"
                    title="Show hashes"
                  >
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline font-mono text-xs">info</span>
                  </button>
                </div>

                {/* Optional Hash Details (Actual/Secret/Dummy) */}
                {showInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-4 rounded-2xl border-2 border-cyber-primary/40 bg-gradient-to-br from-cyber-primary/10 to-cyan-500/10 backdrop-blur-sm"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Hashes</p>
                    <div className="space-y-3 font-mono break-all">
                      <div>
                        <span className="text-cyber-accent text-xs">Actual Hash</span>
                        <p className="text-sm">{selectedGuess.actualHash || "—"}</p>
                      </div>
                      <div>
                        <span className="text-cyber-secondary text-xs">Secret Key</span>
                        <p className="text-sm">{selectedGuess.secretKey || "—"}</p>
                      </div>
                      <div>
                        <span className="text-cyber-success text-xs">Dummy Hash</span>
                        <p className="text-sm">{selectedGuess.userHashGuess || "—"}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-cyber-primary border-opacity-40"
                  >
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Target Block
                    </p>
                    <p className="text-2xl font-display font-bold text-cyber-primary cyber-text-glow">
                      {selectedGuess.targetBlockNumber || "—"}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-cyber-secondary border-opacity-40"
                  >
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Token Size
                    </p>
                    <p className="text-2xl font-display font-bold text-cyber-secondary">
                      {selectedGuess.tokenSize} GC
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`backdrop-blur-sm p-4 rounded-2xl border-2 border-opacity-40 bg-gradient-to-br ${
                      selectedGuess.paidGuess
                        ? "from-green-500/10 to-emerald-500/10 border-cyber-success"
                        : "from-red-500/10 to-rose-500/10 border-cyber-danger"
                    }`}
                  >
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Payment
                    </p>
                    <p
                      className={`text-2xl font-display font-bold ${selectedGuess.paidGuess ? "text-cyber-success" : "text-cyber-danger"}`}
                    >
                      {selectedGuess.paidGuess ? "✓ PAID" : "✗ UNPAID"}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm p-4 rounded-2xl border-2 border-cyber-accent border-opacity-40"
                  >
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      Complexity
                    </p>
                    <p
                      className={`text-2xl font-display font-bold ${selectedGuess.complex ? "text-cyber-accent" : "text-blue-400"}`}
                    >
                      {selectedGuess.complex ? "COMPLEX" : "SIMPLE"}
                    </p>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                    Quick Actions
                  </p>

                  <div className="flex flex-col gap-3">
                    <CyberButton
                      variant="primary"
                      size="lg"
                      onClick={() => onEdit(selectedGuess)}
                      icon={<Zap className="w-4 h-4" />}
                      className="w-full rounded-xl h-12"
                    >
                      New Guess
                    </CyberButton>

                    {!isVerified && (
                      <CyberButton
                        variant="success"
                        size="lg"
                        onClick={() => onVerify(selectedGuess)}
                        icon={<Lock className="w-4 h-4" />}
                        className="w-full rounded-xl h-12"
                      >
                        Verify
                      </CyberButton>
                    )}

                    <CyberButton
                      variant="info"
                      size="lg"
                      onClick={() => onValidity(selectedGuess)}
                      icon={<Target className="w-4 h-4" />}
                      className="w-full rounded-xl h-12"
                    >
                      Check
                    </CyberButton>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5 backdrop-blur-sm border-2 border-cyber-primary border-opacity-20 min-h-96"
              >
                <p className="text-gray-400 font-mono text-sm">
                  Select a guess to view details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
