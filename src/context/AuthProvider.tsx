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
import type { WalletProvider, WalletProviderDetail } from '../types/eip6963';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // 🔥 Helper function for type conversion
  const toSafeString = (value: unknown): string => {
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  // Get wallet provider
  const getWalletProvider = useCallback((): WalletProvider | null => {
    if (!selectedWallet?.provider) {
      console.error('No wallet provider available');
      toast.error('No wallet connected. Please connect your wallet first.');
      return null;
    }
    return selectedWallet.provider;
  }, [selectedWallet]);

  // 🔥 NEW: Fetch user's LogicContract address from TokenContract
  const fetchUserLogicContract = useCallback(async (userAddress: string): Promise<string | null> => {
    try {
      console.log('🔍 Fetching LogicContract for user:', userAddress);
      
      if (!selectedWallet?.provider) {
        console.warn('⚠️ No wallet provider available');
        return null;
      }

      const web3 = new Web3(selectedWallet.provider);
      
      const tokenContract = new web3.eth.Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS
      );

      // Call getLogicAddress() on TokenContract
      const logicAddressResult = await tokenContract.methods
        .getLogicAddress()
        .call({ from: userAddress });

      const logicAddress = toSafeString(logicAddressResult);
      console.log('✅ User LogicContract address:', logicAddress);
      
      if (logicAddress && logicAddress !== '0x0000000000000000000000000000000000000000' && logicAddress !== '0x') {
        // Store in localStorage for persistence
        localStorage.setItem('logicCrtAddress', logicAddress);
        localStorage.setItem(`logicCrt_${userAddress.toLowerCase()}`, logicAddress);
        console.log('💾 LogicContract saved to localStorage');
        return logicAddress;
      } else {
        console.warn('⚠️ No LogicContract found - user needs to register');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching LogicContract:', error);
      return null;
    }
  }, [selectedWallet]);

  // Detect wallets using EIP-6963
  useEffect(() => {
    const handleAnnounceProvider = (event: Event) => {
      const customEvent = event as CustomEvent<WalletProviderDetail>;
      const { info, provider } = customEvent.detail;

      setWallets((prev) => {
        if (prev.some((w) => w.uuid === info.uuid)) return prev;
        return [
          ...prev,
          {
            name: info.name,
            uuid: info.uuid,
            rdns: info.rdns,
            provider: provider,
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

      const handleProviderAnnouncement = (event: Event) => {
        const customEvent = event as CustomEvent<WalletProviderDetail>;
        const { info, provider } = customEvent.detail;

        if (info.rdns === storedRdns) {
          const walletInfo: WalletInfo = {
            name: info.name,
            uuid: info.uuid,
            rdns: info.rdns,
            provider: provider,
            icon: info.icon,
          };

          setSelectedWallet(walletInfo);
          setConnectedAccount(storedAccount);
          console.log(`✅ Session restored with ${info.name}`);
          
          // 🔥 Fetch LogicContract address on session restore
          fetchUserLogicContract(storedAccount);
          
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect wallet
  const connectWallet = useCallback(async (wallet: WalletInfo) => {
    setIsLoading(true);
    setStatusMessage('Connecting to wallet...');

    try {
      if (!wallet.provider) {
        throw new Error('Wallet provider not available');
      }

      const accounts = (await wallet.provider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setSelectedWallet(wallet);
      setConnectedAccount(account);
      
      // Store wallet info
      localStorage.setItem('selectedWalletRdns', wallet.rdns);
      localStorage.setItem('currentAccount', account);

      // Check network
      const web3 = new Web3(wallet.provider);
      const chainId = await web3.eth.getChainId();
      const expectedChainId = parseInt(POLYGON_AMOY_TESTNET.chainId, 16);

      if (Number(chainId) !== expectedChainId) {
        try {
          await wallet.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
          });
        } catch (switchError: unknown) {
          const error = switchError as { code?: number };
          if (error.code === 4902) {
            await wallet.provider.request({
              method: 'wallet_addEthereumChain',
              params: [POLYGON_AMOY_TESTNET],
            });
          }
        }
      }

      // 🔥 CRITICAL: Attempt to fetch user's LogicContract address
      await fetchUserLogicContract(account);

      setStatusMessage(`Connected to ${wallet.name}`);
      toast.success(`Connected to ${wallet.name}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Connection error:', error);
      toast.error(err.message || 'Failed to connect wallet');
      setStatusMessage('Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserLogicContract]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    console.log("Starting disconnect process...");
    try {
      setIsLoading(true);
      setStatusMessage("Disconnecting wallet...");

      // Try wallet-specific disconnect methods
      if (selectedWallet?.provider) {
        try {
          const walletName = selectedWallet.name.toLowerCase();

          if (walletName.includes("metamask")) {
            try {
              await selectedWallet.provider.request({
                method: "wallet_revokePermissions",
                params: [{ eth_accounts: {} }],
              });
              console.log("MetaMask permissions revoked");
            } catch (e: unknown) {
              const err = e as { message?: string };
              console.log("MetaMask revoke failed:", err.message);
            }
          } else if (walletName.includes("coinbase") || walletName.includes("walletconnect")) {
            try {
              if (selectedWallet.provider.disconnect) {
                await selectedWallet.provider.disconnect();
                console.log("Wallet disconnected");
              }
            } catch (e: unknown) {
              const err = e as { message?: string };
              console.log("Wallet disconnect failed:", err.message);
            }
          }
        } catch {
          console.log("Wallet disconnect attempt failed, continuing with cleanup...");
        }
      }

      // Clear React state
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage("");

      // Clear session data
      localStorage.removeItem("selectedWalletRdns");
      localStorage.removeItem("currentAccount");
      localStorage.removeItem("logicCrtAddress");
      localStorage.removeItem("auth");

      // Clear WalletConnect storage
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("wc:2") ||
          key.startsWith("walletconnect") ||
          key.startsWith("@walletconnect")
        ) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();

      console.log("Wallet disconnected - guess data preserved");
      toast.success("Wallet disconnected successfully");
      navigate("/wallet", { replace: true });
    } catch (error: unknown) {
      console.error("Disconnect error:", error);
      
      // Even on error, clear session data
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage("");
      
      localStorage.removeItem("selectedWalletRdns");
      localStorage.removeItem("currentAccount");
      localStorage.removeItem("logicCrtAddress");
      localStorage.removeItem("auth");
      sessionStorage.clear();

      toast.warning("Disconnected with errors - session cleared");
      navigate("/wallet", { replace: true });
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, navigate]);

  // Check and switch network
  const checkAndSwitchNetwork = useCallback(
    async (provider: WalletProvider): Promise<boolean> => {
      try {
        const web3 = new Web3(provider);
        const chainId = await web3.eth.getChainId();
        const expectedChainId = parseInt(POLYGON_AMOY_TESTNET.chainId, 16);

        if (Number(chainId) !== expectedChainId) {
          setStatusMessage('Wrong network. Switching to Polygon Amoy...');
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
            });
            toast.success('Switched to Polygon Amoy Testnet');
            return true;
          } catch (switchError: unknown) {
            const error = switchError as { code?: number };
            if (error.code === 4902) {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: POLYGON_AMOY_TESTNET.chainId,
                    chainName: POLYGON_AMOY_TESTNET.chainName,
                    nativeCurrency: POLYGON_AMOY_TESTNET.nativeCurrency,
                    rpcUrls: POLYGON_AMOY_TESTNET.rpcUrls,
                    blockExplorerUrls: POLYGON_AMOY_TESTNET.blockExplorerUrls,
                  },
                ],
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
    },
    []
  );

  // 🔥 FIXED: Login - fetches existing LogicContract
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
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS
      );

      // Check if user is active
      const isActiveResult = await tokenContract.methods
        .isUserActive()
        .call({ from: connectedAccount });

      const isActive = Boolean(isActiveResult);

      if (!isActive) {
        toast.error('Not a registered wallet address. Please register first.');
        setIsLoading(false);
        return;
      }

      // 🔥 CRITICAL: Fetch the user's LogicContract address
      const logicAddress = await fetchUserLogicContract(connectedAccount);

      if (!logicAddress || logicAddress === '0x0000000000000000000000000000000000000000' || logicAddress === '0x') {
        toast.error('No logic contract found for this wallet. Please contact support.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Login successful - LogicContract:', logicAddress);

      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('currentAccount', connectedAccount);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Login error:', error);
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [selectedWallet, connectedAccount, checkAndSwitchNetwork, navigate, getWalletProvider, fetchUserLogicContract]);

  // 🔥 FIXED: Register - creates NEW LogicContract
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
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS
      );

      // Check if already registered
      const isActiveResult = await tokenContract.methods
        .isUserActive()
        .call({ from: connectedAccount });

      const isActive = Boolean(isActiveResult);

      if (isActive) {
        toast.info('Already registered! Logging you in...');
        await handleLogin();
        return;
      }

      console.log('🚀 Creating new user and LogicContract...');
      toast.info('Creating user... Please confirm the transaction.');

      // Call createUser() - this creates a NEW LogicContract for this user
      const receipt = await tokenContract.methods
        .createUser()
        .send({ from: connectedAccount });

      console.log('✅ Registration receipt:', receipt);

      // 🔥 CRITICAL: Fetch the newly created LogicContract address
      const logicAddress = await fetchUserLogicContract(connectedAccount);

      if (!logicAddress || logicAddress === '0x0000000000000000000000000000000000000000' || logicAddress === '0x') {
        throw new Error('Registration failed: No logic contract created');
      }

      console.log('🎉 New LogicContract created:', logicAddress);

      // Store the LogicContract address
      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('currentAccount', connectedAccount);

      // Save to Firebase
      const userRef = ref(database, `users/${connectedAccount}`);
      await set(userRef, {
        walletAddress: connectedAccount,
        logicContractAddress: logicAddress,
        createdAt: new Date().toISOString(),
      });

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      console.error('Registration error:', error);
      if (err.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error(err.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, [
    selectedWallet,
    connectedAccount,
    checkAndSwitchNetwork,
    navigate,
    handleLogin,
    getWalletProvider,
    fetchUserLogicContract,
  ]);

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
