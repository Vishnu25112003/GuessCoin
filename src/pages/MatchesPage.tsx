// import { useEffect, useState } from 'react';
// import Header from '../components/Header';
// import type { MatchToken, GuessEntry } from '../types';
// import { CyberCard, CyberButton, HexGrid, Scanlines, CyberModal } from "../components/cyberpunk";
// import { useCyberModal } from "../hooks/useCyberModal";

// export default function MatchesPage() {
//   const [matches, setMatches] = useState<MatchToken[]>([]);
//   const [guess, setGuess] = useState<GuessEntry | null>(null);
//   const blockHash = localStorage.getItem('block-hash-generated') || '';
//   const modal = useCyberModal();

//   useEffect(() => {
//     const m = localStorage.getItem('matches');
//     const g = localStorage.getItem('singleGuess');
//     if (m) setMatches(JSON.parse(m));
//     if (g) setGuess(JSON.parse(g));
//   }, []);

//   return (
//     <div className="min-h-screen relative bg-cyber-darker">
//       <HexGrid />
//       <Scanlines />
//       <Header trail={[{ label: 'Get Seed Data', to: '/seed-data' }, { label: 'Matches Found' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
//       <main className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-6">
//         <div className="grid md:grid-cols-2 gap-4">
//           <CyberCard>
//             <p className="text-xs text-gray-400">Block Hash Generated</p>
//             <p className="font-mono break-all text-cyber-text text-sm md:text-base">{blockHash}</p>
//           </CyberCard>
//           <CyberCard>
//             <p className="text-xs text-gray-400">Actual Hash</p>
//             <p className="font-mono break-all text-cyber-text text-sm md:text-base">{guess?.actualHash}</p>
//           </CyberCard>
//           <CyberCard>
//             <p className="text-xs text-gray-400">Secret Key</p>
//             <p className="font-mono break-all text-cyber-text text-sm md:text-base">{guess?.secretKey}</p>
//           </CyberCard>
//           <CyberCard>
//             <p className="text-xs text-gray-400">Dummy Hash</p>
//             <p className="font-mono break-all text-cyber-text text-sm md:text-base">{guess?.userHashGuess}</p>
//           </CyberCard>
//         </div>

//         <h3 className="text-xl font-display font-bold text-cyber-text">No of Matches <span>{matches.length}</span></h3>
//         {matches.length === 0 && (
//           <CyberCard>
//             <div className="p-2 text-rose-400">No Matches Found</div>
//           </CyberCard>
//         )}

//         <div className="grid gap-4">
//           {matches.map((m, i) => (
//             <CyberCard key={i} className={i < 2 ? 'bg-cyber-primary/5' : ''}>
//               <div className="flex items-center justify-between">
//                 <div className="text-cyber-primary font-semibold">Match {i + 1}</div>
//                 <input type="checkbox" defaultChecked={i < 2} />
//               </div>
//               <div className="mt-3">
//                 <p className="text-sm">Token: <span className="font-mono text-cyber-text">{m.token}</span></p>
//               </div>
//               <div className="mt-3 grid grid-cols-2 md:grid-cols-4 text-sm text-cyber-text">
//                 <div><div className="text-gray-400">Hex1 Start</div><div>{m.hex1.startByte}</div></div>
//                 <div><div className="text-gray-400">Hex1 End</div><div>{m.hex1.endByte}</div></div>
//                 <div><div className="text-gray-400">Hex2 Start</div><div>{m.hex2.startByte}</div></div>
//                 <div><div className="text-gray-400">Hex2 End</div><div>{m.hex2.endByte}</div></div>
//               </div>
//               <details className="mt-3">
//                 <summary className="cursor-pointer text-cyber-primary">Encoded Data</summary>
//                 <pre className="mt-2 overflow-auto text-xs text-cyber-text">{m.encoded}</pre>
//               </details>
//             </CyberCard>
//           ))}
//         </div>

//         <div className="flex justify-end gap-3">
//           <CyberButton
//             variant="primary"
//             disabled={matches.length === 0}
//             onClick={() => {
//               if (matches.length === 0) return;
//               const selected: number[] = [];
//               const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
//               boxes.forEach((b, idx) => { if (b.checked) selected.push(idx); });
//               if (selected.length === 0) { modal.open({ title: 'Selection Required', message: 'Please select at least one match', type: 'warning' }); return; }
//               if (selected.length > 2) { modal.open({ title: 'Too Many Selections', message: 'You can only select up to two matches.', type: 'warning' }); return; }
//               const chosen = selected.map(i => matches[i]);
//               localStorage.setItem('selectedMatches', JSON.stringify(chosen));
//               window.location.href = '/on-chain';
//             }}
//           >
//             Verify on Chain
//           </CyberButton>
//           <a href="/seed-data" className="px-4 py-2 border-2 border-cyber-primary/40 rounded-xl text-cyber-text">Back</a>
//         </div>
//       </main>
//       <CyberModal isOpen={modal.isOpen} onClose={modal.close} {...modal.config} onConfirm={modal.onConfirm || undefined} />
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import {
  CyberCard,
  CyberButton,
  HexGrid,
  Scanlines,
  CyberModal,
  CyberBadge,
} from "../components/cyberpunk";
import { useCyberModal } from "../hooks/useCyberModal";
import type { MatchToken, GuessEntry } from "../types";

export default function MatchesPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchToken[]>([]);
  const [guess, setGuess] = useState<GuessEntry | null>(null);
  const [blockHash, setBlockHash] = useState<string>("");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const modal = useCyberModal();

  useEffect(() => {
    const m = localStorage.getItem("matches");
    const g = localStorage.getItem("singleGuess");
    const bh = localStorage.getItem("block-hash-generated");

    if (m) setMatches(JSON.parse(m));
    if (g) setGuess(JSON.parse(g));
    if (bh) setBlockHash(bh);
  }, []);

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      if (newSelected.size >= 2) {
        modal.open({
          title: "Too Many Selections",
          message: "You can only select up to two matches.",
          type: "warning",
        });
        return;
      }
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleVerifyOnChain = async () => {
    if (selectedIndices.size === 0) {
      modal.open({
        title: "No Selection",
        message: "Please select at least one match to verify on-chain.",
        type: "warning",
      });
      return;
    }

    try {
      setIsNavigating(true);

      const chosen = Array.from(selectedIndices).map((i) => matches[i]);
      localStorage.setItem("selectedMatches", JSON.stringify(chosen));

      // Add delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      navigate("/hammer-animation");
    } catch (error) {
      modal.open({
        title: "Navigation Error",
        message: "Failed to navigate to verification page.",
        type: "error",
      });
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-cyber-darker">
      <HexGrid />
      <Scanlines />
      <Header
        trail={[
          { label: "Home", to: "/home" },
          { label: "Seed Data", to: "/seed-data" },
          { label: "Matches Found" },
        ]}
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/session";
        }}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-cyan-400 mb-4 cyber-text-glow">
            TOKEN MATCHES DETECTED
          </h1>
          <p className="text-gray-400 font-mono">
            Found {matches.length} matching token
            {matches.length !== 1 ? "s" : ""}
            {guess?.tokenSize && ` (Token Size: ${guess.tokenSize})`}
          </p>
        </motion.div>

        {/* Blockchain Data Display */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CyberCard glow className="h-full">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Generated Block Hash
                </h3>
                <p className="font-mono break-all text-cyber-text text-sm md:text-base">
                  {blockHash}
                </p>
              </div>
            </CyberCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CyberCard glow className="h-full">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Guess Metadata
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Token Size:</span>
                    <span className="font-mono text-cyber-text">
                      {guess?.tokenSize} bytes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment:</span>
                    <span className="font-mono text-cyber-text">
                      {guess?.paidGuess ? "Paid (25 GC)" : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Complexity:</span>
                    <span className="font-mono text-cyber-text">
                      {guess?.complex ? "Complex" : "Simple"}
                    </span>
                  </div>
                </div>
              </div>
            </CyberCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2"
          >
            <CyberCard glow>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Actual Hash
                </h3>
                <p className="font-mono break-all text-cyber-text text-sm">
                  {guess?.actualHash}
                </p>
              </div>
            </CyberCard>
          </motion.div>
        </div>

        {/* Matches Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-display font-bold text-purple-400 mb-2">
              DETECTED MATCHES
            </h2>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
          </div>

          {matches.length === 0 ? (
            <CyberCard glow className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <p className="text-gray-400 font-mono">No matches found</p>
            </CyberCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {matches.map((match, index) => {
                  const isSelected = selectedIndices.has(index);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CyberCard
                        glow={isSelected}
                        onClick={() => toggleSelection(index)}
                        className="cursor-pointer transition-all"
                      >
                        {/* Selection Checkbox */}
                        <div className="absolute top-4 right-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(index)}
                            className="w-5 h-5 cursor-pointer accent-cyan-400"
                          />
                        </div>

                        <div className="space-y-4">
                          {/* Match Index */}
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {isSelected ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-cyan-400" />
                              )}
                            </motion.div>
                            <span className="text-sm font-semibold text-cyan-400">
                              Match #{index + 1}
                            </span>
                          </div>

                          {/* Token Display */}
                          <div className="bg-gray-900/40 rounded p-3 border border-gray-700/30">
                            <p className="text-xs text-gray-500 mb-1">
                              Matched Token
                            </p>
                            <p className="font-mono text-cyber-text break-all text-sm">
                              {match.token}
                            </p>
                          </div>

                          {/* Hex1 Details */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-purple-400 uppercase">
                              Hex Range 1
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-900/40 p-2 rounded border border-gray-700/30">
                                <p className="text-gray-500">Start Byte</p>
                                <p className="font-mono text-cyber-text">
                                  {match.hex1.startByte}
                                </p>
                              </div>
                              <div className="bg-gray-900/40 p-2 rounded border border-gray-700/30">
                                <p className="text-gray-500">End Byte</p>
                                <p className="font-mono text-cyber-text">
                                  {match.hex1.endByte}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <CyberBadge variant="info">
                                {match.hex1.leftSkip ? "Left Skip" : "No Left"}
                              </CyberBadge>
                              <CyberBadge variant="info">
                                {match.hex1.rightSkip
                                  ? "Right Skip"
                                  : "No Right"}
                              </CyberBadge>
                            </div>
                          </div>

                          {/* Hex2 Details */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-purple-400 uppercase">
                              Hex Range 2
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-900/40 p-2 rounded border border-gray-700/30">
                                <p className="text-gray-500">Start Byte</p>
                                <p className="font-mono text-cyber-text">
                                  {match.hex2.startByte}
                                </p>
                              </div>
                              <div className="bg-gray-900/40 p-2 rounded border border-gray-700/30">
                                <p className="text-gray-500">End Byte</p>
                                <p className="font-mono text-cyber-text">
                                  {match.hex2.endByte}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <CyberBadge variant="info">
                                {match.hex2.leftSkip ? "Left Skip" : "No Left"}
                              </CyberBadge>
                              <CyberBadge variant="info">
                                {match.hex2.rightSkip
                                  ? "Right Skip"
                                  : "No Right"}
                              </CyberBadge>
                            </div>
                          </div>

                          {/* Encoded Data */}
                          <details className="text-xs">
                            <summary className="cursor-pointer text-cyan-400 font-mono hover:text-cyan-300">
                              View Encoded Data
                            </summary>
                            <pre className="mt-2 overflow-auto text-xs text-gray-400 bg-gray-900/60 p-2 rounded font-mono break-all">
                              {match.encoded}
                            </pre>
                          </details>
                        </div>
                      </CyberCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Selection Summary */}
        {selectedIndices.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-400/30 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Selected Matches:</p>
                <p className="text-2xl font-display font-bold text-cyan-400">
                  {selectedIndices.size} of 2 maximum
                </p>
              </div>
              <div className="flex gap-2">
                {Array.from(selectedIndices).map((idx) => (
                  <CyberBadge key={idx} variant="success">
                    Match {idx + 1}
                  </CyberBadge>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end pt-8"
        >
          <CyberButton
            variant="secondary"
            onClick={() => navigate("/seed-data")}
            disabled={isNavigating}
          >
            Back to Seed Data
          </CyberButton>

          <CyberButton
            variant="primary"
            onClick={handleVerifyOnChain}
            disabled={selectedIndices.size === 0 || isNavigating}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isNavigating ? "Proceeding..." : "Verify on Chain"}
          </CyberButton>
        </motion.div>
      </main>

      <CyberModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        {...modal.config}
        onConfirm={modal.onConfirm || undefined}
      />
    </div>
  );
}

