import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

interface RealisticHammerProps {
  index?: number;
  token?: string;
  onClick?: () => void;
  isMatched?: boolean;
  isMismatch?: boolean;
  shouldAnimate?: boolean;
}

export const RealisticHammer: React.FC<RealisticHammerProps> = ({
  index = 0,
  token,
  onClick,
  isMatched,
  isMismatch,
  shouldAnimate = false,
}) => {
  const hammerControls = useAnimation();

  useEffect(() => {
    if (shouldAnimate) {
      hammerControls.start({
        rotate: [0, -45, -90, -45, 0],
        y: [0, -20, 40, 20, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.2, 0.5, 0.7, 1],
          ease: "easeInOut",
        },
      });
    }
  }, [shouldAnimate, hammerControls]);

  const getBorderColor = () => {
    if (isMatched) return "border-green-500 shadow-green-500/50";
    if (isMismatch) return "border-red-500 shadow-red-500/50";
    return "border-gray-700/50 hover:border-purple-500/50";
  };

  return (
    <div
      className={`relative flex flex-col items-center p-4 bg-gray-900/40 rounded-lg border-2 ${getBorderColor()} transition-all hover:bg-gray-900/60 group`}
      onClick={onClick}
    >
      {/* Hammer Visual with Physics */}
      <motion.div
        className="relative w-16 h-20 mb-3 cursor-pointer"
        animate={hammerControls}
        whileHover={{ }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {/* Wooden Handle */}
        <div
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-14 rounded-full shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #D2691E 0%, #CD853F 15%, #8B4513 40%, #654321 70%, #2F1B14 100%)",
            boxShadow:
              "inset -3px -3px 6px rgba(139, 69, 19, 0.9), inset 3px 3px 6px rgba(210, 180, 140, 0.7), 0 6px 16px rgba(0,0,0,0.8)",
          }}
        >
          <div className="absolute top-2 left-0 right-0 h-px bg-black/20" />
          <div className="absolute top-4 left-0 right-0 h-px bg-black/15" />
          <div className="absolute top-8 left-0 right-0 h-px bg-black/20" />
        </div>

        {/* Steel Hammer Head */}
        <div
          className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-7 rounded-lg shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #FFFFFF 0%, #E6E6FA 10%, #C0C0C0 25%, #A9A9A9 50%, #808080 75%, #696969 90%, #2F2F2F 100%)",
            boxShadow:
              "inset -3px -3px 8px rgba(105, 105, 105, 0.9), inset 3px 3px 8px rgba(255, 255, 255, 0.9), 0 8px 20px rgba(0,0,0,0.8)",
          }}
        >
          <motion.div
            className="absolute top-1 left-0 right-0 h-3 rounded-t overflow-hidden"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.8) 60%, transparent 100%)",
            }}
            animate={{ x: [-30, 30] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-gray-600/40" />
          <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-gray-600/30" />
        </div>

        {/* Floating Magical Aura */}
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut",
          }}
        >
          <Star className="w-5 h-5 text-yellow-300 opacity-80 drop-shadow-lg" />
        </motion.div>

        {/* Power Status Indicator */}
        <motion.div
          className="absolute -top-4 -right-4 text-yellow-400"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          <Sparkles className="w-4 h-4 drop-shadow-lg" />
        </motion.div>

        {/* Impact effect */}
        {shouldAnimate && (
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.6,
              delay: 0.4,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-yellow-400/50 blur-md" />
          </motion.div>
        )}
      </motion.div>

      {/* Token Display */}
      {token && (
        <div className="w-full flex flex-col items-center gap-2">
          <div className="text-xs font-mono text-gray-300 bg-gray-800/80 px-2 py-1.5 rounded border border-gray-700 break-all text-center max-w-full overflow-hidden">
            <div className="truncate" title={token}>
              {token}
            </div>
          </div>
        </div>
      )}

      {/* Match/Mismatch indicator */}
      {isMatched !== undefined && (
        <motion.div
          initial={{ }}
          animate={{ }}
          className={`mt-2 text-xs font-bold ${
            isMatched ? "text-green-400" : "text-red-400"
          }`}
        >
          {isMatched ? "✓ MATCH" : "✗ MISS"}
        </motion.div>
      )}
    </div>
  );
};
