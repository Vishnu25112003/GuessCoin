import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CyberButton } from "./Button";

interface GuessRowProps {
  guessId: number;
  targetBlockNumber: number;
  tokenSize: number;
  paidGuess: boolean;
  complex: boolean;
  targetVerified: number;
  onEdit: () => void;
  onVerify: () => void;
  onValidity: () => void;
}

export const GuessRow: React.FC<GuessRowProps> = ({
  guessId,
  targetBlockNumber,
  tokenSize,
  paidGuess,
  complex,
  targetVerified,
  onEdit,
  onVerify,
  onValidity,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isVerified = Number(targetVerified) === 2;

  return (
    <div className="border border-cyber-primary border-opacity-30 rounded-lg overflow-hidden mb-2">
      {/* Main Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="bg-cyber-dark bg-opacity-50 backdrop-blur-sm p-4 cursor-pointer hover:bg-opacity-70 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Guess ID */}
          <div className="min-w-fit">
            <span className="text-sm font-mono text-gray-400">Guess</span>
            <p className="text-xl font-display font-bold text-cyber-primary">
              #{guessId}
            </p>
          </div>

          {/* Info */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-xs font-mono text-gray-400">Block</span>
              <p className="font-mono text-cyber-primary font-semibold">
                {targetBlockNumber || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-gray-400">Tokens</span>
              <p className="font-mono text-cyber-secondary font-semibold">
                {tokenSize} GC
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-gray-400">Status</span>
              <p
                className={`font-mono font-semibold ${isVerified ? "text-cyber-success" : "text-cyber-accent"}`}
              >
                {isVerified ? "VERIFIED" : "PENDING"}
              </p>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-mono text-gray-400">Mode</span>
              <p className="font-mono font-semibold text-blue-400">
                {complex ? "COMPLEX" : "SIMPLE"}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button className="p-2 hover:bg-cyber-primary hover:bg-opacity-20 rounded transition-all">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-cyber-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-cyber-primary" />
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="bg-cyber-darker bg-opacity-50 border-t border-cyber-primary border-opacity-30 p-4 space-y-4">
          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cyber-dark bg-opacity-50 p-3 rounded border border-cyber-primary border-opacity-20">
              <p className="text-xs text-gray-400 mb-1">Payment Status</p>
              <p
                className={`font-mono font-bold ${paidGuess ? "text-cyber-success" : "text-cyber-danger"}`}
              >
                {paidGuess ? "✓ PAID" : "✗ UNPAID"}
              </p>
            </div>
            <div className="bg-cyber-dark bg-opacity-50 p-3 rounded border border-cyber-primary border-opacity-20">
              <p className="text-xs text-gray-400 mb-1">Complexity</p>
              <p
                className={`font-mono font-bold ${complex ? "text-cyber-accent" : "text-blue-400"}`}
              >
                {complex ? "COMPLEX" : "SIMPLE"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <CyberButton
              variant="primary"
              size="sm"
              onClick={onEdit}
              className="flex-1 min-w-[80px]"
            >
              New Guess
            </CyberButton>

            {!isVerified && (
              <CyberButton
                variant="success"
                size="sm"
                onClick={onVerify}
                className="flex-1 min-w-[80px]"
              >
                Verify
              </CyberButton>
            )}

            <CyberButton
              variant="info"
              size="sm"
              onClick={onValidity}
              className="flex-1 min-w-[80px]"
            >
              Check
            </CyberButton>
          </div>
        </div>
      )}
    </div>
  );
};
