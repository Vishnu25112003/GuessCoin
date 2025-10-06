import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle, XCircle, Hash, Cpu, Zap, AlertTriangle, X, Info } from 'lucide-react';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

// Interfaces
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
  txHash?: string;
  gasUsed?: string;
  formattedPayment: string;
  contractBlockNumber?: string;
}

interface MatchResult {
  token: string;
  hex1: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
  hex2: { startByte: number; endByte: number; leftSkip: boolean; rightSkip: boolean };
  encoded: string;
}

interface BlockRangeIndication {
  blockDistance: number;
  indication: 'dark green' | 'light green' | 'light red' | 'dark red';
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

interface AlertMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

const VerifyOffChain: React.FC = () => {
  const { guessId: guessIdFromParams } = useParams<{ guessId: string }>();
  const guessId = parseInt(guessIdFromParams || '1', 10);
  const navigate = useNavigate();
  const { connectedAccount } = useAuth();

  // State from localStorage
  const [targetBlockCount, setTargetBlockCount] = useState(0);
  const [tokenSize, setTokenSize] = useState(0);
  const [paidGuess, setPaidGuess] = useState(false);
  const [complex, setComplex] = useState(false);
  const [actualHash, setActualHash] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [dummyHash, setDummyHash] = useState('');
  const [storedGuessData, setStoredGuessData] = useState<StoredGuessData | null>(null);

  // Component state
  const [targetBlockHash, setTargetBlockHash] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [blockRangeIndication, setBlockRangeIndication] = useState<BlockRangeIndication | null>(null);
  const [complexCalculation, setComplexCalculation] = useState<ComplexCalculation | null>(null);
  const [showComplexCalculation, setShowComplexCalculation] = useState(false);
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);

  // Show alert function
  const showAlert = (type: AlertMessage['type'], title: string, message: string) => {
    setAlertMessage({ type, title, message });
  };

  // Load guess data from localStorage
  useEffect(() => {
    const loadGuessData = () => {
      const account = connectedAccount || localStorage.getItem('currentAccount');
      if (!account) {
        Swal.fire({
          title: 'Error',
          text: 'Please connect your wallet to verify a guess.',
          icon: 'error'
        });
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      let data: StoredGuessData | null = null;
      const storageKey = `guesses/${account}/${guessId}`;
      const storedDataString = localStorage.getItem(storageKey);

      if (storedDataString) {
        try {
          data = JSON.parse(storedDataString);
        } catch (e) {
          console.error('Error parsing specific storage:', e);
        }
      }

      if (!data) {
        const allGuessesRaw = localStorage.getItem('allGuessSubmissions');
        if (allGuessesRaw) {
          try {
            const allGuesses: StoredGuessData[] = JSON.parse(allGuessesRaw);
            data = allGuesses.find((g) => g.guessId === guessId) || null;
          } catch (e) {
            console.error('Error parsing allGuessSubmissions:', e);
          }
        }
      }

      if (!data) {
        const lastGuessRaw = localStorage.getItem('lastGuessSubmission');
        if (lastGuessRaw) {
          try {
            const lastGuess: StoredGuessData = JSON.parse(lastGuessRaw);
            if (lastGuess.guessId === guessId) {
              data = lastGuess;
            }
          } catch (e) {
            console.error('Error parsing lastGuessSubmission:', e);
          }
        }
      }

      if (data) {
        const generatedBlock = data.contractBlockNumber
          ? parseInt(data.contractBlockNumber, 10)
          : data.blockIncrementCount;
        setTargetBlockCount(generatedBlock || 0);
        setTokenSize(data.tokenSize);
        setPaidGuess(data.paymentPaidBet !== '0');
        setComplex(data.complex);
        setActualHash(data.actualHash);
        setSecretKey(data.secretKey);
        setDummyHash(data.dummyHash);
        setStoredGuessData(data);
      } else {
        Swal.fire({
          title: 'Error',
          text: `No verification data found for Guess ID: ${guessId}. Please submit the guess first.`,
          icon: 'error'
        });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    };

    loadGuessData();
  }, [guessId, connectedAccount, navigate]);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3 = new Web3('https://polygon-amoy.infura.io/v3/15817b570c64442b8913e5d031b6ee29');
        setWeb3Instance(web3);
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    };
    initWeb3();
  }, []);

  // Utility functions
  const isValidChar = (hexStr: string): boolean => {
    const cleanHex = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
    return /^[0-9a-fA-F]{64}$/.test(cleanHex);
  };

  const removePrefix = (hexStr: string): string => {
    return hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
  };

  const tokenize = (hexStr: string, tokenSize: number): string[] => {
    const tokens: string[] = [];
    for (let i = 0; i <= hexStr.length - tokenSize; i++) {
      tokens.push(hexStr.slice(i, i + tokenSize));
    }
    return tokens;
  };

  const encodeMatch = (hitHex1: any, hitHex2: any): string => {
    if (!web3Instance) return '';
    return web3Instance.eth.abi.encodeParameters(
      ['uint8', 'uint8', 'bool', 'bool', 'uint8', 'uint8', 'bool', 'bool'],
      [
        hitHex1.startByte,
        hitHex1.endByte,
        hitHex1.leftSkip,
        hitHex1.rightSkip,
        hitHex2.startByte,
        hitHex2.endByte,
        hitHex2.leftSkip,
        hitHex2.rightSkip,
      ]
    );
  };

  const getRandomBlockHash = async (seedHash: string, targetBlockNumber: number) => {
    if (!web3Instance) return null;
    try {
      let cleanSeedHash = removePrefix(seedHash);
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
      console.error('Error getting random block hash:', error);
      return null;
    }
  };

  const calculateBlockRangeIndication = (
    blockDistance: number,
    isComplex: boolean
  ): BlockRangeIndication => {
    let indication: 'dark green' | 'light green' | 'light red' | 'dark red';
    let color: string;
    const limits = isComplex ? [32, 64, 96] : [64, 128, 192];
    if (blockDistance <= limits[0]) {
      indication = 'dark green';
      color = '#10b981';
    } else if (blockDistance <= limits[1]) {
      indication = 'light green';
      color = '#34d399';
    } else if (blockDistance <= limits[2]) {
      indication = 'light red';
      color = '#f87171';
    } else {
      indication = 'dark red';
      color = '#dc2626';
    }
    return { blockDistance, indication, color };
  };

  // MAIN FUNCTION: Fetch Target Hash with Integrated Prefix Comparison
  const handleFetchTargetBlockHash = async () => {
    if (!web3Instance) {
      Swal.fire({
        title: 'Error',
        text: 'Web3 not initialized',
        icon: 'error'
      });
      return;
    }

    if (!targetBlockCount) {
      Swal.fire({
        title: 'Warning',
        text: 'No generated target block available. Please submit a guess first.',
        icon: 'warning'
      });
      return;
    }

    setIsFetching(true);

    try {
      const currentBlockNumber = await web3Instance.eth.getBlockNumber();
      const blockDistance = Number(currentBlockNumber) - targetBlockCount;

      if (blockDistance < 0) {
        Swal.fire({
          title: 'Warning',
          text: "Block couldn't be mined yet. Please wait for the block to be confirmed.",
          icon: 'warning'
        });
        setIsFetching(false);
        return;
      }

      let minedBlockHash = '';

      if (!complex) {
        if (blockDistance > 255) {
          Swal.fire({
            title: 'Error',
            text: `Block distance: ${blockDistance} blocks. Must be within 255 blocks.`,
            icon: 'error'
          });
          setIsFetching(false);
          return;
        }

        const block = await web3Instance.eth.getBlock(targetBlockCount);
        if (block && block.hash) {
          minedBlockHash = block.hash as string;
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Unable to retrieve block hash. Please try again.',
            icon: 'error'
          });
          setIsFetching(false);
          return;
        }
      } else {
        if (blockDistance > 128) {
          Swal.fire({
            title: 'Error',
            text: `Block distance: ${blockDistance} blocks. Must be within 128 blocks for complex mode.`,
            icon: 'error'
          });
          setIsFetching(false);
          return;
        }

        const targetBlock = await web3Instance.eth.getBlock(targetBlockCount);
        if (!targetBlock || !targetBlock.hash) {
          Swal.fire({
            title: 'Error',
            text: 'Unable to retrieve target block hash. Please try again.',
            icon: 'error'
          });
          setIsFetching(false);
          return;
        }

        const randomBlockData = await getRandomBlockHash(targetBlock.hash as string, targetBlockCount);
        if (!randomBlockData) {
          Swal.fire({
            title: 'Error',
            text: 'Unable to retrieve random block hash. Please try again.',
            icon: 'error'
          });
          setIsFetching(false);
          return;
        }

        minedBlockHash = randomBlockData.hash;
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
      setTargetBlockHash(minedBlockHash);

      // PREFIX COMPARISON LOGIC
      const cleanActualHash = removePrefix(actualHash);
      const cleanMinedHash = removePrefix(minedBlockHash);

      const actualHashPrefix = cleanActualHash.substring(0, tokenSize);
      const minedHashPrefix = cleanMinedHash.substring(0, tokenSize);

      console.log('Comparing prefixes:');
      console.log('Actual Hash Prefix:', actualHashPrefix);
      console.log('Mined Hash Prefix:', minedHashPrefix);

      if (actualHashPrefix.toLowerCase() === minedHashPrefix.toLowerCase()) {
        Swal.fire({
          title: 'Success!',
          text: 'Hash prefix match found! Proceeding to on-chain verification.',
          icon: 'success',
          timer: 2000
        });

        navigate(`/verify-onchain/${guessId}`, {
          state: {
            actualHash: cleanActualHash,
            fetchedHash: cleanMinedHash,
            tokenSize,
            targetBlockNumber: targetBlockCount,
            storedGuessData: storedGuessData,
            blockDistance,
            complex
          }
        });
      } else {
        Swal.fire({
          title: 'Verification Failed',
          html: `
            <div style="text-align: left;">
              <p><strong>Hash prefix mismatch detected!</strong></p>
              <p>Expected prefix: <code>${actualHashPrefix}</code></p>
              <p>Received prefix: <code>${minedHashPrefix}</code></p>
              <p>Token Size: ${tokenSize} characters</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'OK'
        });

        showAlert('error', 'No Prefix Match', `Expected: ${actualHashPrefix}, Got: ${minedHashPrefix}`);
      }

    } catch (error) {
      console.error('Error fetching target block hash:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while fetching the target block hash.',
        icon: 'error'
      });
    } finally {
      setIsFetching(false);
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
            hex1: {
              startByte: Math.floor(i / 2),
              endByte: Math.floor((i + size - 1) / 2),
              leftSkip: i % 2 !== 0,
              rightSkip: (i + size) % 2 !== 0,
            },
            hex2: {
              startByte: Math.floor(j / 2),
              endByte: Math.floor((j + size - 1) / 2),
              leftSkip: j % 2 !== 0,
              rightSkip: (j + size) % 2 !== 0,
            },
            encoded: encodeMatch(
              {
                startByte: Math.floor(i / 2),
                endByte: Math.floor((i + size - 1) / 2),
                leftSkip: i % 2 !== 0,
                rightSkip: (i + size) % 2 !== 0,
              },
              {
                startByte: Math.floor(j / 2),
                endByte: Math.floor((j + size - 1) / 2),
                leftSkip: j % 2 !== 0,
                rightSkip: (j + size) % 2 !== 0,
              }
            ),
          });
        }
      });
    });
    return matches;
  };

  const handleVerifyOffChain = async () => {
    if (!targetBlockHash) {
      Swal.fire({
        title: 'Warning',
        text: 'Please fetch the target block hash first before verifying.',
        icon: 'warning'
      });
      return;
    }

    setIsVerifying(true);
    try {
      const foundMatches = await compareHexValues(actualHash, targetBlockHash, tokenSize);
      setMatches(foundMatches);
      if (foundMatches.length > 0) {
        showAlert('success', 'Verification Complete', `Found ${foundMatches.length} pattern match(es)!`);
      } else {
        showAlert('info', 'No Matches', 'No pattern matches found between the hashes.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      showAlert('error', 'Verification Failed', 'An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => navigate('/dashboard');

  const getAlertStyles = (type: AlertMessage['type']) => {
    const IconComponent = type === 'success' ? CheckCircle : type === 'error' ? XCircle : type === 'warning' ? AlertTriangle : Hash;
    const bgClass = type === 'success' ? 'from-emerald-900/40 to-green-900/40' : type === 'error' ? 'from-red-900/40 to-rose-900/40' : type === 'warning' ? 'from-yellow-900/40 to-orange-900/40' : 'from-blue-900/40 to-indigo-900/40';
    const borderClass = type === 'success' ? 'border-emerald-500/50' : type === 'error' ? 'border-red-500/50' : type === 'warning' ? 'border-yellow-500/50' : 'border-blue-500/50';
    const titleColorClass = type === 'success' ? 'text-emerald-300' : type === 'error' ? 'text-red-300' : type === 'warning' ? 'text-yellow-300' : 'text-blue-300';
    const buttonClass = type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : type === 'error' ? 'bg-red-500 hover:bg-red-600' : type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600';
    
    return { 
      IconComponent, 
      bgClass, 
      borderClass, 
      titleColorClass,
      buttonClass 
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 font-mono"
    >
      {/* Animated background elements */}
      <div className="gc-geometric-bg" aria-hidden="true"></div>
      <div className="gc-dots-pattern" aria-hidden="true"></div>
      <div className="gc-floating-elements" aria-hidden="true">
        <div className="gc-float-circle"></div>
        <div className="gc-float-square"></div>
        <div className="gc-float-triangle"></div>
      </div>

      {/* Alert Modal */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setAlertMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-gradient-to-br ${getAlertStyles(alertMessage.type).bgClass} backdrop-blur-xl rounded-lg p-6 max-w-md w-full border ${getAlertStyles(alertMessage.type).borderClass} shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {React.createElement(getAlertStyles(alertMessage.type).IconComponent, {
                    size: 24,
                    className: `${getAlertStyles(alertMessage.type).titleColorClass} mr-3`
                  })}
                  <h3 className={`text-lg font-bold ${getAlertStyles(alertMessage.type).titleColorClass}`}>
                    {alertMessage.title}
                  </h3>
                </div>
                <button
                  onClick={() => setAlertMessage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-200 mb-6">{alertMessage.message}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className={`px-6 py-2 rounded-lg font-semibold ${getAlertStyles(alertMessage.type).buttonClass} text-white transition-colors w-full`}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 relative z-10">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          Off-Chain Hash Verification
        </h1>
        <p className="text-gray-300">Verify your guess against the blockchain</p>
      </div>

      {/* Main Content - NEW LAYOUT */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Row: Guess Info (Full Width) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Info size={20} className="text-blue-400" />
            Guess Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Guess ID</p>
              <p className="text-xl font-bold text-white">#{guessId}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Target Block</p>
              <p className="text-xl font-bold text-white">
                {targetBlockCount ? targetBlockCount.toLocaleString() : '...'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Token Size</p>
              <p className="text-xl font-bold text-white">{tokenSize}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Type</p>
              <div className="flex justify-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${paidGuess ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {paidGuess ? '💰' : '🆓'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${complex ? 'bg-red-500/20 text-red-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                  {complex ? '🔥' : '⚡'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Buttons */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" />
                Verification Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleFetchTargetBlockHash}
                  disabled={isFetching || !web3Instance}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
                >
                  {isFetching ? (
                    <>
                      <Zap className="animate-spin" size={24} />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search size={24} />
                      Fetch Target Hash
                    </>
                  )}
                </button>
                <button
                  onClick={handleVerifyOffChain}
                  disabled={isVerifying || !targetBlockHash}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
                >
                  {isVerifying ? (
                    <>
                      <CheckCircle className="animate-spin" size={24} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} />
                      Verify Patterns
                    </>
                  )}
                </button>
              </div>
            </motion.section>

            {/* Mined Block Hash Result */}
            {targetBlockHash && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Search size={20} className="text-blue-400" />
                  Fetched Target Block Hash
                </h2>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-sm text-gray-200 overflow-x-auto border border-blue-500/30">
                  {targetBlockHash}
                </div>
                
                {/* Block Range Indication */}
                {blockRangeIndication && (
                  <div className="mt-4 p-4 rounded-lg border" style={{ 
                    backgroundColor: `${blockRangeIndication.color}10`,
                    borderColor: `${blockRangeIndication.color}40`
                  }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Block Distance</p>
                        <p className="text-xl font-bold text-white">{blockRangeIndication.blockDistance} blocks</p>
                      </div>
                      <span 
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${blockRangeIndication.color}30`,
                          color: blockRangeIndication.color,
                          border: `1px solid ${blockRangeIndication.color}50`
                        }}
                      >
                        {blockRangeIndication.indication}
                      </span>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* Complex Calculation Details */}
            {showComplexCalculation && complexCalculation && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
              >
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu size={20} className="text-orange-400" />
                  Complex Mode Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Target Block</p>
                    <p className="text-white font-mono font-bold">{complexCalculation.targetBlockNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Random Block</p>
                    <p className="text-white font-mono font-bold">{complexCalculation.randomBlockNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Byte Hex</p>
                    <p className="text-white font-mono font-bold">{complexCalculation.byteHex}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Adjusted Position</p>
                    <p className="text-white font-mono font-bold">{complexCalculation.adjustedRanBlockPos}</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Matches Found */}
            {matches.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
              >
                <h2 className="text-xl font-semibold text-white mb-4">
                  Pattern Matches Found ({matches.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matches.map((match, index) => (
                    <div key={index} className="bg-black/30 p-4 rounded-lg border border-green-500/30">
                      <p className="text-green-300 font-mono text-sm mb-2">✓ Token: {match.token}</p>
                      <p className="text-gray-400 font-mono text-xs break-all">
                        Encoded: {match.encoded}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column (1/3 width) - Hash Details */}
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Hash size={20} className="text-purple-400" />
                Hash Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-xs mb-2">Actual Hash</p>
                  <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-gray-200 overflow-x-auto break-all">
                    {actualHash || 'N/A'}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">Secret Key</p>
                  <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-gray-200 overflow-x-auto break-all">
                    {secretKey || 'N/A'}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-2">Dummy Hash</p>
                  <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-gray-200 overflow-x-auto break-all">
                    {dummyHash || 'N/A'}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyOffChain;
