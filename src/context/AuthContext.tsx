// src/context/AuthContext.tsx

import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import type {ReactNode} from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ref, set } from 'firebase/database';
import { database } from '../config/firebase';
import { POLYGON_AMOY_TESTNET } from '../config/networks';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '../config/contracts';

// --- Type Definitions ---
type WalletInfo = {
    name: string;
    uuid: string;
    rdns: string;
    provider: any;
};

interface AuthContextType {
    wallets: WalletInfo[];
    selectedWallet: WalletInfo | null;
    connectedAccount: string | null;
    isLoading: boolean;
    statusMessage: string;
    connectWallet: (wallet: WalletInfo) => Promise<void>;
    disconnectWallet: () => Promise<void>;
    handleLogin: () => Promise<void>;
    handleRegister: () => Promise<void>;
    setSelectedWallet: React.Dispatch<React.SetStateAction<WalletInfo | null>>;
}

// --- Context Creation ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [wallets, setWallets] = useState<WalletInfo[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Please select a wallet to connect.');

    useEffect(() => {
        const announceListener = (event: CustomEvent) => {
            const newWallet = { name: event.detail.info.name, uuid: event.detail.info.uuid, rdns: event.detail.info.rdns, provider: event.detail.provider };
            setWallets((prev) => {
                if (prev.some((w) => w.uuid === newWallet.uuid)) return prev;
                return [...prev, newWallet];
            });
        };
        window.addEventListener("eip6963:announceProvider", announceListener as EventListener);
        window.dispatchEvent(new Event("eip6963:requestProvider"));
        return () => window.removeEventListener("eip6963:announceProvider", announceListener as EventListener);
    }, []);

    const connectWallet = useCallback(async (wallet: WalletInfo) => {
        if (!wallet) return;
        setIsLoading(true);
        setStatusMessage(`Connecting to ${wallet.name}...`);
        try {
            const accounts: string[] = await wallet.provider.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) throw new Error("No accounts found in wallet.");
            
            setConnectedAccount(accounts[0]);
            setSelectedWallet(wallet);
            localStorage.setItem("selectedWalletRdns", wallet.rdns);
            setStatusMessage(`Successfully connected to ${accounts[0].substring(0, 6)}...`);
            
            // **NAVIGATION TO REGISTER/LOGIN PAGE**
            navigate('/auth');

        } catch (err: any) {
            console.error(`Connection failed for ${wallet.name}`, err);
            setStatusMessage(err.message || "An unknown connection error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);
    
    const disconnectWallet = useCallback(async () => {
        if (!selectedWallet) return;
        console.log(`🔌 Disconnecting from ${selectedWallet.name}...`);
        try {
            const provider = selectedWallet.provider;
            if (typeof provider.disconnect === 'function') {
                await provider.disconnect();
            } else if (provider.request) {
                await provider.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
            } else if (typeof provider.close === 'function') {
                await provider.close();
            }
        } catch (error) {
            console.error("Provider-level disconnect failed:", error);
        } finally {
            localStorage.removeItem("selectedWalletRdns");
            setConnectedAccount(null);
            setSelectedWallet(null);
            setStatusMessage("Wallet disconnected. Please select a wallet to connect.");
            navigate('/');
        }
    }, [selectedWallet, navigate]);

    // ... (handleLogin and handleRegister functions remain the same)
    const checkAndSwitchNetwork = async (provider: ethers.BrowserProvider) => {
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== parseInt(POLYGON_AMOY_TESTNET.chainId, 16).toString()) {
            setStatusMessage('Wrong network detected. Requesting switch to Polygon Amoy...');
            try {
                await provider.send('wallet_switchEthereumChain', [{ chainId: POLYGON_AMOY_TESTNET.chainId }]);
                return true;
            } catch (switchError) {
                setStatusMessage('Failed to switch network. Please do it manually.');
                return false;
            }
        }
        return true;
    };
    
    const validateAndGetContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
        if (!ethers.isAddress(TOKEN_CONTRACT_ADDRESS)) {
            throw new Error(`Invalid contract address. Please check your config.`);
        }
        return new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signerOrProvider);
    };

    const handleLogin = useCallback(async () => {
        if (!selectedWallet || !connectedAccount) { setStatusMessage('Wallet not connected.'); return; }
        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(selectedWallet.provider);
            if (!(await checkAndSwitchNetwork(provider))) { throw new Error(statusMessage); }
            const tokenContract = validateAndGetContract(provider);
            setStatusMessage('Checking registration...');
            const isRegistered = await tokenContract.isUserActive(connectedAccount);
            if (!isRegistered) { throw new Error('This wallet is not registered. Please register first.'); }
            setStatusMessage('User found. Logging in...');
            const logicAddress = await tokenContract.getLogicAddress(connectedAccount);
            localStorage.setItem('logicCrtAddress', logicAddress);
            localStorage.setItem('currentAccount', connectedAccount);
            navigate('/dashboard');
        } catch (error: any) {
            setStatusMessage(error.reason || error.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedWallet, connectedAccount, navigate]);

    const handleRegister = useCallback(async () => {
        if (!selectedWallet || !connectedAccount) { setStatusMessage('Wallet not connected.'); return; }
        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(selectedWallet.provider);
            const signer = await provider.getSigner();
            if (!(await checkAndSwitchNetwork(provider))) { throw new Error(statusMessage); }
            const tokenContract = validateAndGetContract(signer);
            setStatusMessage('Verifying if user already exists...');
            if (await tokenContract.isUserActive(connectedAccount)) { throw new Error('This wallet is already registered. Please log in.'); }
            setStatusMessage('Please confirm registration in your wallet...');
            const tx = await tokenContract.createUser();
            setStatusMessage('Registering on Polygon... please wait for confirmation.');
            await tx.wait();
            setStatusMessage('Registration confirmed! Creating database profile...');
            await set(ref(database, 'users/' + connectedAccount), { createdAt: new Date().toISOString() });
            const logicAddress = await tokenContract.getLogicAddress(connectedAccount);
            localStorage.setItem('logicCrtAddress', logicAddress);
            localStorage.setItem('currentAccount', connectedAccount);
            navigate('/dashboard');
        } catch (error: any) {
            setStatusMessage(error.reason || error.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedWallet, connectedAccount, navigate]);


    const value = { wallets, selectedWallet, connectedAccount, isLoading, statusMessage, connectWallet, disconnectWallet, handleLogin, handleRegister, setSelectedWallet };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
