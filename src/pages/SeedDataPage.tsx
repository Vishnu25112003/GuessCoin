// import { useEffect, useState } from 'react';
// import Header from '../components/Header';
// import { compareHexValues, getRandomBlockHash, npInfura } from '../services/web3';
// import type { GuessEntry, MatchToken } from '../types';
// import { CyberCard, CyberButton, HexGrid, Scanlines, CyberModal } from "../components/cyberpunk";
// import { useCyberModal } from "../hooks/useCyberModal";

// export default function SeedDataPage() {
//   const [guess, setGuess] = useState<GuessEntry | null>(null);
//   const [generatedHash, setGeneratedHash] = useState('');
//   const [, setMatches] = useState<MatchToken[]>([]);
//   const modal = useCyberModal();

//   useEffect(() => {
//     const stored = localStorage.getItem('singleGuess');
//     if (stored) setGuess(JSON.parse(stored));
//   }, []);

//   async function fetchGenerated() {
//     if (!guess) return;
//     const targetBlockNumber = Number(guess.targetBlockNumber);
//     const currentBlockNumber = await npInfura.eth.getBlockNumber();
//     const blockDistance = Number(currentBlockNumber) - Number(targetBlockNumber);

//     if (blockDistance <= -1) {
//       modal.open({ title: 'Block yet to be mined', message: '', type: 'error' });
//       setGeneratedHash('');
//       return;
//     }

//     if (!guess.complex) {
//       if (blockDistance <= 255) {
//         const block = await npInfura.eth.getBlock(targetBlockNumber);
//         if (block && block.hash) {
//           setGeneratedHash(block.hash);
//           localStorage.setItem('block-hash-generated', String(block.hash));
//         } else {
//           modal.open({ title: 'Block hash retrieve issue', message: '', type: 'error' });
//         }
//       } else {
//         modal.open({ title: 'Block out of range', message: `Block Distance - ${blockDistance}` , type: 'error' });
//       }
//       return;
//     }

//     // complex case
//     if (blockDistance <= 128) {
//       const block = await npInfura.eth.getBlock(targetBlockNumber);
//       if (!block || !block.hash) {
//         modal.open({ title: 'Random Block hash retrieve issue', message: '', type: 'error' });
//         return;
//       }
//       const [randomBlockHash] = await getRandomBlockHash(block.hash, targetBlockNumber);
//       if (randomBlockHash) {
//         setGeneratedHash(randomBlockHash);
//         localStorage.setItem('block-hash-generated', String(randomBlockHash));
//       } else {
//         modal.open({ title: 'Random Block hash retrieve issue', message: '', type: 'error' });
//       }
//     } else {
//       modal.open({ title: 'Block out of range', message: `Block Distance - ${blockDistance}`, type: 'error' });
//     }
//   }

//   async function verifyOffChain() {
//     if (!guess || !generatedHash) { modal.open({ title: 'No generated hash', message: 'Fetch generated hash first', type: 'error' }); return; }
//     const m = await compareHexValues(generatedHash, guess.actualHash || '', guess.tokenSize);
//     setMatches(m);
//     localStorage.setItem('matches', JSON.stringify(m));
//     window.location.href = '/matches';
//   }

//   return (
//     <div className="min-h-screen relative bg-cyber-darker">
//       <HexGrid />
//       <Scanlines />
//       <Header trail={[{ label: 'Home', to: '/home' }, { label: 'Get Seed Data' }]} onLogout={() => { localStorage.clear(); window.location.href = '/session'; }} />
//       <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
//         {guess && (
//           <CyberCard>
//             <div className="grid md:grid-cols-2 gap-4 text-sm">
//               <div><span className="text-gray-400">Guess ID</span>: <span className="font-mono text-cyber-text">{guess.guessId}</span></div>
//               <div><span className="text-gray-400">Target Block Count</span>: <span className="font-mono text-cyber-text">{guess.targetBlockNumber}</span></div>
//               <div><span className="text-gray-400">Token Size</span>: <span className="font-mono text-cyber-text">{guess.tokenSize}</span></div>
//               <div><span className="text-gray-400">Paid Guess</span>: <span className="font-mono text-cyber-text">{String(guess.paidGuess)}</span></div>
//               <div><span className="text-gray-400">Complex</span>: <span className="font-mono text-cyber-text">{String(guess.complex)}</span></div>
//               <div className="md:col-span-2 break-all"><span className="text-gray-400">Actual Hash</span>: <span className="font-mono text-cyber-text">{guess.actualHash}</span></div>
//               <div className="md:col-span-2 break-all"><span className="text-gray-400">Secret Key</span>: <span className="font-mono text-cyber-text">{guess.secretKey}</span></div>
//               <div className="md:col-span-2 break-all"><span className="text-gray-400">Dummy Hash</span>: <span className="font-mono text-cyber-text">{guess.userHashGuess}</span></div>
//             </div>
//           </CyberCard>
//         )}

//         <CyberCard>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
//             <div className="md:col-span-2">
//               <p className="text-xs text-gray-400 mb-1">Generated Hash</p>
//               <input className="w-full bg-cyber-dark/60 border-2 border-cyber-primary/30 rounded-xl p-3 font-mono text-cyber-text" value={generatedHash} readOnly />
//             </div>
//             <CyberButton onClick={fetchGenerated} className="h-11" variant="primary">Fetch generated hash</CyberButton>
//           </div>
//         </CyberCard>

//         <div className="flex justify-end gap-3">
//           <CyberButton onClick={verifyOffChain} variant="success">Verify Off Chain</CyberButton>
//           <a href="/home" className="px-4 py-2 border-2 border-cyber-primary/40 rounded-xl text-cyber-text">Back</a>
//         </div>
//       </main>
//       <CyberModal isOpen={modal.isOpen} onClose={modal.close} {...modal.config} onConfirm={modal.onConfirm || undefined} />
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
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
import { compareHexValues } from "../services/web3";
import { npInfura } from "../services/web3";
import type { GuessEntry, MatchToken } from "../types";

export default function SeedDataPage() {
  const navigate = useNavigate();
  const [guess, setGuess] = useState<GuessEntry | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string>("");
  const [matches, setMatches] = useState<MatchToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const modal = useCyberModal();

  // Load guess from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("singleGuess");
    if (stored) {
      try {
        const parsedGuess = JSON.parse(stored);
        setGuess(parsedGuess);
      } catch (error) {
        console.error("Error parsing guess:", error);
        modal.open({
          title: "Error",
          message: "Failed to load guess data",
          type: "error",
        });
      }
    }
  }, []);

  // Format encoded data to proper hex string for Web3
  const formatEncodedData = (encoded: unknown): string => {
    if (!encoded) return "0x";

    // If it's already a string
    if (typeof encoded === "string") {
      // Remove any spaces, newlines, or extra characters
      let cleanHex = encoded
        .replace(/[\s\n\r]/g, "")
        .replace(/^0x/, "")
        .toLowerCase();

      // Ensure even length for proper byte conversion
      if (cleanHex.length % 2 !== 0) {
        cleanHex = "0" + cleanHex;
      }

      // Validate that it's valid hex
      if (!/^[0-9a-f]*$/.test(cleanHex)) {
        console.warn("Invalid hex characters in encoded data:", encoded);
        return "0x";
      }

      return "0x" + cleanHex;
    }

    // If it's an array (from smart contract or comparison result)
    if (Array.isArray(encoded)) {
      try {
        const hex = (encoded as number[])
          .map((byte) => {
            const num = Number(byte);
            if (isNaN(num) || num < 0 || num > 255) {
              throw new Error(`Invalid byte value: ${byte}`);
            }
            const h = num.toString(16);
            return h.length === 1 ? "0" + h : h;
          })
          .join("");
        return "0x" + hex;
      } catch (error) {
        console.error("Error converting array to hex:", error);
        return "0x";
      }
    }

    // If it's a Uint8Array or similar
    if (
      typeof encoded === "object" &&
      encoded !== null &&
      typeof (encoded as any).length === "number"
    ) {
      try {
        const hex = Array.from(encoded as Iterable<number>)
          .map((byte) => {
            const h = byte.toString(16);
            return h.length === 1 ? "0" + h : h;
          })
          .join("");
        return "0x" + hex;
      } catch (error) {
        console.error("Error converting buffer-like to hex:", error);
        return "0x";
      }
    }

    console.warn("Unexpected encoded data type:", typeof encoded);
    return "0x";
  };

  // Generate block hash
  const handleGenerateHash = async () => {
    if (!guess) {
      modal.open({
        title: "Error",
        message: "No guess data available",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setGenerationError(null);

    try {
      const targetBlockNumber = Number(guess.targetBlockNumber);

      // Validate block number
      if (!Number.isFinite(targetBlockNumber) || targetBlockNumber <= 0) {
        throw new Error(
          "Invalid target block number. Must be a positive number."
        );
      }

      console.log(`Fetching block #${targetBlockNumber}...`);

      // Fetch the target block
      const block = await npInfura.eth.getBlock(targetBlockNumber);

      if (!block) {
        throw new Error(
          `Block #${targetBlockNumber} not found on the blockchain`
        );
      }

      if (!block.hash) {
        throw new Error(`Block #${targetBlockNumber} has no hash`);
      }

      const hash = block.hash as string;
      setGeneratedHash(hash);

      // Store for later use
      localStorage.setItem("block-hash-generated", hash);

      console.log("Block hash generated successfully:", hash);

      modal.open({
        title: "Block Hash Generated ✓",
        message: `Successfully fetched hash from block #${targetBlockNumber}\n\n${hash}`,
        type: "success",
      });

      setGenerationError(null);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error generating hash:", error);

      const errorMsg = err?.message || "Failed to generate hash from block";
      setGenerationError(errorMsg);

      modal.open({
        title: "Generation Failed",
        message: errorMsg,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compare hashes and find matches
  const handleFindMatches = async () => {
    if (!guess) {
      modal.open({
        title: "Error",
        message: "No guess data available",
        type: "error",
      });
      return;
    }

    if (!generatedHash) {
      modal.open({
        title: "Missing Data",
        message: "Generate hash first before finding matches",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Comparing hashes...");
      console.log("Generated hash:", generatedHash);
      console.log("Actual hash:", guess.actualHash);
      console.log("Token size:", guess.tokenSize);

      // Call comparison function
      const foundMatches = await compareHexValues(
        generatedHash,
        guess.actualHash,
        guess.tokenSize
      );

      console.log("Matches found:", foundMatches);

      if (!foundMatches || foundMatches.length === 0) {
        modal.open({
          title: "No Matches Found",
          message: `No matching tokens of size ${guess.tokenSize} found between the hashes.`,
          type: "info",
        });
        setMatches([]);
        setShowMatches(true);
        setIsLoading(false);
        return;
      }

      // Format encoded data for Web3 compatibility
      const formattedMatches: MatchToken[] = foundMatches.map((match) => {
        const formattedEncoded = formatEncodedData(match.encoded);
        return {
          ...match,
          encoded: formattedEncoded,
        };
      });

      console.log("Formatted matches:", formattedMatches);

      setMatches(formattedMatches);
      localStorage.setItem("matches", JSON.stringify(formattedMatches));

      modal.open({
        title: "Matches Found! ✓",
        message: `Found ${formattedMatches.length} matching token(s) with size ${guess.tokenSize}`,
        type: "success",
      });

      setShowMatches(true);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error finding matches:", error);

      const errorMsg = err?.message || "Failed to compare hashes";

      modal.open({
        title: "Comparison Failed",
        message: errorMsg,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToMatches = () => {
    if (matches.length === 0) {
      modal.open({
        title: "No Matches",
        message: "Find matches before proceeding to the next step",
        type: "warning",
      });
      return;
    }

    navigate("/matches");
  };

  if (!guess) {
    return (
      <div className="min-h-screen relative bg-cyber-darker">
        <HexGrid />
        <Scanlines />
        <Header
          trail={[{ label: "Home", to: "/home" }, { label: "Seed Data" }]}
          onLogout={() => {
            localStorage.clear();
            window.location.href = "/session";
          }}
        />
        <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-12">
          <CyberCard glow className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-gray-300 font-mono mb-4">
              No guess data found. Please create a guess first.
            </p>
            <CyberButton
              variant="primary"
              onClick={() => navigate("/new-guess")}
            >
              Create New Guess
            </CyberButton>
          </CyberCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-cyber-darker">
      <HexGrid />
      <Scanlines />
      <Header
        trail={[
          { label: "Home", to: "/home" },
          { label: "New Guess", to: "/new-guess" },
          { label: "Seed Data" },
        ]}
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/session";
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-cyan-300 mb-4 cyber-text-glow">
            SEED DATA GENERATION
          </h1>
          <p className="text-gray-200 font-mono">
            Fetch block hash and find matching tokens
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Guess Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-purple-300 mb-4">
                GUESS DETAILS
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
            </div>

            <CyberCard glow>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">
                      Guess ID
                    </p>
                    <p className="font-mono text-lg font-bold text-cyan-300">
                      #{guess.guessId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">
                      Token Size
                    </p>
                    <p className="font-mono text-lg font-bold text-cyan-300">
                      {guess.tokenSize} bytes
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">
                      Target Block
                    </p>
                    <p className="font-mono text-lg font-bold text-cyan-300">
                      #{guess.targetBlockNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">
                      Payment Type
                    </p>
                    <CyberBadge
                      variant={guess.paidGuess ? "success" : "warning"}
                    >
                      {guess.paidGuess ? "PAID" : "FREE"}
                    </CyberBadge>
                  </div>
                </div>

                {/* Hash Information */}
                <div className="pt-4 border-t border-gray-700/30 space-y-3">
                  <div>
                    <p className="text-xs text-gray-300 mb-1 uppercase tracking-wider">
                      Actual Hash (Secret)
                    </p>
                    <p className="font-mono break-all text-sm text-cyan-200 leading-relaxed">
                      {guess.actualHash}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-1 uppercase tracking-wider">
                      User Hash Guess (Public)
                    </p>
                    <p className="font-mono break-all text-sm text-cyan-200 leading-relaxed">
                      {guess.userHashGuess}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-300 mb-1 uppercase tracking-wider">
                      Secret Key
                    </p>
                    <p className="font-mono break-all text-sm text-cyan-200 leading-relaxed">
                      {guess.secretKey}
                    </p>
                  </div>
                </div>
              </div>
            </CyberCard>
          </motion.div>

          {/* Right: Hash Generation & Matching */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-purple-300 mb-4">
                BLOCK HASH GENERATION
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
            </div>

            {/* Generated Hash Display */}
            <CyberCard glow>
              <div className="space-y-4">
                <p className="text-xs text-gray-300 mb-2 uppercase tracking-wider">
                  Generated Block Hash
                </p>

                {generatedHash ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900/60 rounded p-4 border border-green-500/30"
                  >
                    <p className="font-mono break-all text-sm text-green-200 leading-relaxed">
                      {generatedHash}
                    </p>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-3 flex items-center gap-2 text-green-300 text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Hash Generated Successfully
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="bg-gray-900/40 rounded p-4 border border-gray-700/50 text-center">
                    <p className="text-gray-300 font-mono text-sm">
                      Click button below to generate hash from block
                    </p>
                  </div>
                )}

                <CyberButton
                  variant="primary"
                  onClick={handleGenerateHash}
                  disabled={isLoading}
                  icon={<Zap className="w-4 h-4" />}
                  className="w-full"
                >
                  {isLoading ? "Generating..." : "Generate Hash from Block"}
                </CyberButton>

                {generationError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/20 border border-red-500/30 rounded p-3"
                  >
                    <p className="text-red-300 text-xs font-mono">
                      {generationError}
                    </p>
                  </motion.div>
                )}
              </div>
            </CyberCard>

            {/* Matching Section */}
            {generatedHash && (
              <CyberCard glow className="border-cyan-500/50">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-300 mb-3 uppercase tracking-wider">
                      Token Matching
                    </p>
                    <p className="text-sm text-gray-300 mb-4">
                      Find all token sequences of size{" "}
                      <span className="font-bold text-cyan-300">
                        {guess.tokenSize}
                      </span>{" "}
                      that match between:
                    </p>
                    <div className="space-y-2 text-xs font-mono mb-4">
                      <p className="text-gray-400">
                        📍 Generated Hash:{" "}
                        <span className="text-cyan-300">
                          {generatedHash.substring(0, 20)}...
                        </span>
                      </p>
                      <p className="text-gray-400">
                        📍 Actual Hash:{" "}
                        <span className="text-cyan-300">
                          {guess.actualHash.substring(0, 20)}...
                        </span>
                      </p>
                    </div>
                  </div>

                  <CyberButton
                    variant="success"
                    onClick={handleFindMatches}
                    disabled={isLoading}
                    icon={<RefreshCw className="w-4 h-4" />}
                    className="w-full"
                  >
                    {isLoading ? "Comparing..." : "Find Matching Tokens"}
                  </CyberButton>

                  {matches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-900/20 border border-green-500/30 rounded p-4"
                    >
                      <p className="text-green-300 font-mono text-sm mb-2">
                        ✓ Found {matches.length} matching token(s)
                      </p>
                      <p className="text-green-400 text-xs">
                        Ready to proceed to matches page
                      </p>
                    </motion.div>
                  )}
                </div>
              </CyberCard>
            )}
          </motion.div>
        </div>

        {/* Matches Display */}
        <AnimatePresence>
          {showMatches && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div>
                <h3 className="text-2xl font-display font-bold text-green-300 mb-4">
                  FOUND MATCHES ({matches.length})
                </h3>
                <div className="h-1 w-40 bg-gradient-to-r from-green-500 to-cyan-400 rounded-full mb-6" />
              </div>

              {matches.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {matches.map((match, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CyberCard
                        glow
                        className="bg-green-900/10 border-green-500/30"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <h4 className="font-semibold text-green-300">
                              Match #{index + 1}
                            </h4>
                          </div>

                          <div className="bg-gray-900/60 rounded p-3 border border-gray-700/50">
                            <p className="text-xs text-gray-300 mb-1 uppercase tracking-wider">
                              Token Value
                            </p>
                            <p className="font-mono text-sm text-cyan-200 break-all">
                              {match.token}
                            </p>
                          </div>

                          <details className="group">
                            <summary className="cursor-pointer text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-semibold">
                              <span className="group-open:rotate-90 transition-transform inline-block">
                                ▶
                              </span>
                              Encoded Data (Hex)
                            </summary>
                            <div className="mt-2 bg-gray-900/60 rounded p-2 border border-gray-700/50">
                              <p className="font-mono text-xs text-cyan-200 break-all leading-relaxed overflow-x-auto">
                                {match.encoded}
                              </p>
                            </div>
                          </details>

                          <details className="group">
                            <summary className="cursor-pointer text-xs font-mono text-purple-300 hover:text-purple-200 flex items-center gap-1 font-semibold">
                              <span className="group-open:rotate-90 transition-transform inline-block">
                                ▶
                              </span>
                              Match Details
                            </summary>
                            <div className="mt-2 space-y-2 text-xs text-gray-400 font-mono">
                              <div>
                                <p className="text-gray-300">
                                  Hex Range 1:{" "}
                                  <span className="text-cyan-300">
                                    {match.hex1.startByte}-{match.hex1.endByte}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-300">
                                  Hex Range 2:{" "}
                                  <span className="text-cyan-300">
                                    {match.hex2.startByte}-{match.hex2.endByte}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </details>
                        </div>
                      </CyberCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <CyberCard glow className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-gray-300 font-mono text-sm">
                    No matches found between the hashes
                  </p>
                </CyberCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-end pt-8"
        >
          <CyberButton
            variant="secondary"
            onClick={() => navigate("/new-guess")}
            disabled={isLoading}
          >
            Back to Guess
          </CyberButton>

          <CyberButton
            variant="primary"
            onClick={handleProceedToMatches}
            disabled={matches.length === 0 || isLoading}
          >
            Proceed to Matches
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
