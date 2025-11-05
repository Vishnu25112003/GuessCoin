import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Sparkles, Star, Lock, Unlock } from "lucide-react";

interface TreasureBoxProps {
  hash?: string;
  isLocked?: boolean;
  animate?: boolean;
  index?: number;
  onClick?: () => void;
  label?: string;
  shouldBreak?: boolean;
  isMatched?: boolean;
}

export const TreasureBox: React.FC<TreasureBoxProps> = ({
  hash,
  isLocked = false,
  animate = true,
  index = 0,
  onClick,
  label = "Block Hash",
  shouldBreak = false,
  isMatched = false,
}) => {
  const [isBroken, setIsBroken] = useState(false);
  const boxControls = useAnimation();
  const shardControls = useAnimation();

  useEffect(() => {
    if (shouldBreak && isMatched) {
      boxControls.start({
        scale: [1, 1.1, 1.05, 0.95, 0],
        rotate: [0, -5, 5, -3, 0],
        opacity: [1, 1, 1, 0.8, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.2, 0.4, 0.6, 1],
        },
      });

      shardControls.start({
        scale: [0, 1.5, 2],
        opacity: [1, 0.8, 0],
        transition: {
          duration: 1,
          delay: 0.6,
        },
      });

      setTimeout(() => setIsBroken(true), 800);
    }
  }, [shouldBreak, isMatched, boxControls, shardControls]);

  if (isBroken && isMatched) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative flex flex-col items-center p-6 bg-gradient-to-br from-green-900/40 to-emerald-800/40 rounded-xl border-2 border-green-500/50 shadow-lg shadow-green-500/30"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          💎
        </motion.div>

        <div className="text-sm font-semibold text-green-400 mb-2">
          {label} - MATCHED!
        </div>

        {hash && (
          <div className="text-xs font-mono text-green-300 bg-green-950/80 px-3 py-2 rounded border border-green-700 break-all text-center max-w-full overflow-hidden">
            <div className="truncate" title={hash}>
              {hash}
            </div>
          </div>
        )}

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [-10, -30, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="relative flex flex-col items-center p-6 bg-gray-900/40 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all hover:bg-gray-900/60 group">
      <motion.div
        className="relative w-24 h-24 mb-4 cursor-pointer"
        animate={
          animate && !shouldBreak
            ? {
                rotateY: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }
            : boxControls
        }
        transition={{
          duration: 3,
          repeat: shouldBreak ? 0 : Infinity,
          delay: index * 0.3,
        }}
        whileHover={{ scale: 1.1 }}
        onClick={onClick}
        style={{ transformStyle: "preserve-3d" }}
      >
        {shouldBreak && (
          <motion.div className="absolute inset-0" animate={shardControls}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-600"
                style={{
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: Math.cos((i * Math.PI) / 4) * 60,
                  y: Math.sin((i * Math.PI) / 4) * 60,
                  rotate: Math.random() * 360,
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                }}
              />
            ))}
          </motion.div>
        )}

        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-14 rounded-lg shadow-2xl"
          style={{
            background:
              "linear-gradient(145deg, #CD7F32 0%, #B8860B 20%, #DAA520 40%, #FFD700 60%, #B8860B 80%, #8B6914 100%)",
            boxShadow:
              "inset -4px -4px 10px rgba(139, 105, 20, 0.9), inset 4px 4px 10px rgba(255, 215, 0, 0.7), 0 10px 25px rgba(0,0,0,0.8)",
          }}
        >
          <div className="absolute top-1/3 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-700 via-gray-400 to-gray-700 shadow-lg" />
          <div className="absolute bottom-1/3 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-700 via-gray-400 to-gray-700 shadow-lg" />
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-gray-700" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-gray-700" />
        </div>

        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-12 rounded-t-lg shadow-2xl origin-bottom"
          style={{
            background:
              "linear-gradient(145deg, #8B6914 0%, #B8860B 20%, #DAA520 40%, #FFD700 60%, #CD7F32 80%, #8B6914 100%)",
            boxShadow:
              "inset -4px -4px 10px rgba(139, 105, 20, 0.9), inset 4px 4px 10px rgba(255, 215, 0, 0.7), 0 10px 25px rgba(0,0,0,0.8)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {isLocked ? (
              <Lock className="w-6 h-6 text-gray-800" />
            ) : (
              <Unlock className="w-6 h-6 text-green-400" />
            )}
          </div>
        </motion.div>

        {isMatched && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-20 h-20 rounded-full bg-green-400/40 blur-xl" />
          </motion.div>
        )}

        {!isLocked && (
          <>
            <motion.div
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              animate={{
                y: [-10, -30, -10],
                x: [-5, 5, -5],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
            <motion.div
              className="absolute top-0 right-0"
              animate={{
                y: [-10, -25, -10],
                x: [5, 10, 5],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              <Star className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </>
        )}
      </motion.div>

      <div className="text-sm font-semibold text-yellow-400 mb-2">{label}</div>

      {hash && !shouldBreak && (
        <div className="w-full flex flex-col items-center gap-2">
          <div className="text-xs font-mono text-gray-300 bg-gray-800/80 px-3 py-2 rounded border border-gray-700 break-all text-center max-w-full overflow-hidden">
            <div className="truncate" title={hash}>
              {hash}
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="text-xs text-gray-400 text-center mt-2">
          Waiting for block generation...
        </div>
      )}
    </div>
  );
};
