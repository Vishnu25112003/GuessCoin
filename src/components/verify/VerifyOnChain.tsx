import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Hash, DollarSign, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { database } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { LOGIC_CONTRACT_ABI } from '../../config/contracts';

interface StoredGuessData {
  Sno: number;
  guessId: number;
  secretKey: string;
  actualHash: string;
  tokenSize: number;
  paymentPaidBet: string;
  complex: boolean;
  contractBlockNumber?: string;
  dummyHash?: string;
}

interface LocationState {
  actualHash: string;
  fetchedHash: string;
  tokenSize: number;
  targetBlockNumber: number;
  storedGuessData: StoredGuessData;
  blockDistance: number;
  complex: boolean;
}

const VerifyOnChain: React.FC = () => {
  const { guessId: guessIdFromParams } = useParams<{ guessId: string }>();
  const guessId = parseInt(guessIdFromParams || '1', 10);
  const navigate = useNavigate();
  const location = useLocation();
  const { connectedAccount, isConnected, getWalletProvider } = useAuth();

  const [actualHash, setActualHash] = useState('');
  const [fetchedHash, setFetchedHash] = useState('');
  const [tokenSize, setTokenSize] = useState(0);
  const [targetBlockNumber, setTargetBlockNumber] = useState(0);
  const [storedGuessData, setStoredGuessData] = useState<StoredGuessData | null>(null);
  const [blockDistance, setBlockDistance] = useState(0);
  const [complex, setComplex] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    const state = location.state as LocationState;
    if (state) {
      setActualHash(state.actualHash);
      setFetchedHash(state.fetchedHash);
      setTokenSize(state.tokenSize);
      setTargetBlockNumber(state.targetBlockNumber);
      setStoredGuessData(state.storedGuessData);
      setBlockDistance(state.blockDistance);
      setComplex(state.complex);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No match data found. Redirecting to off-chain verification.',
        icon: 'error'
      });
      navigate(`/verify-offchain/${guessId}`);
    }
  }, [location, guessId, navigate]);

  // FIXED: Claim reward function with corrected gas type (string)
  const claimReward = async () => {
    if (!isConnected || !connectedAccount || !storedGuessData || !getWalletProvider) {
      Swal.fire({
        title: 'Error',
        text: 'Wallet not connected or no guess data available.',
        icon: 'error'
      });
      return;
    }

    setIsClaiming(true);
    setClaimStatus('');

    try {
      const provider = getWalletProvider();
      const web3 = new Web3(provider);
      
      // Get logic contract address from localStorage (from original)
      const logicCrtAddress = localStorage.getItem('logicCrtAddress');
      if (!logicCrtAddress || logicCrtAddress === '0x') {
        throw new Error('Logic contract address not found');
      }

      const logicContract = new web3.eth.Contract(LOGIC_CONTRACT_ABI as any, logicCrtAddress);

      const accounts = await web3.eth.getAccounts();
      
      // Estimate gas
      const estimatedGas = await logicContract.methods.claimReward(
        storedGuessData.Sno,
        storedGuessData.guessId,
        storedGuessData.secretKey,
        '0x' + actualHash,
        BigInt(targetBlockNumber),
        storedGuessData.tokenSize
      ).estimateGas({ from: accounts[0] });

      // FIXED: Convert to string for Web3 gas parameter
      const adjustedGas = String(Number(BigInt(estimatedGas) * 200n / 100n));

      // Send transaction with gas as string
      const receipt = await logicContract.methods.claimReward(
        storedGuessData.Sno,
        storedGuessData.guessId,
        storedGuessData.secretKey,
        '0x' + actualHash,
        BigInt(targetBlockNumber),
        storedGuessData.tokenSize
      ).send({ 
        from: accounts[0],
        gas: adjustedGas // Now properly typed as string
      });

      if (receipt.transactionHash) {
        setTxHash(receipt.transactionHash);
        
        // Update localStorage
        const updatedData = { 
          ...storedGuessData, 
          txHash: receipt.transactionHash, 
          gasUsed: receipt.gasUsed?.toString() 
        };
        localStorage.setItem(`guesses/${connectedAccount}/${guessId}`, JSON.stringify(updatedData));
        setStoredGuessData(updatedData);

        // Listen for Firebase updates
        const guessRef = ref(database, `guesses/${connectedAccount}/${guessId}`);
        const unsubscribe = onValue(guessRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.status === 'verified') {
            setClaimStatus('Reward claimed and verified on-chain!');
            Swal.fire({
              title: 'Success!',
              text: 'Reward claimed successfully! Check your wallet.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            unsubscribe();
          }
        });

        setClaimStatus('Transaction successful! Awaiting on-chain verification.');
        Swal.fire({
          title: 'Transaction Sent',
          text: 'Your claim transaction has been submitted. Please wait for confirmation.',
          icon: 'info',
          timer: 3000
        });
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      let msg = 'Claim failed.';
      if (error.code === 4001) {
        msg = 'User rejected the transaction';
      } else if (error.message) {
        msg = error.message;
      }
      setClaimStatus(`Error: ${msg}`);
      Swal.fire({
        title: 'Claim Failed',
        text: msg,
        icon: 'error'
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleBack = () => navigate('/dashboard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-4 font-mono"
    >
      {/* Animated background */}
      <div className="gc-geometric-bg" aria-hidden="true"></div>
      <div className="gc-dots-pattern" aria-hidden="true"></div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 relative z-10">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">
          On-Chain Verification & Reward Claim
        </h1>
        <p className="text-gray-300">Prefix match confirmed. Proceed to claim your reward.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Left Column: Compared Hashes Display */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl space-y-6"
        >
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Hash size={24} className="text-green-400" />
            Compared Hashes (Prefix Match)
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-400" />
                Actual Hash Prefix ({tokenSize} chars)
              </p>
              <div className="bg-green-500/10 p-4 rounded-lg font-mono text-sm border border-green-500/30 text-green-300 overflow-x-auto">
                {actualHash.substring(0, tokenSize)}
                <span className="text-gray-500">...</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-400" />
                Fetched Target Hash Prefix ({tokenSize} chars)
              </p>
              <div className="bg-blue-500/10 p-4 rounded-lg font-mono text-sm border border-blue-500/30 text-blue-300 overflow-x-auto">
                {fetchedHash.substring(0, tokenSize)}
                <span className="text-gray-500">...</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-300 font-medium">Match Confirmed!</p>
              <p className="text-gray-400 text-sm mt-1">Target Block: {targetBlockNumber}</p>
              <p className="text-gray-400 text-sm">Block Distance: {blockDistance}</p>
            </div>
          </div>

          {/* Full Hashes Display */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-gray-400 text-sm mb-2">Full Actual Hash</p>
              <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
                {actualHash}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Full Fetched Hash</p>
              <div className="bg-black/30 p-3 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
                {fetchedHash}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Right Column: Claim Reward and Details */}
        <div className="space-y-6">
          {/* Claim Reward Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign size={24} className="text-yellow-400" />
              Claim Reward
            </h2>
            <button
              onClick={claimReward}
              disabled={isClaiming || !isConnected || !storedGuessData}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isClaiming ? (
                <>
                  <Zap className="animate-spin" size={20} />
                  Claiming Reward...
                </>
              ) : (
                <>
                  <DollarSign size={20} />
                  Claim Reward Now
                </>
              )}
            </button>
            
            {claimStatus && (
              <div className={`mt-4 p-4 rounded-lg ${
                claimStatus.includes('Error') || claimStatus.includes('Failed')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-green-500/10 border border-green-500/30 text-green-300'
              }`}>
                {claimStatus.includes('Error') ? (
                  <AlertTriangle size={20} className="inline mr-2" />
                ) : (
                  <CheckCircle size={20} className="inline mr-2" />
                )}
                {claimStatus}
              </div>
            )}

            {txHash && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Transaction Hash</p>
                <a
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1"
                >
                  {txHash.substring(0, 20)}...
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {!isConnected && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-blue-300 text-sm">Connect your wallet to claim the reward.</p>
              </div>
            )}
          </motion.section>

          {/* Guess Details Section */}
          {storedGuessData && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Guess Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Guess ID</p>
                  <p className="text-white font-bold">#{storedGuessData.guessId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Token Size</p>
                  <p className="text-white font-bold">{storedGuessData.tokenSize}</p>
                </div>
                <div>
                  <p className="text-gray-400">Paid Bet</p>
                  <p className="text-white font-bold">
                    {storedGuessData.paymentPaidBet !== '0' ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Complex Mode</p>
                  <p className="text-white font-bold">{complex ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 mb-2">Secret Key</p>
                  <div className="bg-black/30 p-2 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                    {storedGuessData.secretKey}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyOnChain;
