// src/hooks/useUserContract.ts
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '../config/contracts';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const useUserContract = (userAddress: string | null) => {
  const [logicContractAddress, setLogicContractAddress] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserContract = async () => {
      if (!userAddress || !window.ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const web3 = new Web3(window.ethereum);
        const tokenContract = new web3.eth.Contract(
          TOKEN_CONTRACT_ABI,
          TOKEN_CONTRACT_ADDRESS
        );

        // 🔥 FIX: Properly type the response
        const isActiveResult = await tokenContract.methods
          .isUserActive()
          .call({ from: userAddress });

        // Convert to boolean properly
        const isActive = Boolean(isActiveResult);
        setIsRegistered(isActive);

        if (isActive) {
          // Get LogicContract address
          const logicAddressResult = await tokenContract.methods
            .getLogicAddress()
            .call({ from: userAddress });

          // Convert to string properly
          const logicAddress = String(logicAddressResult);
          setLogicContractAddress(logicAddress);
          
          // Sync with localStorage
          const storedAddress = localStorage.getItem('logicCrtAddress');
          if (storedAddress !== logicAddress) {
            console.warn('⚠️ LogicContract mismatch detected - syncing...');
            localStorage.setItem('logicCrtAddress', logicAddress);
          }

          console.log('✅ User Contract Info:');
          console.log('   - Registered:', isActive);
          console.log('   - LogicContract:', logicAddress);
        } else {
          setLogicContractAddress(null);
          console.log('⚠️ User not registered');
        }

        setError(null);
      } catch (err) {
        console.error('❌ Error checking user contract:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsRegistered(false);
        setLogicContractAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserContract();
  }, [userAddress]);

  return {
    logicContractAddress,
    isRegistered,
    isLoading,
    error,
  };
};
