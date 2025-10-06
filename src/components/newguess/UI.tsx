import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  RefreshCw,
  Send,
  RotateCcw,
  Info,
  AlertTriangle,
  DollarSign,
  Zap,
  X,
  Check,
  Sparkles,
  Star,
  ArrowLeft,
} from "lucide-react";

interface GuessUIProps {
  // State props
  guessId: number;
  paidGuess: boolean;
  overwrite: boolean;
  complex: boolean;
  blockIncrement: number;
  actualHash: string;
  secretHash: string;
  dummyHash: string;
  tokenSize: number;
  tokens: string[];
  isGeneratingActual: boolean;
  isGeneratingSecret: boolean;
  isSubmitting: boolean;
  isFormReadonly: boolean;

  // Event handlers
  onPaidGuessChange: (value: boolean) => void;
  onOverwriteChange: (value: boolean) => void;
  onComplexChange: (value: boolean) => void;
  onBlockIncrementChange: (value: number) => void;
  onActualHashChange: (value: string) => void;
  onSecretHashChange: (value: string) => void;
  onTokenSizeChange: (value: number) => void;
  onGenerateActualHash: () => void;
  onGenerateSecretHash: () => void;
  onSubmit: () => void;
  onClear: () => void;
  onBack: () => void;
}

const RealisticHammer: React.FC<{
  onClick?: () => void;
  token: string;
  index: number;
}> = ({ onClick, token, index }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showCopiedEffect, setShowCopiedEffect] = useState(false);
  const [isPowered, setIsPowered] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setIsPowered(true);
    setShowCopiedEffect(true);
    onClick?.();

    setTimeout(() => setIsClicked(false), 300);
    setTimeout(() => setIsPowered(false), 800);
    setTimeout(() => setShowCopiedEffect(false), 1500);
  };

  return (
    <div className="relative">
      <motion.div
        className="relative w-16 h-20 cursor-pointer group"
        initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateY: 0,
        }}
        transition={{
          delay: index * 0.08,
          duration: 0.8,
          type: "spring",
          stiffness: 120,
        }}
        whileHover={{
          scale: 1.2,
          rotate: [0, -8, 8, -4, 0],
          transition: { duration: 0.4 },
        }}
        whileTap={{ scale: 0.85 }}
        onClick={handleClick}
        title={`Copy token: ${token}`}
      >
        {/* Realistic Wooden Handle */}
        <motion.div
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-14 rounded-full shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #D2691E 0%, #CD853F 20%, #8B4513 50%, #654321 80%, #2F1B14 100%)",
            boxShadow:
              "inset -2px -2px 4px rgba(139, 69, 19, 0.8), inset 2px 2px 4px rgba(210, 180, 140, 0.6), 0 4px 12px rgba(0,0,0,0.6)",
          }}
          animate={{
            rotateZ: isClicked ? [0, -15, 15, 0] : 0,
            y: isClicked ? [0, -3, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 space-y-1 pt-2 px-1">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-full h-0.5 opacity-40 rounded-full"
                style={{
                  background: i % 3 === 0 ? "#8B4513" : "#654321",
                  marginTop: i * 1.2,
                }}
              />
            ))}
          </div>

          <div className="absolute top-8 inset-x-0 h-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-x-0 h-1 opacity-30"
                style={{
                  background:
                    "radial-gradient(ellipse, #654321 0%, transparent 70%)",
                  top: i * 1.5,
                }}
              />
            ))}
          </div>

          <div
            className="absolute bottom-0 inset-x-0 h-3 rounded-full"
            style={{
              background:
                "linear-gradient(145deg, #C0C0C0 0%, #808080 50%, #404040 100%)",
              boxShadow:
                "inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          />
        </motion.div>

        {/* Realistic Steel Hammer Head */}
        <motion.div
          className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-7 rounded-lg shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #F8F8FF 0%, #E6E6FA 15%, #C0C0C0 30%, #A9A9A9 50%, #808080 70%, #696969 85%, #2F2F2F 100%)",
            boxShadow:
              "inset -2px -2px 6px rgba(105, 105, 105, 0.8), inset 2px 2px 6px rgba(248, 248, 255, 0.8), 0 6px 16px rgba(0,0,0,0.7)",
          }}
          animate={{
            rotateZ: isClicked ? [0, -20, 20, 0] : 0,
            y: isClicked ? [0, -4, 2, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute top-1 left-1 right-1 h-2 rounded-t opacity-60"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.7) 70%, transparent 100%)",
            }}
            animate={{
              x: [-15, 15, -15],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div
            className="absolute inset-1 rounded border opacity-40"
            style={{ borderColor: "#696969" }}
          />

          <div className="absolute top-2 left-2 w-6 h-1 bg-gray-600 opacity-30 rounded-full transform -rotate-12" />
          <div className="absolute bottom-2 right-2 w-4 h-0.5 bg-gray-700 opacity-40 rounded-full transform rotate-45" />
          <div className="absolute top-3 right-1 w-2 h-2 bg-gray-600 opacity-20 rounded-full" />

          <div
            className="absolute -right-2 top-1 w-3 h-5 rounded-r-lg"
            style={{
              background:
                "linear-gradient(90deg, #A9A9A9 0%, #808080 50%, #505050 100%)",
              boxShadow:
                "inset 0 1px 3px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
            }}
          >
            <div className="absolute top-1 bottom-1 left-1/2 w-0.5 bg-gray-700 opacity-60" />
          </div>
        </motion.div>

        {/* POWERED MODE: Magical Energy Effects */}
        <AnimatePresence>
          {isPowered && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`lightning-${i}`}
                  className="absolute w-1 h-8 bg-gradient-to-t from-blue-500 via-purple-400 to-white rounded-full"
                  style={{
                    left: "50%",
                    top: "20%",
                    transformOrigin: "bottom center",
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.2,
                    rotate: i * 45,
                  }}
                  animate={{
                    opacity: [0, 1, 0.7, 0],
                    scale: [0.2, 1.5, 1, 0],
                    rotate: i * 45,
                    x: Math.cos((i * 45 * Math.PI) / 180) * 20,
                    y: Math.sin((i * 45 * Math.PI) / 180) * 20,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.05,
                  }}
                />
              ))}

              <motion.div
                className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, #FFD700 0%, #FFA500 30%, #FF69B4 60%, #8A2BE2 100%)",
                  boxShadow:
                    "0 0 20px #FFD700, 0 0 40px #FF69B4, 0 0 60px #8A2BE2",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 1, 1.2, 1],
                  opacity: [0, 1, 0.8, 1, 0],
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.8 }}
              />

              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-purple-400 rounded-full"
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{
                  width: 120,
                  height: 120,
                  opacity: 0,
                  borderWidth: [4, 2, 0],
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Enhanced Strike Spark Effects */}
        <AnimatePresence>
          {isClicked && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background:
                      i % 2 === 0
                        ? "radial-gradient(circle, #FFD700 0%, #FFA500 70%, transparent 100%)"
                        : "radial-gradient(circle, #FF6347 0%, #FF4500 70%, transparent 100%)",
                  }}
                  initial={{
                    opacity: 1,
                    scale: 0.3,
                    x: 32,
                    y: 20,
                  }}
                  animate={{
                    opacity: [1, 0.9, 0.5, 0],
                    scale: [0.3, 1.5, 1.2, 0],
                    x:
                      32 +
                      Math.cos((i * 30 * Math.PI) / 180) *
                        (20 + Math.random() * 15),
                    y:
                      20 +
                      Math.sin((i * 30 * Math.PI) / 180) *
                        (20 + Math.random() * 15),
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    delay: i * 0.03,
                  }}
                />
              ))}

              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`ember-${i}`}
                  className="absolute w-1 h-1 bg-orange-400 rounded-full"
                  initial={{
                    opacity: 1,
                    x: 32 + Math.random() * 10,
                    y: 20 + Math.random() * 10,
                  }}
                  animate={{
                    opacity: [1, 0.7, 0],
                    y: 20 + Math.random() * 10 - 30,
                    x: 32 + Math.random() * 20 - 10,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.1 + i * 0.1,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Floating Magical Aura */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
          }}
        >
          <Star className="w-4 h-4 text-yellow-300 opacity-70" />
        </motion.div>

        {/* Power Indicator Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-full opacity-0 group-hover:opacity-80 group-hover:border-purple-400"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity },
            rotate: { duration: 6, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Enhanced Hover Glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-30 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Magical Particles Floating Around */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-60"
            style={{
              left: `${30 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1.3, 0.8],
              y: [0, -8, 0],
              x: [0, 4, -4, 0],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: index * 0.2 + i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Copy Success Effect */}
      <AnimatePresence>
        {showCopiedEffect && (
          <motion.div
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl border border-green-400">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
              Token Copied!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power Status Indicator */}
      <motion.div
        className="absolute -top-3 -right-3 text-yellow-400"
        animate={{
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: index * 0.3,
        }}
      >
        <Sparkles className="w-3 h-3" />
      </motion.div>
    </div>
  );
};

// Toggle with hover tooltip
const ToggleWithTooltip: React.FC<{
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  color: "emerald" | "amber" | "rose";
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}> = ({
  label,
  checked,
  onChange,
  color,
  description,
  icon,
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    emerald: {
      bg: checked ? "bg-emerald-600" : "bg-gray-600",
      translate: checked ? "translate-x-6" : "translate-x-0",
      border: "border-emerald-500",
      glow: "shadow-emerald-500/50",
    },
    amber: {
      bg: checked ? "bg-amber-600" : "bg-gray-600",
      translate: checked ? "translate-x-6" : "translate-x-0",
      border: "border-amber-500",
      glow: "shadow-amber-500/50",
    },
    rose: {
      bg: checked ? "bg-rose-600" : "bg-gray-600",
      translate: checked ? "translate-x-6" : "translate-x-0",
      border: "border-rose-500",
      glow: "shadow-rose-500/50",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="relative font-sans">
      <motion.div
        className={`p-4 rounded-xl border-2 ${colors.border} bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 ${
          disabled ? "opacity-50" : ""
        } ${checked ? `shadow-lg ${colors.glow}` : ""}`}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-2xl"
              animate={{ rotate: checked ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
            <span className="text-white font-semibold">{label}</span>
          </div>
          <motion.button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${colors.bg} ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
          >
            <motion.span
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
              animate={{
                x: checked ? 24 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            />
          </motion.button>
        </div>

        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-600 max-w-xs"
            >
              {description}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-600 transform rotate-45"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: "warning" | "error" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
}> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/50",
    },
    error: {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/50",
    },
    info: {
      icon: Info,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/50",
    },
    success: {
      icon: Check,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/50",
    },
  };

  const { icon: Icon, color, bgColor, borderColor } = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className={`bg-gray-900 border-2 ${borderColor} rounded-xl p-6 max-w-md w-full shadow-2xl font-mono`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </motion.div>
          <motion.button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <div className="text-gray-300 mb-6 whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto">
          {message.split("\n\n").map((part, index) => (
            <p key={index} className="mb-2">
              {part.includes("Transaction Hash:") ? (
                <>
                  <span className="font-semibold">
                    {part.split(" ")[0]} {part.split(" ")[1]}
                  </span>
                  <div className="text-sm font-mono break-all mt-1 p-2 bg-gray-800 rounded-lg">
                    {part.substring(part.indexOf("0x"))}
                  </div>
                </>
              ) : (
                part
              )}
            </p>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <motion.button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cancelText}
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-600/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {confirmText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const GuessUI: React.FC<GuessUIProps> = ({
  guessId,
  paidGuess,
  overwrite,
  complex,
  blockIncrement,
  actualHash,
  secretHash,
  dummyHash,
  tokenSize,
  tokens,
  isGeneratingActual,
  isGeneratingSecret,
  isSubmitting,
  isFormReadonly,
  onPaidGuessChange,
  onOverwriteChange,
  onComplexChange,
  onBlockIncrementChange,
  onActualHashChange,
  onSecretHashChange,
  onTokenSizeChange,
  onGenerateActualHash,
  onGenerateSecretHash,
  onSubmit,
  onClear,
  onBack,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 font-mono">
      <div className="max-w-4xl lg:max-w-7xl mx-auto space-y-6 lg:space-y-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-4 pb-0 text-left"
        >
          <motion.button
            onClick={onBack}
            className="flex items-center text-purple-300 hover:text-purple-100 transition-colors font-semibold text-sm sm:text-base bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-purple-500/30 shadow-md"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center py-6 sm:py-8"
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            NEW GUESS PROTOCOL
          </motion.h1>
          <motion.div
            className="text-xl sm:text-2xl text-purple-300 font-semibold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            GUESS ID: #{guessId}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            FEATURE CONFIGURATION
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ToggleWithTooltip
              label="Overwrite"
              checked={overwrite}
              onChange={onOverwriteChange}
              color="amber"
              description="Allows overwriting existing guess data. When enabled, the form is editable."
              icon={<RefreshCw />}
            />
            <ToggleWithTooltip
              label="Complex"
              checked={complex}
              onChange={onComplexChange}
              color="rose"
              description="Enables a complex hash generation algorithm for advanced guesses."
              icon={<Zap />}
              disabled={isFormReadonly}
            />
            <ToggleWithTooltip
              label="Paid Guess"
              checked={paidGuess}
              onChange={onPaidGuessChange}
              color="emerald"
              description="Enables paid guess mode. This will cost 25 tokens."
              icon={<DollarSign />}
              disabled={isFormReadonly}
            />
          </div>

          <AnimatePresence mode="wait">
            {paidGuess ? (
              <motion.div
                key="paid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg font-sans"
              >
                <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                  <DollarSign className="w-4 h-4" />
                  PAID GUESS: ENABLED
                </div>
                <p className="text-sm text-green-300">
                  Cost: 25 tokens | Higher reward potential.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="free"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg font-sans"
              >
                <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
                  <Info className="w-4 h-4" />
                  FREE GUESS: SELECTED
                </div>
                <p className="text-sm text-blue-300">
                  No cost | Standard rewards.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            BLOCK INCREMENT COUNT
          </h2>
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between text-white">
              <span>
                TARGET BLOCK:{" "}
                <span className="text-purple-300 font-bold">
                  {blockIncrement}
                </span>
              </span>
              <span className="text-sm text-gray-300">Range: 513 - 2048</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="513"
                max="2048"
                value={blockIncrement}
                onChange={(e) =>
                  onBlockIncrementChange(parseInt(e.target.value))
                }
                disabled={isFormReadonly}
                className={`w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${
                  isFormReadonly ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((blockIncrement - 513) / (2048 - 513)) * 100}%, #374151 ${((blockIncrement - 513) / (2048 - 513)) * 100}%, #374151 100%)`,
                }}
              />
              <motion.div
                className="absolute -top-8 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold"
                style={{
                  left: `${((blockIncrement - 513) / (2048 - 513)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
              >
                {blockIncrement}
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>513</span>
              <span>1280</span>
              <span>2048</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            HASH GENERATION
          </h2>
          <div className="space-y-6 lg:space-y-8">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ACTUAL HASH
                <span
                  className={`text-xs ml-2 ${actualHash.length === 64 ? "text-green-400" : "text-amber-400"}`}
                >
                  (Length: {actualHash.length})
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={actualHash}
                  onChange={(e) => onActualHashChange(e.target.value)}
                  placeholder="Enter text to hash or generate automatically"
                  disabled={isFormReadonly}
                  className={`flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm ${
                    isFormReadonly ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <motion.button
                  onClick={onGenerateActualHash}
                  disabled={isGeneratingActual || isFormReadonly}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={
                      isGeneratingActual ? { rotate: 360 } : { rotate: 0 }
                    }
                    transition={
                      isGeneratingActual
                        ? { duration: 1, repeat: Infinity, ease: "linear" }
                        : {}
                    }
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  GENERATE
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                SECRET KEY HASH
                <span
                  className={`text-xs ml-2 ${secretHash.length === 64 ? "text-green-400" : "text-amber-400"}`}
                >
                  (Length: {secretHash.length})
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={secretHash}
                  onChange={(e) => onSecretHashChange(e.target.value)}
                  placeholder="Enter text to hash or generate automatically"
                  disabled={isFormReadonly}
                  className={`flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm ${
                    isFormReadonly ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <motion.button
                  onClick={onGenerateSecretHash}
                  disabled={isGeneratingSecret || isFormReadonly}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={
                      isGeneratingSecret ? { rotate: 360 } : { rotate: 0 }
                    }
                    transition={
                      isGeneratingSecret
                        ? { duration: 1, repeat: Infinity, ease: "linear" }
                        : {}
                    }
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  GENERATE
                </motion.button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                DUMMY HASH (AUTO-GENERATED)
                <span className="text-xs text-green-400 ml-2">
                  ✓ Combined using getUnrevealedHash ({dummyHash.length} chars)
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={dummyHash}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed text-sm"
                />
                <motion.button
                  onClick={() => copyToClipboard(dummyHash)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  title="Copy to clipboard"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-gray-700 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            TOKEN SIZE CONFIGURATION
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-white mb-4">
                <span>
                  TOKEN SIZE:{" "}
                  <span className="text-green-300 font-bold">{tokenSize}</span>{" "}
                  CHARACTERS
                </span>
                <span className="text-sm text-gray-300">4 - 64 CHARACTERS</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="4"
                  max="64"
                  value={tokenSize}
                  onChange={(e) => onTokenSizeChange(parseInt(e.target.value))}
                  disabled={isFormReadonly}
                  className={`w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${
                    isFormReadonly ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((tokenSize - 4) / (64 - 4)) * 100}%, #374151 ${((tokenSize - 4) / (64 - 4)) * 100}%, #374151 100%)`,
                  }}
                />
                <motion.div
                  className="absolute -top-8 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"
                  style={{
                    left: `${((tokenSize - 4) / (64 - 4)) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {tokenSize}
                </motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>4</span>
                <span>34</span>
                <span>64</span>
              </div>
            </div>

            {actualHash &&
              actualHash !==
                "0000000000000000000000000000000000000000000000000000000000000000" && (
                <motion.div
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg font-sans"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-green-400 font-medium mb-1">
                    TOKEN GENERATION ACTIVE
                  </div>
                  <div className="text-sm text-green-300">
                    Expected tokens:{" "}
                    {Math.max(0, actualHash.length - tokenSize + 1)}
                    {tokens.length > 0 && (
                      <span className="ml-2">| Generated: {tokens.length}</span>
                    )}
                  </div>
                </motion.div>
              )}

            <AnimatePresence>
              {tokens.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <motion.span
                      animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-2xl"
                    >
                      🔨
                    </motion.span>
                    <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      REALISTIC POWER HAMMERS
                    </span>
                    <span className="text-lg text-purple-400">
                      ({tokens.length} FORGED)
                    </span>
                  </h3>
                  <div className="text-sm text-gray-300 mb-4 p-3 bg-gray-800/40 rounded-lg border border-gray-600 font-sans">
                    ⚡ Each hammer is forged with magical energy - Click to copy
                    token and unleash its power!
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-h-[500px] overflow-y-auto p-6 bg-gray-800/60 rounded-xl border border-gray-700 shadow-2xl">
                    {tokens.map((token, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-800/80 border-2 border-gray-700/50 rounded-2xl p-4 flex flex-col items-center gap-4 hover:bg-gray-700/80 transition-all duration-500 shadow-xl hover:shadow-2xl backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.7, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          y: -8,
                          scale: 1.05,
                          boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        <RealisticHammer
                          onClick={() => copyToClipboard(token)}
                          token={token}
                          index={index}
                        />
                        <div className="text-xs text-gray-200 break-all text-center select-all bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-600/50 backdrop-blur-sm w-full">
                          {token}
                        </div>
                        <motion.div
                          className="text-xs text-white font-bold bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 rounded-full border border-purple-400/50 shadow-lg"
                          animate={{
                            boxShadow: [
                              "0 0 10px rgba(168,85,247,0.4)",
                              "0 0 20px rgba(168,85,247,0.7)",
                              "0 0 10px rgba(168,85,247,0.4)",
                            ],
                          }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        >
                          HAMMER #{index + 1}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
        >
          {overwrite ? (
            <motion.button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isSubmitting ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  isSubmitting
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                {isSubmitting ? (
                  <RefreshCw className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.div>
              {isSubmitting ? "PROCESSING TRANSACTION..." : "SUBMIT GUESS"}
            </motion.button>
          ) : null}

          <motion.button
            onClick={onClear}
            disabled={isSubmitting}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-800 disabled:to-gray-900 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            CLEAR FORM
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {!overwrite && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg font-sans"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400 font-medium mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertTriangle className="w-4 h-4" />
                </motion.div>
                OVERWRITE REQUIRED FOR SUBMISSION
              </div>
              <p className="text-sm text-amber-300">
                Enable "Overwrite" toggle to unlock form submission.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GuessUI;