import React from "react";
import {
  Target,
  Zap,
  Lock,
  Gamepad2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CyberBadge } from "./Badge";
import { CyberButton } from "./Button";

interface GuessCardProps {
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

export const GuessCard: React.FC<GuessCardProps> = ({
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
  const isVerified = Number(targetVerified) === 2;
  const isPending = Number(targetVerified) === 1;

  return (
    <div className="relative group">
      {/* Glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-accent opacity-20 blur-lg group-hover:opacity-30 transition-all rounded-lg" />

      {/* Card */}
      <div className="relative bg-cyber-dark bg-opacity-80 backdrop-blur-sm border-2 border-cyber-primary border-opacity-40 rounded-lg p-6 hover:border-opacity-60 transition-all shadow-cyber-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-cyber-primary" />
            <div>
              <h3 className="text-xl font-display font-bold text-cyber-primary cyber-text-glow">
                GUESS #{guessId}
              </h3>
              <p className="text-xs text-gray-400 font-mono">ENTRY SLOT</p>
            </div>
          </div>

          {/* Status Badge */}
          {isVerified ? (
            <CyberBadge variant="success">
              <CheckCircle className="w-3 h-3" />
              VERIFIED
            </CyberBadge>
          ) : isPending ? (
            <CyberBadge variant="info">
              <AlertCircle className="w-3 h-3" />
              PENDING
            </CyberBadge>
          ) : (
            <CyberBadge variant="warning">
              <AlertCircle className="w-3 h-3" />
              UNVERIFIED
            </CyberBadge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Target Block */}
          <div className="bg-cyber-darker bg-opacity-50 p-3 rounded border border-cyber-primary border-opacity-20">
            <p className="text-xs text-gray-400 font-mono mb-1">Target Block</p>
            <p className="text-lg font-display font-bold text-cyber-primary">
              {targetBlockNumber || "—"}
            </p>
          </div>

          {/* Token Size */}
          <div className="bg-cyber-darker bg-opacity-50 p-3 rounded border border-cyber-secondary border-opacity-20">
            <p className="text-xs text-gray-400 font-mono mb-1">Token Size</p>
            <p className="text-lg font-display font-bold text-cyber-secondary">
              {tokenSize} GC
            </p>
          </div>

          {/* Paid Status */}
          <div className="bg-cyber-darker bg-opacity-50 p-3 rounded border border-cyber-primary border-opacity-20">
            <p className="text-xs text-gray-400 font-mono mb-1">Payment</p>
            <p
              className={`text-lg font-display font-bold ${paidGuess ? "text-cyber-success" : "text-cyber-danger"}`}
            >
              {paidGuess ? "PAID" : "UNPAID"}
            </p>
          </div>

          {/* Complexity */}
          <div className="bg-cyber-darker bg-opacity-50 p-3 rounded border border-cyber-accent border-opacity-20">
            <p className="text-xs text-gray-400 font-mono mb-1">Mode</p>
            <p
              className={`text-lg font-display font-bold ${complex ? "text-cyber-accent" : "text-blue-400"}`}
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
            icon={<Zap className="w-3 h-3" />}
            className="flex-1 min-w-[100px]"
          >
            Edit
          </CyberButton>

          {!isVerified && (
            <CyberButton
              variant="success"
              size="sm"
              onClick={onVerify}
              icon={<Lock className="w-3 h-3" />}
              className="flex-1 min-w-[100px]"
            >
              Verify
            </CyberButton>
          )}

          <CyberButton
            variant="info"
            size="sm"
            onClick={onValidity}
            icon={<Target className="w-3 h-3" />}
            className="flex-1 min-w-[100px]"
          >
            Check
          </CyberButton>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-primary opacity-40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-primary opacity-40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-primary opacity-40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-primary opacity-40" />
      </div>
    </div>
  );
};
