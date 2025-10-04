import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import { ref, set, get } from 'firebase/database';
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
    if (value === null || value === undefined) return '0';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    return String(value);
  };

  const toSafeNumber = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return parseInt(value, 10) || 0;
    return 0;
  };

  // Wallet detection and restoration
  useEffect(() => {
    const addedUuids = new Set<string>();

    const onAnnounceProvider = (event: any) => {
      const walletInfo = event.detail.info;
      if (!addedUuids.has(walletInfo.uuid)) {
        addedUuids.add(walletInfo.uuid);
        const newWallet: WalletInfo = {
          name: walletInfo.name,
          uuid: walletInfo.uuid,
          rdns: walletInfo.rdns,
          provider: event.detail.provider,
          icon: walletInfo.icon || './notfound.jpg'
        };

        setWallets(prev => {
          if (prev.some(w => w.uuid === newWallet.uuid)) return prev;
          return [...prev, newWallet];
        });
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
    };
  }, []);

  // Enhanced wallet connection restoration
  useEffect(() => {
    const restoreWalletConnection = async () => {
      const savedWalletRdns = localStorage.getItem('selectedWalletRdns');
      const savedAccount = localStorage.getItem('currentAccount');

      if (savedWalletRdns && savedAccount && wallets.length > 0) {
        const savedWallet = wallets.find(w => w.rdns === savedWalletRdns);
        if (savedWallet && !connectedAccount) {
          try {
            // Verify connection is still valid
            const accounts = await savedWallet.provider.request({ method: "eth_accounts" });
            if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
              setConnectedAccount(savedAccount);
              setSelectedWallet(savedWallet);
              console.log('Wallet connection restored from localStorage');
              
              // Check if user should be redirected to dashboard or register
              const logicAddress = localStorage.getItem('logicCrtAddress');
              if (logicAddress && logicAddress !== '0x0') {
                navigate('/dashboard');
              } else {
                navigate('/auth');
              }
            } else {
              // Clear invalid stored connection
              localStorage.removeItem('selectedWalletRdns');
              localStorage.removeItem('currentAccount');
            }
          } catch (error) {
            console.log('Failed to restore wallet connection:', error);
            // Clear invalid stored connection
            localStorage.removeItem('selectedWalletRdns');
            localStorage.removeItem('currentAccount');
          }
        }
      }
    };

    if (wallets.length > 0 && !connectedAccount) {
      restoreWalletConnection();
    }
  }, [wallets, connectedAccount, navigate]);

  const connectWallet = useCallback(async (wallet: WalletInfo) => {
    setIsLoading(true);
    setStatusMessage(`Connecting to ${wallet.name}...`);

    try {
      const accounts = await wallet.provider.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) throw new Error("No accounts found");

      setConnectedAccount(accounts[0]);
      setSelectedWallet(wallet);
      localStorage.setItem('selectedWalletRdns', wallet.rdns);
      localStorage.setItem('currentAccount', accounts[0]);

      toast.success(`Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
      setStatusMessage('');

      // Check if user is already registered
      const logicAddress = localStorage.getItem('logicCrtAddress');
      if (logicAddress && logicAddress !== '0x0') {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      toast.error(err.message || "Connection failed");
      setStatusMessage('Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Enhanced Smart Disconnect Function
  const disconnectWallet = useCallback(async () => {
    if (!selectedWallet) {
      // If no wallet is selected, just clear everything
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage('');
      localStorage.clear();
      sessionStorage.clear();
      toast.info("Local data cleared");
      navigate('/');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Disconnecting wallet...');

    try {
      const walletName = selectedWallet.name.toLowerCase();
      const walletRdns = selectedWallet.rdns.toLowerCase();
      let disconnectMessage = 'Wallet disconnected';
      let disconnectSuccess = false;

      // METHOD 1: Try wallet-specific revoke permissions (MetaMask, Coinbase, etc.)
      if (walletRdns.includes('metamask') || walletName.includes('metamask')) {
        setStatusMessage('Revoking MetaMask permissions...');
        try {
          await selectedWallet.provider.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
          disconnectMessage = 'MetaMask permissions revoked successfully';
          disconnectSuccess = true;
        } catch (e: any) {
          console.log('MetaMask permission revocation failed:', e.message);
        }
      }
      else if (walletRdns.includes('coinbase') || walletName.includes('coinbase')) {
        setStatusMessage('Disconnecting Coinbase Wallet...');
        try {
          if (selectedWallet.provider.disconnect) {
            await selectedWallet.provider.disconnect();
            disconnectMessage = 'Coinbase Wallet disconnected successfully';
            disconnectSuccess = true;
          } else {
            await selectedWallet.provider.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }]
            });
            disconnectMessage = 'Coinbase Wallet permissions revoked';
            disconnectSuccess = true;
          }
        } catch (e: any) {
          console.log('Coinbase disconnect failed:', e.message);
        }
      }
      else if (walletRdns.includes('walletconnect') || walletName.includes('walletconnect')) {
        setStatusMessage('Disconnecting WalletConnect...');
        try {
          if (selectedWallet.provider.disconnect) {
            await selectedWallet.provider.disconnect();
            disconnectMessage = 'WalletConnect disconnected successfully';
            disconnectSuccess = true;
          }
        } catch (e: any) {
          console.log('WalletConnect disconnect failed:', e.message);
        }
      }

      // METHOD 2: Try generic disconnect method for other wallets
      if (!disconnectSuccess) {
        setStatusMessage('Trying generic disconnect...');
        try {
          if (selectedWallet.provider.disconnect && typeof selectedWallet.provider.disconnect === 'function') {
            await selectedWallet.provider.disconnect();
            disconnectMessage = `${selectedWallet.name} disconnected successfully`;
            disconnectSuccess = true;
          } else if (selectedWallet.provider.request) {
            // Try generic permission revocation
            await selectedWallet.provider.request({
              method: 'wallet_revokePermissions',
              params: [{ eth_accounts: {} }]
            });
            disconnectMessage = `${selectedWallet.name} permissions revoked`;
            disconnectSuccess = true;
          }
        } catch (e: any) {
          console.log('Generic disconnect failed:', e.message);
        }
      }

      // METHOD 3: Always clear local data regardless of wallet-specific disconnect success
      setStatusMessage('Clearing local data...');
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage('');

      // Clear all related localStorage and sessionStorage
      localStorage.removeItem('selectedWalletRdns');
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('logicCrtAddress');
      localStorage.removeItem('auth');
      localStorage.removeItem('walletconnect');
      sessionStorage.removeItem('walletconnect');
      sessionStorage.removeItem('walletConnectChainId');

      // Clear any WalletConnect specific storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('wc@2:') || key.startsWith('@walletconnect/')) {
          localStorage.removeItem(key);
        }
      });

      if (!disconnectSuccess) {
        disconnectMessage = `${selectedWallet.name} local data cleared (manual wallet disconnection may be needed)`;
      }

      toast.success(disconnectMessage);
      navigate('/');

    } catch (error: any) {
      console.error('Disconnect error:', error);
      // Even if there's an error, still clear local data
      setSelectedWallet(null);
      setConnectedAccount(null);
      setStatusMessage('');
      localStorage.removeItem('selectedWalletRdns');
      localStorage.removeItem('currentAccount');
      localStorage.removeItem('logicCrtAddress');
      toast.warning('Disconnect completed with errors - local data cleared');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, navigate]);

  const checkAndSwitchNetwork = async (web3: Web3): Promise<boolean> => {
    try {
      const chainId = await web3.eth.getChainId();
      const targetChainId = parseInt(POLYGON_AMOY_TESTNET.chainId, 16);
      const currentChainId = toSafeNumber(chainId);

      if (currentChainId !== targetChainId) {
        setStatusMessage('Wrong network. Requesting switch to Polygon Amoy...');
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_TESTNET.chainId }],
          });
          toast.success('Network switched to Polygon Amoy');
          return true;
        } catch (switchError: any) {
          toast.error('Failed to switch network. Please switch manually.');
          console.error('Network switch error:', switchError);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  };

  const handleLogin = useCallback(async () => {
    if (!selectedWallet || !connectedAccount) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Starting login process...');

    try {
      const web3 = new Web3(selectedWallet.provider);
      if (!(await checkAndSwitchNetwork(web3))) {
        throw new Error('Network verification failed');
      }

      const contract = new web3.eth.Contract(TOKEN_CONTRACT_ABI as any, TOKEN_CONTRACT_ADDRESS);

      setStatusMessage('Verifying registration on blockchain...');
      const isRegistered = await contract.methods.isUserActive(connectedAccount).call({
        from: connectedAccount
      }) as boolean;

      if (!isRegistered) {
        throw new Error('This wallet is not registered. Please register first.');
      }

      setStatusMessage('Getting user data...');
      const logicAddress = await contract.methods.getLogicAddress(connectedAccount).call({
        from: connectedAccount
      }) as string;

      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('currentAccount', connectedAccount);

      toast.success('Login successful!');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      setStatusMessage('Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, connectedAccount, navigate, checkAndSwitchNetwork]);

  const handleRegister = useCallback(async () => {
    if (!selectedWallet || !connectedAccount) {
      toast.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Starting registration process...');

    try {
      const web3 = new Web3(selectedWallet.provider);
      if (!(await checkAndSwitchNetwork(web3))) {
        throw new Error('Network verification failed');
      }

      const contract = new web3.eth.Contract(TOKEN_CONTRACT_ABI as any, TOKEN_CONTRACT_ADDRESS);

      setStatusMessage('Checking Firebase database...');
      const userRef = ref(database, `users/${connectedAccount}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        throw new Error('This wallet is already registered in our database. Please try logging in instead.');
      }

      setStatusMessage('Checking blockchain registration status...');
      const isRegisteredOnChain = await contract.methods.isUserActive(connectedAccount).call({
        from: connectedAccount
      }) as boolean;

      if (isRegisteredOnChain) {
        throw new Error('This wallet is already registered on the blockchain. Please try logging in instead.');
      }

      setStatusMessage('Please confirm the transaction in your wallet...');
      toast.info('Please confirm the transaction in your wallet');

      const tx = await contract.methods.createUser().send({
        from: connectedAccount
      });

      setStatusMessage('Transaction confirmed! Creating your profile...');

      await set(userRef, {
        walletAddress: connectedAccount,
        createdAt: new Date().toISOString(),
        transactionHash: (tx as any).transactionHash || ''
      });

      const logicAddress = await contract.methods.getLogicAddress(connectedAccount).call({
        from: connectedAccount
      }) as string;

      localStorage.setItem('logicCrtAddress', logicAddress);
      localStorage.setItem('currentAccount', connectedAccount);

      toast.success('Registration successful! Welcome to GuessCoin!');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
        setStatusMessage('Transaction rejected');
      } else if (error.message.includes('already registered')) {
        toast.error(error.message);
        setStatusMessage('Already registered');
      } else {
        toast.error(error.message || 'Registration failed');
        setStatusMessage('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedWallet, connectedAccount, navigate, checkAndSwitchNetwork]);

  // FIXED: Context value now includes the missing properties
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
    // ADDED: Missing properties for Navbar
    walletAddress: connectedAccount || localStorage.getItem('currentAccount'),
    isConnected: !!connectedAccount || !!localStorage.getItem('currentAccount'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
