// src/context/AuthProvider.tsx
import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { ref, set } from 'firebase/database';
import { toast } from 'react-toastify';
import { database } from '../config/firebase';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '../config/contracts';
import { POLYGON_AMOY_TESTNET } from '../config/networks';
import { AuthContext, type WalletInfo, type AuthContextType } from './AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Helper functions for type conversion
  const toSafeString = (value: unknown): string => {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  // NEW: Function to get the registered wallet's provider
  const getWalletProvider = useCallback(() => {
    if (!selectedWallet?.provider) {
      console.error('No wallet provider available');
      toast.error('No wallet connected. Please connect your wallet first.');
      return null;
    }
    return selectedWallet.provider;
  }, [selectedWallet]);

  // Detect wallets using EIP-6963
  useEffect(() => {
    const handleAnnounceProvider = (event: CustomEvent) => {
      const { info, provider } = event.detail;
      setWallets((prev) => {
        if (prev.some((w) => w.uuid === info.uuid)) return prev;
        return [
          ...prev,
          {
            name: info.name,
            uuid: info.uuid,
            rdns: info.rdns,
            provider,
            icon: info.icon,
          },
        ];
      });
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider);
    };
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedRdns = localStorage.getItem('selectedWalletRdns');
      const storedAccount = localStorage.getItem('currentAccount');
      const isAuth = localStorage.getItem('auth');

      if (!storedRdns || !storedAccount || isAuth !== 'true') return;

      const handleProviderAnnouncement = (event: CustomEvent) => {
        const { info, provider } = event.detail;
        if (info.rdns === storedRdns) {
          const walletInfo: WalletInfo = {
            name: info.name,
            uuid: info.uuid,
            rdns: info.rdns,
            provider,
            icon: info.icon,
          };
          setSelectedWallet(walletInfo);
          setConnectedAccount(storedAccount);
          console.log(`✅ Session restored with ${info.name}`);
          window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
        }
      };

      window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement);
      window.dispatchEvent(new Event('eip6963:requestProvider'));

      setTimeout(() => {
        window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement);
      }, 3000);
    };

    restoreSession();
  }, []);

  const connectWallet = useCallback(async (wallet: WalletInfo) => {
    setIsLoading(true);
    setStatusMessage('Connecting to wallet...');

    try {
      if (!wallet.provider) {
        throw new Error('Wallet provider not available');
      }

      const accounts = await wallet.provider.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setSelectedWallet(wallet);
      setConnectedAccount(accounts[0]);
      localStorage.setItem('selectedWalletRdns', wallet.rdns);
      
      setStatusMessage(`Connected to ${wallet.name}`);
      toast.success(`Connected to ${wallet.name}`);
      
    } catch (error: unknown) {
      console.error('Connection error:', error);
      toast.error((error as Error).message || 'Failed to connect wallet');
      setStatusMessage('Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // FIXED: Disconnect wallet with proper navigation
  const disconnectWallet = useCallback(async () => {
    console.log('🔴 Starting disconnect process...');
    
    try {
      setIsLoading(true);
      setStatusMessage('Disconnecting wallet...');

      // Try wallet-specific disconnect methods
      if (selectedWallet?.provider) {
        try {
          const walletName = selectedWallet.name.toLowerCase();
          
          // MetaMask
          if (walletName.includes('metamask')) {
            try {
              await selectedWallet.provider.request({
                method: 'wallet_revokePermissions',
                params: [{ eth_accounts: {} }]
              });
              console.log('✅ MetaMask permissions revoked');
            } catch (e: unknown) {
              console.log('⚠️ MetaMask revoke failed:', (e as Error).message);
            }
          }
          // Coinbase Wallet
          else if (walletName.includes('coinbase')) {
            try {
              if (selectedWallet.provider.disconnect) {
                await selectedWallet.provider.disconnect();
                console.log('✅ Coinbase Wallet disconnected');
              }
            } catch (e: unknown) {
              console.log('⚠️ Coinbase disconnect failed:', (e as Error).message);
            }
          }
          // WalletConnect
          else if (walletName.includes('walletconnect')) {
            try {
              if (selectedWallet.provider.disconnect) {
                await selectedWallet.provider.disconnect();
                console.log('✅ WalletConnect disconnected');
              }
            } catch (e: unknown) {
              console.log('⚠️ WalletConnect disconnect failed:', (e as Error).message);
            }
          }
        } catch {
          console.log('⚠️ Wallet disconnect attempt failed, continuing with cleanup');
        }
      }

      // Clear React state
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage('');

      // Clear all localStorage
      localStorage.removeItem('selectedWalletRdns');
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('logicCrtAddress');
      localStorage.removeItem('auth');
      
      // Clear WalletConnect storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('wc@2:') || key.startsWith('@walletconnect/') || key.startsWith('walletconnect')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('✅ All local data cleared');
      toast.success('Wallet disconnected successfully');
      
      // FIXED: Navigate to /wallet instead of /
      navigate('/wallet', { replace: true });
      
    } catch (error: unknown) {
      console.error('❌ Disconnect error:', error);
      
      // Even on error, clear everything and navigate
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage('');
      localStorage.clear();
      sessionStorage.clear();
      
      toast.warning('Disconnected with errors - all data cleared');
      navigate('/wallet', { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, navigate]);

  const checkAndSwitchNetwork = useCallback(async (provider: unknown): Promise<boolean> => {
    try {
      const web3 = new Web3(provider);
      const chainId = await web3.eth.getChainId();
      const expectedChainId = parseInt(POLYGON_AMOY_TESTNET.chainId, 16);

      if (Number(chainId) !== expectedChainId) {
        setStatusMessage('Wrong network. Switching to Polygon Amoy...');
        
        try {
          await (provider as { request: (params: unknown) => Promise<unknown> }).request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
          });
          toast.success('Switched to Polygon Amoy Testnet');
          return true;
        } catch (switchError: unknown) {
          if ((switchError as { code?: number }).code === 4902) {
            await (provider as { request: (params: unknown) => Promise<unknown> }).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: POLYGON_AMOY_TESTNET.chainId,
                chainName: POLYGON_AMOY_TESTNET.chainName,
                nativeCurrency: POLYGON_AMOY_TESTNET.nativeCurrency,
                rpcUrls: POLYGON_AMOY_TESTNET.rpcUrls,
                blockExplorerUrls: POLYGON_AMOY_TESTNET.blockExplorerUrls,
              }],
            });
            toast.success('Network added and switched');
            return true;
          }
          throw switchError;
        }
      }
      return true;
    } catch (error: unknown) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
      return false;
    }
  }, []);

  const handleLogin = useCallback(async () => {
    if (!selectedWallet || !connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Logging in...');

    try {
      const provider = getWalletProvider();
      if (!provider) return;

      const networkSwitched = await checkAndSwitchNetwork(provider);
      if (!networkSwitched) {
        setIsLoading(false);
        return;
      }

      const web3 = new Web3(provider);
      const tokenContract = new web3.eth.Contract(
        TOKEN_CONTRACT_ABI as unknown[],
        TOKEN_CONTRACT_ADDRESS
      );

      const isActive = await tokenContract.methods
        .isUserActive()
        .call({ from: connectedAccount });

      if (!isActive) {
        toast.error('Not a registered wallet address');
        setIsLoading(false);
        return;
      }

      const logicAddressResult = await tokenContract.methods
        .getLogicAddress()
        .call({ from: connectedAccount });

      const logicAddress = toSafeString(logicAddressResult);

      if (logicAddress === '0x0000000000000000000000000000000000000000' || logicAddress === '0x') {
        toast.error('No logic contract found for this wallet');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('currentAccount', connectedAccount);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      toast.error((error as Error).message || 'Login failed');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [selectedWallet, connectedAccount, checkAndSwitchNetwork, navigate, getWalletProvider]);

  const handleRegister = useCallback(async () => {
    if (!selectedWallet || !connectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Registering...');

    try {
      const provider = getWalletProvider();
      if (!provider) return;

      const networkSwitched = await checkAndSwitchNetwork(provider);
      if (!networkSwitched) {
        setIsLoading(false);
        return;
      }

      const web3 = new Web3(provider);
      const tokenContract = new web3.eth.Contract(
        TOKEN_CONTRACT_ABI as unknown[],
        TOKEN_CONTRACT_ADDRESS
      );

      const isActive = await tokenContract.methods
        .isUserActive()
        .call({ from: connectedAccount });

      if (isActive) {
        toast.info('Already registered. Redirecting to login...');
        await handleLogin();
        return;
      }

      toast.info('Creating user... Please confirm the transaction.');

      await tokenContract.methods
        .createUser()
        .send({ from: connectedAccount });

      const logicAddressResult = await tokenContract.methods
        .getLogicAddress()
        .call({ from: connectedAccount });

      const logicAddress = toSafeString(logicAddressResult);

      if (logicAddress === '0x0000000000000000000000000000000000000000' || logicAddress === '0x') {
        toast.error('Registration failed: No logic contract created');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('currentAccount', connectedAccount);

      const userRef = ref(database, `users/${connectedAccount}`);
      await set(userRef, {
        walletAddress: connectedAccount,
        logicContractAddress: logicAddress,
        createdAt: new Date().toISOString(),
      });

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if ((error as { code?: number }).code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error((error as Error).message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [selectedWallet, connectedAccount, checkAndSwitchNetwork, navigate, handleLogin, getWalletProvider]);

  const value: AuthContextType = {
    wallets,
    selectedWallet,
    connectedAccount,
    isLoading,
    statusMessage,
    connectWallet,
    disconnectWallet,
    handleLogin,
    handleRegister,
    walletAddress: connectedAccount,
    isConnected: !!connectedAccount && !!selectedWallet,
    setSelectedWallet,
    getWalletProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
