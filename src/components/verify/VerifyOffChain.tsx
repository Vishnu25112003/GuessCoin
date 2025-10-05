import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import { useAuth } from "../../context/AuthContext";

// Interface for data stored in localStorage
interface StoredGuessData {
  Sno: number;
  blockIncrementCount: number;
  blockHashGuess: string;
  tokenSize: number;
  paymentPaidBet: string;
  overWrite: boolean;
  complex: boolean;
  dummyHash: string;
  actualHash: string;
  secretKey: string;
  guessId: number;
  tokens: string[];
  timestamp: number;
}

// Interfaces for component logic
interface MatchResult {
  token: string;
  hex1: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean; };
  hex2: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean; };
  encoded: string;
}

interface BlockRangeIndication {
  blockDistance: number;
  indication: "dark green" | "light green" | "light red" | "dark red";
  color: string;
}

interface ComplexCalculation {
  targetBlockNumber: number;
  targetBlockHash: string;
  byteHex: string;
  adjustedRanBlockPos: number;
  randomBlockNumber: number;
  randomBlockHash: string;
}

const GuessInfo: React.FC = () => {
  const { guessId: guessIdFromParams } = useParams<{ guessId: string }>();
  const guessId = parseInt(guessIdFromParams || "1", 10);
  const navigate = useNavigate();
  const { connectedAccount } = useAuth();

  // State now initialized empty, to be filled from localStorage
  const [targetBlockCount, setTargetBlockCount] = useState(0);
  const [tokenSize, setTokenSize] = useState(0);
  const [paidGuess, setPaidGuess] = useState(false);
  const [complex, setComplex] = useState(false);
  const [actualHash, setActualHash] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [dummyHash, setDummyHash] = useState("");

  // Component-specific state
  const [generatedHash, setGeneratedHash] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [blockRangeIndication, setBlockRangeIndication] = useState<BlockRangeIndication | null>(null);
  const [complexCalculation, setComplexCalculation] = useState<ComplexCalculation | null>(null);
  const [showComplexCalculation, setShowComplexCalculation] = useState(false);

  // Load guess data from localStorage
  useEffect(() => {
    const loadGuessData = () => {
      const account = connectedAccount || localStorage.getItem("currentAccount");
      if (!account) {
        alert("Wallet not connected. Please connect your wallet to verify a guess.");
        navigate('/dashboard');
        return;
      }
      const storageKey = `guesses/${account}/${guessId}`;
      const storedDataString = localStorage.getItem(storageKey);

      if (storedDataString) {
        const data: StoredGuessData = JSON.parse(storedDataString);
        setTargetBlockCount(data.blockIncrementCount);
        setTokenSize(data.tokenSize);
        setPaidGuess(data.paymentPaidBet !== '0');
        setComplex(data.complex);
        setActualHash(data.actualHash);
        setSecretKey(data.secretKey);
        setDummyHash(data.dummyHash);
      } else {
        alert(`No verification data found for Guess ID: ${guessId}. Please submit the guess first.`);
        navigate('/dashboard');
      }
    };
    loadGuessData();
  }, [guessId, connectedAccount, navigate]);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3 = new Web3("https://polygon-amoy.infura.io/v3/15817b570c64442b8913e5d031b6ee29");
        setWeb3Instance(web3);
      } catch (error) {
        console.error("Error initializing Web3:", error);
      }
    };
    initWeb3();
  }, []);
  
  // --- All your utility and handler functions remain here (isValidChar, removePrefix, etc.) ---
  
  const isValidChar = (hexStr: string): boolean => {
    const cleanHex = hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
    return /^[0-9a-fA-F]{64}$/.test(cleanHex);
  };

  const removePrefix = (hexStr: string): string => {
    return hexStr.startsWith("0x") ? hexStr.slice(2) : hexStr;
  };

  const tokenize = (hexStr: string, tokenSize: number): string[] => {
    const tokens: string[] = [];
    for (let i = 0; i <= hexStr.length - tokenSize; i++) {
      tokens.push(hexStr.slice(i, i + tokenSize));
    }
    return tokens;
  };

  const encodeMatch = (hitHex1: any, hitHex2: any): string => {
    if (!web3Instance) return "";
    return web3Instance.eth.abi.encodeParameters(
      ["uint8", "uint8", "bool", "bool", "uint8", "uint8", "bool", "bool"],
      [
        hitHex1.startByte,
        hitHex1.endByte,
        hitHex1.leftSkip,
        hitHex1.rightSkip,
        hitHex2.startByte,
        hitHex2.endByte,
        hitHex2.leftSkip,
        hitHex2.rightSkip,
      ],
    );
  };

  const getRandomBlockHash = async (
    seedHash: string,
    targetBlockNumber: number,
  ) => {
    if (!web3Instance) return null;
    try {
      let cleanSeedHash = seedHash.startsWith("0x") ? seedHash.slice(2) : seedHash;
      const byteHex = cleanSeedHash.slice(30, 32);
      const ranBlockPos = parseInt(byteHex, 16);
      let adjustedRanBlockPos = ranBlockPos;
      if (adjustedRanBlockPos > 127) {
        adjustedRanBlockPos = Math.floor(adjustedRanBlockPos / 2);
      }
      const randomBlockNumber = targetBlockNumber - adjustedRanBlockPos;
      const block = await web3Instance.eth.getBlock(randomBlockNumber);
      if (block && block.hash) {
        return {
          hash: block.hash as string,
          byteHex,
          adjustedRanBlockPos,
          randomBlockNumber,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting random block hash:", error);
      return null;
    }
  };

  const calculateBlockRangeIndication = (
    blockDistance: number,
    isComplex: boolean,
  ): BlockRangeIndication => {
    let indication: "dark green" | "light green" | "light red" | "dark red";
    let color: string;
    const limits = isComplex ? [32, 64, 96] : [64, 128, 192];
    if (blockDistance <= limits[0]) {
      indication = "dark green";
      color = "#006400";
    } else if (blockDistance <= limits[1]) {
      indication = "light green";
      color = "#90EE90";
    } else if (blockDistance <= limits[2]) {
      indication = "light red";
      color = "#FF7F7F";
    } else {
      indication = "dark red";
      color = "#8B0000";
    }
    return { blockDistance, indication, color };
  };

  const handleFetchHash = async () => {
    if (!web3Instance) {
      alert("Web3 not initialized");
      return;
    }
    setIsGenerating(true);
    try {
      const currentBlockNumber = await web3Instance.eth.getBlockNumber();
      const blockDistance = Number(currentBlockNumber) - targetBlockCount;
      if (blockDistance < 0) {
        alert("Block yet to be mined");
        setIsGenerating(false);
        return;
      }
      let targetBlockHash = "";
      if (!complex) {
        if (blockDistance > 255) {
          alert(`Block out of range. Block Distance: ${blockDistance}`);
          setIsGenerating(false);
          return;
        }
        const block = await web3Instance.eth.getBlock(targetBlockCount);
        if (block && block.hash) {
          targetBlockHash = block.hash as string;
        } else {
          alert("Block hash retrieve issue");
          setIsGenerating(false);
          return;
        }
      } else {
        if (blockDistance > 128) {
          alert(`Block out of range. Block Distance: ${blockDistance}`);
          setIsGenerating(false);
          return;
        }
        const targetBlock = await web3Instance.eth.getBlock(targetBlockCount);
        if (!targetBlock || !targetBlock.hash) {
          alert("Target block hash retrieve issue");
          setIsGenerating(false);
          return;
        }
        const randomBlockData = await getRandomBlockHash(targetBlock.hash as string, targetBlockCount);
        if (!randomBlockData) {
          alert("Random block hash retrieve issue");
          setIsGenerating(false);
          return;
        }
        targetBlockHash = randomBlockData.hash;
        setComplexCalculation({
          targetBlockNumber: targetBlockCount,
          targetBlockHash: targetBlock.hash as string,
          byteHex: randomBlockData.byteHex,
          adjustedRanBlockPos: randomBlockData.adjustedRanBlockPos,
          randomBlockNumber: randomBlockData.randomBlockNumber,
          randomBlockHash: randomBlockData.hash,
        });
        setShowComplexCalculation(true);
      }
      setBlockRangeIndication(calculateBlockRangeIndication(blockDistance, complex));
      setGeneratedHash(targetBlockHash);
    } catch (error) {
      console.error("Error fetching hash:", error);
      alert("Error fetching blockchain hash");
    } finally {
      setIsGenerating(false);
    }
  };

  const compareHexValues = async (hex1: string, hex2: string, size: number): Promise<MatchResult[]> => {
    const cleanHex1 = removePrefix(hex1.toLowerCase());
    const cleanHex2 = removePrefix(hex2.toLowerCase());
    if (!isValidChar(cleanHex1) || !isValidChar(cleanHex2)) return [];
    if (size < 3 || size > 64) return [];

    const tokens1 = tokenize(cleanHex1, size);
    const tokens2 = tokenize(cleanHex2, size);
    const matches: MatchResult[] = [];
    tokens1.forEach((token1, i) => {
      tokens2.forEach((token2, j) => {
        if (token1 === token2) {
          matches.push({
            token: token1,
            hex1: { startByte: Math.floor(i / 2), endByte: Math.floor((i + size - 1) / 2), leftSkip: i / 2 !== 0, rightSkip: (i + size) / 2 !== 0 },
            hex2: { startByte: Math.floor(j / 2), endByte: Math.floor((j + size - 1) / 2), leftSkip: j / 2 !== 0, rightSkip: (j + size) / 2 !== 0 },
            encoded: encodeMatch({ startByte: Math.floor(i / 2), endByte: Math.floor((i + size - 1) / 2), leftSkip: i / 2 !== 0, rightSkip: (i + size) / 2 !== 0 }, { startByte: Math.floor(j / 2), endByte: Math.floor((j + size - 1) / 2), leftSkip: j / 2 !== 0, rightSkip: (j + size) / 2 !== 0 }),
          });
        }
      });
    });
    return matches;
  };

  const handleVerifyOffChain = async () => {
    if (!generatedHash) {
      alert("Please generate hash first");
      return;
    }
    setIsVerifying(true);
    try {
      const foundMatches = await compareHexValues(actualHash, generatedHash, tokenSize);
      setMatches(foundMatches);
      alert(foundMatches.length > 0 ? `✅ Verification Complete! Found ${foundMatches.length} pattern match(es)!` : "❌ No pattern matches found");
    } catch (error) {
      console.error("Verification error:", error);
      alert(`Verification failed: ${error}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => navigate("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            Hash Pattern Verification
          </h1>
          <p className="text-lg text-gray-300">Off-Chain Blockchain Hash Matching System</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <span className="text-gray-400 text-sm">Guess ID</span>
              <div className="text-2xl font-bold text-white mt-1">#{guessId}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <span className="text-gray-400 text-sm">Target Block</span>
              <div className="text-2xl font-bold text-white mt-1">{targetBlockCount.toLocaleString()}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <span className="text-gray-400 text-sm">Token Size</span>
              <div className="text-2xl font-bold text-white mt-1">{tokenSize} chars</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <span className="text-gray-400 text-sm">Mode</span>
              <div className="text-2xl font-bold text-white mt-1">{complex ? "Complex" : "Simple"} / {paidGuess ? "Paid" : "Free"}</div>
            </div>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="mb-2 font-semibold">Actual Hash</div>
              <div className="font-mono break-all select-all">{actualHash}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="mb-2 font-semibold">Secret Key</div>
              <div className="font-mono break-all select-all">{secretKey}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
              <div className="mb-2 font-semibold">Dummy Hash</div>
              <div className="font-mono break-all select-all">{dummyHash}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={handleFetchHash} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200">
              {isGenerating ? "Fetching..." : "Fetch Generated Hash"}
            </button>
            <button onClick={handleVerifyOffChain} disabled={isVerifying || !generatedHash} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200">
              {isVerifying ? "Verifying..." : "Verify Off-Chain"}
            </button>
            <button onClick={handleBack} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200">
              Back
            </button>
          </div>
          
          {/* --- Results and other UI sections remain here --- */}
          {generatedHash && (
            <div className="mt-6 p-4 rounded-lg bg-white/10 font-mono break-all select-all">
                <h2 className="font-semibold mb-1">Blockchain Hash Retrieved</h2>
                {generatedHash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessInfo;
