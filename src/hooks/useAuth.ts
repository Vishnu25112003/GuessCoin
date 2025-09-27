import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ref, set } from 'firebase/database';
import { useWallet } from './useWallet';
import { database } from '../config/firebase';
import { POLYGON_AMOY_TESTNET } from '../config/networks';
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from '../config/contracts';

export const useAuth = () => {
    const { selectedWallet, connectedAccount } = useWallet();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const checkAndSwitchNetwork = useCallback(async (provider: ethers.BrowserProvider) => {
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== parseInt(POLYGON_AMOY_TESTNET.chainId, 16).toString()) {
            setStatusMessage('Wrong network detected. Please switch to Polygon Amoy Testnet.');
            try {
                await provider.send('wallet_switchEthereumChain', [{ chainId: POLYGON_AMOY_TESTNET.chainId }]);
                setStatusMessage('Network switched successfully.');
                return true;
            } catch (error) {
                setStatusMessage('Failed to switch network. Please do it manually.');
                console.error(error);
                return false;
            }
        }
        return true;
    }, []);

    const createFirebaseUser = useCallback(async (walletAddress: string) => {
        try {
            setStatusMessage('Creating user profile in database...');
            const userRef = ref(database, 'users/' + walletAddress);
            await set(userRef, {
                createdAt: new Date().toISOString(),
                // Add any other initial user data here
            });
            setStatusMessage('Database profile created.');
        } catch (error) {
            console.error("Firebase setup failed:", error);
            setStatusMessage('Error setting up user profile.');
        }
    }, []);

    const handleLogin = useCallback(async () => {
        if (!selectedWallet || !connectedAccount) {
            setStatusMessage('Please connect your wallet first.');
            return;
        }
        setIsLoading(true);
        setStatusMessage('Initiating login...');
        
        const provider = new ethers.BrowserProvider(selectedWallet.provider);
        if (!(await checkAndSwitchNetwork(provider))) {
            setIsLoading(false);
            return;
        }

        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider);

        try {
            setStatusMessage('Checking registration status...');
            const isRegistered = await tokenContract.isUserActive({ from: connectedAccount });

            if (isRegistered) {
                setStatusMessage('User found. Logging in...');
                // In your old code, you fetched a logic address. We replicate that here.
                const logicAddress = await tokenContract.getLogicAddress({ from: connectedAccount });
                localStorage.setItem('logicCrtAddress', logicAddress);
                localStorage.setItem('currentAccount', connectedAccount);
                navigate('/dashboard');
            } else {
                setStatusMessage('This wallet is not registered. Please register first.');
            }
        } catch (error) {
            console.error("Login failed:", error);
            setStatusMessage('Login failed. See console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedWallet, connectedAccount, navigate, checkAndSwitchNetwork]);

    const handleRegister = useCallback(async () => {
        if (!selectedWallet || !connectedAccount) {
            setStatusMessage('Please connect your wallet first.');
            return;
        }
        setIsLoading(true);
        setStatusMessage('Initiating registration...');

        const provider = new ethers.BrowserProvider(selectedWallet.provider);
        const signer = await provider.getSigner();

        if (!(await checkAndSwitchNetwork(provider))) {
            setIsLoading(false);
            return;
        }

        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer);
        
        try {
            setStatusMessage('Checking if user already exists...');
            const isRegistered = await tokenContract.isUserActive({ from: connectedAccount });

            if (isRegistered) {
                setStatusMessage('This wallet is already registered. Please log in.');
                setIsLoading(false);
                return;
            }

            setStatusMessage('Please confirm the registration transaction in your wallet...');
            const tx = await tokenContract.createUser();
            setStatusMessage('Registering on the blockchain... please wait.');
            await tx.wait(); // Wait for the transaction to be mined

            setStatusMessage('Registration successful! Setting up your profile...');
            await createFirebaseUser(connectedAccount);
            
            // Fetch the newly created logic address
            const logicAddress = await tokenContract.getLogicAddress({ from: connectedAccount });
            localStorage.setItem('logicCrtAddress', logicAddress);
            localStorage.setItem('currentAccount', connectedAccount);
            navigate('/dashboard');

        } catch (error: any) {
            if (error.code === 4001) {
                setStatusMessage('Transaction rejected. Please try again.');
            } else {
                setStatusMessage('Registration failed. See console for details.');
                console.error("Registration failed:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedWallet, connectedAccount, navigate, checkAndSwitchNetwork, createFirebaseUser]);

    return { isLoading, statusMessage, handleLogin, handleRegister };
};
